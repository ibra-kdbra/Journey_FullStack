# Lesson 2: Values, Slices and Maps

## 🎯 Lesson Objectives

After this lesson, you will be able to:

- Rely on zero values instead of initialising everything by hand
- Predict when Go copies a value and when two variables share data
- Explain a slice as a view onto an array — pointer, length, capacity — and avoid the `append` aliasing trap
- Use maps safely: nil maps, the comma-ok idiom, and iteration order
- Iterate over a map in a stable order with `slices.Sorted(maps.Keys(m))`

## 📝 Detailed Content

### 1. Zero Values

Every Go variable has a value from the moment it is declared. There is no "uninitialised": each type has a **zero value** — `0`, `""`, `false`, `nil` for pointers, slices, maps, channels, functions and interfaces, and for structs, a struct whose fields are all zero.

```console
$ mkdir values && cd values
$ go mod init example.com/values
go: creating new go.mod: module example.com/values
```

```go [values/zero/main.go]
package main

import "fmt"

type Account struct {
	Owner   string
	Balance int
	Frozen  bool
	Tags    []string
}

func main() {
	var n int
	var s string
	var p *int
	var a Account
	fmt.Printf("%d %q %v\n", n, s, p)
	fmt.Printf("%+v\n", a)
	fmt.Println(len(a.Tags), a.Tags == nil)
}
```

```console
$ go run ./zero
0 "" <nil>
{Owner: Balance:0 Frozen:false Tags:[]}
0 true
```

`%+v` prints struct fields by name. A nil slice has length 0 and works with `len`, `range` and `append` — so a type whose zero value is useful as-is (an empty account, an empty `bytes.Buffer`, an unlocked `sync.Mutex`) needs no constructor. Designing types this way is idiomatic Go.

### 2. Assignment Copies

Assigning a value, or passing it to a function, copies it. For numbers that is obvious; it is equally true of arrays and structs:

```go [values/copies/main.go]
package main

import "fmt"

type Point struct{ X, Y int }

func moveRight(p Point) { p.X++ }

func moveRightPtr(p *Point) { p.X++ }

func main() {
	a := [3]int{1, 2, 3}
	b := a // copies all three elements
	b[0] = 100
	fmt.Println(a, b)

	p := Point{1, 1}
	moveRight(p)
	fmt.Println(p)
	moveRightPtr(&p)
	fmt.Println(p)
}
```

```console
$ go run ./copies
[1 2 3] [100 2 3]
{1 1}
{2 1}
```

`moveRight` changed its own copy. To let a function change the caller's value, pass a pointer — `&p` — and the function works through it. Go has no reference types in the C++ sense; sharing is always visible in the code, as a pointer or as one of the types below that contain one.

### 3. Slices Are Views

A slice does not hold elements. It is a small struct — a pointer into an array, a length and a capacity — and copying a slice copies that header, not the array. Two slices can therefore see the same elements:

```go [values/views/main.go]
package main

import "fmt"

func main() {
	arr := [5]int{10, 20, 30, 40, 50}
	s := arr[1:4] // elements 1, 2 and 3
	fmt.Println(s, len(s), cap(s))

	s[0] = 99 // writes to arr[1]
	fmt.Println(arr)

	t := s // copies the header, shares the array
	t[1] = 77
	fmt.Println(s, arr)
}
```

```console
$ go run ./views
[20 30 40] 3 4
[10 99 30 40 50]
[99 77 40] [10 99 77 40 50]
```

`cap(s)` is 4: from `s`'s first element to the end of `arr`. Writing through `s` or `t` writes to `arr`, because all three share the same storage.

### 4. The `append` Trap

`append` adds elements to a slice. If the underlying array has spare capacity, it writes there *in place* and returns a longer header over the same array; only when capacity runs out does it allocate a new, bigger array and copy. So two appends to the same slice can overwrite each other:

```go [values/aliasing/main.go]
package main

import "fmt"

func main() {
	base := make([]int, 3, 10) // length 3, room for 10
	a := append(base, 1)
	b := append(base, 2) // same spare slot as a's 1
	fmt.Println(a, b)

	full := []int{0, 0, 0} // length 3, capacity 3: no spare room
	c := append(full, 1)
	d := append(full, 2) // each append copies to a new array
	fmt.Println(c, d)
}
```

```console
$ go run ./aliasing
[0 0 0 2] [0 0 0 2]
[0 0 0 1] [0 0 0 2]
```

`a` now ends in `2`: both appends wrote into the same element of `base`'s array, and the second one won. With no spare capacity, each `append` copied to a fresh array, and `c` and `d` are independent. Whether a bug appears therefore depends on capacity — a detail that changes with how the slice was built.

The rule that avoids it: **use the result of `append` as the new value of the slice you appended to** (`s = append(s, x)`), and never append to a slice you do not own. When a function must hand out a sub-slice that callers might append to, cap it with a *full slice expression*, `s[low:high:max]`, so their append must copy:

```go [values/fullslice/main.go]
package main

import "fmt"

func main() {
	data := []int{1, 2, 3, 4, 5}
	head := data[:2:2] // length 2, capacity 2
	head = append(head, 100)
	fmt.Println(data, head)

	loose := data[:2] // capacity 5
	loose = append(loose, 100)
	fmt.Println(data, loose)
}
```

```console
$ go run ./fullslice
[1 2 3 4 5] [1 2 100]
[1 2 100 4 5] [1 2 100]
```

The capped slice left `data` alone; the loose one overwrote `data[2]`.

### 5. Maps

A map is a reference to a hash table: copying a map variable shares the table. Reading a missing key returns the zero value, so to tell "missing" from "present but zero", use the two-value form:

```go [values/maps/main.go]
package main

import "fmt"

func main() {
	stock := map[string]int{"apples": 5, "pears": 0}
	fmt.Println(stock["pears"], stock["plums"])

	if n, ok := stock["pears"]; ok {
		fmt.Println("pears in the map:", n)
	}
	if _, ok := stock["plums"]; !ok {
		fmt.Println("no plums entry")
	}

	alias := stock
	alias["plums"] = 7
	fmt.Println(len(stock), stock["plums"])

	delete(stock, "apples")
	fmt.Println(len(stock))
}
```

```console
$ go run ./maps
0 0
pears in the map: 0
no plums entry
3 7
2
```

A **nil** map — the zero value of a map type — can be read, and reports every key missing. Writing to it panics:

```go [values/nilmap/main.go]
package main

import "fmt"

func main() {
	var counts map[string]int
	fmt.Println(counts["x"], len(counts))
	counts["x"]++
}
```

A panic ends the program with exit status 2 — `go run` reports it as `exit status 2` — after printing the panic message and a stack trace. The trace contains a temporary path and memory offsets that change from run to run, so this transcript keeps only the lines that do not:

```console
$ go run ./nilmap 2>&1 | grep -E '^(0 0|panic:|exit status)'
0 0
panic: assignment to entry in nil map
exit status 2
```

The program printed its first line, then died on the write. Create maps with `make(map[K]V)` or a literal before writing to them.

### 6. Map Order Is Random — On Purpose

Iterating over a map with `range` visits keys in an unspecified order, and Go deliberately randomises it, so that no program comes to depend on one:

```go [values/order/main.go]
package main

import (
	"fmt"
	"maps"
	"slices"
	"strings"
)

func main() {
	m := map[string]int{"a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8}

	seen := map[string]bool{}
	for i := 0; i < 100; i++ {
		var order []string
		for k := range m {
			order = append(order, k)
		}
		seen[strings.Join(order, "")] = true
	}
	fmt.Println("100 loops over the same map, distinct orders:", len(seen) > 1)

	for _, k := range slices.Sorted(maps.Keys(m)) {
		fmt.Print(k, "=", m[k], " ")
	}
	fmt.Println()
}
```

```console
$ go run ./order
100 loops over the same map, distinct orders: true
a=1 b=2 c=3 d=4 e=5 f=6 g=7 h=8
```

The same map, iterated a hundred times, came out in more than one order. When order matters — output, tests, anything a person reads — sort the keys. `maps.Keys` returns an *iterator* over the keys (Go 1.23 added iterators to the language), and `slices.Sorted` collects one into a sorted slice.

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Fix a Function That Leaks Its Buffer

This function is meant to return a *copy* of the first `n` elements, but callers who append to the result corrupt the original. Show the bug, then fix it with `slices.Clone`.

**Solution:**

```go [values/leak/main.go]
package main

import (
	"fmt"
	"slices"
)

func firstN(s []int, n int) []int { return s[:n] }

func firstNSafe(s []int, n int) []int { return slices.Clone(s[:n]) }

func main() {
	orig := []int{1, 2, 3, 4}
	got := append(firstN(orig, 2), 99)
	fmt.Println("buggy:", orig, got)

	orig = []int{1, 2, 3, 4}
	got = append(firstNSafe(orig, 2), 99)
	fmt.Println("fixed:", orig, got)
}
```

```console
$ go run ./leak
buggy: [1 2 99 4] [1 2 99]
fixed: [1 2 3 4] [1 2 99]
```

The buggy version returned a view whose capacity reached into `orig`, so the caller's `append` overwrote `orig[2]`. `slices.Clone` returns a slice with its own array. A full slice expression, `s[:n:n]`, would also have prevented this, more cheaply — the append would have copied then instead.

### Exercise 2: Count Words in a Stable Order

Count how often each word occurs in `"the cat and the hat and the bat"` and print the counts alphabetically.

**Solution:**

```go [values/words/main.go]
package main

import (
	"fmt"
	"maps"
	"slices"
	"strings"
)

func main() {
	counts := map[string]int{}
	for _, w := range strings.Fields("the cat and the hat and the bat") {
		counts[w]++
	}
	for _, w := range slices.Sorted(maps.Keys(counts)) {
		fmt.Printf("%-4s %d\n", w, counts[w])
	}
}
```

```console
$ go run ./words
and  2
bat  1
cat  1
hat  1
the  3
```

`counts[w]++` works on a missing key because the zero value of `int` is 0: no "if not present, set to 0" step is needed.

## 🔑 Key Points to Remember

- Every type has a zero value; design types whose zero value is ready to use.
- Assignment and function arguments copy values — including arrays and structs. Use pointers to share.
- A slice is a header (pointer, length, capacity) over an array; copying a slice shares the array.
- `append` writes in place when there is capacity: always assign its result, and cap slices you hand out (`s[a:b:b]`) or clone them.
- Maps: read missing keys as zero, use `v, ok := m[k]` to tell, never write to a nil map, and never rely on iteration order.

## 📝 Homework

1. Print `len` and `cap` of a slice after each of 20 appends starting from `nil`. When does the capacity jump, and by how much?
2. Write a function that removes the element at index `i` from a slice, in place, and check the result with `slices.Delete`.
3. Two maps are equal if they have the same keys and values. `==` does not work on maps — find the standard-library function that does this comparison.
