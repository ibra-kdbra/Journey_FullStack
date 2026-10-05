# Go: Concurrency, Interfaces and Tooling

Go is a small language with a large standard library and an opinionated toolchain. It is easy to learn the syntax in an afternoon and then write Go that looks like another language — Java with `if err != nil`, Python with braces. This course skips the syntax tour you can find anywhere and concentrates on the parts that make Go *Go*: the tool that builds, formats, vets and tests everything; values, slices and maps, and when they share memory; interfaces satisfied without being declared; errors as ordinary values; and goroutines and channels — and what it takes to make concurrent code correct.

The course runs in one direction: tooling first, because every lesson uses it; then the type system; then errors; then concurrency, first with channels and then with shared memory; and finally a capstone that combines all of it, with tests.

## How to use this course

Every lesson is built around shell transcripts and the files they use. A file is shown with its path in the block header, like `hello/main.go`: create it at that path, relative to an empty working directory for the lesson. A transcript looks like this:

```console
$ go env GOVERSION
go1.24.7
```

The line after `$ ` is what you type; everything up to the next `$ ` is what it prints. Even this example is checked: it prints the Go release the course was verified with. Output that is genuinely different on every run — how long a test took, one deliberately racy result — is shown as `[...]`, and the lesson says why at that point.

**These transcripts are tested, not illustrative.** `learning-doc/scripts/verify-go-transcripts.mjs` runs every lesson — writing its files, typing its commands into one shell, in order — and fails if any command prints something different. That includes the compiler's error messages, `go vet`'s findings, panics, the race detector and failing tests: when a lesson says "this does not compile" or "this deadlocks", it was run and it did. The transcripts were last verified with **Go 1.24.7** on Linux. Compiler messages and `go.mod` contents vary slightly between releases (a module created with Go 1.24.7 records `go 1.24.7`), so use Go 1.24 to match them exactly. Every program uses only the standard library: nothing is downloaded.

### Setting up

Install Go 1.24 from [go.dev/dl](https://go.dev/dl/) or your package manager, and check it with `go version`. Lesson 6's race detector needs a C compiler (`gcc` or `clang`) on Linux; on macOS and Windows it works out of the box. Any editor with the Go extension (gopls) will format on save and show `go vet` findings as you type.

## Part 1: Foundations

### Lesson 1: Modules, Packages and the Toolchain

**Content:**

- `go mod init`, `go run`, `go build`, and cross-compiling with `GOOS`/`GOARCH`
- A strict compiler: unused variables and imports are errors
- `gofmt` and `go vet`
- Packages, exported names, `internal/`, and `go doc`

**Activities:**

- Build one program for three platforms
- Find out what `go vet` catches — and what it does not

### Lesson 2: Values, Slices and Maps

**Content:**

- Zero values, and types that are ready to use without a constructor
- Assignment copies; pointers share
- Slices as views onto arrays, and the `append` aliasing trap
- Maps: missing keys, nil maps, and deliberately random iteration order

**Activities:**

- Fix a function that leaks its caller's buffer
- Count words and print them in a stable order

### Lesson 3: Methods and Interfaces

**Content:**

- Value and pointer receivers
- Implicit interface satisfaction, and method sets
- The typed-nil trap
- Type switches, `fmt.Stringer`, and composing `io.Reader`s

**Activities:**

- A type that prints itself, checked at compile time
- A counting `io.Writer`

### Lesson 4: Errors Are Values

**Content:**

- Returning and checking errors
- Wrapping with `%w`; `errors.Is` and `errors.As`
- Sentinel errors, error types, `errors.Join`
- `defer`, and when `panic` and `recover` belong

**Activities:**

- Report which file failed, without losing the cause
- Decide when to wrap and when to hide

## Part 2: Concurrency

### Lesson 5: Goroutines and Channels

**Content:**

- Goroutines, and waiting for them with `sync.WaitGroup`
- Unbuffered and buffered channels, closing, and `range`
- Deadlock, and what the runtime tells you
- `select`, timeouts, and a worker pool with deterministic output

**Activities:**

- First answer wins, without leaking goroutines
- Merge two channels into one

### Lesson 6: Sharing Memory Safely

**Content:**

- Data races, and the race detector
- `sync.Mutex`, `sync.RWMutex` and `sync/atomic`
- Cancellation and deadlines with `context`
- Choosing between channels and mutexes

**Activities:**

- Find and fix a race in a cache
- Cancel the losing goroutines

### Lesson 7: Capstone — A Tested, Concurrent Word Counter

**Content:**

- A library, its tests, its test data and a command in one module
- Table-driven tests, failing tests, cached results
- Example tests, coverage, `-race`, and benchmarks with `b.Loop`

**Activities:**

- A test for a rule, not an accident
- Fuzzing the word counter
