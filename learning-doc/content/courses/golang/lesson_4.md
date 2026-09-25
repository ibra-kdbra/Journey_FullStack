# Lesson 4: Errors Are Values

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Return and check errors the Go way, and explain why there are no exceptions
- Add context to an error with `fmt.Errorf` and `%w` without losing the original
- Test for a kind of error with `errors.Is`, and extract details with `errors.As`
- Define your own error types and sentinel errors
- Use `defer` for clean-up, and know when `panic` and `recover` are appropriate

## 📝 Detailed Content

### 1. An Error Is a Returned Value

Go has no exceptions. A function that can fail returns an `error` as its last result, and the caller checks it:

```console
$ mkdir errs && cd errs
$ go mod init example.com/errs
go: creating new go.mod: module example.com/errs
```

```go [errs/basic/main.go]
package main

import (
	"fmt"
	"strconv"
)

func main() {
	for _, s := range []string{"42", "forty-two", "99999999999999999999"} {
		n, err := strconv.Atoi(s)
		if err != nil {
			fmt.Println("error:", err)
			continue
		}
		fmt.Println("parsed", n)
	}
}
```

```console
$ go run ./basic
parsed 42
error: strconv.Atoi: parsing "forty-two": invalid syntax
error: strconv.Atoi: parsing "99999999999999999999": value out of range
```

`error` is an ordinary interface — `interface{ Error() string }` — and an error is an ordinary value: you can store it, compare it, wrap it, pass it along. The cost is visible in the code, as `if err != nil` after every call that can fail. The benefit is that every place a function can fail is visible too: nothing can jump out of the middle of a function without it saying so.

### 2. Wrapping: Context Without Losing the Cause

An error that reaches the top of a program should say what the program was trying to do, not just what the lowest layer saw. `fmt.Errorf` with the `%w` verb adds context and **wraps** the original error inside the new one:

```go [errs/wrap/main.go]
package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
)

func loadConfig(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}
	return data, nil
}

func start() error {
	if _, err := loadConfig("/no/such/app.toml"); err != nil {
		return fmt.Errorf("start server: %w", err)
	}
	return nil
}

func main() {
	err := start()
	fmt.Println(err)
	fmt.Println(errors.Is(err, fs.ErrNotExist))

	var pathErr *fs.PathError
	if errors.As(err, &pathErr) {
		fmt.Println("op:", pathErr.Op, "path:", pathErr.Path)
	}
}
```

```console
$ go run ./wrap
start server: load config: open /no/such/app.toml: no such file or directory
true
op: open path: /no/such/app.toml
```

The message reads from the outside in, like a chain of reasons. And because each layer wrapped with `%w`, the original error is still inside:

- `errors.Is(err, target)` walks the chain looking for an error *equal to* `target` — here the standard sentinel `fs.ErrNotExist`, which `os.ReadFile` produced deep down.
- `errors.As(err, &target)` walks the chain looking for an error *of target's type*, and if it finds one, stores it in `target`, giving you its fields.

Never compare errors with `==` or by their message text: a single layer of wrapping would break both.

`%v` instead of `%w` formats the same message but does **not** wrap — the chain is cut. Use `%v` deliberately, when you do not want callers to depend on an implementation detail such as which file-system error occurred.

### 3. Your Own Errors

Two kinds are common. A **sentinel** is a package-level error value that callers test with `errors.Is`. An **error type** carries data, and callers extract it with `errors.As`:

```go [errs/custom/main.go]
package main

import (
	"errors"
	"fmt"
)

// ErrInsufficientFunds is returned when a withdrawal exceeds the balance.
var ErrInsufficientFunds = errors.New("insufficient funds")

// LimitError reports a withdrawal above the daily limit.
type LimitError struct {
	Limit, Requested int
}

func (e *LimitError) Error() string {
	return fmt.Sprintf("requested %d exceeds daily limit %d", e.Requested, e.Limit)
}

type Account struct{ Balance, DailyLimit int }

func (a *Account) Withdraw(amount int) error {
	if amount > a.DailyLimit {
		return &LimitError{Limit: a.DailyLimit, Requested: amount}
	}
	if amount > a.Balance {
		return fmt.Errorf("withdraw %d: %w", amount, ErrInsufficientFunds)
	}
	a.Balance -= amount
	return nil
}

func main() {
	acct := &Account{Balance: 100, DailyLimit: 500}
	for _, amount := range []int{30, 90, 800} {
		err := acct.Withdraw(amount)
		var limitErr *LimitError
		switch {
		case err == nil:
			fmt.Println("ok, balance now", acct.Balance)
		case errors.Is(err, ErrInsufficientFunds):
			fmt.Println("declined:", err)
		case errors.As(err, &limitErr):
			fmt.Println("over the limit by", limitErr.Requested-limitErr.Limit)
		}
	}
}
```

```console
$ go run ./custom
ok, balance now 70
declined: withdraw 90: insufficient funds
over the limit by 300
```

`Withdraw` returns a literal `nil` on success — lesson 3's typed-nil trap is exactly what happens if a function declared to return `*LimitError` has its result returned as an `error`.

### 4. Several Errors at Once

Sometimes several things fail and all of them matter — validating a form, closing several files. `errors.Join` combines errors into one; `errors.Is` and `errors.As` still find each of them:

```go [errs/join/main.go]
package main

import (
	"errors"
	"fmt"
	"strings"
)

var ErrEmpty = errors.New("empty")

func validate(name, email string) error {
	var errs []error
	if name == "" {
		errs = append(errs, fmt.Errorf("name: %w", ErrEmpty))
	}
	if !strings.Contains(email, "@") {
		errs = append(errs, fmt.Errorf("email %q: missing @", email))
	}
	return errors.Join(errs...) // nil when errs is empty
}

func main() {
	fmt.Println(validate("gopher", "gopher@example.com"))
	err := validate("", "nope")
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrEmpty))
}
```

```console
$ go run ./join
<nil>
name: empty
email "nope": missing @
true
```

A joined error prints one error per line. `errors.Join` returns `nil` when given no non-nil errors, so the "all valid" case needs no special handling.

### 5. `defer`: Clean-Up That Always Runs

A deferred call runs when the surrounding function returns — normally, early, or by panic. Deferred calls run in reverse order, and their arguments are evaluated when the `defer` statement runs, not when the call happens:

```go [errs/defer/main.go]
package main

import "fmt"

func work() (result string) {
	fmt.Println("open resource")
	defer fmt.Println("close resource")

	for i := 1; i <= 3; i++ {
		defer fmt.Println("deferred", i)
	}

	// A deferred closure can change named results after the return statement.
	defer func() { result += " (checked)" }()
	return "done"
}

func main() {
	fmt.Println(work())
}
```

```console
$ go run ./defer
open resource
deferred 3
deferred 2
deferred 1
close resource
done (checked)
```

`defer f.Close()` right after a successful `os.Open` is the idiom: the clean-up sits next to the acquisition, and it happens on every path out of the function.

### 6. `panic` and `recover`

`panic` is for situations that should never happen — a bug, a broken invariant — not for expected failures such as a missing file. It unwinds the stack, running deferred calls, and crashes the program unless a deferred function calls `recover`. The legitimate use of `recover` is at a boundary where one failure must not take down everything — a server handling one request among many:

```go [errs/recover/main.go]
package main

import "fmt"

func handle(req int) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("request %d: recovered from panic: %v", req, r)
		}
	}()
	data := []int{10, 20, 30}
	fmt.Println("request", req, "->", data[req])
	return nil
}

func main() {
	for _, req := range []int{0, 2, 7, 1} {
		if err := handle(req); err != nil {
			fmt.Println(err)
		}
	}
}
```

```console
$ go run ./recover
request 0 -> 10
request 2 -> 30
request 7: recovered from panic: runtime error: index out of range [7] with length 3
request 1 -> 20
```

Request 7 indexed past the end of the slice — a runtime panic — and the deferred `recover` turned it into an ordinary error for that request alone; requests after it were served. Go's `net/http` server does the same for each request's handler. Outside such boundaries, let panics crash: a program that recovers from its own bugs keeps running in a state nobody understands.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Report Which File Failed

Write `readAll(paths ...string) ([][]byte, error)` that reads every file, and on failure returns an error naming the file, which still satisfies `errors.Is(err, fs.ErrNotExist)` when a file is missing.

**Solution:**

```text [errs/files/a.txt]
alpha
```

```go [errs/files/main.go]
package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
)

func readAll(paths ...string) ([][]byte, error) {
	var out [][]byte
	for _, p := range paths {
		data, err := os.ReadFile(p)
		if err != nil {
			return nil, fmt.Errorf("reading %d files, failed at %s: %w", len(paths), p, err)
		}
		out = append(out, data)
	}
	return out, nil
}

func main() {
	if got, err := readAll("files/a.txt"); err == nil {
		fmt.Printf("%q\n", got[0])
	}
	_, err := readAll("files/a.txt", "files/missing.txt")
	fmt.Println(err)
	fmt.Println("missing file:", errors.Is(err, fs.ErrNotExist))
}
```

```console
$ go run ./files
"alpha\n"
reading 2 files, failed at files/missing.txt: open files/missing.txt: no such file or directory
missing file: true
```

(The paths are relative to where the program runs — the module root, `errs`.)

### Exercise 2: Wrap or Not?

A function `fetchUser` currently wraps a database driver's error with `%w`. Why might its maintainers switch to `%v`? What do callers lose?

**Solution:** With `%w`, the driver's error becomes part of `fetchUser`'s API: callers can — and will — write `errors.Is(err, somedriver.ErrConnReset)`, and replacing the database later breaks them. Switching to `%v` keeps the message for humans and logs, but callers can no longer match the driver's errors. The usual compromise is to translate: return your own sentinel (say, `ErrUnavailable`) wrapping nothing implementation-specific, so callers match on what you choose to promise.

## 🔑 Key Points to Remember

- Errors are values returned last; check them where they occur.
- Add context with `fmt.Errorf("doing x: %w", err)`; test with `errors.Is` (identity) and `errors.As` (type), never with `==` or string matching.
- `%w` makes the wrapped error part of your API; `%v` hides it.
- `errors.Join` reports several failures at once.
- `defer` runs clean-up on every exit path, last-in first-out. `panic` is for bugs; `recover` belongs only at boundaries such as request handlers.

## 📝 Homework

1. Make `LimitError` implement `Is(target error) bool` so that `errors.Is(err, ErrOverLimit)` matches any `*LimitError`. When is a custom `Is` worth it?
2. What does `errors.Unwrap` return for an error created by `errors.Join`? Look at the `errors` package documentation for the answer, then test it.
3. Find a `defer` in a loop in your own code, or write one. Why can deferring `Close` inside a loop over thousands of files be a problem?
