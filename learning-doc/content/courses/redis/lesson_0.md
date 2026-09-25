# Redis: Data Structures, Expiry and Cache Design

Redis is usually introduced as "a cache", which undersells it and misleads beginners in the same breath. It is an in-memory **data structure server**: every key holds a typed value — a string, a hash, a list, a set, a sorted set — and every command is an operation on one of those structures. Caching is one thing you can build out of that, and it is the last thing this course builds, once the pieces underneath it are solid.

The course runs in one direction: the structures first, then time (expiry), then correctness under concurrency (atomicity), and only then the designs that combine them — a cache and a rate limiter.

## How to use this course

Every lesson is built around `redis-cli` transcripts like this one:

```text
127.0.0.1:6379> SET greeting "hello"
OK
127.0.0.1:6379> GET greeting
"hello"
```

The line after the prompt is what you type; everything up to the next prompt is exactly what Redis prints back. Type them yourself — the point is to watch the server answer, not to read the answers.

**These transcripts are tested, not illustrative.** A verifier replays every transcript in this course against a real `redis-server` and fails if a single reply differs from what is printed here. They were last verified against **Redis 7.0.15**, and the course relies on commands added in 6.2 and 7.0 (`SET ... GET`, `ZRANGE ... BYSCORE`, `EXPIRE ... GT`, `EXPIRETIME`), so use **Redis 7.0 or later**.

### Running Redis locally

Install Redis from your operating system's package manager (the package is usually called `redis` or `redis-server`), or use the official `redis` image on Docker Hub. Then, in one terminal:

```bash
redis-server
```

and in another:

```bash
redis-cli
```

`redis-cli` connects to `127.0.0.1:6379` by default, which is why every transcript starts with that prompt. Run `FLUSHALL` between lessons if you want an empty database — each lesson's transcripts assume they start from one.

## Part 1: The Data Structures

### Lesson 1: Keys, Strings and Counters

**Content:**

- The keyspace: one flat namespace, and a naming convention (`object:id:field`) to give it shape
- `SET` / `GET` / `DEL` / `EXISTS`, and conditional writes with `NX`, `XX` and `GET`
- Atomic counters: `INCR`, `INCRBY`, `DECR`, `INCRBYFLOAT`
- Strings are byte arrays: `STRLEN`, `APPEND`, `GETRANGE`, and why `STRLEN "café"` is 5
- Peeking inside: `TYPE` and `OBJECT ENCODING` (`int`, `embstr`, `raw`)
- Finding keys without stopping the server: `SCAN`, not `KEYS`

**Activities:**

- A page-view counter that cannot lose an increment
- A "last visitor" register that returns the previous value as it writes the new one

### Lesson 2: Hashes and Lists

**Content:**

- Hashes as records: `HSET`, `HGET`, `HMGET`, `HGETALL`, `HINCRBY`, `HDEL`
- When a hash beats a JSON string, and when it does not
- Lists as queues and timelines: `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LRANGE`, `LLEN`
- Capped collections with `LTRIM`, and blocking consumers with `BLPOP`

**Activities:**

- A user profile with independently updatable fields
- A "latest 5 events" timeline that never grows past five

### Lesson 3: Sets and Sorted Sets

**Content:**

- Sets for membership and uniqueness: `SADD`, `SISMEMBER`, `SCARD`, `SREM`
- Set algebra: `SINTER`, `SUNION`, `SDIFF` — and why their reply order is not something to rely on
- Sorted sets: members ordered by a score, `ZADD`, `ZSCORE`, `ZINCRBY`
- Reading ranges: `ZRANGE` with `REV`, `WITHSCORES`, `BYSCORE` and `LIMIT`; `ZRANK` and `ZREVRANK`

**Activities:**

- Tagging articles and finding the ones that share two tags
- A game leaderboard with top-N and "what rank am I?"

## Part 2: Time and Correctness

### Lesson 4: Expiry

**Content:**

- `EXPIRE`, `PEXPIRE`, `TTL`, `PTTL`, `PERSIST` — and what `-1` and `-2` mean
- `SET ... EX`, and the trap: a plain `SET` silently removes an existing TTL (`KEEPTTL` keeps it)
- Conditional expiry in 7.0: `EXPIRE ... NX | XX | GT | LT`
- Absolute deadlines: `EXPIREAT`, `EXPIRETIME`
- How keys actually disappear: lazy expiry on access plus active background sampling

**Activities:**

- Watching a key expire in real time
- A sliding session that activity extends but can never shorten

### Lesson 5: Atomicity — Transactions, WATCH and Lua

**Content:**

- Why a single command is always atomic, and why read-modify-write in application code is not
- `MULTI` / `EXEC`: queued commands, and the surprising part — a failing command does **not** roll back the others
- `EXECABORT`: when a transaction is refused before anything runs
- Optimistic locking with `WATCH`
- Lua with `EVAL`: one atomic unit of arbitrary logic

**Activities:**

- A balance transfer that cannot overdraw, done twice: with `WATCH`, then with Lua

## Part 3: Designs

### Lesson 6: Cache Design

**Content:**

- Cache-aside: read through the cache, fall back to the source, populate on a miss
- Expiry with jitter, so keys written together do not expire together
- The stampede problem, and a lock built from `SET ... NX PX`
- Invalidation: delete-on-write versus waiting for expiry
- `maxmemory` and eviction policies: what Redis does when memory runs out

**Activities:**

- A Node.js cache-aside wrapper with jitter and stampede protection, run against a deliberately slow "database"

### Lesson 7: Capstone — Rate Limiting

**Content:**

- Fixed-window limiting with `INCR` and `EXPIRE`, and the burst it allows at window edges
- Sliding-window limiting with a sorted set of timestamps
- Making the sliding window atomic with a Lua script

**Activities:**

- Build both limiters, then break the fixed-window one with a boundary burst the sliding window refuses
