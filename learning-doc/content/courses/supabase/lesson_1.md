# Lesson 1: What Supabase Adds to Postgres

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Name the database roles a Supabase request runs as, and say which one each kind of caller gets
- Explain why PostgREST logs in as `authenticator`, a role that can do almost nothing by itself
- Explain how `auth.uid()` knows who is calling, and why that is only safe behind PostgREST
- Build a faithful local stand-in for the roles and `auth` schema of a Supabase database
- Impersonate an HTTP request by hand in `psql`, to see exactly what a policy will see

## 📝 Detailed Content

### 1. A Request Is a Role

When a browser calls your Supabase REST API, no application server of yours runs. PostgREST receives the request, checks the JSON Web Token that came with it, and then runs SQL in your database **as a database role chosen by the token**:

| Caller | Token | Database role |
|---|---|---|
| A visitor who is not signed in | the project's public *anon* key | `anon` |
| A signed-in user | the JWT the Auth server issued at sign-in | `authenticated` |
| Your own trusted server code | the secret *service_role* key | `service_role` |

That is the whole trick. Everything you already know about PostgreSQL permissions — `GRANT`, `REVOKE`, row-level security — applies to these three roles, and that is how Supabase access control works. There is no separate permission system to learn; there is Postgres's.

A Supabase database creates these roles in its first migration. This is the relevant part, from `migrations/db/init-scripts/00000000000000-initial-schema.sql` in the open-source [`supabase/postgres`](https://github.com/supabase/postgres) repository:

```sql
create role anon                nologin noinherit;
create role authenticated       nologin noinherit; -- "logged in" user: web_user, app_user, etc
create role service_role        nologin noinherit bypassrls; -- allow developers to create JWT's that bypass their policies

create user authenticator noinherit;
grant anon              to authenticator;
grant authenticated     to authenticator;
grant service_role      to authenticator;
```

Three details matter:

- `anon`, `authenticated` and `service_role` are `nologin`: nothing can connect to the database as them directly.
- `service_role` has `bypassrls`. Row-level security simply does not apply to it — which is why the service role key must never reach a browser.
- `authenticator` is the one role that *can* log in, and it is a member of the other three. PostgREST connects as `authenticator` and switches to the role the token names at the start of every request.

### 2. Building the Stand-In

On a Supabase project all of this already exists. On the plain PostgreSQL this course is verified against, we create it — the same statements, minus the Supabase-internal administrator role:

```text
postgres=# create role anon nologin noinherit;
CREATE ROLE
postgres=# create role authenticated nologin noinherit;
CREATE ROLE
postgres=# create role service_role nologin noinherit bypassrls;
CREATE ROLE
postgres=# create role authenticator login noinherit;
CREATE ROLE
postgres=# grant anon to authenticator;
GRANT ROLE
postgres=# grant authenticated to authenticator;
GRANT ROLE
postgres=# grant service_role to authenticator;
GRANT ROLE
```

(`create user` is `create role ... login`; the transcript spells it out.) `\du` lists the roles and their attributes:

```text
postgres=# \du
                               List of roles
   Role name   |                         Attributes
---------------+------------------------------------------------------------
 anon          | No inheritance, Cannot login
 authenticated | No inheritance, Cannot login
 authenticator | No inheritance
 postgres      | Superuser, Create role, Create DB, Replication, Bypass RLS
 service_role  | No inheritance, Cannot login, Bypass RLS
```

### 3. `noinherit`: A Role That Can Only Become Others

Normally a member of a role automatically has that role's privileges. `noinherit` switches that off: `authenticator` is a member of `anon`, `authenticated` and `service_role`, but holds none of their privileges while it is itself. All it can do is `SET ROLE` to one of them.

To see it, give `anon` the right to use a schema, and ask as `authenticator`:

```text
postgres=# grant usage on schema public to anon, authenticated, service_role;
GRANT
postgres=# select has_schema_privilege('anon', 'public', 'usage') as anon_can, has_schema_privilege('authenticator', 'public', 'usage') as authenticator_can;
 anon_can | authenticator_can
----------+-------------------
 t        | t
(1 row)
```

`authenticator` says yes to `public` — but not because of `anon`: every role can use `public` through the built-in `PUBLIC` pseudo-role. A schema that only the three API roles were granted shows the difference. The next section creates exactly such a schema, `auth`.

This is a deliberate safety property. If PostgREST's connection were ever used without a role switch, it would have no access to your data at all; it can only ever act with the privileges of a role that a verified token chose.

### 4. The `auth` Schema and `auth.users`

Supabase keeps its users in a table called `auth.users`, owned by the Auth server. Signing up inserts a row; the row's `id` — a UUID — is the user's identity everywhere else in the system, and it is what you reference from your own tables.

The real table has around thirty columns (password hashes, confirmation tokens, timestamps) that the Auth server manages. Your SQL only ever needs a few of them, so the stand-in keeps just those, with the same names:

```text
postgres=# create schema auth;
CREATE SCHEMA
postgres=# grant usage on schema auth to anon, authenticated, service_role;
GRANT
postgres=# create table auth.users (
postgres(#   id uuid primary key,
postgres(#   email text unique,
postgres(#   raw_user_meta_data jsonb not null default '{}'
postgres(# );
CREATE TABLE
```

The `grant usage` line is Supabase's too (`GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role` in the Auth schema migration). Now the `noinherit` effect is visible:

```text
postgres=# select has_schema_privilege('authenticated', 'auth', 'usage') as authenticated_can, has_schema_privilege('authenticator', 'auth', 'usage') as authenticator_can;
 authenticated_can | authenticator_can
-------------------+-------------------
 t                 | f
(1 row)
```

`authenticator` is a member of `authenticated` and still cannot use `auth`. It has to *become* `authenticated` first.

Three users will appear throughout the course. Their IDs are fixed, readable UUIDs so that every transcript is reproducible; real ones are random:

```text
postgres=# insert into auth.users (id, email) values
postgres-#   ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
postgres-#   ('22222222-2222-2222-2222-222222222222', 'bob@example.com'),
postgres-#   ('33333333-3333-3333-3333-333333333333', 'carol@example.com');
INSERT 0 3
```

### 5. `auth.uid()`: Who Is Calling?

PostgREST passes the verified token's claims to the database as a transaction-local setting named `request.jwt.claims`, holding the claims as JSON. `auth.uid()` reads the `sub` (subject) claim out of it. This is the definition from the [`supabase/auth`](https://github.com/supabase/auth) repository (`migrations/20220224000811_update_auth_functions.up.sql`), with its schema name filled in:

```text
postgres=# create function auth.uid() returns uuid language sql stable as $$
postgres$#   select coalesce(
postgres$#     nullif(current_setting('request.jwt.claim.sub', true), ''),
postgres$#     (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
postgres$#   )::uuid
postgres$# $$;
CREATE FUNCTION
postgres=# create function auth.role() returns text language sql stable as $$
postgres$#   select coalesce(
postgres$#     nullif(current_setting('request.jwt.claim.role', true), ''),
postgres$#     (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
postgres$#   )::text
postgres$# $$;
CREATE FUNCTION
```

Read it from the inside out:

- `current_setting(name, true)` returns the setting, or `NULL` if it was never set — the `true` means "missing is fine, don't raise an error".
- `request.jwt.claim.sub` is the older, one-setting-per-claim format; the coalesce keeps functions working for both.
- `->> 'sub'` extracts the claim as text, and `::uuid` turns it into a user ID.

Outside a request, nothing is set, so there is no caller:

```text
postgres=# select auth.uid(), auth.role();
 uid | role
-----+------
     |
(1 row)
```

### 6. Impersonating a Request

You can now do by hand what PostgREST does for every request: open a transaction, switch role, set the claims, run the query. PostgREST uses `set_config(..., true)` with parameters; `SET LOCAL` is the same thing typed by hand, and `LOCAL` is essential — the setting and the role end with the transaction, so the next request on the same connection starts clean.

First as PostgREST itself, before choosing a role:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticator;
SET
postgres=*> select current_user;
 current_user
---------------
 authenticator
(1 row)

postgres=*> select auth.uid();
ERROR:  permission denied for schema auth
LINE 1: select auth.uid();
               ^
postgres=!# rollback;
ROLLBACK
```

Watch the prompt: `=*#` means "in a transaction", and it becomes `=*>` once `SET ROLE` has dropped superuser rights. `authenticator` cannot even call `auth.uid()`, because it cannot use the `auth` schema — `noinherit` at work. And once a statement fails inside a transaction the prompt shows `=!`: the transaction is dead and only `ROLLBACK` will do anything.

Now as Alice, signed in. The token's `role` claim is what PostgREST reads to choose the database role:

```text
postgres=# begin;
BEGIN
postgres=*# set local role authenticator;
SET
postgres=*> set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> select current_user, auth.uid(), auth.role();
 current_user  |                 uid                  |     role
---------------+--------------------------------------+---------------
 authenticated | 11111111-1111-1111-1111-111111111111 | authenticated
(1 row)

postgres=*> rollback;
ROLLBACK
```

`authenticator` may switch to `authenticated` because it is a member, and from then on, until the transaction ends, the session *is* `authenticated`: its tables, its policies, its identity.

### 7. Role Switching Is Not the Security Boundary

It is tempting to conclude that once a request is `authenticated`, it is locked in. It is not, and the reason tells you where Supabase's real boundary is. PostgreSQL checks `SET ROLE` against the **session user** — the role that logged in — not against the role you are currently playing. Log in as `authenticator`, as PostgREST does, and watch (`\c - authenticator` reconnects as that role; it works here because local socket connections are trusted, as they are inside the Docker container — elsewhere you would need to give `authenticator` a password):

```text
postgres=# \c - authenticator
You are now connected to database "postgres" as user "authenticator".
postgres=> begin;
BEGIN
postgres=*> set local role anon;
SET
postgres=*> select current_user, session_user;
 current_user | session_user
--------------+---------------
 anon         | authenticator
(1 row)

postgres=*> set local role service_role;
SET
postgres=*> select current_user, session_user;
 current_user | session_user
--------------+---------------
 service_role | authenticator
(1 row)

postgres=*> rollback;
ROLLBACK
postgres=> \c - postgres
You are now connected to database "postgres" as user "postgres".
```

An `anon` "request" promoted itself to `service_role` in one statement, because the logged-in role, `authenticator`, is a member of both. So the role switch only holds because **clients never get to type SQL**. PostgREST turns an HTTP request into SQL it generates itself; there is no endpoint that runs a client's statement verbatim. Everything downstream — grants, policies, `auth.uid()` — is only as strong as that.

The same goes for the claims. Anyone who can type SQL can `set local request.jwt.claims` to Bob's ID and become Bob as far as `auth.uid()` is concerned. PostgREST only sets the claims after verifying the token's signature against the project's JWT secret, and that is why they can be trusted. Two consequences:

- Browsers never connect to Postgres. They talk to the API, which verifies tokens.
- A direct database connection — the `postgres` password, the connection string — and the service role key are equivalent to full control. They belong on servers you run, never in a client.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: The Anonymous Visitor

A visitor who has not signed in sends the anon key, whose token has `"role": "anon"` and no `sub`. Impersonate that request. What does `auth.uid()` return, and what does that mean for a policy that compares a column to `auth.uid()`?

**Solution:**

```text
postgres=# begin;
BEGIN
postgres=*# set local role anon;
SET
postgres=*> set local request.jwt.claims = '{"role": "anon"}';
SET
postgres=*> select current_user, auth.uid() is null as no_user, auth.role();
 current_user | no_user | role
--------------+---------+------
 anon         | t       | anon
(1 row)

postgres=*> rollback;
ROLLBACK
```

`auth.uid()` is `NULL`. In SQL, `anything = NULL` is not true — it is `NULL` — so a condition such as `user_id = auth.uid()` matches **no rows at all** for an anonymous visitor. That is the property row-level security policies rely on: a visitor without an identity fails every ownership check without any special handling.

### Exercise 2: Who May Become Whom?

Using the catalog table `pg_auth_members`, list the roles `authenticator` is a member of — the complete list of roles a request could run as.

**Solution:**

```text
postgres=# select r.rolname as member_of from pg_auth_members m join pg_roles r on r.oid = m.roleid join pg_roles u on u.oid = m.member where u.rolname = 'authenticator' order by 1;
   member_of
---------------
 anon
 authenticated
 service_role
(3 rows)
```

That membership list is the whole map of what PostgREST's login can become. On a real project it also includes Supabase's own administrator role — one more reason why "the client never sends SQL" is the load-bearing wall.

## 🔑 Key Points to Remember

- Every API request runs as a database role: `anon` without a session, `authenticated` with one, `service_role` for trusted servers.
- PostgREST logs in as `authenticator`, a `noinherit` role with no useful privileges of its own, and `SET LOCAL ROLE`s per request.
- `service_role` has `bypassrls`: its key must never reach a client.
- `auth.uid()` reads the `sub` claim from `request.jwt.claims`; with no signed-in user it is `NULL`, which matches nothing.
- `SET ROLE` is checked against the login role, so a role switch is not a boundary against anyone who can run SQL. Claims are trusted because only PostgREST sets them, after verifying the token's signature — direct database credentials bypass all of this.

## 📝 Homework

1. Supabase also defines `auth.email()` the same way, reading the `email` claim. Write it, following the pattern of `auth.role()`, and test it with an impersonated request.
2. `SET LOCAL` versus `SET`: impersonate a request with plain `SET ROLE authenticated` instead of `SET LOCAL`, commit, and check `current_user` afterwards. Why would that be a serious bug in a connection pool?
3. Read the Supabase migration linked in section 1. Which other roles does it create, and which of them can log in?
