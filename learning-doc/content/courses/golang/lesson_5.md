# Lesson 5: Control Structures - Loops in Golang

## 🎯 Lesson Objectives

- Understand and master the different types of loops in Golang.
- Be proficient in the syntax and usage of `for` loops.
- Explore advanced loop control techniques.

## 📝 Detailed Content

### 1. The Basic `for` Loop

#### 1.1 Classical Syntax

Golang uses the `for` keyword to perform loops with a flexible and powerful syntax. The full syntax consists of three parts:

```go
for initialization; condition; post {
    // block of code
}
```

#### 1.2 While-style Loop

Golang does not have a separate `while` keyword. Instead, you use `for` with only a condition:

```go
count := 0
for count < 5 {
    fmt.Println("Count:", count)
    count++
}
```

#### 1.3 Infinite Loop

Infinite loops are very useful in special cases like servers, games, or applications that continuously process data:

```go
for {
    if condition {
        break
    }
}
```

### 2. Loop Control Keywords

#### 2.1 The `break` Keyword

The `break` keyword allows you to exit a loop completely and immediately:

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        fmt.Println("Found number 5, stopping the loop")
        break
    }
    fmt.Println(i)
}
```

#### 2.2 The `continue` Keyword

The `continue` keyword skips the rest of the current iteration and proceeds to the next one:

```go
for i := 0; i < 10; i++ {
    if i % 2 == 0 {
        continue
    }
    fmt.Println(i) // Prints only odd numbers
}
```

**Applications:**

- Skipping unwanted elements.
- Optimizing processing logic within a loop.

### 3. Iterating Over Data Structures

#### 3.1 The `range` Loop with Slices

The `range` keyword provides an easy way to iterate through the elements of a slice:

```go
numbers := []int{1, 2, 3, 4, 5}
for index, value := range numbers {
    fmt.Printf("Index %d: Value %d\n", index, value)
}

// Using the blank identifier if index is not needed
for _, value := range numbers {
    fmt.Println("Value:", value)
}
```

#### 3.2 The `range` Loop with Maps

Iterating through key-value pairs in a map:

```go
student := map[string]int{
    "Alice": 90,
    "Bob":   85,
    "Carol": 92,
}

for key, value := range student {
    fmt.Printf("Name: %s, Score: %d\n", key, value)
}

// Only keys
for key := range student {
    fmt.Println("Student Name:", key)
}
```

**Characteristics:**

- Iteration order over maps is not guaranteed.

## 🏆 Hands-on Exercise

### Exercise 1: Sum of Integers

**Task:** Write a program to calculate the sum of integers from 1 to n (where n is input by the user).

### Exercise 2: Multiplication Table

**Task:** Create a program that prints the multiplication table from 1 to 10.

### Exercise 3: Prime Number Check

**Task:** Write a function that checks if a given number is a prime number.

## 🔑 Key Points to Remember

- Golang lacks a traditional `while` loop; use `for` instead.
- `break` and `continue` keywords help control the loop flow.
- Use `range` to iterate through slices, maps, and channels.

## 📝 Homework

### Task 1: Count Characters

Write a program to count the number of characters in a string without using the `len()` function.

### Task 2: Find Maximum Number

Create a program to find the largest number in an array of integers using a loop.

### Task 3: Binary Conversion

Write a function to convert a positive integer to its binary representation.

### Task 4: Draw a Star Triangle

Create a program that prints a triangle pattern made of stars (\*) with a height entered by the user.
