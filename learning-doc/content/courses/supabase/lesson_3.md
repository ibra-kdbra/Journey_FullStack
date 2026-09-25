# Lesson 3: Row-Level Security

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Turn on row-level security and explain why it makes a table return nothing at all
- Write policies for each operation with `using` and `with check`, and say which rows each clause is applied to
- Explain why an `UPDATE` or `DELETE` of someone else's row reports zero rows instead of an error, while a bad `INSERT` raises one
- Combine several policies, and predict the result
- Name every way a query can bypass row-level security

## 📝 Detailed Content

### 1. Default Deny

Lesson 2 ended with two tables anyone could read and a grant system that could not say "only your own rows". Row-level security (RLS) is PostgreSQL's answer: once it is enabled on a table, every query against it is silently filtered by the table's *policies*, and a table with no policies filters out everything.

```text
postgres=# alter table notes enable row level security;
ALTER TABLE
postgres=# begin;
BEGIN
postgres=*# set local role anon;
SET
postgres=*> set local request.jwt.claims = '{"role": "anon"}';
SET
postgres=*> select id, title from notes order by id;
 id | title
----+-------
(0 rows)

postgres=*> rollback;
ROLLBACK
```

No error, no rows. That is the right way to fail: turning on RLS can never expose more than before, only less. It is also why "my query returns nothing" is the most common symptom of a missing policy — the database does not tell you that it filtered.

The superuser is not filtered:

```text
postgres=# select id, title from notes order by id;
 id |          title
----+-------------------------
  2 | Alice's shopping list
  3 | Alice's published essay
  4 | Bob's diary
(3 rows)
```

Superusers and roles with the `bypassrls` attribute skip RLS entirely, and so, by default, does the table's owner. This is why the SQL editor in the Supabase dashboard, which connects as the `postgres` role that owns your tables, shows every row whatever your policies say. **Test policies as `anon` and `authenticated`, never as the owner.**

### 2. A Policy Is a `WHERE` Clause

A policy names an operation, the roles it applies to, and a boolean expression. For reading, the expression goes in `using`, and PostgreSQL effectively adds it to the query's `WHERE` clause:

```text
postgres=# create policy "owners can read their notes" on notes for select to authenticated using (owner_id = auth.uid());
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> select id, title from notes order by id;
 id |          title
----+-------------------------
  2 | Alice's shopping list
  3 | Alice's published essay
(2 rows)

postgres=*> rollback;
ROLLBACK
```

Alice sees her two notes and not Bob's. Her query did not change; the policy did the filtering.

Several policies for the same operation are combined with `OR` — a row is visible if *any* of them lets it through. Published notes should be readable by everyone, signed in or not:

```text
postgres=# create policy "anyone can read public notes" on notes for select to anon, authenticated using (is_public);
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role anon;
SET
postgres=*> set local request.jwt.claims = '{"role": "anon"}';
SET
postgres=*> select id, title from notes order by id;
 id |          title
----+-------------------------
  3 | Alice's published essay
(1 row)

postgres=*> rollback;
ROLLBACK
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> select id, title from notes order by id;
 id |          title
----+-------------------------
  3 | Alice's published essay
  4 | Bob's diary
(2 rows)

postgres=*> rollback;
ROLLBACK
```

The visitor sees the one published note. Bob sees his own note through the first policy and Alice's essay through the second.

The `to` clause matters. A policy without it applies to `public` — every role. Naming the roles keeps a policy written for signed-in users from ever being evaluated for `anon`, and it is also faster: policies for other roles are skipped without evaluating their expressions.

### 3. Writing: `with check`

`using` filters rows that already exist. `with check` tests rows that a statement is about to *write*. For `insert` there are no existing rows, so an insert policy has only `with check`:

```text
postgres=# create policy "users can create their own notes" on notes for insert to authenticated with check (owner_id = auth.uid());
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> insert into notes (title) values ('Alice''s new idea');
INSERT 0 1
postgres=*> insert into notes (owner_id, title) values ('22222222-2222-2222-2222-222222222222', 'Written by Bob. Honest.');
ERROR:  new row violates row-level security policy for table "notes"
postgres=!# rollback;
ROLLBACK
```

The first insert takes `owner_id` from its default, `auth.uid()`, and passes. The second tries to create a note in Bob's name and is refused with an error. An insert that fails a check *is* an error, because silently discarding a row someone asked to write would be worse.

### 4. Updates and Deletes: `UPDATE 0`

Updates need both clauses: `using` decides which existing rows may be updated, `with check` decides what they may become.

```text
postgres=# create policy "owners can update their notes" on notes for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
CREATE POLICY
postgres=# create policy "owners can delete their notes" on notes for delete to authenticated using (owner_id = auth.uid());
CREATE POLICY
```

Now let Bob try to change and delete Alice's shopping list:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> update notes set title = 'hacked' where id = 2;
UPDATE 0
postgres=*> delete from notes where id = 2;
DELETE 0
postgres=*> rollback;
ROLLBACK
```

`UPDATE 0` and `DELETE 0` — no error. The `using` clause filtered Alice's row out before the statement looked for it, so as far as Bob's query can tell, no row with `id = 2` exists. Through the API this is an empty result with a success status, which surprises people the first time: **a denied update or delete looks exactly like one that matched nothing.** If your app needs to know, ask for the changed rows back (PostgREST's `Prefer: return=representation`, or SQL's `returning`) and check that you got one.

The `with check` half stops a subtler attack: Alice updating her own note so that it belongs to someone else.

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update notes set title = 'Groceries' where id = 2;
UPDATE 1
postgres=*> update notes set owner_id = '22222222-2222-2222-2222-222222222222' where id = 2;
ERROR:  new row violates row-level security policy for table "notes"
postgres=!# rollback;
ROLLBACK
```

The first update passes both clauses. The second passes `using` — it is her row — but the row it would produce fails `with check`. If you leave `with check` off an update policy, PostgreSQL uses the `using` expression for both, which here would give the same protection; spelling it out makes the intent visible in review.

### 5. Updates Also Need a Way to See the Row

Here is a trap that catches almost everyone once. An `UPDATE ... WHERE id = 2` has to *read* the row to find it, and reading is governed by `select` policies. Build a table with an update policy and no select policy, and the update finds nothing:

```text
postgres=# create table public.drafts (id bigint generated always as identity primary key, owner_id uuid not null default auth.uid(), body text not null);
CREATE TABLE
postgres=# alter table drafts enable row level security;
ALTER TABLE
postgres=# create policy "owners can update drafts" on drafts for update to authenticated using (owner_id = auth.uid());
CREATE POLICY
postgres=# insert into drafts (owner_id, body) values ('11111111-1111-1111-1111-111111111111', 'v1');
INSERT 0 1
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update drafts set body = 'v2' where id = 1;
UPDATE 0
postgres=*> rollback;
ROLLBACK
postgres=# create policy "owners can read drafts" on drafts for select to authenticated using (owner_id = auth.uid());
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update drafts set body = 'v2' where id = 1;
UPDATE 1
postgres=*> rollback;
ROLLBACK
postgres=# drop table drafts;
DROP TABLE
```

Alice owns the draft, the update policy allows it, and still `UPDATE 0` — until a select policy lets her see the row. When an update or delete through the API mysteriously changes nothing, check the select policies first.

### 6. Who Bypasses RLS

`\dp` now shows the policies alongside the grants:

```text
postgres=# \dp notes
                                                  Access privileges
 Schema | Name  | Type  |       Access privileges        | Column privileges |               Policies
--------+-------+-------+--------------------------------+-------------------+---------------------------------------
 public | notes | table | postgres=arwdDxt/postgres     +|                   | owners can read their notes (r):     +
        |       |       | anon=rxt/postgres             +|                   |   (u): (owner_id = auth.uid())       +
        |       |       | authenticated=arwdDxt/postgres+|                   |   to: authenticated                  +
        |       |       | service_role=arwdDxt/postgres  |                   | anyone can read public notes (r):    +
        |       |       |                                |                   |   (u): is_public                     +
        |       |       |                                |                   |   to: anon, authenticated            +
        |       |       |                                |                   | users can create their own notes (a):+
        |       |       |                                |                   |   (c): (owner_id = auth.uid())       +
        |       |       |                                |                   |   to: authenticated                  +
        |       |       |                                |                   | owners can update their notes (w):   +
        |       |       |                                |                   |   (u): (owner_id = auth.uid())       +
        |       |       |                                |                   |   (c): (owner_id = auth.uid())       +
        |       |       |                                |                   |   to: authenticated                  +
        |       |       |                                |                   | owners can delete their notes (d):   +
        |       |       |                                |                   |   (u): (owner_id = auth.uid())       +
        |       |       |                                |                   |   to: authenticated
(1 row)
```

Every query against `notes` is filtered by these — except queries run by:

- **superusers**, like the `postgres` role in this course;
- **roles with `bypassrls`**, such as `service_role`;
- **the table's owner**, unless the table has `force row level security`.

`service_role` is the one you will use deliberately, from trusted server code:

```text
postgres=# begin;
BEGIN
postgres=*# set local role service_role;
SET
postgres=*> select id, title from notes order by id;
 id |          title
----+-------------------------
  2 | Alice's shopping list
  3 | Alice's published essay
  4 | Bob's diary
(3 rows)

postgres=*> rollback;
ROLLBACK
```

On Supabase, your tables are owned by the `postgres` role and your app never connects as it, so the owner exemption mostly matters for tools: migrations, the dashboard's SQL editor, anything using the connection string. `alter table ... force row level security` makes the owner subject to policies too, which is useful when an application does connect as a table's owner. It has no effect on superusers or `bypassrls` roles.

### 7. `profiles`: Public Read, Owner Write

The same pattern secures `profiles`. Everyone may read usernames; only the user may change their own profile; nobody may insert or delete one through the API — lesson 5 creates profiles automatically at sign-up.

```text
postgres=# alter table profiles enable row level security;
ALTER TABLE
postgres=# revoke insert, update, delete, truncate on profiles from anon;
REVOKE
postgres=# create policy "profiles are public" on profiles for select to anon, authenticated using (true);
CREATE POLICY
postgres=# create policy "users can update their own profile" on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
CREATE POLICY
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
SET
postgres=*> update profiles set display_name = 'Robert' where id = '22222222-2222-2222-2222-222222222222';
UPDATE 1
postgres=*> update profiles set display_name = 'Bobbed' where id = '11111111-1111-1111-1111-111111111111';
UPDATE 0
postgres=*> insert into profiles (id, username) values ('22222222-2222-2222-2222-222222222222', 'bob2');
ERROR:  new row violates row-level security policy for table "profiles"
postgres=!# rollback;
ROLLBACK
```

The last insert is refused by row-level security even though `authenticated` holds the `insert` grant: RLS is on and no insert policy exists, so nothing is allowed.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Publishing

As Alice, publish her shopping list. Then show what an anonymous visitor sees, and show that Carol still cannot unpublish it.

**Solution:**

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update notes set is_public = true where id = 2 returning id, title, is_public;
 id |         title         | is_public
----+-----------------------+-----------
  2 | Alice's shopping list | t
(1 row)

UPDATE 1
postgres=*> commit;
COMMIT
postgres=# begin;
BEGIN
postgres=*# set local role anon;
SET
postgres=*> set local request.jwt.claims = '{"role": "anon"}';
SET
postgres=*> select id, title from notes order by id;
 id |          title
----+-------------------------
  2 | Alice's shopping list
  3 | Alice's published essay
(2 rows)

postgres=*> rollback;
ROLLBACK
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
SET
postgres=*> update notes set is_public = false where id = 2 returning id;
 id
----
(0 rows)

UPDATE 0
postgres=*> rollback;
ROLLBACK
```

`returning` makes the difference visible: Alice's update returns her row, Carol's returns nothing. Carol can *read* the note — a select policy lets her — but no update policy matches her, so for writing the row does not exist. This change is committed; the next lessons see the shopping list as public.

### Exercise 2: Find the Tables That Are Locked or Wide Open

Extend lesson 2's audit query: for each table in `public`, show whether RLS is on and how many policies it has. A table with RLS off is open to the API; a table with RLS on and zero policies is closed to it entirely.

**Solution:**

```text
postgres=# select c.relname as table_name, c.relrowsecurity as rls_on, count(p.polname) as policies from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policy p on p.polrelid = c.oid where n.nspname = 'public' and c.relkind = 'r' group by c.relname, c.relrowsecurity order by 1;
 table_name | rls_on | policies
------------+--------+----------
 notes      | t      |        5
 profiles   | t      |        2
(2 rows)
```

Both tables are now protected, by five and two policies. Supabase's dashboard runs a similar check (its "Security Advisor" flags tables in exposed schemas with RLS disabled); knowing how to run it yourself means you can put it in CI.

## 🔑 Key Points to Remember

- With RLS enabled and no policies, a table returns nothing and accepts nothing: default deny.
- `using` filters existing rows (select, update, delete); `with check` tests rows being written (insert, update).
- Permissive policies for the same operation are OR-ed together.
- A filtered-out row is invisible, not forbidden: denied updates and deletes report `0` rows, not errors. Denied inserts and failed `with check` are errors.
- Updates and deletes must be able to *see* the row: they need a select policy too.
- Superusers, `bypassrls` roles (`service_role`) and, unless forced, table owners skip RLS. Test as `anon` and `authenticated`.

## 📝 Homework

1. Policies are permissive by default. Read about `as restrictive` policies in the PostgreSQL documentation for `CREATE POLICY`, and use one on `notes` to require, on top of the existing policies, that nobody can read a note whose title starts with `[draft]`.
2. Write the policies for a `bookmarks` table where each user can do everything to their own bookmarks and nothing to anyone else's, using a single `for all` policy. Test each operation as two different users.
3. Explain, in two sentences each, why a missing `with check` on an insert policy and a missing select policy for an update would each show up in production.
