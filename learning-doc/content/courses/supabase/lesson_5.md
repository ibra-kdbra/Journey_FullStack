# Lesson 5: Functions and Triggers

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Maintain an `updated_at` column with a trigger that clients cannot bypass
- Create a profile row automatically whenever a user signs up, with a trigger on `auth.users`
- Explain why that trigger must be `security definer`, and write definer functions safely
- Expose a database function as an API endpoint, and control who may call it
- Choose between `security invoker` and `security definer` for a function

## 📝 Detailed Content

### 1. Rules That Live in the Database

A Supabase app has many clients — a web app, a mobile app, scripts, the dashboard — and no application server that all of them pass through. Any rule that must always hold therefore has to live in the database: constraints (lesson 2), policies (lessons 3 and 4), and, for everything else, **triggers** and **functions**.

The simplest example is `updated_at`. A column default only applies to inserts, and trusting clients to send the right time on every update is hopeless. A trigger sets it on every update, whoever sends it:

```text
postgres=# alter table notes add column updated_at timestamptz not null default now();
ALTER TABLE
postgres=# create function private.set_updated_at() returns trigger language plpgsql as $$
postgres$# begin
postgres$#   new.updated_at := now();
postgres$#   return new;
postgres$# end $$;
CREATE FUNCTION
postgres=# create trigger notes_set_updated_at before update on notes for each row execute function private.set_updated_at();
CREATE TRIGGER
```

A `before` row trigger runs once per row about to be written and may change it: `new` is the row as it will be stored. Returning `new` lets the write proceed. The function lives in `private` because it has no business being called through the API.

Timestamps are never printed in these transcripts, but they can be compared. Inside a transaction `now()` is fixed at the transaction's start, so "was `updated_at` set by this transaction?" is `updated_at = now()`:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> select id, updated_at = now() as touched_now from notes where id = 2;
 id | touched_now
----+-------------
  2 | f
(1 row)

postgres=*> update notes set body = 'eggs, milk' where id = 2;
UPDATE 1
postgres=*> select id, updated_at = now() as touched_now from notes where id = 2;
 id | touched_now
----+-------------
  2 | t
(1 row)

postgres=*> update notes set updated_at = '2000-01-01' where id = 2;
UPDATE 1
postgres=*> select id, updated_at = now() as touched_now from notes where id = 2;
 id | touched_now
----+-------------
  2 | t
(1 row)

postgres=*> rollback;
ROLLBACK
```

Even an explicit attempt to backdate the row is overwritten: the trigger runs after the client's `set` and has the last word.

### 2. A Profile for Every New User

In lesson 2, profiles were inserted by hand. In a real project, the Auth server inserts into `auth.users` at sign-up, and your app needs a matching row in `public.profiles`. The standard Supabase pattern is a trigger on `auth.users`.

The Auth server connects as its own role, `supabase_auth_admin`, which owns the `auth` schema and has no rights on your tables. The stand-in needs that role too:

```text
postgres=# create role supabase_auth_admin nologin noinherit;
CREATE ROLE
postgres=# grant usage on schema auth to supabase_auth_admin;
GRANT
postgres=# grant select, insert, update, delete on auth.users to supabase_auth_admin;
GRANT
```

At sign-up, a client can attach metadata — here, the username the user chose — which the Auth server stores in `raw_user_meta_data`. The trigger copies it into a profile:

```text
postgres=# create function private.handle_new_user() returns trigger language plpgsql as $$
postgres$# begin
postgres$#   insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data ->> 'username');
postgres$#   return new;
postgres$# end $$;
CREATE FUNCTION
postgres=# create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
CREATE TRIGGER
```

Now sign Dave up, the way the Auth server would:

```text
postgres=# begin;
BEGIN
postgres=*# set local role supabase_auth_admin;
SET
postgres=*> insert into auth.users (id, email, raw_user_meta_data) values ('44444444-4444-4444-4444-444444444444', 'dave@example.com', '{"username": "dave"}');
ERROR:  permission denied for table profiles
CONTEXT:  SQL statement "insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data ->> 'username')"
PL/pgSQL function private.handle_new_user() line 3 at SQL statement
postgres=!# rollback;
ROLLBACK
```

The sign-up fails. A trigger function runs with the rights of whoever caused it — here `supabase_auth_admin`, which cannot insert into `public.profiles`. On Supabase, the Auth server reports this to the user as a generic database error during sign-up, which is why a broken profile trigger shows up as "nobody can sign up".

The function needs to run with its *owner's* rights instead: `security definer`. And a definer function must pin its `search_path`:

```text
postgres=# alter function private.handle_new_user() security definer set search_path = '';
ALTER FUNCTION
postgres=# begin;
BEGIN
postgres=*# set local role supabase_auth_admin;
SET
postgres=*> insert into auth.users (id, email, raw_user_meta_data) values ('44444444-4444-4444-4444-444444444444', 'dave@example.com', '{"username": "dave"}');
INSERT 0 1
postgres=*> commit;
COMMIT
postgres=# select id, username from profiles order by username;
                  id                  | username
--------------------------------------+----------
 11111111-1111-1111-1111-111111111111 | alice
 22222222-2222-2222-2222-222222222222 | bob
 33333333-3333-3333-3333-333333333333 | carol
 44444444-4444-4444-4444-444444444444 | dave
(4 rows)
```

Dave has a profile, inserted by a function running as `postgres` on behalf of a role that could not have done it itself.

### 3. Writing `security definer` Safely

A definer function is a small, deliberate hole in your permissions: it does, for whoever calls it, something they could not do themselves. Three rules keep the hole the size you intended:

1. **`set search_path = ''`.** Unqualified names are resolved through the caller-controllable `search_path` — and for tables, PostgreSQL searches the caller's temporary schema first. A definer function that says `profiles` instead of `public.profiles` can be pointed at a table the caller created. With an empty path, every name must be qualified (`public.profiles`, `auth.uid()`), and nothing is left to resolve. The PostgreSQL manual's section *Writing SECURITY DEFINER Functions Safely* describes the attack; Supabase's database linter flags functions without a fixed `search_path`.
2. **Decide who may call it.** Section 4.
3. **Keep it narrow.** It should do one thing, for the caller only — like `my_team_ids()` in lesson 4, which only ever reports on `auth.uid()`.

A trigger's `new` row is also input to trust carefully. Here the username is whatever the client sent at sign-up — which is fine, because the insert still has to pass `profiles`' `check` constraint. A username that breaks the rule fails the sign-up, which is the right outcome:

```text
postgres=# begin;
BEGIN
postgres=*# set local role supabase_auth_admin;
SET
postgres=*> insert into auth.users (id, email, raw_user_meta_data) values ('55555555-5555-5555-5555-555555555555', 'eve@example.com', '{"username": "Robert''); drop table notes;--"}');
ERROR:  new row for relation "profiles" violates check constraint "profiles_username_check"
DETAIL:  Failing row contains (55555555-5555-5555-5555-555555555555, Robert'); drop table notes;--, null).
CONTEXT:  SQL statement "insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data ->> 'username')"
PL/pgSQL function private.handle_new_user() line 3 at SQL statement
postgres=!# rollback;
ROLLBACK
```

The attempted SQL injection is just a string that fails a regular expression. Parameters and `new.` fields are values, never SQL.

### 4. Functions as API Endpoints

PostgREST exposes functions as well as tables: a function `public.join_team(code text)` becomes `POST /rest/v1/rpc/join_team` with `{"code": "..."}` as its body. That makes functions the way to do what a policy cannot express. Here: anyone with a team's invite code may join it as a member — although only admins may insert memberships directly.

```text
postgres=# alter table teams add column invite_code text unique;
ALTER TABLE
postgres=# update teams set invite_code = 'acme-rockets' where id = 1;
UPDATE 1
postgres=# create function public.join_team(code text) returns bigint language plpgsql security definer set search_path = '' as $$
postgres$# declare
postgres$#   team bigint;
postgres$# begin
postgres$#   if auth.uid() is null then
postgres$#     raise exception 'sign in to join a team';
postgres$#   end if;
postgres$#   select id into team from public.teams where invite_code = code;
postgres$#   if team is null then
postgres$#     raise exception 'no team has that invite code';
postgres$#   end if;
postgres$#   insert into public.team_members (team_id, user_id, role) values (team, auth.uid(), 'member') on conflict do nothing;
postgres$#   return team;
postgres$# end $$;
CREATE FUNCTION
```

Invite codes are only readable by team members, because the `teams` select policy from lesson 4 applies to the column as much as to the row. The function, as definer, can look any code up — but only reveals whether it matched.

Now, who can call it?

```text
postgres=# select has_function_privilege('anon', 'public.join_team(text)', 'execute') as anon_can_call;
 anon_can_call
---------------
 t
(1 row)

postgres=# revoke execute on function public.join_team(text) from anon;
REVOKE
postgres=# select has_function_privilege('anon', 'public.join_team(text)', 'execute') as anon_can_call;
 anon_can_call
---------------
 t
(1 row)
```

Revoking from `anon` was not enough. Two separate grants gave it `execute`: Supabase's default privileges from lesson 2 granted it to `anon` explicitly, and PostgreSQL itself grants `execute` on every new function to `PUBLIC` — every role. Both have to go:

```text
postgres=# revoke execute on function public.join_team(text) from public;
REVOKE
postgres=# grant execute on function public.join_team(text) to authenticated;
GRANT
postgres=# select has_function_privilege('anon', 'public.join_team(text)', 'execute') as anon_can_call, has_function_privilege('authenticated', 'public.join_team(text)', 'execute') as authenticated_can_call;
 anon_can_call | authenticated_can_call
---------------+------------------------
 f             | t
(1 row)
```

The function checks `auth.uid()` as well, which would stop an anonymous caller anyway. Defence in depth costs one line, and it means an anonymous request is refused before any of the function body runs.

Dave uses Alice's invite, mistyping it the first time. Through the API each call is its own request, and so its own transaction:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';
SET
postgres=*> select id, name from projects order by id;
 id | name
----+------
(0 rows)

postgres=*> select public.join_team('acme-rocket');
ERROR:  no team has that invite code
CONTEXT:  PL/pgSQL function public.join_team(text) line 10 at RAISE
postgres=!# rollback;
ROLLBACK
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';
SET
postgres=*> select public.join_team('acme-rockets');
 join_team
-----------
         1
(1 row)

postgres=*> select id, name from projects order by id;
 id |     name
----+---------------
  1 | Rocket skates
  2 | Giant magnet
(2 rows)

postgres=*> commit;
COMMIT
```

A wrong code raises the function's own error, and PostgREST passes its message back to the client. The right one adds him, and projects he could not see a moment ago appear, through the policies from lesson 4.

(Had both calls been in one transaction, the error would have aborted it — the `=!` prompt — and the second call would never have run.)

The same private helpers also have `PUBLIC` execute, but it does not matter: nobody can reach a function in `private` through the API, because PostgREST does not expose the schema, and roles other than `authenticated` do not even have `usage` on it.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Never Leave a Team Without an Admin

Let admins remove members and change their roles, but make it impossible — for anyone, through any client — to leave a team with no admin. A policy can only look at one row at a time; this rule is about all of a team's rows, so it needs a trigger.

**Solution:**

```text
postgres=# create policy "admins can remove members" on team_members for delete to authenticated using (private.has_team_role(team_id, 'admin'));
CREATE POLICY
postgres=# create policy "admins can change roles" on team_members for update to authenticated using (private.has_team_role(team_id, 'admin')) with check (private.has_team_role(team_id, 'admin'));
CREATE POLICY
postgres=# create function private.keep_one_admin() returns trigger language plpgsql as $$
postgres$# begin
postgres$#   if old.role = 'admin' and not exists (
postgres$#     select 1 from public.team_members
postgres$#     where team_id = old.team_id and role = 'admin' and user_id <> old.user_id
postgres$#   ) then
postgres$#     raise exception 'team % would have no admin left', old.team_id;
postgres$#   end if;
postgres$#   return null;
postgres$# end $$;
CREATE FUNCTION
postgres=# create trigger team_members_keep_one_admin after update of role or delete on team_members for each row execute function private.keep_one_admin();
CREATE TRIGGER
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update team_members set role = 'member' where team_id = 1 and user_id = '11111111-1111-1111-1111-111111111111';
ERROR:  team 1 would have no admin left
CONTEXT:  PL/pgSQL function private.keep_one_admin() line 7 at RAISE
postgres=!# rollback;
ROLLBACK
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update team_members set role = 'admin' where team_id = 1 and user_id = '22222222-2222-2222-2222-222222222222';
UPDATE 1
postgres=*> update team_members set role = 'member' where team_id = 1 and user_id = '11111111-1111-1111-1111-111111111111';
UPDATE 1
postgres=*> rollback;
ROLLBACK
```

Alice cannot demote herself while she is Acme's only admin, but she can once Bob has been promoted. It is an `after` trigger so it sees the table as it is after the change; the `CONTEXT` line shows where the error came from. The trigger is not `security definer`, and it does not need to be: it reads `team_members` as the caller, and the caller — an admin of this team, or the `after` trigger could not have fired — can see all of the team's memberships. `return null` is fine in an `after` trigger: the row has already been written.

### Exercise 2: Invoker Functions Respect RLS

Write `public.my_projects()`, returning the names of every project the caller can see, for the API. Should it be `security definer`?

**Solution:** No. It needs nothing the caller does not already have, so it should run as the caller — `security invoker`, the default — and the policies do the filtering:

```text
postgres=# create function public.my_projects() returns setof text language sql stable set search_path = '' as $$
postgres$#   select name from public.projects order by name
postgres$# $$;
CREATE FUNCTION
postgres=# revoke execute on function public.my_projects() from public, anon;
REVOKE
postgres=# grant execute on function public.my_projects() to authenticated;
GRANT
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> select * from public.my_projects();
  my_projects
---------------
 Giant magnet
 Rocket skates
(2 rows)

postgres=*> rollback;
ROLLBACK
```

Bob gets Acme's projects only. Reach for `security definer` only when a function must do something its caller cannot — and then follow section 3's rules.

## 🔑 Key Points to Remember

- Put invariants in the database: every client is held to them, including ones you did not write.
- A `before update` trigger that sets `updated_at` cannot be bypassed by clients.
- A trigger on `auth.users` runs as the Auth server's role; to write to your tables it must be `security definer`. If it fails, sign-up fails.
- Definer functions: `set search_path = ''`, fully qualified names, narrow purpose, explicit `execute` grants.
- New functions are executable by `PUBLIC`, and on Supabase also by `anon` explicitly. Revoke both.
- Functions in `public` are API endpoints (`/rest/v1/rpc/...`); helpers belong in an unexposed schema.

## 📝 Homework

1. Add a `delete` counterpart to the sign-up trigger: when a user is deleted from `auth.users`, what happens to their profile, notes and memberships? (Look at the foreign keys before you write any code — you may not need a trigger at all.)
2. Rewrite `join_team` to return the team's name instead of its ID. What would change if it were `security invoker`, and why would it break?
3. Find every function in `public` that `anon` can execute: query `pg_proc` with `has_function_privilege`.
