# Lesson 4: Policies That Scale

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Write policies that grant access through membership in a team, stored in another table
- Recognise the infinite-recursion error, and fix it with a `security definer` helper function
- Keep such helpers out of the API, in a schema PostgREST does not expose
- Explain why `(select auth.uid())` is faster than `auth.uid()` in a policy, and see the difference in a query plan
- Index the columns your policies filter on

## 📝 Detailed Content

### 1. Access Through Membership

Real apps rarely stop at "my own rows". Most data belongs to a team, a workspace or an organisation, and access follows membership. Three tables model it:

```text
postgres=# create table public.teams (
postgres(#   id bigint generated always as identity primary key,
postgres(#   name text not null
postgres(# );
CREATE TABLE
postgres=# create table public.team_members (
postgres(#   team_id bigint not null references teams (id) on delete cascade,
postgres(#   user_id uuid not null references auth.users (id) on delete cascade,
postgres(#   role text not null check (role in ('admin', 'member')),
postgres(#   primary key (team_id, user_id)
postgres(# );
CREATE TABLE
postgres=# create table public.projects (
postgres(#   id bigint generated always as identity primary key,
postgres(#   team_id bigint not null references teams (id) on delete cascade,
postgres(#   name text not null
postgres(# );
CREATE TABLE
postgres=# alter table teams enable row level security;
ALTER TABLE
postgres=# alter table team_members enable row level security;
ALTER TABLE
postgres=# alter table projects enable row level security;
ALTER TABLE
```

Row-level security goes on in the same breath as the tables — never leave a table in `public` without it, even for a minute. Alice runs Acme with Bob as a member; Carol runs Globex alone:

```text
postgres=# insert into teams (name) values ('Acme'), ('Globex');
INSERT 0 2
postgres=# insert into team_members values
postgres-#   (1, '11111111-1111-1111-1111-111111111111', 'admin'),
postgres-#   (1, '22222222-2222-2222-2222-222222222222', 'member'),
postgres-#   (2, '33333333-3333-3333-3333-333333333333', 'admin');
INSERT 0 3
postgres=# insert into projects (team_id, name) values (1, 'Rocket skates'), (1, 'Giant magnet'), (2, 'World domination');
INSERT 0 3
```

### 2. The Recursion Trap

A member should see the memberships of their own teams — who else is on the team. The natural policy looks up the caller's teams in `team_members` itself:

```text
postgres=# create policy "members can see their teammates" on team_members for select to authenticated using (team_id in (select team_id from team_members where user_id = auth.uid()));
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> select * from team_members;
ERROR:  infinite recursion detected in policy for relation "team_members"
postgres=!# rollback;
ROLLBACK
```

The policy's subquery reads `team_members`, which is protected by the policy, whose subquery reads `team_members`... PostgreSQL detects the loop before running anything and refuses. It is the most common error in Supabase projects that go beyond single-owner rows.

### 3. `security definer` Helpers

The fix is to answer "which teams am I in?" in a function that runs with its *owner's* rights — `security definer` — and so is not subject to the caller's policies. The function then has one job: return facts about the caller, and nothing else.

Such helpers must not be callable through the API, and on Supabase every function in `public` is (lesson 5 shows why). So they go in a schema of their own, one that PostgREST does not expose:

```text
postgres=# drop policy "members can see their teammates" on team_members;
DROP POLICY
postgres=# create schema private;
CREATE SCHEMA
postgres=# grant usage on schema private to authenticated;
GRANT
postgres=# create function private.my_team_ids() returns setof bigint
postgres-#   language sql stable security definer set search_path = ''
postgres-# as $$
postgres$#   select team_id from public.team_members where user_id = auth.uid()
postgres$# $$;
CREATE FUNCTION
postgres=# create function private.has_team_role(team bigint, wanted text) returns boolean
postgres-#   language sql stable security definer set search_path = ''
postgres-# as $$
postgres$#   select exists (
postgres$#     select 1 from public.team_members
postgres$#     where team_id = team and user_id = auth.uid() and role = wanted
postgres$#   )
postgres$# $$;
CREATE FUNCTION
```

Three details make these safe:

- They only ever ask about `auth.uid()` — the caller. A definer function that took a user ID as a parameter would let anyone ask about anyone.
- `set search_path = ''` means every name must be schema-qualified (`public.team_members`, `auth.uid()`), so a caller cannot trick the function into using an object of their own with the same name. Lesson 5 returns to this.
- `stable` tells the planner the result does not change within a statement, so it need not re-run it for every row.

Now the policies can use them:

```text
postgres=# create policy "members can see their teammates" on team_members for select to authenticated using (team_id in (select private.my_team_ids()));
CREATE POLICY
postgres=# create policy "members can see their teams" on teams for select to authenticated using (id in (select private.my_team_ids()));
CREATE POLICY
postgres=# create policy "members can read projects" on projects for select to authenticated using (team_id in (select private.my_team_ids()));
CREATE POLICY
postgres=# create policy "admins can create projects" on projects for insert to authenticated with check (private.has_team_role(team_id, 'admin'));
CREATE POLICY
postgres=# create policy "admins can update projects" on projects for update to authenticated using (private.has_team_role(team_id, 'admin')) with check (private.has_team_role(team_id, 'admin'));
CREATE POLICY
postgres=# create policy "admins can delete projects" on projects for delete to authenticated using (private.has_team_role(team_id, 'admin'));
CREATE POLICY
```

Bob, a member of Acme:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> select m.team_id, p.username, m.role from team_members m join profiles p on p.id = m.user_id order by 1, 2;
 team_id | username |  role
---------+----------+--------
       1 | alice    | admin
       1 | bob      | member
(2 rows)

postgres=*> select id, name from projects order by id;
 id |     name
----+---------------
  1 | Rocket skates
  2 | Giant magnet
(2 rows)

postgres=*> update projects set name = 'Rocket skates 2' where id = 1;
UPDATE 0
postgres=*> insert into projects (team_id, name) values (1, 'Bob''s pet project');
ERROR:  new row violates row-level security policy for table "projects"
postgres=!# rollback;
ROLLBACK
```

He sees his team and its projects, not Globex's; he cannot rename a project (`UPDATE 0` — invisible to the update policy) or create one (an error — the insert check fails). Alice, Acme's admin, can do both:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update projects set name = 'Rocket skates 2' where id = 1;
UPDATE 1
postgres=*> insert into projects (team_id, name) values (1, 'Earthquake pills') returning id, team_id, name;
 id | team_id |       name
----+---------+------------------
  5 |       1 | Earthquake pills
(1 row)

INSERT 0 1
postgres=*> insert into projects (team_id, name) values (2, 'Planted in Globex');
ERROR:  new row violates row-level security policy for table "projects"
postgres=!# rollback;
ROLLBACK
```

— but not in a team she does not administer.

### 4. `(select auth.uid())`: Once, Not Per Row

A policy's expression is evaluated for every row the query considers. For `owner_id = auth.uid()` on a table read by a sequential scan, that means calling `auth.uid()` — and parsing the JWT claims JSON — once per row. Wrapping the call in a scalar subquery, `(select auth.uid())`, lets PostgreSQL run it once per statement and reuse the result. Supabase's own guidance on RLS performance recommends exactly this.

You can watch the difference with a stand-in function that announces each call. Like `auth.uid()` it is `stable`; unlike it, it is written in PL/pgSQL so that it can raise a notice:

```text
postgres=# create function private.noisy_uid() returns uuid language plpgsql stable as $$
postgres$# begin
postgres$#   raise notice 'noisy_uid() called';
postgres$#   return '11111111-1111-1111-1111-111111111111';
postgres$# end $$;
CREATE FUNCTION
postgres=# select count(*) from notes where owner_id = private.noisy_uid();
NOTICE:  noisy_uid() called
NOTICE:  noisy_uid() called
NOTICE:  noisy_uid() called
NOTICE:  noisy_uid() called
 count
-------
     2
(1 row)

postgres=# select count(*) from notes where owner_id = (select private.noisy_uid());
NOTICE:  noisy_uid() called
 count
-------
     2
(1 row)

postgres=# drop function private.noisy_uid();
DROP FUNCTION
```

Four calls for three rows: one per row, plus one the planner makes up front — for a `stable` function it may evaluate the call while estimating how many rows will match. Against that, one call in total. With three rows it does not matter; with a million it is the difference between a fast query and a timeout. The query plans show the mechanism:

```text
postgres=# explain (costs off) select id from notes where owner_id = auth.uid();
                                                                                                   QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Seq Scan on notes
   Filter: (owner_id = (COALESCE(NULLIF(current_setting('request.jwt.claim.sub'::text, true), ''::text), ((NULLIF(current_setting('request.jwt.claims'::text, true), ''::text))::jsonb ->> 'sub'::text)))::uuid)
(2 rows)

postgres=# explain (costs off) select id from notes where owner_id = (select auth.uid());
        QUERY PLAN
---------------------------
 Seq Scan on notes
   Filter: (owner_id = $0)
   InitPlan 1 (returns $0)
     ->  Result
(4 rows)
```

The first plan is more revealing than expected. `auth.uid()` is a one-line SQL function, so the planner *inlined* it: the filter applied to every row is the function's whole body — two `current_setting` calls, a `nullif`, a cast of the claims text to `jsonb` and a key lookup. In the second, the subquery has become an *InitPlan*: it runs once, before the scan, and the filter compares each row against its result, `$0`.

So rewrite the `notes` policies from lesson 3 in the faster form. `alter policy` changes a policy in place:

```text
postgres=# alter policy "owners can read their notes" on notes using (owner_id = (select auth.uid()));
ALTER POLICY
postgres=# alter policy "users can create their own notes" on notes with check (owner_id = (select auth.uid()));
ALTER POLICY
postgres=# alter policy "owners can update their notes" on notes using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
ALTER POLICY
postgres=# alter policy "owners can delete their notes" on notes using (owner_id = (select auth.uid()));
ALTER POLICY
postgres=# alter policy "users can update their own profile" on profiles using (id = (select auth.uid())) with check (id = (select auth.uid()));
ALTER POLICY
```

The helpers in section 3 were already called that way — `team_id in (select private.my_team_ids())` runs the function once. The same trick applies to any function in a policy whose result does not depend on the row.

Here is a signed-in read of `notes` as the planner now sees it, with both select policies folded into one filter:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> explain (costs off) select id, title from notes;
                QUERY PLAN
------------------------------------------
 Seq Scan on notes
   Filter: ((owner_id = $0) OR is_public)
   InitPlan 1 (returns $0)
     ->  Result
(4 rows)

postgres=*> rollback;
ROLLBACK
```

### 5. Index What Policies Filter On

A policy is a `WHERE` clause on every query, so it deserves the same indexes a `WHERE` clause would. Primary keys and unique constraints are indexed automatically; foreign keys are **not**:

```text
postgres=# create index notes_owner_id_idx on notes (owner_id);
CREATE INDEX
postgres=# create index team_members_user_id_idx on team_members (user_id);
CREATE INDEX
postgres=# create index projects_team_id_idx on projects (team_id);
CREATE INDEX
```

- `notes.owner_id` is what every notes policy compares.
- `team_members (team_id, user_id)` is the primary key, which serves lookups by team; `my_team_ids()` looks up by user, which needs the second index.
- `projects.team_id` is what the project policies compare.

On tables this small the planner will keep choosing sequential scans, and it is right to — reading one page is cheaper than an index lookup. The indexes are for when the tables grow, and they cost nothing to create now.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Admins Add Members

Let team admins add members to their team, and let nobody else. Then, as Alice, add Carol to Acme as a member, and as Bob, try to add himself to Globex.

**Solution:**

```text
postgres=# create policy "admins can add members" on team_members for insert to authenticated with check (private.has_team_role(team_id, 'admin'));
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> insert into team_members values (1, '33333333-3333-3333-3333-333333333333', 'member');
INSERT 0 1
postgres=*> commit;
COMMIT
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> insert into team_members values (2, '22222222-2222-2222-2222-222222222222', 'admin');
ERROR:  new row violates row-level security policy for table "team_members"
postgres=!# rollback;
ROLLBACK
```

This is committed: Carol is now in both teams, which later lessons rely on. Notice that the policy does not need a recursion guard — `has_team_role` is a definer function, so its read of `team_members` is not filtered by `team_members`' policies.

### Exercise 2: What Does Carol See Now?

Carol is admin of Globex and a member of Acme. Predict which projects she can read and which she can rename, then check.

**Solution:**

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
SET
postgres=*> select id, team_id, name from projects order by id;
 id | team_id |       name
----+---------+------------------
  1 |       1 | Rocket skates
  2 |       1 | Giant magnet
  3 |       2 | World domination
(3 rows)

postgres=*> update projects set name = name || ' (reviewed)' returning id, name;
 id |            name
----+-----------------------------
  3 | World domination (reviewed)
(1 row)

UPDATE 1
postgres=*> rollback;
ROLLBACK
```

She reads all three projects, through two different memberships, but an unrestricted `update` touches only Globex's: the update policy's `using` clause quietly narrows "every project" to "every project I administer".

## 🔑 Key Points to Remember

- A policy on a table that queries the same table recurses; PostgreSQL refuses it with "infinite recursion detected".
- Move membership lookups into `security definer` functions that only answer questions about `auth.uid()`, with `set search_path = ''` and schema-qualified names.
- Keep helper functions in a schema the API does not expose, such as `private`.
- Write `(select auth.uid())` and `(select helper())` in policies: evaluated once per statement instead of once per row.
- Index every column a policy filters on; foreign keys are not indexed automatically.

## 📝 Homework

1. Add policies so that a team admin can change a member's role and remove members, but cannot remove themselves if they are the team's last admin. (Hint: the last part needs more than a policy — keep it for after lesson 5.)
2. Load 100,000 notes for one user with `generate_series`, run `analyze notes`, and compare `explain analyze` for a signed-in `select count(*) from notes` with the policies written as `auth.uid()` and as `(select auth.uid())`.
3. `my_team_ids()` is called from three policies. Could it be `security invoker` instead? Try it and explain the error you get.
