# Lesson 7: Capstone — A Tested, Concurrent Word Counter

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Write table-driven tests with subtests, and read `go test` output — passing, failing and cached
- Write example tests whose output `go test` checks
- Measure test coverage, run tests under the race detector, and write a benchmark
- Structure a small module: a library package, its tests, test data, and a command
- Combine interfaces, errors, goroutines and a mutex from lessons 3 to 6 in one program

## 📝 Detailed Content

### 1. The Package

The capstone is `wordfreq`: a library that counts words in text and reports the most frequent, and a command that uses it on files — counting several files concurrently.

```console
$ mkdir wordfreq && cd wordfreq
$ go mod init example.com/wordfreq
go: creating new go.mod: module example.com/wordfreq
```

```go [wordfreq/wordfreq.go]
// Package wordfreq counts word frequencies in text.
package wordfreq

import (
	"bufio"
	"cmp"
	"context"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"
	"sync"
	"unicode"
)

// Entry is one word and how often it occurred.
type Entry struct {
	Word  string
	Count int
}

// Count reads r and returns how often each word occurs. Words are compared
// case-insensitively, and punctuation around them is ignored.
func Count(r io.Reader) (map[string]int, error) {
	counts := map[string]int{}
	sc := bufio.NewScanner(r)
	sc.Split(bufio.ScanWords)
	for sc.Scan() {
		w := strings.TrimFunc(strings.ToLower(sc.Text()), func(c rune) bool {
			return !unicode.IsLetter(c) && !unicode.IsDigit(c)
		})
		if w != "" {
			counts[w]++
		}
	}
	if err := sc.Err(); err != nil {
		return nil, fmt.Errorf("count words: %w", err)
	}
	return counts, nil
}

// Top returns the n most frequent words, most frequent first; ties are broken
// alphabetically, so the result does not depend on map order.
func Top(counts map[string]int, n int) []Entry {
	entries := make([]Entry, 0, len(counts))
	for w, c := range counts {
		entries = append(entries, Entry{w, c})
	}
	slices.SortFunc(entries, func(a, b Entry) int {
		return cmp.Or(cmp.Compare(b.Count, a.Count), cmp.Compare(a.Word, b.Word))
	})
	return entries[:min(n, len(entries))]
}

// CountFiles counts the words in all the files, reading up to workers files
// at a time, and returns the combined counts. It stops early if ctx is
// cancelled, and fails if any file cannot be read.
func CountFiles(ctx context.Context, paths []string, workers int) (map[string]int, error) {
	var (
		mu    sync.Mutex
		total = map[string]int{}
		errs  []error
		wg    sync.WaitGroup
		jobs  = make(chan string)
	)
	for range workers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for path := range jobs {
				counts, err := countFile(path)
				mu.Lock()
				if err != nil {
					errs = append(errs, err)
				}
				for w, c := range counts {
					total[w] += c
				}
				mu.Unlock()
			}
		}()
	}
send:
	for _, p := range paths {
		select {
		case jobs <- p:
		case <-ctx.Done():
			break send
		}
	}
	close(jobs)
	wg.Wait()

	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if len(errs) > 0 {
		slices.SortFunc(errs, func(a, b error) int { return strings.Compare(a.Error(), b.Error()) })
		return nil, errs[0]
	}
	return total, nil
}

func countFile(path string) (map[string]int, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	counts, err := Count(f)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return counts, nil
}
```

Everything here comes from earlier lessons: `Count` takes an `io.Reader`, so it works on files, strings and network streams alike (lesson 3); errors are wrapped with context (lesson 4); `CountFiles` is a worker pool (lesson 5) whose shared map is guarded by a mutex (lesson 6) and which stops sending work when its context is cancelled. `Top` breaks ties alphabetically — lesson 2's map order would otherwise make its result change from run to run. (`for range workers` loops `workers` times; ranging over an integer arrived in Go 1.22, as did the built-in `min`.)

### 2. Table-Driven Tests

A test is a function `TestXxx(t *testing.T)` in a file ending in `_test.go`. The idiomatic shape is a **table**: a slice of cases, each run as a named subtest with `t.Run`:

```go [wordfreq/wordfreq_test.go]
package wordfreq

import (
	"context"
	"errors"
	"io/fs"
	"maps"
	"slices"
	"strings"
	"testing"
)

func TestCount(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want map[string]int
	}{
		{"empty", "", map[string]int{}},
		{"case folding", "Go go GO", map[string]int{"go": 3}},
		{"punctuation", "Hello, world! Hello?", map[string]int{"hello": 2, "world": 1}},
		{"only punctuation", "-- ... !!", map[string]int{}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Count(strings.NewReader(tt.in))
			if err != nil {
				t.Fatalf("Count(%q) error: %v", tt.in, err)
			}
			if !maps.Equal(got, tt.want) {
				t.Errorf("Count(%q) = %v, want %v", tt.in, got, tt.want)
			}
		})
	}
}

func TestTop(t *testing.T) {
	counts := map[string]int{"b": 2, "a": 2, "c": 5, "d": 1}
	want := []Entry{{"c", 5}, {"a", 2}, {"b", 2}}
	if got := Top(counts, 3); !slices.Equal(got, want) {
		t.Errorf("Top = %v, want %v", got, want)
	}
	if got := Top(counts, 10); len(got) != 4 {
		t.Errorf("Top(counts, 10) returned %d entries, want 4", len(got))
	}
}

func TestCountFiles(t *testing.T) {
	paths := []string{"testdata/one.txt", "testdata/two.txt", "testdata/three.txt"}
	got, err := CountFiles(context.Background(), paths, 2)
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]int{"the": 4, "gopher": 3, "runs": 2, "digs": 1, "sleeps": 1, "fast": 1}
	if !maps.Equal(got, want) {
		t.Errorf("CountFiles = %v, want %v", got, want)
	}
}

func TestCountFilesMissing(t *testing.T) {
	_, err := CountFiles(context.Background(), []string{"testdata/one.txt", "testdata/nope.txt"}, 2)
	if !errors.Is(err, fs.ErrNotExist) {
		t.Errorf("err = %v, want one wrapping fs.ErrNotExist", err)
	}
}

func TestCountFilesCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := CountFiles(ctx, []string{"testdata/one.txt"}, 1); !errors.Is(err, context.Canceled) {
		t.Errorf("err = %v, want context.Canceled", err)
	}
}
```

The test data lives in `testdata/`, a directory name the Go tool ignores when looking for packages — the conventional home for fixtures:

```text [wordfreq/testdata/one.txt]
The gopher runs.
```

```text [wordfreq/testdata/two.txt]
The gopher digs, the gopher runs fast.
```

```text [wordfreq/testdata/three.txt]
The ... sleeps!
```

```console
$ go test ./...
ok  	example.com/wordfreq	[...]
$ go test ./...
ok  	example.com/wordfreq	(cached)
```

`ok` with the package and the time taken (shown as `[...]`, since it varies). The second run says `(cached)`: Go remembers that nothing the tests depend on has changed — source, test data, environment — and reuses the result. `-count=1` forces a real run.

`-v` lists every test and subtest; `-run` selects them by a regular expression, `/` separating a test from its subtests:

```console
$ go test -v -run 'TestCount$/punct' .
=== RUN   TestCount
=== RUN   TestCount/punctuation
=== RUN   TestCount/only_punctuation
--- PASS: TestCount ([...])
    --- PASS: TestCount/punctuation ([...])
    --- PASS: TestCount/only_punctuation ([...])
PASS
ok  	example.com/wordfreq	[...]
```

### 3. A Failing Test

Tests earn their keep when code changes. Suppose someone "simplifies" `Top`'s sort to compare counts only:

```console
$ sed -i 's/return cmp.Or(cmp.Compare(b.Count, a.Count), cmp.Compare(a.Word, b.Word))/return cmp.Compare(b.Count, a.Count)/' wordfreq.go
$ go test -count=20 . > test.log; echo "exit $?"
exit 1
$ grep -m1 'wordfreq_test.go' test.log
    wordfreq_test.go:41: Top = [{c 5} {b 2} {a 2}], want [{c 5} {a 2} {b 2}]
```

With ties no longer broken, whether `a` or `b` comes first depends on the order the map handed them over — and lesson 2 showed that order is random. So a single `go test` run of this bug fails only about half the time. `-count=20` runs the tests twenty times, and it takes just one failure for `go test` to exit 1 and fail CI; the log shows the failure: `t.Errorf` reports the file and line, and the message says what was expected. Only one order is wrong, so the failure message is always the same. A test that fails *sometimes* is still telling you something — run it more, don't dismiss it. Put the line back:

```console
$ sed -i 's/return cmp.Compare(b.Count, a.Count)/return cmp.Or(cmp.Compare(b.Count, a.Count), cmp.Compare(a.Word, b.Word))/' wordfreq.go
$ go test -count=1 .
ok  	example.com/wordfreq	[...]
```

### 4. Examples Are Tests Too

An `ExampleXxx` function shows how to use `Xxx`. If it ends with an `// Output:` comment, `go test` runs it and compares what it printed — and `go doc` shows it as documentation:

```go [wordfreq/example_test.go]
package wordfreq_test

import (
	"fmt"
	"strings"

	"example.com/wordfreq"
)

func ExampleTop() {
	counts, _ := wordfreq.Count(strings.NewReader("to be or not to be"))
	for _, e := range wordfreq.Top(counts, 2) {
		fmt.Println(e.Word, e.Count)
	}
	// Output:
	// be 2
	// to 2
}
```

```console
$ go test -run Example -v .
=== RUN   ExampleTop
--- PASS: ExampleTop ([...])
PASS
ok  	example.com/wordfreq	[...]
```

The file declares `package wordfreq_test`: an *external* test package, which can only use `wordfreq`'s exported API, exactly as a user would. Documentation that is tested cannot drift out of date — the same idea as the transcripts in this course.

### 5. Coverage, Races and Benchmarks

`-cover` reports the share of statements the tests executed:

```console
$ go test -cover .
ok  	example.com/wordfreq	[...]	coverage: 94.0% of statements
```

`-coverprofile` records which lines, and `go tool cover -html` shows them in a browser — the quickest way to see which branches no test reaches. And because `CountFiles` is concurrent, its tests belong under the race detector too:

```console
$ go test -race -count=1 .
ok  	example.com/wordfreq	[...]
```

A benchmark is a `BenchmarkXxx(b *testing.B)` function. Go 1.24 added `b.Loop`, which runs the body as many times as it takes to get a stable measurement:

```go [wordfreq/bench_test.go]
package wordfreq

import (
	"strings"
	"testing"
)

func BenchmarkCount(b *testing.B) {
	text := strings.Repeat("the quick brown fox jumps over the lazy dog ", 1000)
	for b.Loop() {
		Count(strings.NewReader(text))
	}
}
```

```console
$ go test -run '^$' -bench Count -benchtime 20x . | grep -E '^(Benchmark|ok)'
BenchmarkCount[...]
ok  	example.com/wordfreq	[...]
```

`-run '^$'` matches no tests, so only the benchmark runs; `-benchtime 20x` fixes the iteration count. The name gets a `-N` suffix — the number of CPUs used — and the timing columns are machine-dependent, all shown as `[...]` here. Compare benchmarks with the `benchstat` tool across several runs; a single number means little.

### 6. The Command

A command in the same module lives under `cmd/`, as `package main`:

```go [wordfreq/cmd/wordfreq/main.go]
// Command wordfreq prints the most frequent words in the given files.
package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"

	"example.com/wordfreq"
)

func main() {
	n := flag.Int("n", 3, "how many words to print")
	flag.Parse()
	if flag.NArg() == 0 {
		fmt.Fprintln(os.Stderr, "usage: wordfreq [-n N] file...")
		os.Exit(2)
	}

	// Ctrl-C cancels the context, and CountFiles stops handing out work.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	counts, err := wordfreq.CountFiles(ctx, flag.Args(), 4)
	if err != nil {
		fmt.Fprintln(os.Stderr, "wordfreq:", err)
		os.Exit(1)
	}
	for _, e := range wordfreq.Top(counts, *n) {
		fmt.Printf("%-8s %d\n", e.Word, e.Count)
	}
}
```

```console
$ go run ./cmd/wordfreq testdata/*.txt
the      4
gopher   3
runs     2
$ go run ./cmd/wordfreq -n 1 testdata/two.txt
gopher   2
$ go run ./cmd/wordfreq testdata/one.txt testdata/nope.txt
wordfreq: open testdata/nope.txt: no such file or directory
exit status 1
$ go run ./cmd/wordfreq
usage: wordfreq [-n N] file...
exit status 2
$ go vet ./... && gofmt -l .
```

Every failure path exits non-zero with a message on stderr, and `go vet` and `gofmt` have nothing to say — the state a Go module should be in before every commit.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: A Test for the Tie-Break

Section 3's bug was caught only because `TestTop` happened to include a tie. Add a test that states the tie-break rule on its own, and check that it fails reliably against the broken sort by running it many times.

**Solution:**

```go [wordfreq/tie_test.go]
package wordfreq

import (
	"slices"
	"testing"
)

func TestTopBreaksTiesAlphabetically(t *testing.T) {
	counts := map[string]int{"delta": 1, "alpha": 1, "charlie": 1, "bravo": 1}
	want := []Entry{{"alpha", 1}, {"bravo", 1}, {"charlie", 1}, {"delta", 1}}
	if got := Top(counts, 4); !slices.Equal(got, want) {
		t.Errorf("Top = %v, want %v", got, want)
	}
}
```

```console
$ go test -count=1 -run TiesAlphabetically .
ok  	example.com/wordfreq	[...]
$ sed -i 's/return cmp.Or(cmp.Compare(b.Count, a.Count), cmp.Compare(a.Word, b.Word))/return cmp.Compare(b.Count, a.Count)/' wordfreq.go
$ go test -count=50 -run TiesAlphabetically . >/dev/null; echo "exit $?"
exit 1
$ sed -i 's/return cmp.Compare(b.Count, a.Count)/return cmp.Or(cmp.Compare(b.Count, a.Count), cmp.Compare(a.Word, b.Word))/' wordfreq.go
```

With four tied words there are 24 possible orders, and `-count=50` runs the test fifty times: the broken version fails at least once, so `go test` exits 1. A test whose subject is the rule itself is worth more than one that catches the rule by accident.

### Exercise 2: Fuzz the Counter

Go has fuzzing built in. Write a fuzz test asserting that no word `Count` returns is empty or contains upper-case letters, whatever the input.

**Solution:**

```go [wordfreq/fuzz_test.go]
package wordfreq

import (
	"strings"
	"testing"
)

func FuzzCount(f *testing.F) {
	f.Add("Hello, World!")
	f.Add("  --  ")
	f.Fuzz(func(t *testing.T, in string) {
		counts, err := Count(strings.NewReader(in))
		if err != nil {
			t.Skip() // e.g. a single "word" longer than the scanner's buffer
		}
		for w := range counts {
			if w == "" || w != strings.ToLower(w) {
				t.Errorf("Count(%q) produced word %q", in, w)
			}
		}
	})
}
```

```console
$ go test -count=1 -run FuzzCount .
ok  	example.com/wordfreq	[...]
```

A plain `go test` runs the fuzz test once per seed input (`f.Add`), as a regular test. `go test -fuzz FuzzCount` keeps generating new inputs until it finds a failure or you stop it — try it for a minute. When it finds one, it writes the input under `testdata/fuzz/`, where it becomes a permanent regression test.

## 🔑 Key Points to Remember

- Tests live in `_test.go` files; table-driven tests with `t.Run` subtests are the idiom. `t.Errorf` records a failure and continues; `t.Fatalf` stops the test.
- `go test` caches passing results; `-count=1` forces a run, `-run` selects tests, `-v` lists them.
- Example functions with `// Output:` are documentation that `go test` verifies.
- `-cover` measures coverage, `-race` belongs in CI, benchmarks use `b.Loop` and are compared, not read in isolation.
- Put fixtures in `testdata/`, commands in `cmd/<name>/`, and keep `go vet` and `gofmt -l` silent.

## 📝 Homework

1. Use `t.TempDir()` to write test files at test time instead of keeping them in `testdata/`. When is each approach better?
2. `CountFiles` returns the alphabetically first error. Change it to return every failure with `errors.Join`, and update the test.
3. Run `go test -fuzz FuzzCount -fuzztime 30s .`. Did it find anything? Read about `bufio.Scanner`'s token size limit and decide whether `Count` should handle longer words.
