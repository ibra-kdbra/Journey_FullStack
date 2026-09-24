# Lesson 6: Realtime Under the Hood

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Explain how a database change becomes a Realtime event: write-ahead log, logical decoding, replication slot
- Use the `supabase_realtime` publication to choose which tables produce events
- Read changes from a replication slot with `wal2json`, the plugin Realtime itself uses
- Explain what `replica identity full` changes, and what it costs
- Explain how Realtime applies your row-level security policies to each subscriber — and the one case where it cannot

## 📝 Detailed Content

### 1. Where Change Events Come From

Supabase Realtime's *Postgres Changes* feature lets a browser subscribe to inserts, updates and deletes on a table. No trigger of yours fires, and no application code publishes the events. They come from PostgreSQL's **write-ahead log** (WAL): the append-only record of every change, which PostgreSQL writes before changing any table so that it can recover from a crash.

The WAL is a low-level, physical record. **Logical decoding** turns it back into row-level changes — "insert into `projects` a row with these values" — by passing it through an *output plugin*. A **replication slot** is a named, durable position in that stream: it remembers how far a consumer has read, and PostgreSQL keeps any WAL the slot has not consumed yet.

The Realtime server's Postgres Changes driver uses exactly these pieces. From its source (`lib/extensions/postgres_cdc_rls/replications.ex` in [`supabase/realtime`](https://github.com/supabase/realtime)), this is how it creates its slot:

```sql
select 1 from pg_create_logical_replication_slot(slot_name => $1, plugin => 'wal2json', temporary => true)
```

and it then polls that slot through a database function, `realtime.list_changes(publication, slot_name, ...)`. This lesson builds a small version of the same machinery, so you can see what Realtime sees.

Logical decoding needs the server started with `wal_level = logical` (Supabase projects are):

```text
postgres=# show wal_level;
 wal_level
-----------
 logical
(1 row)
```

### 2. The Publication

Decoding produces changes for every table. What limits Realtime to the tables you chose is a **publication** — a named set of tables. Supabase creates an empty one called `supabase_realtime` in its initial migration (the first statement of the file lesson 1 quoted), and the dashboard's "enable Realtime" switch for a table adds the table to it:

```text
postgres=# create publication supabase_realtime;
CREATE PUBLICATION
postgres=# select count(*) as published_tables from pg_publication_tables where pubname = 'supabase_realtime';
 published_tables
------------------
                0
(1 row)
```

Nothing is published, so nothing will produce events. Keep it that way for a moment.

### 3. A Replication Slot With `wal2json`

Create a slot the way Realtime does, with the `wal2json` output plugin. A temporary slot disappears when the session that created it ends, which is what Realtime wants — if its connection dies it starts over rather than leave a slot behind holding WAL forever:

```text
postgres=# select slot_name from pg_create_logical_replication_slot('course_realtime', 'wal2json', temporary => true);
    slot_name
-----------------
 course_realtime
(1 row)
```

Make a change, then look at what the slot produced. `peek` reads without consuming; `format-version 2` emits one JSON document per row change, and `include-transaction false` leaves out the begin/commit markers:

```text
postgres=# insert into projects (team_id, name) values (2, 'Weather machine');
INSERT 0 1
postgres=# select data from pg_logical_slot_peek_changes('course_realtime', null, null, 'format-version', '2', 'include-transaction', 'false');
                                                                                                     data
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 {"action":"I","schema":"public","table":"projects","columns":[{"name":"id","type":"bigint","value":7},{"name":"team_id","type":"bigint","value":2},{"name":"name","type":"text","value":"Weather machine"}]}
(1 row)
```

That is the raw material of a Realtime event: the action (`I` for insert), the table, and every column with its type and new value.

### 4. A Miniature `list_changes`

Reading raw JSON gets tedious. The function below does, in miniature, what `realtime.list_changes` does: consume the slot, keep only changes to tables in the publication, and turn wal2json's column lists into a `record` and an `old_record` object — the two fields a Realtime client receives. Realtime's real function also evaluates each subscriber's permissions (section 7); this one does not.

```text
postgres=# create function private.realtime_changes() returns table (action text, "table" text, record jsonb, old_record jsonb) language sql as $$
postgres$#   select
postgres$#     w ->> 'action',
postgres$#     w ->> 'table',
postgres$#     (select jsonb_object_agg(c ->> 'name', c -> 'value') from jsonb_array_elements(w -> 'columns') c),
postgres$#     (select jsonb_object_agg(c ->> 'name', c -> 'value') from jsonb_array_elements(w -> 'identity') c)
postgres$#   from pg_logical_slot_get_changes('course_realtime', null, null, 'format-version', '2', 'include-transaction', 'false') s,
postgres$#     lateral (select s.data::jsonb) as change (w)
postgres$#   where (w ->> 'schema', w ->> 'table') in (select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime')
postgres$# $$;
CREATE FUNCTION
postgres=# select * from private.realtime_changes();
 action | table | record | old_record
--------+-------+--------+------------
(0 rows)
```

The insert from section 3 was consumed and filtered out: `projects` is not in the publication. Add it, and changes start coming through:

```text
postgres=# alter publication supabase_realtime add table projects;
ALTER PUBLICATION
postgres=# insert into projects (team_id, name) values (1, 'Portable hole');
INSERT 0 1
postgres=# select * from private.realtime_changes();
 action |  table   |                      record                      | old_record
--------+----------+--------------------------------------------------+------------
 I      | projects | {"id": 8, "name": "Portable hole", "team_id": 1} |
(1 row)
```

### 5. Updates, Deletes and the Old Row

For an update or a delete, a subscriber often wants to know what the row *was*. Whether that is available is decided by the table's **replica identity** — what PostgreSQL writes to the WAL about the old version of a row:

```text
postgres=# update projects set name = 'Portable hole v2' where name = 'Portable hole';
UPDATE 1
postgres=# delete from projects where name = 'Weather machine';
DELETE 1
postgres=# select * from private.realtime_changes();
 action |  table   |                       record                        | old_record
--------+----------+-----------------------------------------------------+------------
 U      | projects | {"id": 8, "name": "Portable hole v2", "team_id": 1} | {"id": 8}
 D      | projects |                                                     | {"id": 7}
(2 rows)
```

With the default replica identity — the primary key — the WAL records only the key of the old row. So the update carries the full new row in `record`, but `old_record` knows just the `id`; the delete carries only the `id` of what was deleted. Not the name, not the team.

`replica identity full` makes PostgreSQL log the entire old row:

```text
postgres=# alter table projects replica identity full;
ALTER TABLE
postgres=# update projects set name = 'Portable hole v3' where name = 'Portable hole v2';
UPDATE 1
postgres=# delete from projects where name = 'Portable hole v3';
DELETE 1
postgres=# select * from private.realtime_changes();
 action |  table   |                       record                        |                     old_record
--------+----------+-----------------------------------------------------+-----------------------------------------------------
 U      | projects | {"id": 8, "name": "Portable hole v3", "team_id": 1} | {"id": 8, "name": "Portable hole v2", "team_id": 1}
 D      | projects |                                                     | {"id": 8, "name": "Portable hole v3", "team_id": 1}
(2 rows)
```

Now the update's `old_record` has the previous name, and the delete says exactly what was removed. Supabase's documentation tells you to set this on a table when your Realtime subscribers need old records.

It is not free. Every update and delete on the table now writes the whole old row into the WAL, which adds write volume on every change to that table, whether or not anyone is subscribed. Turn it on for the tables whose subscribers need it, not by default.

### 6. What a Slot Costs

A replication slot guarantees its consumer will not miss a change, and it keeps that promise by making PostgreSQL retain all WAL the slot has not consumed. A slot whose consumer has gone away holds WAL until the disk fills. You can see every slot and how far behind it is:

```text
postgres=# select slot_name, plugin, slot_type, temporary, active from pg_replication_slots;
    slot_name    |  plugin  | slot_type | temporary | active
-----------------+----------+-----------+-----------+--------
 course_realtime | wal2json | logical   | t         | t
(1 row)
```

This slot is temporary, and it is dropped automatically when this `psql` session ends. A permanent slot must be dropped explicitly with `pg_drop_replication_slot()` when its consumer is retired. Realtime uses temporary slots for Postgres Changes for exactly this reason.

### 7. Realtime and Row-Level Security

A change event contains a row. Should every subscriber to `projects` receive every new project? Obviously not: Carol must not learn about Acme's projects by subscribing to the table.

Realtime answers this with your own policies. Each Postgres Changes subscription is stored in the database together with the JWT claims the client joined with, and when a change comes off the slot, `realtime.list_changes` asks — as that subscriber's role, with their claims — whether that subscriber could `select` that row, and only delivers it if so. Its architecture document puts it plainly: *"the table's own row-level security policies are the thing being evaluated, not a copy of them maintained by Realtime"* (`ARCHITECTURE.md` in `supabase/realtime`).

The check is the same kind of query you have been running all course. A Globex project is created; who would be told?

```text
postgres=# insert into projects (team_id, name) values (2, 'Tectonic plate polish');
INSERT 0 1
postgres=# select action, record from private.realtime_changes();
 action |                          record
--------+----------------------------------------------------------
 I      | {"id": 9, "name": "Tectonic plate polish", "team_id": 2}
(1 row)

postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
SET
postgres=*> select exists (select 1 from projects where name = 'Tectonic plate polish') as carol_gets_event;
 carol_gets_event
------------------
 t
(1 row)

postgres=*> rollback;
ROLLBACK
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444", "role": "authenticated"}';
SET
postgres=*> select exists (select 1 from projects where name = 'Tectonic plate polish') as dave_gets_event;
 dave_gets_event
-----------------
 f
(1 row)

postgres=*> rollback;
ROLLBACK
```

Carol, Globex's admin, receives it; Dave, who is only in Acme, does not. Two consequences follow:

- **A table with no select policy for `authenticated` delivers no events to signed-in users**, however it is published. "Realtime doesn't work" is very often "the select policy doesn't match".
- **Deletes cannot be checked.** The row no longer exists, so there is nothing to evaluate a policy against. The same architecture document is explicit: *"The one gap is deletes, where the row no longer exists to be checked, so subscribers get only its primary key."* Section 5's full old row is what the slot provides; it is not what a subscriber receives for a delete, because nobody could check whether they were allowed to see it.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: What Did Change?

Publish `notes` and have Alice rename her shopping list through an impersonated request. Show which columns an update event's `old_record` contains with the default replica identity, and what the new title is. (`notes` has timestamps, so do not print `record` in full.)

**Solution:**

```text
postgres=# alter publication supabase_realtime add table notes;
ALTER PUBLICATION
postgres=# begin;
BEGIN
postgres=*# set local role authenticated;
SET
postgres=*> set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
SET
postgres=*> update notes set title = 'Groceries' where id = 2;
UPDATE 1
postgres=*> commit;
COMMIT
postgres=# select action, "table", old_record, record ->> 'title' as new_title from private.realtime_changes();
 action | table | old_record | new_title
--------+-------+------------+-----------
 U      | notes | {"id": 2}  | Groceries
(1 row)
```

Only the key. A subscriber that needs to show "renamed from *Alice's shopping list*" either needs `replica identity full` on `notes` — and then it only works for subscribers who could read the note — or has to keep its own copy of what it saw before.

Note that the update was made as `authenticated`: the role that makes a change has no effect on the event. Decoding happens after commit, from the WAL, where roles do not exist; permissions are applied on the way out, per subscriber.

### Exercise 2: Audit What Is Published

List the tables in the `supabase_realtime` publication together with each table's replica identity. (`pg_class.relreplident` is `d` for default, `f` for full.)

**Solution:**

```text
postgres=# select p.tablename, c.relreplident as replica_identity from pg_publication_tables p join pg_class c on c.oid = format('%I.%I', p.schemaname, p.tablename)::regclass where p.pubname = 'supabase_realtime' order by 1;
 tablename | replica_identity
-----------+------------------
 notes     | d
 projects  | f
(2 rows)
```

A good habit for any project: every published table should have a select policy that means what you want subscribers to see, and every `f` should be there because some subscriber needs old rows.

## 🔑 Key Points to Remember

- Realtime's Postgres Changes are read from the write-ahead log by logical decoding, through a temporary replication slot using the `wal2json` plugin.
- Only tables in the `supabase_realtime` publication produce events.
- With the default replica identity, updates and deletes carry only the old row's primary key; `replica identity full` logs the whole old row, at a cost in WAL volume.
- Realtime delivers a change only to subscribers whose own select policies let them read the row. No select policy, no events.
- Deletes cannot be checked against policies, so subscribers receive only the deleted row's primary key.
- An abandoned permanent replication slot retains WAL indefinitely; drop slots you no longer use.

## 📝 Homework

1. `pg_logical_slot_peek_changes` does not consume, `pg_logical_slot_get_changes` does. Make three changes, peek twice, then get twice, and explain the results.
2. Wrap two inserts in one transaction and read them with `'include-transaction', 'true'`. What does `wal2json` add, and why might a consumer care that the two rows committed together?
3. Supabase Realtime also offers *Broadcast from Database*, which reads inserts into a `realtime.messages` table rather than your tables. Read the Realtime architecture document and explain one advantage it has over Postgres Changes for a table with many subscribers.
