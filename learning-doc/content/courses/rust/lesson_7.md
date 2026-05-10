# Lesson 7: References and Borrowing in Rust

## 🎯 Lesson Objectives

- Understand the concepts of references and borrowing in Rust.
- Distinguish between immutable references and mutable references.
- Master Rust's borrowing rules.
- Recognize and avoid dangling references.
- Apply borrowing knowledge to practical programming scenarios.

## 📝 Detailed Content

### 1. References and Borrowing: Basic Concepts

**What are References?**

- References in Rust are a way to access data without taking ownership of it.
- Use the `&` symbol to create a reference to a value.
- They allow us to use a value without transferring ownership.

**What is Borrowing?**

- Borrowing is the act of creating a reference to data.
- When you create a reference, you are "borrowing" that value.
- There are two types: immutable borrowing and mutable borrowing.

**Illustration:**

```rust
fn main() {
    let s1 = String::from("hello");

    // We "borrow" s1 via a reference
    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

### 2. Immutable References vs. Mutable References

**Immutable References (&T)**

- Allow reading data but not modifying it.
- Multiple immutable references can exist simultaneously.
- Syntax: `&T`

**Mutable References (&mut T)**

- Allow reading and modifying data.
- Only one mutable reference is allowed at a time.
- Syntax: `&mut T`

**Example: Immutable References**

```rust
fn main() {
    let s = String::from("hello");

    let r1 = &s; // immutable reference 1
    let r2 = &s; // immutable reference 2

    println!("{} and {}", r1, r2);
    // Valid because multiple immutable references are allowed
}
```

**Example: Mutable Reference**

```rust
fn main() {
    let mut s = String::from("hello");

    let r = &mut s; // mutable reference

    r.push_str(", world");

    println!("{}", r); // hello, world
}
```

### 3. Borrowing Rules

**Rule 1: At any given time, you can have:**

- Any number of immutable references (&T)
- OR exactly one mutable reference (&mut T)

**Rule 2:** References must always be valid - a reference cannot outlive the data it refers to.

**Example: Violating the Rules**

```rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &s;      // immutable reference
    let r2 = &s;      // immutable reference
    let r3 = &mut s;  // ERROR: cannot have a mutable reference
                      // while immutable references exist

    println!("{}, {}, and {}", r1, r2, r3);
}
```

**Reference Scope:**

```rust
fn main() {
    let mut s = String::from("hello");

    {
        let r1 = &s; // immutable reference
        println!("{}", r1);
    } // r1 goes out of scope here

    // Now we can create a mutable reference
    let r2 = &mut s;
    r2.push_str(", world");
}
```

### 4. Dangling References and Prevention

**What are Dangling References?**

- A dangling reference points to data that has been deallocated.
- These can cause serious bugs in other languages.
- Rust prevents this at compile time.

**How Rust Prevents Them:**

- The compiler tracks data scope.
- It ensures data is not freed as long as references to it still exist.

**Example: Prevented Dangling Reference**

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String { // ERROR: returns a reference to a local variable
    let s = String::from("hello");
    &s // s will be deallocated when the function ends!
}
```

**Fixing the Dangling Reference:**

```rust
fn main() {
    let string_from_function = no_dangle();
}

fn no_dangle() -> String {
    let s = String::from("hello");
    s // Return the value directly, moving ownership
}
```

### 5. Slices - A Special Form of Reference

**String Slices:**

- A slice is a reference to a portion of a String.
- Syntax: `&str`

```rust
fn main() {
    let s = String::from("hello world");

    let hello = &s[0..5];  // slice from byte 0 to 4
    let world = &s[6..];   // slice from byte 6 to the end

    println!("{} - {}", hello, world);
}
```

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Fix Borrowing Errors

**Problem:**

```rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &mut s;

    println!("{} and {}", r1, r2);
}
```

**Solution:**
Ensure the immutable references are no longer being used before creating a mutable one.

```rust
fn main() {
    let mut s = String::from("hello");

    {
        let r1 = &s;
        println!("r1: {}", r1);
    } // r1 scope ends here

    let r2 = &mut s;
    r2.push_str(", world");
    println!("r2: {}", r2);
}
```

### Exercise 2: String Modification Function

**Task:** Write a function `add_suffix` that accepts a mutable reference to a String and appends ", Rust!" to it.

**Solution:**

```rust
fn main() {
    let mut greeting = String::from("Hello");

    add_suffix(&mut greeting);

    println!("{}", greeting); // Prints: "Hello, Rust!"
}

fn add_suffix(s: &mut String) {
    s.push_str(", Rust!");
}
```

## 🔑 Key Points to Remember

1. **Borrowing Rules are Core to Rust's Memory Model**

   - One of Rust's most vital safety features.
   - Prevents data races and race conditions at compile time.

2. **References Enable Data Reuse Without Ownership Transfer**

   - Reduces the need for expensive data cloning, improving performance.
   - Allows safe shared access to data.

3. **The "One Mutable XOR Many Immutable" Rule is Crucial**

   - Remember: At any time, you get either ONE writer or MANY readers.
   - In modern Rust (2018+), reference scope starts at declaration and ends at its last usage.

4. **Rust Disallows Null Pointers**

   - References are guaranteed to be valid. There is no concept of a "null reference".
   - Use `Option<&T>` to represent an optional reference.

5. **Borrowing is Linked to Lifetimes**
   - Lifetimes ensure references never outlive the data they point to.

## 📝 Homework

### Task 1: Average Calculation

Write a function that takes a reference to an integer vector and returns the average. Use borrowing instead of moving the vector.

### Task 2: Simple Library Management

Create a program that allows adding books, updating titles, and displaying book info. Use references appropriately.

### Task 3: Debug Borrowing

Fix the ownership/borrowing conflict in this snippet:

```rust
fn main() {
    let mut message = String::from("Learning Rust ");
    let first = &message[0..8];
    message.push_str("is fun!"); // Error happens here
    println!("Start: {}", first);
}
```

### Task 4: String Search Function

Write a function that takes a slice of string slices and a target string, returning the index if found.
