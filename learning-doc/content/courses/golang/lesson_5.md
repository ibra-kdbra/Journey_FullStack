# Lesson 5: Goroutines and Channels

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Start goroutines, and wait for them with `sync.WaitGroup`
- Pass values between goroutines with channels, and close channels to signal "no more"
- Recognise the deadlock error and what causes it
- Wait on several channels at once, with a timeout, using `select`
- Build a worker pool whose output is deterministic, however the goroutines are scheduled

## 📝 Detailed Content

### 1. Goroutines

`go f()` starts `f` running concurrently, in a **goroutine** — a function executing independently, scheduled by the Go runtime onto operating-system threads. Goroutines are cheap: a few kilobytes of stack to start with, so a program can run hundreds of thousands of them.

The first thing to learn about them is that `main` does not wait:

```console
$ mkdir conc && cd conc
$ go mod init example.com/conc
go: creating new go.mod: module example.com/conc
```

```go [conc/nowait/main.go]
package main

import (
	"fmt"
	"time"
)

func main() {
	go func() {
		time.Sleep(100 * time.Millisecond)
		fmt.Println("from the goroutine")
	}()
	fmt.Println("main is done")
}
```

```console
$ go run ./nowait
main is done
```

When `main` returns, the program exits, and every goroutine still running is abandoned mid-flight. The goroutine never got to print.

### 2. Waiting with `sync.WaitGroup`

A `WaitGroup` counts outstanding goroutines: `Add` before starting each one, `Done` when it finishes, `Wait` to block until the count reaches zero. To keep results in a predictable order, give each goroutine its own slot to write:

```go [conc/waitgroup/main.go]
package main

import (
	"fmt"
	"strings"
	"sync"
)

func main() {
	words := []string{"alpha", "beta", "gamma", "delta"}
	results := make([]string, len(words))

	var wg sync.WaitGroup
	for i, w := range words {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results[i] = strings.ToUpper(w)
		}()
	}
	wg.Wait()
	fmt.Println(results)
}
```

```console
$ go run ./waitgroup
[ALPHA BETA GAMMA DELTA]
```

The goroutines run in whatever order the scheduler chooses, but each writes only its own element, so the result is always in input order — and because no two goroutines touch the same memory, this is safe (lesson 6 shows what happens when they do).

Each goroutine uses `i` and `w` from its own loop iteration. Since Go 1.22, every iteration of a `for` loop has fresh variables; in older versions all the goroutines would have shared one `i` and one `w`, a classic bug that `go vet`'s `loopclosure` check still looks for in older modules.

### 3. Channels

A channel is a typed pipe between goroutines. `ch <- v` sends, `v := <-ch` receives. On an **unbuffered** channel, a send waits until a receiver takes the value — so a send and its receive are also a synchronisation point:

```go [conc/pingpong/main.go]
package main

import "fmt"

func main() {
	ping := make(chan int)
	pong := make(chan int)

	go func() {
		for n := range ping { // receives until ping is closed
			pong <- n * 10
		}
		close(pong)
	}()

	for i := 1; i <= 3; i++ {
		ping <- i
		fmt.Println("sent", i, "got", <-pong)
	}
	close(ping)

	_, ok := <-pong
	fmt.Println("pong still open:", ok)
}
```

```console
$ go run ./pingpong
sent 1 got 10
sent 2 got 20
sent 3 got 30
pong still open: false
```

`close(ch)` says "no more values". `for v := range ch` receives until the channel is closed and drained, and a receive from a closed channel returns the zero value with `ok == false`. Only the sender should close a channel, and only once: sending on a closed channel panics.

A **buffered** channel, `make(chan T, n)`, holds up to `n` values, so sends only block when it is full:

```go [conc/buffered/main.go]
package main

import "fmt"

func main() {
	queue := make(chan string, 3)
	queue <- "a"
	queue <- "b"
	fmt.Println(len(queue), cap(queue))
	close(queue)
	for item := range queue {
		fmt.Println(item)
	}
}
```

```console
$ go run ./buffered
2 3
a
b
```

No goroutine was needed: the buffer had room for both sends.

### 4. Deadlock

If every goroutine is blocked — waiting on a channel nobody will ever send to or receive from — the program can never make progress, and the runtime says so:

```go [conc/deadlock/main.go]
package main

import "fmt"

func main() {
	results := make(chan int)
	results <- 42 // blocks forever: nobody is receiving
	fmt.Println(<-results)
}
```

```console
$ go run ./deadlock 2>&1 | grep -E '^(fatal error|goroutine 1|exit status)'
fatal error: all goroutines are asleep - deadlock!
goroutine 1 [chan send]:
exit status 2
```

(The full message continues with a stack trace containing a temporary path; the transcript keeps the lines that do not change.) `goroutine 1 [chan send]` says what `main` was stuck on. An unbuffered send needs a receiver running *at the same time*, in another goroutine. The runtime can only detect a deadlock when *every* goroutine is stuck; a program with one healthy goroutine and ten deadlocked ones just hangs, which is why lesson 6's timeouts matter.

### 5. `select` and Timeouts

`select` waits on several channel operations and proceeds with whichever is ready first. With `time.After`, which delivers a value after a delay, it gives any operation a timeout:

```go [conc/timeout/main.go]
package main

import (
	"fmt"
	"time"
)

func slowSquare(n int, delay time.Duration) <-chan int {
	out := make(chan int, 1) // buffered, so the goroutine can finish even if nobody waits
	go func() {
		time.Sleep(delay)
		out <- n * n
	}()
	return out
}

func main() {
	for _, delay := range []time.Duration{10 * time.Millisecond, 500 * time.Millisecond} {
		select {
		case v := <-slowSquare(7, delay):
			fmt.Println("result:", v)
		case <-time.After(100 * time.Millisecond):
			fmt.Println("gave up after 100ms")
		}
	}
}
```

```console
$ go run ./timeout
result: 49
gave up after 100ms
```

`<-chan int` is a receive-only channel type: callers of `slowSquare` can only read from it. The one-element buffer matters: when the caller gives up, the goroutine can still complete its send and exit, instead of blocking forever on a channel nobody reads — a **goroutine leak**.

### 6. A Worker Pool

The standard shape for concurrent work: a channel of jobs, a fixed number of workers reading from it, a channel of results. Which worker handles which job, and in which order results arrive, varies from run to run — so the results carry what they belong to, and the collector sorts them:

```go [conc/pool/main.go]
package main

import (
	"fmt"
	"slices"
	"strings"
	"sync"
)

type result struct {
	word   string
	vowels int
}

func countVowels(s string) int {
	return strings.Count(s, "a") + strings.Count(s, "e") + strings.Count(s, "i") +
		strings.Count(s, "o") + strings.Count(s, "u")
}

func main() {
	words := strings.Fields("concurrency is not parallelism but it enables parallelism")
	jobs := make(chan string)
	results := make(chan result)

	var wg sync.WaitGroup
	for w := 0; w < 3; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for word := range jobs {
				results <- result{word, countVowels(word)}
			}
		}()
	}

	go func() {
		for _, word := range words {
			jobs <- word
		}
		close(jobs) // workers' range loops end
	}()

	go func() {
		wg.Wait()
		close(results) // the collector's range loop ends
	}()

	var all []result
	for r := range results {
		all = append(all, r)
	}
	slices.SortFunc(all, func(a, b result) int { return strings.Compare(a.word, b.word) })
	for _, r := range slices.CompactFunc(all, func(a, b result) bool { return a.word == b.word }) {
		fmt.Printf("%-12s %d\n", r.word, r.vowels)
	}
}
```

```console
$ go run ./pool
but          1
concurrency  3
enables      3
is           1
it           1
not          1
parallelism  4
```

Three details make this correct rather than lucky:

- The producer closes `jobs` when it has sent everything, which ends each worker's `range` loop.
- A separate goroutine closes `results` only after **all** workers are done (`wg.Wait()`); closing it any earlier would make a late worker's send panic.
- The collector sorts before printing (and drops the duplicate "parallelism"), so the output does not depend on scheduling.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: First Answer Wins

Query three "mirrors" concurrently, each with a different delay, and use the first answer. Make sure the slower goroutines do not leak.

**Solution:**

```go [conc/first/main.go]
package main

import (
	"fmt"
	"time"
)

func query(name string, delay time.Duration, out chan<- string) {
	time.Sleep(delay)
	out <- name
}

func main() {
	out := make(chan string, 3) // room for every answer: nobody blocks
	go query("mirror-slow", 400*time.Millisecond, out)
	go query("mirror-fast", 10*time.Millisecond, out)
	go query("mirror-medium", 200*time.Millisecond, out)
	fmt.Println("first answer from", <-out)
}
```

```console
$ go run ./first
first answer from mirror-fast
```

The buffer has room for all three answers, so the two losers can deliver theirs and exit even though nobody reads them. With an unbuffered channel they would block forever — harmless in a program about to exit, a steady memory leak in a long-running server. (Lesson 6's `context` is the tool for telling them to stop early instead.)

### Exercise 2: Fan In

Merge two channels into one, closing the output when both inputs are closed.

**Solution:**

```go [conc/merge/main.go]
package main

import (
	"fmt"
	"slices"
	"sync"
)

func merge(a, b <-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for _, in := range []<-chan int{a, b} {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for v := range in {
				out <- v
			}
		}()
	}
	go func() { wg.Wait(); close(out) }()
	return out
}

func emit(values ...int) <-chan int {
	ch := make(chan int)
	go func() {
		for _, v := range values {
			ch <- v
		}
		close(ch)
	}()
	return ch
}

func main() {
	var got []int
	for v := range merge(emit(1, 3, 5), emit(2, 4)) {
		got = append(got, v)
	}
	slices.Sort(got)
	fmt.Println(got)
}
```

```console
$ go run ./merge
[1 2 3 4 5]
```

The same close-after-`Wait` pattern as the worker pool: `out` is closed by the one goroutine that knows every sender has finished.

## 🔑 Key Points to Remember

- `go f()` starts a goroutine; `main` returning ends the program without waiting.
- `sync.WaitGroup` waits for a group of goroutines; give each its own result slot to keep order.
- Unbuffered channels synchronise sender and receiver; buffered channels decouple them up to their capacity.
- The sender closes a channel, once; `range` over a channel ends at close. Close a shared results channel only after all senders finish.
- `select` waits on several operations; `time.After` adds a timeout. Buffer or cancel so that abandoned goroutines can exit.
- Concurrent output is only deterministic if the program makes it so: collect, then sort.

## 📝 Homework

1. Remove the `wg.Wait()` goroutine from the worker pool and close `results` right after starting the workers. What happens, and why?
2. Rewrite the worker pool so that each result carries the index of its word, and rebuild the output in input order without sorting.
3. Measure how many goroutines a program can start that each block on a channel receive, using `runtime.NumGoroutine()`. Stop at a million.
