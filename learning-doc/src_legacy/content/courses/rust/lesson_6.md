# Lesson 6: Ownership - The Core Concept of Rust

## 🎯 Lesson Objectives

- Clearly understand the concept of ownership and its role in Rust.
- Distinguish between Stack and Heap in memory management.
- Master the three basic principles of ownership.
- Understand the difference between moving (move) and copying (copy).
- Identify and resolve common errors related to ownership.

## 📝 Detailed Content

### 1. Introduction to Ownership

Ownership is one of Rust's most important features, ensuring memory safety without the need for a garbage collector.

#### 1.1. Problems Rust Solves

- **Manual Memory Management** (like C/C++): Prone to memory leaks and dangling pointers.
- **Garbage Collector** (like Java, Python): Consumes resources and makes memory reclamation non-deterministic.
- **Rust with Ownership**: Automatic but predictable memory management without runtime performance penalties.

#### 1.2. Definition of Ownership

Ownership is a set of rules that govern how a Rust program manages memory:

- Each value in Rust has a variable called its **owner**.
- There can only be **one owner** at a time.
- When the owner goes **out of scope**, the value is automatically dropped.

### 2. Stack vs. Heap

#### 2.1. Stack

- **Characteristics**: Fast, handles data with a fixed size known at compile time.
- **Operation**: LIFO (Last In First Out).
- **Data Types on Stack**: Primitive types like integers, floats, booleans, characters, and fixed-size arrays or tuples.

```rust
fn example() {
    let x = 5; // x is stored on the stack
    let y = true; // y is also on the stack
} // When the function returns, x and y are popped off the stack
```

#### 2.2. Heap

- **Characteristics**: Slower than stack, handles data with dynamic or unknown sizes at compile time.
- **Operation**: Request memory → OS finds space → returns a pointer.
- **Data Types on Heap**: String, Vec, Box, and other dynamic types.

```rust
fn example() {
    let s = String::from("hello"); // s is a pointer to heap data
} // When s goes out of scope, the heap memory is freed
```

### 3. The Three Principles of Ownership

#### 3.1. Each value has an owner

```rust
let s = String::from("hello"); // s owns the string "hello"
```

#### 3.2. Only one owner at a time

```rust
let s1 = String::from("hello");
let s2 = s1; // s1 is now invalid, ownership moved to s2
// println!("{}", s1); // Error: value borrowed here after move
```

#### 3.3. Drop when out of scope

```rust
{
    let s = String::from("hello"); // s is valid from here
    // do something with s
} // scope ends, s is invalid, memory is freed
```

### 4. Move vs. Copy

#### 4.1. Move

- Applies to data stored on the **heap**.
- Only the pointer is moved; data is not copied.
- The original variable becomes invalid.

```rust
let s1 = String::from("hello");
let s2 = s1; // ownership moves to s2, s1 is invalidated
```

#### 4.2. Copy

- Applies to data stored on the **stack**.
- The entire data is bitwise copied.
- Both variables remain valid.

```rust
let x = 5;
let y = x; // x is still valid, y is a separate copy
println!("x = {}, y = {}", x, y); // No error
```

#### 4.3. The Copy Trait

Types that implement the `Copy` trait:

- Integers (i32, u32, etc.)
- Booleans (bool)
- Characters (char)
- Floating-point types (f32, f64)
- Tuples/Arrays containing only `Copy` types.

### 5. Clone - Deep Copy

To explicitly copy heap data, use the `clone()` method:

```rust
let s1 = String::from("hello");
let s2 = s1.clone(); // Deep copies heap data

println!("s1 = {}, s2 = {}", s1, s2); // Both are valid
```

### 6. Ownership and Functions

#### 6.1. Moving Ownership into a Function

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s); // s is moved and no longer valid here
    // println!("{}", s); // Compilation error

    let x = 5;
    makes_copy(x); // x is copied, remains valid
    println!("{}", x); // Works fine
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
} // some_string dropped here

fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
} // nothing special happens
```

#### 6.2. Returning Ownership

```rust
fn main() {
    let s1 = gives_ownership(); // returns value into s1

    let s2 = String::from("hello");
    let s3 = takes_and_gives_back(s2); // s2 moved, returned into s3
}

fn gives_ownership() -> String {
    let some_string = String::from("hello");
    some_string // moved out
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string // moved back out
}
```

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Identify Move vs. Copy

**Task**: Determine which lines result in a move and which in a copy.

```rust
fn main() {
    let a = 10;
    let b = a; // Copy (i32)

    let s1 = String::from("rust");
    let s2 = s1; // Move (String)

    let t1 = (1, 2);
    let t2 = t1; // Copy (Tuple of Copy types)
}
```

### Exercise 2: Fix Ownership Issues

**Problem**:

```rust
fn main() {
    let s = String::from("hello");
    print_string(s);
    print_string(s); // Error!
}
```

**Solution 1 (References)**:

```rust
fn main() {
    let s = String::from("hello");
    print_string(&s); // Pass a reference
    print_string(&s); // Still valid
}

fn print_string(s: &String) {
    println!("{}", s);
}
```

**Solution 2 (Clone)**:

```rust
fn main() {
    let s = String::from("hello");
    print_string(s.clone());
    print_string(s); // Still valid because we passed a clone earlier
}
```

## 🔑 Key Points to Remember

1. **Ownership is unique to Rust**: It is the foundation of its safety guarantees.
2. **No garbage collector**: Compile-time memory management ensures zero runtime overhead.
3. **Move vs. Copy rules**: Stack-only types are copied; heap-allocated types are moved.
4. **Mind the scope**: Memory is freed the moment an owner exits its scope.
5. **Deep copying requires `.clone()`**: Rust never hiddenly performs expensive deep copies.

## 📝 Homework

1. **Number Guessing Game**: Write a small program and analyze the ownership flow.
2. **Fix Ownership Bugs**: Fix errors in a provided snippet where variables are used after a move.
3. **Analyze Real Code**: Take a small Rust snippet and identify every ownership transfer.
4. **Implement a Stack**: Create a simple stack data structure and explain your ownership design choices.
