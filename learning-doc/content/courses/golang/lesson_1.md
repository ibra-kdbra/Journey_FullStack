# Lesson 1: Modules, Packages and the Toolchain

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Create a module and run, build and install a Go program
- Read the compiler's errors, including the ones other languages would only warn about
- Format code with `gofmt` and catch bugs with `go vet`
- Split a program into packages, and control what a package exports
- Read a package's documentation from the command line with `go doc`

## 📝 Detailed Content

### 1. One Command for Everything

Most languages hand you a compiler and leave the rest — formatting, testing, dependency management, documentation — to separately installed tools. Go ships all of it behind one command, `go`, and the rest of this course uses nothing else. Start by checking which release you have:

```console
$ go env GOVERSION
go1.24.7
```

### 2. A Module

Go code lives in **modules**: a directory tree with a `go.mod` file at its root naming the module. The name is conventionally where the code would be published, but it only has to be unique:

```console
$ mkdir hello && cd hello
$ go mod init example.com/hello
go: creating new go.mod: module example.com/hello
$ cat go.mod
module example.com/hello

go 1.24.7
```

The `go` line records the language version the module is written for. Now a program:

```go [hello/main.go]
package main

import "fmt"

func main() {
	fmt.Println("hello, world")
}
```

A program is a package named `main` with a function `main`. `go run` compiles it to a temporary binary and runs it; `go build` produces a binary you keep:

```console
$ go run .
hello, world
$ go build -o hello .
$ ./hello
hello, world
```

The binary is statically linked and self-contained: copy it to another Linux machine of the same architecture and it runs, with no Go installed. `GOOS` and `GOARCH` cross-compile for another platform from the same machine — `GOOS=windows GOARCH=amd64 go build .` produces a Windows executable.

### 3. The Compiler Is Strict

Go refuses to compile some things other languages merely warn about. An unused variable and an unused import are errors:

```go [strict/main.go]
package main

import (
	"fmt"
	"os"
)

func main() {
	message := "never printed"
	fmt.Println("hello")
}
```

```console
$ cd ../strict
$ go mod init example.com/strict
go: creating new go.mod: module example.com/strict
go: to add module requirements and sums:
	go mod tidy
$ go build .
# example.com/strict
./main.go:5:2: "os" imported and not used
./main.go:9:2: declared and not used: message
```

Two errors, each with `file:line:column`. The strictness is deliberate: an unused import slows every build of every program that depends on the package, and an unused variable is very often a bug — a value computed and then forgotten. Delete both lines and the program compiles.

### 4. `gofmt`: One Style

Go has exactly one formatting style, and `gofmt` applies it. Here is a file written carelessly:

```go [format/main.go]
package main
import "fmt"
func main(){
    total:=0
  for i:=1;i<=3;i++{ total+=i }
	fmt.Println( "total:",total )
}
```

```console
$ cd ../format
$ go mod init example.com/format
go: creating new go.mod: module example.com/format
go: to add module requirements and sums:
	go mod tidy
$ gofmt -l .
main.go
$ gofmt -w main.go
$ gofmt -l .
$ cat main.go
package main

import "fmt"

func main() {
	total := 0
	for i := 1; i <= 3; i++ {
		total += i
	}
	fmt.Println("total:", total)
}
```

`gofmt -l` lists files whose formatting differs from the standard; after `-w` rewrites them, it lists nothing. Tabs for indentation, spaces around operators, braces on the same line: nobody argues about style in Go code review, because the tool decided. Editors run `gofmt` on save, and CI pipelines typically fail the build when `gofmt -l` prints anything.

### 5. `go vet`: Bugs the Compiler Allows

Some mistakes are legal Go. `go vet` looks for suspicious constructs — the classic is a `Printf` whose verbs do not match its arguments:

```go [vet/main.go]
package main

import "fmt"

func main() {
	name := "gopher"
	age := 13
	fmt.Printf("%s is %d years old\n", age, name)
}
```

```console
$ cd ../vet
$ go mod init example.com/vet
go: creating new go.mod: module example.com/vet
go: to add module requirements and sums:
	go mod tidy
$ go run .
%!s(int=13) is %!d(string=gopher) years old
$ go vet .
# example.com/vet
# [example.com/vet]
./main.go:8:2: fmt.Printf format %s has arg age of wrong type int
```

The program compiles and runs — and prints nonsense: `%!s(int=13)` is how `fmt` reports a verb applied to the wrong type. `go vet` catches it before it ships. (`go test` runs a subset of these checks automatically, which lesson 7 relies on.)

### 6. Packages and Exported Names

A package is a directory of `.go` files that all say the same `package` name. Another package uses it by importing its path — the module path plus the directory. Inside a package, a name is **exported** — visible to importers — if and only if it starts with a capital letter. There are no `public` or `private` keywords.

```go [shop/price/price.go]
// Package price formats and computes prices held as whole cents.
package price

import "fmt"

// Format renders cents as a price such as "$12.50".
func Format(cents int) string {
	return fmt.Sprintf("$%d.%02d", cents/100, cents%100)
}

// WithTax adds tax at the given percentage, rounding half up.
func WithTax(cents, percent int) int {
	return cents + roundDiv(cents*percent, 100)
}

func roundDiv(a, b int) int {
	return (a + b/2) / b
}
```

```go [shop/main.go]
package main

import (
	"fmt"

	"example.com/shop/price"
)

func main() {
	fmt.Println(price.Format(1250))
	fmt.Println(price.Format(price.WithTax(1250, 8)))
}
```

```console
$ cd ../shop
$ go mod init example.com/shop
go: creating new go.mod: module example.com/shop
go: to add module requirements and sums:
	go mod tidy
$ go run .
$12.50
$13.50
```

`Format` and `WithTax` are exported; `roundDiv` is not, and code outside the package cannot call it:

```go [shop/sneaky/main.go]
package main

import (
	"fmt"

	"example.com/shop/price"
)

func main() {
	fmt.Println(price.roundDiv(7, 2))
}
```

```console
$ go run ./sneaky
# example.com/shop/sneaky
sneaky/main.go:10:20: name roundDiv not exported by package price
$ rm -r sneaky
```

A package's unexported names are its implementation, free to change without breaking anyone. Go also has a stronger form: packages under a directory named `internal` can only be imported from within the tree rooted at `internal`'s parent — used to share code between a module's own packages without offering it to the world.

### 7. Documentation From Comments

The comments immediately above the package clause and above each exported name are its documentation. `go doc` reads them:

```console
$ go doc ./price
package price // import "example.com/shop/price"

Package price formats and computes prices held as whole cents.

func Format(cents int) string
func WithTax(cents, percent int) int
$ go doc ./price WithTax
package price // import "example.com/shop/price"

func WithTax(cents, percent int) int
    WithTax adds tax at the given percentage, rounding half up.
```

There is no separate documentation format to learn: write a sentence that starts with the name, and it is documentation — here, and on pkg.go.dev for published modules.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Build for Another Platform

Build the `hello` program for Windows on amd64 and for Linux on arm64, then ask Go which platform each binary was built for. `go version -m` reads the build information Go embeds in every binary it produces.

**Solution:**

```console
$ cd ../hello
$ GOOS=windows GOARCH=amd64 go build -o hello.exe .
$ GOOS=linux GOARCH=arm64 go build -o hello-arm64 .
$ go version -m hello.exe | grep -E 'GOOS|GOARCH'
	build	GOARCH=amd64
	build	GOOS=windows
$ go version -m hello-arm64 | grep -E 'GOOS|GOARCH'
	build	GOARCH=arm64
	build	GOOS=linux
```

No cross-compiler to install, no SDK: the Go toolchain carries every target with it, as long as the program does not use cgo. The embedded build information — Go version, module path, target, settings — is also how security scanners find out what a Go binary was built from.

### Exercise 2: What Does `vet` Know About?

A condition that tests the same thing twice is legal Go and almost always a typo. Write one, and see whether `go vet` notices. Then list some of the analyzers `vet` runs.

**Solution:**

```go [vet/check.go]
package main

func inRange(x int) bool {
	return x > 0 || x > 0
}
```

```console
$ cd ../vet
$ go vet . 2>&1 | grep check.go
./check.go:4:9: redundant or: x > 0 || x > 0
$ go tool vet help | grep -E '^ +(printf|bools|copylocks|loopclosure|unreachable)' | sort
    bools        check for common mistakes involving boolean operators
    copylocks    check for locks erroneously passed by value
    loopclosure  check references to loop variables from within nested functions
    printf       check consistency of Printf format strings and arguments
    unreachable  check for unreachable code
```

The `bools` analyzer flags the redundant `||` — the author surely meant `x > 0 || x < -10` or similar. Not every suspicious pattern is covered: comparing a value with itself (`x == x`), for instance, is not a `vet` check. Third-party linters such as `staticcheck` go further, with more checks and more opinions; `vet` sticks to problems that are almost never intended.

## 🔑 Key Points to Remember

- `go` is the whole toolchain: `mod init`, `run`, `build`, `vet`, `doc`, `test`, and `gofmt` beside it.
- A module is a tree with a `go.mod`; a package is a directory; a program is `package main` with `func main`.
- Unused variables and imports are compile errors, by design.
- `gofmt` settles formatting; `go vet` catches legal-but-wrong code such as mismatched `Printf` verbs.
- Capitalised names are exported; lower-case names are private to their package. `internal/` restricts importers further.

## 📝 Homework

1. Run `go build -x .` in `hello` and skim what it prints. What does `go build` actually do?
2. Add `//go:build ignore` as the first line of a `.go` file and run `go build .`. What happened to the file? What are build constraints for?
3. Rename `Format` to `format` in `price.go`. Which file fails to compile, and what does the error say?
