# Lesson 6: Arrays and Slices in Golang

## 🎯 Lesson Objectives

- **Clearly understand the concept and usage of Arrays** in Go.
- **Master the concept of Slices** and their differences from Arrays.
- **Effectively manipulate Slices**: creation, addition, copying, and element access.
- **Use built-in functions** such as `len()`, `cap()`, `append()`, and `copy()`.

## 📝 Detailed Content

### 1. Arrays in Go - Fixed-size Data Structures

#### 1.1 Concept of Arrays

An **Array** in Go is a collection of elements of the same data type, ordered, and having a fixed size.

**Declaration Syntax:**

```go
var arrayName [size]dataType
```

#### 1.2 Ways to Declare and Initialize Arrays

**Description:** Go provides many flexible ways to declare and initialize arrays. Here are common methods from basic to advanced:

```go
package main

import "fmt"

func main() {
    var numbers [5]int
    numbers[0] = 10
    numbers[1] = 20
    fmt.Println("Array numbers:", numbers)

    fruits := [3]string{"apple", "banana", "orange"}
    fmt.Println("Array fruits:", fruits)
}
```

#### 1.3 Key Characteristics of Arrays

**Description:** Understanding these characteristics will help you use arrays effectively and avoid common mistakes:

- **Fixed Size**: Once defined, the size cannot change.
- **Zero Values**: Elements are automatically initialized to their zero value.
- **Passed by Value**: When passed to a function, a complete copy is made.

### 2. Slices in Go - Flexible Dynamic Arrays

#### 2.1 Concept of Slices

A **Slice** is a dynamic and flexible data structure built on top of arrays.

**Structure of a Slice:**

- **Pointer**: Points to the first reachable element of the underlying array.
- **Length**: The number of elements currently in the slice.
- **Capacity**: The maximum number of elements the slice can hold before needing reallocation.

#### 2.2 Ways to Create Slices

**Description:** Slices can be created in several ways, including using slice literals or the `make()` function.

#### 2.3 Slicing Operations

**Description:** Slicing allows you to create a new slice from an existing slice or array.

```go
func main() {
    numbers := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}

    // Syntax: slice[start:end] (excludes end index)
    fmt.Println("numbers[2:5]:", numbers[2:5])
    fmt.Println("numbers[:4]:", numbers[:4])
    fmt.Println("numbers[6:]:", numbers[6:])
    fmt.Println("numbers[:]:", numbers[:])

    // Slicing with capacity
    slice := numbers[2:5:8] // start:end:capacity
    fmt.Printf("Length: %d, Capacity: %d\n", len(slice), cap(slice))
    fmt.Println("Slice:", slice) // [2 3 4]
}
```

#### 2.4 The `append()` Function - Adding Elements

```go
func main() {
    var fruits []string
    fmt.Println("Initial slice:", fruits) // []

    fruits = append(fruits, "apple")
    fmt.Println("After adding apple:", fruits)
}
```

#### 2.5 The `copy()` Function - Copying Slices

**Description:** `copy()` is used to copy data from one slice to another. It is important to understand that it only copies as many elements as the destination slice can hold.

### 3. Comparing Arrays vs. Slices

| Feature           | Arrays                     | Slices              |
| ----------------- | -------------------------- | ------------------- |
| Size              | Fixed, part of the type    | Dynamic, can change |
| Declaration       | `[5]int`                   | `[]int`             |
| Function Argument | Passed by value (copy)     | Passed by reference |
| Performance       | Faster                     | More flexible       |
| Usage             | When size is known exactly | Most use cases      |

### 4. Common Slice Patterns

#### 4.1 Removing an Element

**Description:** Go has no built-in delete function, but we can combine slicing and `append`:

```go
func removeElement(slice []int, index int) []int {
    return append(slice[:index], slice[index+1:]...)
}

func main() {
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Println("Before removal:", numbers) // [1 2 3 4 5]

    numbers = removeElement(numbers, 2) // Removes element at index 2
    fmt.Println("After removal:", numbers) // [1 2 4 5]
}
```

#### 4.2 Inserting an Element

**Description:** Similar to removal, inserting an element at a specific position is done with slicing and `append`:

```go
func insertElement(slice []int, index int, value int) []int {
    slice = append(slice[:index], append([]int{value}, slice[index:]...)...)
    return slice
}

func main() {
    numbers := []int{1, 2, 4, 5}
    fmt.Println("Before insertion:", numbers) // [1 2 4 5]

    numbers = insertElement(numbers, 2, 3) // Inserts 3 at index 2
    fmt.Println("After insertion:", numbers) // [1 2 3 4 5]
}
```

## 🏆 Hands-on Exercise

### Exercise 1: Find Min and Max in a Slice

**Task:** Write a program to find the largest and smallest values in an integer slice.

### Exercise 2: Filtering and Creating New Slices

**Task:** Write a program to filter even numbers from a slice and create a new slice containing only those even numbers.

### Exercise 3: Student List Management

**Task:** Create a system to manage a student list with functionalities: add, remove, and search for students.

## 🔑 Key Points to Remember

### 1. **Arrays vs. Slices**

- **Arrays**: Fixed size, passed by value.
- **Slices**: Dynamic size, passed by reference.

### 2. **Nil Slice vs. Empty Slice**

```go
var nilSlice []int        // nil slice: nilSlice == nil
emptySlice := []int{}     // empty slice: emptySlice != nil
```

- **Nil slice**: Not initialized, length and capacity are 0.
- **Empty slice**: Initialized but contains no elements.

### 3. **Shared Underlying Arrays**

```go
arr := [5]int{1, 2, 3, 4, 5}
slice1 := arr[1:4]  // [2, 3, 4]
slice2 := arr[2:5]  // [3, 4, 5]
slice1[1] = 999     // Change affects slice2
```

- Multiple slices can share the same underlying array.
- Modifications in one slice may affect others sharing the same array.

### 4. **Capacity and Reallocation**

- When `append()` exceeds capacity, Go creates a new array with double the capacity.
- This might cause the slice to lose its connection with the original array.

## 📝 Homework

### Task 1: Sum and Average

Write a program that takes a slice of floats, calculates the sum and the average. Print the results with 2 decimal places. Handle empty slice cases.

### Task 2: Reverse a Slice

Write a program to reverse a string slice in-place (without creating a new slice). Example: `["a", "b", "c", "d"]` becomes `["d", "c", "b", "a"]`.

### Task 3: Product Inventory Management

Create a simple warehouse management system using a `Product` struct (ID, Name, Price, Quantity). Implement:

- Add new product.
- Update quantity.
- Search by name.
- Show out-of-stock items (quantity = 0).
- Calculate total inventory value.

### Task 4: Merge and Sort Slices

Write a program that receives two sorted integer slices and merges them into a single new sorted slice. Do not use the `sort` package. Time complexity should be O(n+m).
