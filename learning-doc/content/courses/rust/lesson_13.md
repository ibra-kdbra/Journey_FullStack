# Lesson 13: Collections - Vectors in Rust

## 1. Introduction to Collections and Vec<T>

In programming, we frequently need to work with sets of values. Rust provides several collection structures to meet different needs. In this lesson, we will focus on the most common one: **Vector**.

### What is Vec<T>?

A Vector, or `Vec<T>`, is a re-sizable collection that stores elements of the same data type on the heap. Key characteristics include:

- Dynamically adjustable size.
- Continuous storage in memory.
- All elements must be of the same type.
- Indexing starts at 0.

### Declaring and Initializing a Vector

```rust
// Create an empty vector
let mut v1: Vec<i32> = Vec::new();

// Use the vec! macro to initialize with values
let v2 = vec![1, 2, 3, 4, 5];

// Create a vector with an initial capacity
let mut v3: Vec<String> = Vec::with_capacity(10);

// Initialize a vector with default values
let v4 = vec![0; 10]; // Vector with 10 elements, each initialized to 0
```

## 2. Basic Vector Methods

### Adding Elements (Push)

```rust
fn main() {
    let mut v = Vec::new();

    // Add elements to the end
    v.push(1);
    v.push(2);
    v.push(3);

    println!("Vector after push: {:?}", v); // Output: [1, 2, 3]
}
```

### Removing the Last Element (Pop)

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5];

    // Remove and return the last element
    let last = v.pop(); // Returns Option<T>

    println!("Removed element: {:?}", last); // Output: Some(5)
    println!("Vector after pop: {:?}", v);  // Output: [1, 2, 3, 4]
}
```

### Accessing Elements

There are two main ways to access elements in a vector:

#### 1. Using Indexing

```rust
fn main() {
    let v = vec![10, 20, 30, 40, 50];

    // Access via index (panics if index is invalid)
    let third = &v[2];
    println!("The 3rd element: {}", third); // Output: 30

    // Note: the following line would crash the program
    // let does_not_exist = &v[100]; // panic!
}
```

#### 2. Using the get() Method (Safer)

```rust
fn main() {
    let v = vec![10, 20, 30, 40, 50];

    // Use get() which returns Option<&T>
    match v.get(2) {
        Some(third) => println!("The 3rd element: {}", third),
        None => println!("Element not found!"),
    }

    // Accessing an out-of-bounds index
    match v.get(100) {
        Some(value) => println!("Value: {}", value),
        None => println!("Invalid index!"),
    }
}
```

### Other Useful Methods

```rust
fn main() {
    let mut v = vec![1, 2, 3];

    // Get length
    println!("Length: {}", v.len()); // Output: 3

    // Check if empty
    println!("Is empty? {}", v.is_empty()); // Output: false

    // Clear all elements
    v.clear();
    println!("After clear: {:?}", v); // Output: []

    // Insert at specific position
    v.push(10);
    v.push(20);
    v.insert(1, 15);
    println!("After insert: {:?}", v); // Output: [10, 15, 20]

    // Remove at specific position
    v.remove(0);
    println!("After remove: {:?}", v); // Output: [15, 20]

    // Resize vector
    v.resize(5, 0);
    println!("After resize: {:?}", v); // Output: [15, 20, 0, 0, 0]
}
```

## 3. Ownership and Borrowing with Vectors

Vectors follow standard Rust ownership rules. This is particularly important because vectors are often used in varied scenarios.

### Borrowing and Referencing

```rust
fn main() {
    let mut v = vec![1, 2, 3, 4, 5];

    // Immutable borrow
    let first = &v[0];

    // ERROR: cannot borrow v as mutable because it is already borrowed as immutable
    // v.push(6); // Error!

    println!("The first element is: {}", first);

    // Now that 'first' is no longer used, we can borrow v as mutable
    v.push(6);
    println!("Vector after push: {:?}", v);
}
```

### Beware of Invalidation

```rust
fn main() {
    let mut v = vec![1, 2, 3];

    // Get a reference to the first element
    let first = &v[0];

    // v.push(4); // Error! Pushing might cause reallocation,
    // which would invalidate the 'first' reference.

    println!("First element: {}", first);

    // After usage of 'first', modifications are safe
    v.push(4);
    println!("Vector after push: {:?}", v);
}
```

## 4. Iterating Over a Vector

Rust provides multiple ways to traverse a vector:

### Using a for loop

```rust
fn main() {
    let v = vec![10, 20, 30];

    // Iterate over immutable references
    for element in &v {
        println!("{}", element);
    }

    // Iterate over mutable references and modify
    let mut v = vec![10, 20, 30];
    for element in &mut v {
        *element += 5;
    }
    println!("Modified vector: {:?}", v); // Output: [15, 25, 35]
}
```

### Using Iterator Methods

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // Use map to transform elements
    let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();
    println!("Doubled: {:?}", doubled); // Output: [2, 4, 6, 8, 10]

    // Use filter to select elements
    let even: Vec<&i32> = v.iter().filter(|&&x| x % 2 == 0).collect();
    println!("Even: {:?}", even); // Output: [2, 4]

    // Sum using fold
    let sum: i32 = v.iter().fold(0, |acc, &x| acc + x);
    println!("Sum: {}", sum); // Output: 15
}
```

### Iterators: iter, iter_mut, and into_iter

Rust provides three types of iterators:

```rust
fn main() {
    let v = vec![1, 2, 3];

    // iter() - borrows elements immutably
    for element in v.iter() {
        println!("iter(): {}", element);
    }

    let mut v = vec![1, 2, 3];
    // iter_mut() - borrows elements mutably
    for element in v.iter_mut() {
        *element *= 2;
    }
    println!("After iter_mut(): {:?}", v); // [2, 4, 6]

    // into_iter() - takes ownership and consumes the vector
    for element in v.into_iter() {
        println!("into_iter(): {}", element);
    }

    // v is no longer usable here
    // println!("{:?}", v); // Error!
}
```

## 5. Using Enums to Store Multiple Types

Since vectors can only store one type, you can use an enum to wrap different data types:

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

fn main() {
    let row = vec![
        SpreadsheetCell::Int(3),
        SpreadsheetCell::Text(String::from("blue")),
        SpreadsheetCell::Float(10.12),
    ];

    for cell in &row {
        match cell {
            SpreadsheetCell::Int(v) => println!("Int: {}", v),
            SpreadsheetCell::Float(v) => println!("Float: {}", v),
            SpreadsheetCell::Text(v) => println!("Text: {}", v),
        }
    }
}
```

## 6. Comparing Vec, Array, and Slice

| Feature         | Vec<T>                | Array [T; N]                  | Slice &[T]                            |
| --------------- | --------------------- | ----------------------------- | ------------------------------------- |
| **Size**        | Dynamic, resizable    | Fixed at compile time         | View into part of a collection        |
| **Memory**      | Heap                  | Stack (small) or Heap (large) | Does not own data                     |
| **Performance** | Fast O(1), reallocs   | Extremely fast O(1)           | Fast O(1)                             |
| **Use Case**    | Unknown size at start | Fixed, known size             | Passing a reference to a sub-sequence |
| **Syntax**      | `vec![1, 2, 3]`       | `[1, 2, 3]`                   | `&v[0..2]`                            |

## 7. Practical Application: Task Management App

Let's build a simple task manager using what we've learned:

```rust
struct TodoItem {
    id: usize,
    title: String,
    completed: bool,
}

struct TodoList {
    tasks: Vec<TodoItem>,
    next_id: usize,
}

impl TodoList {
    fn new() -> TodoList {
        TodoList { tasks: Vec::new(), next_id: 1 }
    }

    fn add_task(&mut self, title: &str) -> usize {
        let id = self.next_id;
        self.tasks.push(TodoItem { id, title: String::from(title), completed: false });
        self.next_id += 1;
        id
    }

    fn complete_task(&mut self, id: usize) -> Result<(), String> {
        if let Some(task) = self.tasks.iter_mut().find(|t| t.id == id) {
            task.completed = true;
            Ok(())
        } else {
            Err(format!("Task with ID {} not found", id))
        }
    }

    fn remove_task(&mut self, id: usize) -> Result<TodoItem, String> {
        if let Some(pos) = self.tasks.iter().position(|t| t.id == id) {
            Ok(self.tasks.remove(pos))
        } else {
            Err(format!("Task with ID {} not found", id))
        }
    }

    fn list_tasks(&self) {
        if self.tasks.is_empty() {
            println!("Task list is empty!");
            return;
        }
        println!("TASK LIST:");
        for task in &self.tasks {
            let status = if task.completed { "✓ Done" } else { "⏳ Pending" };
            println!("{}: {} [{}]", task.id, task.title, status);
        }
    }
}

fn main() {
    let mut list = TodoList::new();
    list.add_task("Learn Rust Vectors");
    list.add_task("Build a CLI tool");
    list.list_tasks();
    list.complete_task(1).unwrap();
    list.list_tasks();
}
```

## 8. Common Errors and Solutions

### 1. Borrow Checker Conflicts

**Problem**: Accessing a reference after the vector has been modified.
**Solution**: Ensure the reference's scope ends before the modification occurs.

### 2. Out-of-Bounds Panic

**Problem**: Indexing into a vector with a value >= its length.
**Solution**: Use the `.get()` method to safely handle potential errors with `Option`.

### 3. Move Errors

**Problem**: Trying to move an element out of a vector that is indexed.
**Solution**: Use `.clone()` if you need ownership, or use references if you only need to read the data.

## 9. Exercises

1. **Data Statistics**: Write a program that takes a list of integers and calculates the min, max, average, and sum of evens/odds.
2. **Enhanced TodoList**: Add due dates and priorities to the tasks, and implement sorting.
3. **Vector Manipulation**: Write functions to remove duplicates and to merge two sorted vectors into a single sorted result.

## 10. Summary

In this lesson, we explored:

1. Creating and initializing vectors.
2. Basic manipulation methods.
3. Ownership and borrowing rules as they apply to vectors.
4. Iteration techniques.
5. Using enums for heterogeneity.
6. A realistic task management application.

## Resources

- [Rust Book: Vectors](https://doc.rust-lang.org/book/ch08-01-vectors.html)
- [Rust Standard Library: Vec](https://doc.rust-lang.org/std/vec/struct.Vec.html)
