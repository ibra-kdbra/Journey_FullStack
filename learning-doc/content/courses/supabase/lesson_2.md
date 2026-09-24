# Lesson 2: Tables, Grants and the Exposed Schema

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Design tables the way Supabase projects conventionally do: identity keys, `uuid` references to `auth.users`, `timestamptz`, and constraints that reject bad data
- Explain why a new table in `public` is reachable through the API the moment it is created
- Read a table's privileges with `\dp` and `has_table_privilege()`
- Show that grants control *which operations* a role may perform, but never *which rows*

## 📝 Detailed Content

### 1. The Schema the API Exposes

PostgREST publishes a REST endpoint for every table and view in the schemas it is configured to expose — by default, `public`. Create a table `notes` in `public`, and `GET /rest/v1/notes` exists. Whether a request to it returns anything is decided entirely by the database: by what the request's role has been granted, and then by row-level security.

So the first question about any new table is: what has `anon` been granted on it? On a Supabase database the answer is set up in advance by *default privileges* — rules that grant rights on objects as they are created. These lines are from the same initial migration as the roles in lesson 1:

```text
postgres=# alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES
postgres=# alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES
postgres=# alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES
postgres=# \ddp
                   Default access privileges
  Owner   | Schema |   Type   |       Access privileges
----------+--------+----------+--------------------------------
 postgres | public | function | anon=X/postgres               +
          |        |          | authenticated=X/postgres      +
          |        |          | service_role=X/postgres
 postgres | public | sequence | anon=rwU/postgres             +
          |        |          | authenticated=rwU/postgres    +
          |        |          | service_role=rwU/postgres
 postgres | public | table    | anon=arwdDxt/postgres         +
          |        |          | authenticated=arwdDxt/postgres+
          |        |          | service_role=arwdDxt/postgres
(3 rows)
```

Read the `tables` row carefully: every table created in `public` from now on grants `arwdDxt` — `a`ppend (insert), `r`ead (select), `w`rite (update), `d`elete, `D` truncate, `x` references, `t` trigger — to `anon`. That is every privilege a table has. Supabase does this on purpose: it makes every table usable through the API immediately, and it leaves **row-level security** as the one place where access is decided. The consequence is the most important sentence in this course: *a table without row-level security is readable and writable by anyone who has your project's public anon key.*

### 2. Tables the Supabase Way

Two tables will carry the next few lessons. First, a profile per user:

```text
postgres=# create table public.profiles (
postgres(#   id uuid primary key references auth.users (id) on delete cascade,
postgres(#   username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
postgres(#   display_name text
postgres(# );
CREATE TABLE
```

- The primary key **is** the user's ID, so there can be at most one profile per user, and the profile is found with `auth.uid()` directly.
- `references auth.users (id) on delete cascade`: deleting the account deletes the profile. Your tables point at `auth.users`; nothing in `auth` points at yours.
- The username rule lives in the database, in a `check` constraint, so no client — however it talks to the API — can store an invalid one.

Then the notes:

```text
postgres=# create table public.notes (
postgres(#   id bigint generated always as identity primary key,
postgres(#   owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
postgres(#   title text not null check (char_length(title) between 1 and 100),
postgres(#   body text not null default '',
postgres(#   is_public boolean not null default false,
postgres(#   created_at timestamptz not null default now()
postgres(# );
CREATE TABLE
```

- `generated always as identity` is the modern replacement for `serial`: the database assigns the ID and refuses one supplied by a client.
- `default auth.uid()`: when a signed-in user inserts a note without saying whose it is, it is theirs. Clients should never have to send their own user ID — and lesson 3 makes sure they cannot send someone else's.
- `timestamptz`, never `timestamp`: it stores an absolute instant, and the API returns it with an offset.

The constraints earn their keep straight away:

```text
postgres=# insert into profiles (id, username) values ('11111111-1111-1111-1111-111111111111', 'Alice');
ERROR:  new row for relation "profiles" violates check constraint "profiles_username_check"
DETAIL:  Failing row contains (11111111-1111-1111-1111-111111111111, Alice, null).
postgres=# insert into notes (id, owner_id, title) values (1, '11111111-1111-1111-1111-111111111111', 'hello');
ERROR:  cannot insert a non-DEFAULT value into column "id"
DETAIL:  Column "id" is an identity column defined as GENERATED ALWAYS.
HINT:  Use OVERRIDING SYSTEM VALUE to override.
```

The `DETAIL` of a check violation prints the whole rejected row, which is useful when debugging and a leak when it reaches an API client — PostgREST passes database errors through in its responses, so keep secrets out of rows you might reject.

The next one is worth understanding. There is no signed-in user in this `psql` session, so `auth.uid()` is `NULL`, and the `not null` constraint refuses a note that belongs to nobody. Its `DETAIL` line would print the rejected row including a `created_at` that depends on the clock, so this transcript first tells `psql` to print only the main error line — `VERBOSITY terse` is a psql display setting, and does not change what the server does:

```text
postgres=# \set VERBOSITY terse
postgres=# insert into notes (title) values ('hello');
ERROR:  null value in column "owner_id" of relation "notes" violates not-null constraint
postgres=# \set VERBOSITY default
```

(Transcripts in this course never print clock times or random values, so that they can be checked character for character.)

Now some valid data. From here on, `created_at` is never selected, for the same reason:

```text
postgres=# insert into profiles (id, username, display_name) values
postgres-#   ('11111111-1111-1111-1111-111111111111', 'alice', 'Alice'),
postgres-#   ('22222222-2222-2222-2222-222222222222', 'bob', 'Bob'),
postgres-#   ('33333333-3333-3333-3333-333333333333', 'carol', 'Carol');
INSERT 0 3
postgres=# insert into notes (owner_id, title, is_public) values
postgres-#   ('11111111-1111-1111-1111-111111111111', 'Alice''s shopping list', false),
postgres-#   ('11111111-1111-1111-1111-111111111111', 'Alice''s published essay', true),
postgres-#   ('22222222-2222-2222-2222-222222222222', 'Bob''s diary', false);
INSERT 0 3
postgres=# select n.id, p.username as owner, n.title, n.is_public from notes n join profiles p on p.id = n.owner_id order by n.id;
 id | owner |          title          | is_public
----+-------+-------------------------+-----------
  2 | alice | Alice's shopping list   | f
  3 | alice | Alice's published essay | t
  4 | bob   | Bob's diary             | f
(3 rows)
```

The IDs start at 2. The rejected insert above had already drawn 1 from the identity's sequence, and sequences are never rolled back — that is what lets many transactions draw IDs at once without waiting for each other. Gaps are normal; never assume IDs are consecutive, or use them to count rows.

### 3. Reading Privileges

`\dp` shows who may do what to a table:

```text
postgres=# \dp notes
                                   Access privileges
 Schema | Name  | Type  |       Access privileges        | Column privileges | Policies
--------+-------+-------+--------------------------------+-------------------+----------
 public | notes | table | postgres=arwdDxt/postgres     +|                   |
        |       |       | anon=arwdDxt/postgres         +|                   |
        |       |       | authenticated=arwdDxt/postgres+|                   |
        |       |       | service_role=arwdDxt/postgres  |                   |
(1 row)
```

Each entry reads `grantee=privileges/grantor`. The default privileges from section 1 fired when the table was created: `anon`, `authenticated` and `service_role` each hold all seven privileges, granted by `postgres`. Note the empty `Policies` column — there are none, and row-level security is off.

For a yes/no answer, ask directly:

```text
postgres=# select has_table_privilege('anon', 'notes', 'select') as can_read, has_table_privilege('anon', 'notes', 'delete') as can_delete;
 can_read | can_delete
----------+------------
 t        | t
(1 row)
```

### 4. What an Anonymous Visitor Can Do Right Now

Impersonate a visitor with the anon key, exactly as in lesson 1, and try the API's equivalent of `GET /rest/v1/notes` and then `DELETE /rest/v1/notes?id=eq.4`:

```text
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
  4 | Bob's diary
(3 rows)

postgres=*> delete from notes where id = 4;
DELETE 1
postgres=*> rollback;
ROLLBACK
```

Private notes read and Bob's diary deleted, by someone who never signed in. (The `rollback` puts it back; a real request commits.) This is not a contrived misconfiguration — it is what any new table in `public` looks like until you act.

### 5. Grants Decide Operations, Not Rows

The obvious first repair is to take privileges away. Visitors should be able to read, at most:

```text
postgres=# revoke insert, update, delete, truncate on notes from anon;
REVOKE
postgres=# begin;
BEGIN
postgres=*# set local role anon;
SET
postgres=*> delete from notes where id = 4;
ERROR:  permission denied for table notes
postgres=!# rollback;
ROLLBACK
```

That helps, but look at what it cannot express. `anon` can still read Bob's *private* diary, because `select` on a table is all-or-nothing. And a signed-in user needs `delete` to delete their own notes — which, as a grant, means any note. Here is Carol deleting Bob's diary:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
SET
postgres=*> delete from notes where id = 4;
DELETE 1
postgres=*> rollback;
ROLLBACK
```

A grant answers "may this role delete from `notes`?" The question that matters — "may *this user* delete *this note*?" — depends on the row, and only row-level security can answer it. That is lesson 3.

Grants still matter, as the first filter: an operation a role has not been granted fails before any policy is consulted, with an error rather than an empty result. Revoking what a role should never do — `truncate` for API roles, writes for `anon` on read-only data — is good hygiene. It is just not access control by itself.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Audit the Exposed Schema

Write one query that lists every table in `public` together with whether `anon` can read it, whether `anon` can delete from it, and whether row-level security is enabled. This is the first thing to run against any Supabase project you inherit.

**Solution:**

```text
postgres=# select c.relname as table_name, has_table_privilege('anon', c.oid, 'select') as anon_read, has_table_privilege('anon', c.oid, 'delete') as anon_delete, c.relrowsecurity as rls_on from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' order by 1;
 table_name | anon_read | anon_delete | rls_on
------------+-----------+-------------+--------
 notes      | t         | f           | f
 profiles   | t         | t           | f
(2 rows)
```

`pg_class.relrowsecurity` is the flag that `alter table ... enable row level security` sets. Any row showing `anon_read` true and `rls_on` false is a table the whole internet can read. Right now that is both tables — and `profiles` can still be written to by anonymous visitors, too.

### Exercise 2: Identity Columns Refuse Client IDs

Try to insert a note with an explicit `id`. Why is refusing it the right default for a table behind a public API?

**Solution:**

```text
postgres=# insert into notes (id, owner_id, title) values (100, '11111111-1111-1111-1111-111111111111', 'chosen id');
ERROR:  cannot insert a non-DEFAULT value into column "id"
DETAIL:  Column "id" is an identity column defined as GENERATED ALWAYS.
HINT:  Use OVERRIDING SYSTEM VALUE to override.
```

With `generated always`, clients cannot pick IDs, so they cannot collide with future ones or probe for them. A migration script that genuinely must set IDs can say `overriding system value`, as the hint says — a deliberate, visible exception rather than something any API caller can do.

## 🔑 Key Points to Remember

- PostgREST exposes every table in `public`; what a request can do to it is decided by grants and row-level security.
- Supabase's default privileges grant **all** table privileges to `anon` and `authenticated` on every new table in `public`.
- A table without row-level security is readable and writable with the public anon key.
- Grants are per table and per operation. "Only my own rows" is not expressible as a grant.
- Put rules in the database — `not null`, `check`, `unique`, foreign keys — so that every client is held to them.

## 📝 Homework

1. Revoke `truncate` from `anon`, `authenticated` and `service_role` on both tables. Which roles would ever legitimately truncate a table through an API?
2. PostgreSQL supports column privileges: `grant update (title, body) on notes to authenticated` after revoking table-wide `update`. Try it, then try to update `owner_id` as `authenticated`. What does this protect against that a row-level policy on its own would not?
3. Supabase recommends keeping tables that should never be reachable through the API in a schema other than `public`. Create a `private` schema with a table in it, and check what `anon` can do to it.
