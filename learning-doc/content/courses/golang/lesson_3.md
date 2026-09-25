# Lesson 3: Methods and Interfaces

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Attach methods to your own types, and choose between value and pointer receivers
- Explain how a type satisfies an interface without declaring it, and why that matters
- Read the "does not implement" compiler error, including the pointer-receiver case
- Avoid the typed-nil trap: an interface holding a nil pointer is not nil
- Use type switches, and compose small standard interfaces such as `io.Reader` and `fmt.Stringer`

## 📝 Detailed Content

### 1. Methods

A method is a function with a **receiver** — the value it is called on. Any named type you define can have methods, not only structs:

```console
$ mkdir shapes && cd shapes
$ go mod init example.com/shapes
go: creating new go.mod: module example.com/shapes
```

```go [shapes/receivers/main.go]
package main

import "fmt"

type Celsius float64

func (c Celsius) Fahrenheit() float64 { return float64(c)*9/5 + 32 }

type Counter struct{ n int }

func (c Counter) IncByValue()    { c.n++ } // works on a copy
func (c *Counter) IncByPointer() { c.n++ } // works on the caller's value

func main() {
	fmt.Println(Celsius(100).Fahrenheit())

	var c Counter
	c.IncByValue()
	fmt.Println(c.n)
	c.IncByPointer()
	fmt.Println(c.n)
}
```

```console
$ go run ./receivers
212
0
1
```

A **value receiver** gets a copy, exactly like a function argument (lesson 2): `IncByValue` incremented the copy and threw it away. A **pointer receiver** can change the value. Go takes the address automatically — `c.IncByPointer()` means `(&c).IncByPointer()` — so the call looks the same either way.

The rule of thumb: if any method needs to modify the receiver, or the type is large, or it contains something that must not be copied (such as a `sync.Mutex`), give *all* its methods pointer receivers. Mixing is legal but confusing.

### 2. Interfaces Are Satisfied Implicitly

An interface is a set of method signatures. A type satisfies it by having those methods — there is no `implements` declaration:

```go [shapes/implicit/main.go]
package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
}

type Rect struct{ W, H float64 }
type Circle struct{ R float64 }

func (r Rect) Area() float64   { return r.W * r.H }
func (c Circle) Area() float64 { return math.Pi * c.R * c.R }

func total(shapes []Shape) float64 {
	sum := 0.0
	for _, s := range shapes {
		sum += s.Area()
	}
	return sum
}

func main() {
	shapes := []Shape{Rect{3, 4}, Circle{1}, Rect{1, 1}}
	fmt.Printf("%.2f\n", total(shapes))
}
```

```console
$ go run ./implicit
16.14
```

Neither `Rect` nor `Circle` mentions `Shape`. That decoupling is the point: you can define an interface *where it is used*, describing only what that code needs, and types written years earlier — in other packages, even the standard library — satisfy it without being changed. Go interfaces are therefore usually small: one or two methods.

### 3. Method Sets: When a Type Does Not Implement

The pointer-receiver rule has a consequence. The methods of a value `T` are only its value-receiver methods; the methods of `*T` are both kinds. So if a method has a pointer receiver, only the pointer satisfies the interface:

```go [shapes/methodset/main.go]
package main

import "fmt"

type Shape interface{ Area() float64 }

type Square struct{ Side float64 }

func (s *Square) Area() float64 { return s.Side * s.Side }

func main() {
	var s Shape = Square{2}
	fmt.Println(s.Area())
}
```

```console
$ go run ./methodset
# example.com/shapes/methodset
methodset/main.go:12:16: cannot use Square{…} (value of struct type Square) as Shape value in variable declaration: Square does not implement Shape (method Area has pointer receiver)
```

The compiler says exactly what is wrong. `&Square{2}` would compile. The reason for the rule: a value stored in an interface is a copy that cannot be addressed, so a pointer method called through it could never modify the caller's value — Go refuses rather than silently changing a copy.

### 4. The Typed-Nil Trap

An interface value is a pair: a *type* and a *value*. It is `nil` only when **both** are unset. A nil pointer stored in an interface gives a pair with a type and a nil value — which is not a nil interface:

```go [shapes/typednil/main.go]
package main

import "fmt"

type NotFound struct{ Name string }

func (e *NotFound) Error() string { return e.Name + " not found" }

// find returns a *NotFound, which is nil when the name exists.
func find(name string) *NotFound {
	if name == "gopher" {
		return nil
	}
	return &NotFound{name}
}

// lookupBuggy returns find's result as an error.
func lookupBuggy(name string) error {
	return find(name)
}

// lookup returns a literal nil when there is no error.
func lookup(name string) error {
	if err := find(name); err != nil {
		return err
	}
	return nil
}

func main() {
	err := lookupBuggy("gopher")
	fmt.Println(err == nil, err != nil)
	fmt.Printf("%T %v\n", err, err == (*NotFound)(nil))

	fmt.Println(lookup("gopher") == nil)
}
```

```console
$ go run ./typednil
false true
*main.NotFound true
true
```

`lookupBuggy` found the gopher — `find` returned a nil `*NotFound` — and yet its caller sees a non-nil `error`, because the interface carries the type `*NotFound`. Every `if err != nil` above it will treat success as failure. The fix is the rule `lookup` follows: **return a literal `nil` for "no error", never a typed nil pointer.** Lesson 4 is about errors, and this trap comes up again there.

### 5. Type Switches and Assertions

To get the concrete value back out of an interface, use a type assertion — with the comma-ok form, so that a wrong guess does not panic — or a type switch:

```go [shapes/typeswitch/main.go]
package main

import "fmt"

func describe(v any) string {
	switch x := v.(type) {
	case nil:
		return "nothing"
	case int:
		return fmt.Sprintf("int %d, doubled %d", x, x*2)
	case string:
		return fmt.Sprintf("string of length %d", len(x))
	case fmt.Stringer:
		return "a Stringer: " + x.String()
	default:
		return fmt.Sprintf("something else: %T", x)
	}
}

type Version struct{ Major, Minor int }

func (v Version) String() string { return fmt.Sprintf("v%d.%d", v.Major, v.Minor) }

func main() {
	for _, v := range []any{nil, 21, "gopher", Version{1, 24}, 3.5} {
		fmt.Println(describe(v))
	}

	var v any = "hello"
	n, ok := v.(int)
	fmt.Println(n, ok)
}
```

```console
$ go run ./typeswitch
nothing
int 21, doubled 42
string of length 6
a Stringer: v1.24
something else: float64
0 false
```

`any` is the empty interface, `interface{}`: every type satisfies it. Inside each `case`, `x` has that case's type. A case can name an interface, like `fmt.Stringer` — any type with a `String() string` method — and `Version` has one, which is also why `fmt.Println(Version{1, 24})` would print `v1.24`.

### 6. Small Interfaces Compose: `io.Reader`

The standard library is built on tiny interfaces. `io.Reader` has one method — `Read(p []byte) (n int, err error)` — and files, network connections, compressed streams, HTTP bodies and strings all implement it. Anything written against `io.Reader` works with all of them, and readers can wrap readers:

```go [shapes/reader/main.go]
package main

import (
	"io"
	"os"
	"strings"
)

// upper wraps another Reader and upper-cases ASCII letters as they pass.
type upper struct{ r io.Reader }

func (u upper) Read(p []byte) (int, error) {
	n, err := u.r.Read(p)
	for i := 0; i < n; i++ {
		if 'a' <= p[i] && p[i] <= 'z' {
			p[i] -= 'a' - 'A'
		}
	}
	return n, err
}

func main() {
	src := strings.NewReader("small interfaces compose\n")
	io.Copy(os.Stdout, upper{src})
}
```

```console
$ go run ./reader
SMALL INTERFACES COMPOSE
```

`upper` knows nothing about where its bytes come from; `io.Copy` knows nothing about `upper`. Swap `strings.NewReader` for `os.Stdin` or an HTTP response body and nothing else changes.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Make a Type Print Itself

Give `Rect` from section 2 a `String` method so that `fmt.Println(Rect{3, 4})` prints `3×4 rectangle`, and check at compile time that `Rect` satisfies `fmt.Stringer`.

**Solution:**

```go [shapes/stringer/main.go]
package main

import "fmt"

type Rect struct{ W, H float64 }

func (r Rect) String() string { return fmt.Sprintf("%g×%g rectangle", r.W, r.H) }

// A compile-time assertion: this line fails to build if Rect ever stops
// satisfying fmt.Stringer. The blank identifier discards the value.
var _ fmt.Stringer = Rect{}

func main() {
	fmt.Println(Rect{3, 4})
	fmt.Printf("%v and %s\n", Rect{1, 2}, Rect{5, 6})
}
```

```console
$ go run ./stringer
3×4 rectangle
1×2 rectangle and 5×6 rectangle
```

The `var _ Interface = Type{}` line is a common idiom: implicit satisfaction means nothing else would tell you when a refactor breaks it until some distant call site fails to compile.

### Exercise 2: Count Bytes Without Buffering

Write a `countingWriter` that implements `io.Writer`, counts the bytes written through it, and passes them on to another writer. Use it to count what `fmt.Fprintf` writes.

**Solution:**

```go [shapes/counting/main.go]
package main

import (
	"fmt"
	"io"
	"os"
)

type countingWriter struct {
	w io.Writer
	n int
}

func (c *countingWriter) Write(p []byte) (int, error) {
	n, err := c.w.Write(p)
	c.n += n
	return n, err
}

func main() {
	cw := &countingWriter{w: os.Stdout}
	fmt.Fprintf(cw, "%s has %d legs\n", "a spider", 8)
	fmt.Fprintln(cw, "done")
	fmt.Println("bytes written:", cw.n)
}
```

```console
$ go run ./counting
a spider has 8 legs
done
bytes written: 25
```

`Write` has a pointer receiver because it updates `n`, so it is `*countingWriter` that satisfies `io.Writer` — hence `&countingWriter{...}`. Passing the struct value would not compile, for the method-set reason in section 3.

## 🔑 Key Points to Remember

- Methods can be defined on any named type; pointer receivers can modify the receiver, value receivers get a copy.
- Interfaces are satisfied implicitly. Define small interfaces where they are consumed.
- Only `*T` has `T`'s pointer-receiver methods, so only `*T` satisfies an interface that needs them.
- An interface holding a nil pointer is not nil. Return a literal `nil` for "no error".
- Get concrete values back with comma-ok assertions or type switches; lean on `io.Reader`, `io.Writer` and `fmt.Stringer`.

## 📝 Homework

1. Add a `Perimeter() float64` method to `Shape` in section 2. Which types stop compiling, and what does the error list?
2. Embed `io.Reader` in a struct (`type logged struct{ io.Reader }`) and override only `Read`. What does embedding give you for free?
3. Why does `fmt.Println` print a `*Version` using its `String` method too, even though `String` has a value receiver?
