# Lesson 8: Functions and Packages

## 🎯 **Lesson Objectives**

- Understand how to define and call **functions** in Go.
- Master different parameter types and **multiple return values**.
- Learn about **variadic functions** and **anonymous functions**.
- Understand the concept of **packages** and how to organize code.
- Learn how to **export** variables and functions to other packages.

## 📝 **Detailed Content**

### 1. **Functions in Go**

**Concept:**
Functions are building blocks of a program, used to group code that performs a specific task.

**Syntax:**

```go
func functionName(parameter1 type, parameter2 type) returnType {
    // code
    return result
}
```

**Example:**

```go
func add(a int, b int) int {
    return a + b
}
```

### 2. **Multiple Return Values**

Go functions can return more than one value. This is frequently used to return a result along with an error.

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return a / b, nil
}
```

### 3. **Variadic Functions**

A variadic function can accept any number of trailing arguments.

```go
func sumAll(nums ...int) int {
    total := 0
    for _, num := range nums {
        total += num
    }
    return total
}
```

### 4. **Anonymous Functions and Closures**

Go supports anonymous functions, which can form closures.

```go
func main() {
    addOne := func(x int) int {
        return x + 1
    }
    fmt.Println(addOne(5)) // 6
}
```

### 5. **Packages and Visibility**

**Packages:**
Every Go file belongs to a package. Packages help organize code and create namespaces.

**Visibility (Exporting):**

- If a name starts with an **uppercase** letter (e.g., `Calculate`), it is **exported** and visible outside the package.
- If it starts with a **lowercase** letter (e.g., `calculate`), it is **unexported** (private).

## 🏆 **Hands-on Exercise**

### ✅ **Exercise 1: Geometry Calculator**

**Task:**
Create a package named `geometry` that contains functions to calculate:

- The area of a rectangle.
- The perimeter of a rectangle.
- Export these functions so they can be used in your `main` package.

### ✅ **Exercise 2: Multi-math Function**

**Task:**
Write a function `minMax` that takes a slice of integers and returns both the minimum and maximum values.

## 🔑 **Key Points to Remember**

| 🔍 Topic        | ❗ Note                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| Return Values   | Use `(type1, type2)` for multiple returns.                                             |
| Named Returns   | You can name return variables in the function signature.                               |
| `init()`        | A special function that runs automatically when a package is initialized.              |
| Imports         | Unused imports cause compilation errors in Go.                                         |
| Parameter Types | If multiple parameters share a type, you can omit all but the last (e.g., `a, b int`). |

## 📝 **Homework**

### 🧪 **Task 1: String Utilities**

**Requirements:**
Create a package named `strutils` with:

- A function to reverse a string.
- A function to count vowels in a string.
- Ensure both functions are exported.

### 🧪 **Task 2: Recursive Factorial**

**Requirements:**
Write a function that calculates the factorial of a number using recursion. Ensure you handle the base case (0! = 1).
