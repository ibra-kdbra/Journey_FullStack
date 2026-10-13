# Lesson 6: Sharing Memory Safely

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Explain what a data race is, and why "it printed the right number" proves nothing
- Find races with the race detector, `-race`
- Protect shared state with `sync.Mutex`, and simple counters with `sync/atomic`
- Stop goroutines that are no longer needed, with `context` cancellation and deadlines
- Choose between channels and mutexes for a given job

## 📝 Detailed Content

### 1. A Data Race

A **data race** happens when two goroutines access the same memory at the same time and at least one of them writes, with nothing ordering the accesses. `count++` looks like one step but is three — read, add, write — and two goroutines interleaving those steps lose increments:

```console
$ mkdir shared && cd shared
$ go mod init example.com/shared
go: creating new go.mod: module example.com/shared
```

```go [shared/race/main.go]
package main

import (
	"fmt"
	"sync"
)

func main() {
	count := 0
	var wg sync.WaitGroup
	for g := 0; g < 4; g++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < 250_000; i++ {
				count++
			}
		}()
	}
	wg.Wait()
	fmt.Println("expected 1000000, got the right answer:", count == 1_000_000)
}
```

```console
$ go run ./race
expected 1000000, got the right answer: [...]
```

The transcript shows the answer as `[...]` because it genuinely varies — the one place in this course where the output of a program is not fixed. On a machine with more than one CPU core, the four goroutines run truly in parallel and increments are lost, so it usually prints `false`. On a single core the scheduler may happen to switch goroutines only between whole loops, and the answer comes out right — which is the real danger of races: a racy program can pass every test on your laptop and fail in production. Worse, the Go memory model gives a racy program **no** guaranteed behaviour at all; lost increments are merely the most visible symptom.

### 2. The Race Detector

You cannot find races by staring at output. Build with `-race`, and the runtime instruments every memory access and reports conflicting ones as they happen:

```console
$ go run -race ./race 2>&1 | grep -E '^(WARNING: DATA RACE|exit status)' | sort -u
WARNING: DATA RACE
exit status 66
```

The full report names both goroutines, the two conflicting accesses and the source lines where each goroutine was started; its goroutine IDs and memory addresses change from run to run, so the transcript keeps only the lines that do not. A program with a detected race exits with status 66, which `go run` passes on as `exit status 66` — so CI fails even if the program's own output looked fine.

The detector only sees races that actually happen during the run, so it is only as good as the code it exercises. Run your tests with `go test -race` routinely — in CI, always. It costs time and memory (typically several times slower), which is why it is a flag and not the default.

### 3. `sync.Mutex`

A mutex allows one goroutine at a time into a critical section. Put the mutex next to the data it protects, and lock around every access:

```go [shared/mutex/main.go]
package main

import (
	"fmt"
	"sync"
)

// Counter is safe for concurrent use. Its zero value is ready to use.
type Counter struct {
	mu sync.Mutex
	n  map[string]int
}

func (c *Counter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.n == nil {
		c.n = map[string]int{}
	}
	c.n[key]++
}

func (c *Counter) Get(key string) int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.n[key]
}

func main() {
	var c Counter
	var wg sync.WaitGroup
	for g := 0; g < 4; g++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < 250_000; i++ {
				c.Inc("hits")
			}
		}()
	}
	wg.Wait()
	fmt.Println(c.Get("hits"))
}
```

```console
$ go run -race ./mutex
1000000
```

Exactly one million, and the race detector is silent. `defer c.mu.Unlock()` right after `Lock` guarantees the unlock on every path out of the method, including panics. Note the pointer receivers: copying a `Counter` would copy its mutex, and the copy would not protect the original — `go vet`'s `copylocks` check reports it.

A plain Go map is not safe for concurrent writes even without a counter: concurrent writes to a map crash the program with `fatal error: concurrent map writes`, race detector or not.

### 4. Atomics

For a single number, `sync/atomic` does the read-modify-write as one indivisible hardware operation, with no lock:

```go [shared/atomic/main.go]
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var count atomic.Int64
	var wg sync.WaitGroup
	for g := 0; g < 4; g++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < 250_000; i++ {
				count.Add(1)
			}
		}()
	}
	wg.Wait()
	fmt.Println(count.Load())
}
```

```console
$ go run -race ./atomic
1000000
```

Atomics are the right tool for counters and flags. As soon as two values must change together — a balance and a transaction log, a map and its size — reach for a mutex: two atomic operations in a row are not atomic together.

### 5. Stopping Goroutines: `context`

Lesson 5's timeout abandoned a goroutine and let it finish on its own. Often the goroutine should *stop*: the client disconnected, the deadline passed, a sibling failed. `context.Context` carries that signal. `ctx.Done()` is a channel that is closed on cancellation, and `ctx.Err()` says why:

```go [shared/cancel/main.go]
package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

// crunch does work in small steps, checking for cancellation between them.
func crunch(ctx context.Context, steps int) (int, error) {
	done := 0
	for i := 0; i < steps; i++ {
		select {
		case <-ctx.Done():
			return done, ctx.Err()
		case <-time.After(10 * time.Millisecond): // one step of work
			done++
		}
	}
	return done, nil
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	n, err := crunch(ctx, 5)
	fmt.Println(n, err)

	ctx, cancel = context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()
	n, err = crunch(ctx, 1000)
	fmt.Println(n < 1000, err, errors.Is(err, context.DeadlineExceeded))

	ctx, cancel = context.WithCancel(context.Background())
	cancel() // cancelled before we even start
	n, err = crunch(ctx, 1000)
	fmt.Println(n, err)
}
```

```console
$ go run ./cancel
5 <nil>
true context deadline exceeded true
0 context canceled
```

The pattern:

- The **caller** decides the deadline, with `context.WithTimeout`, `WithDeadline` or `WithCancel`, and always calls `cancel` when done — `defer cancel()` — to release the context's resources.
- The **callee** takes `ctx context.Context` as its first parameter and checks `ctx.Done()` wherever it waits. Most blocking standard-library operations — HTTP requests, database queries — accept a context and do this for you.
- A cancelled operation returns `ctx.Err()`: `context.DeadlineExceeded` or `context.Canceled`.

Contexts form a tree: cancelling a parent cancels every context derived from it, which is how a web server cancels all the work belonging to one request when its client goes away.

### 6. Channels or Mutexes?

Go's proverb is *"Don't communicate by sharing memory; share memory by communicating"* — but both tools are in the standard library for a reason:

- **Channels** when ownership of data moves between goroutines: a pipeline, a worker pool, handing a result back, signalling "done".
- **Mutexes** when several goroutines consult and update shared state in place: a cache, a counter map, a connection pool.

If a design needs a channel of channels to protect one map, a mutex is simpler; if a mutex-protected queue has goroutines polling it in loops, a channel is simpler.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Find the Race

This cache looks reasonable and prints the right answer. Run it under the race detector, then fix it.

**Solution:**

```go [shared/cache/main.go]
package main

import (
	"fmt"
	"sync"
)

type Cache struct {
	mu   sync.Mutex
	data map[string]string
}

func (c *Cache) Get(k string) (string, bool) {
	v, ok := c.data[k] // BUG: reads without the lock
	return v, ok
}

func (c *Cache) Set(k, v string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[k] = v
}

func main() {
	c := &Cache{data: map[string]string{}}
	var wg sync.WaitGroup
	for i := 0; i < 2; i++ {
		wg.Add(2)
		go func() { defer wg.Done(); c.Set("k", "v") }()
		go func() { defer wg.Done(); c.Get("k") }()
	}
	wg.Wait()
	v, _ := c.Get("k")
	fmt.Println(v)
}
```

```console
$ go run ./cache
v
$ go run -race ./cache 2>&1 | grep -E '^(WARNING: DATA RACE|exit status)' | sort -u
WARNING: DATA RACE
exit status 66
```

Only writes were locked. A read concurrent with a write is still a race — the reader can see a map in the middle of being changed. The fix is to lock in `Get` too (or use `sync.RWMutex`, whose `RLock` lets many readers in at once while excluding writers):

```go [shared/cachefixed/main.go]
package main

import (
	"fmt"
	"sync"
)

type Cache struct {
	mu   sync.RWMutex
	data map[string]string
}

func (c *Cache) Get(k string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	v, ok := c.data[k]
	return v, ok
}

func (c *Cache) Set(k, v string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[k] = v
}

func main() {
	c := &Cache{data: map[string]string{}}
	var wg sync.WaitGroup
	for i := 0; i < 2; i++ {
		wg.Add(2)
		go func() { defer wg.Done(); c.Set("k", "v") }()
		go func() { defer wg.Done(); c.Get("k") }()
	}
	wg.Wait()
	v, _ := c.Get("k")
	fmt.Println(v)
}
```

```console
$ go run -race ./cachefixed
v
```

### Exercise 2: Stop the Losers

Rework lesson 5's "first answer wins" so that the slower queries are cancelled as soon as one answers, and report how many were cancelled.

**Solution:**

```go [shared/firstctx/main.go]
package main

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

func query(ctx context.Context, name string, delay time.Duration, out chan<- string, cancelled *atomic.Int32) {
	select {
	case <-time.After(delay):
		select {
		case out <- name:
		case <-ctx.Done():
			cancelled.Add(1)
		}
	case <-ctx.Done():
		cancelled.Add(1)
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	out := make(chan string)
	var cancelled atomic.Int32
	var wg sync.WaitGroup
	for name, delay := range map[string]time.Duration{
		"mirror-slow": 400 * time.Millisecond, "mirror-fast": 10 * time.Millisecond, "mirror-medium": 200 * time.Millisecond,
	} {
		wg.Add(1)
		go func() { defer wg.Done(); query(ctx, name, delay, out, &cancelled) }()
	}
	fmt.Println("first answer from", <-out)
	cancel()
	wg.Wait() // every query goroutine has now returned
	fmt.Println("cancelled:", cancelled.Load())
}
```

```console
$ go run -race ./firstctx
first answer from mirror-fast
cancelled: 2
```

After `cancel()`, both slow queries see `ctx.Done()` and return instead of sleeping on, and `wg.Wait()` proves that every goroutine has exited: nothing leaks, and the race detector finds nothing to report.

## 🔑 Key Points to Remember

- A data race is unsynchronised concurrent access with at least one write. A racy program has no defined behaviour, even when its output looks right.
- `go run -race` / `go test -race` finds races that happen during the run. Use it in CI.
- Guard shared state with a `sync.Mutex` next to the data; use `sync/atomic` for lone counters and flags.
- Never copy a mutex; plain maps must not be written concurrently.
- Pass `context.Context` first, check `ctx.Done()` where you wait, always `defer cancel()`.

## 📝 Homework

1. Replace the `Counter` mutex in section 3 with one goroutine that owns the map and receives increments over a channel. Compare the code and the run time with `time go run ./mutex`.
2. Look up `sync.Once` and use it to initialise a value lazily and safely from many goroutines.
3. What does `context.WithValue` do, and why does its documentation say to use it only for request-scoped data, not for passing optional parameters?
