# Lesson 10: Ownership in Practice

## 1. Introduction (5 minutes)

**Welcome to the 10th lesson in our Rust series!**

In previous lessons, we explored the theory of ownership—one of Rust's core and most unique features. Today, we will dive deep into how to apply these concepts in real-world programming.

**Lesson Objectives:**

- Deeper understanding of ownership, borrowing, and lifetimes.
- Master common design patterns related to ownership.
- Know when to use `Clone` vs. `Copy`.
- Learn how to optimize code through effective ownership management.
- Apply knowledge to a practical project.

## 2. Recap: Ownership, Borrowing, and Lifetimes (10 minutes)

### 2.1 Overview of Ownership

Ownership is how Rust manages memory without a garbage collector or manual allocation/deallocation. The basic principles:

- **Each value in Rust has a variable called its owner.**
- **There can only be one owner at a time.**
- **When the owner goes out of scope, the value is dropped.**

```rust
fn main() {
    {
        let s = String::from("hello"); // s is the owner of the string
        // s can be used here
    } // scope ends, s is dropped, memory is freed
}
```

### 2.2 Borrowing and References

Borrowing allows the use of a value without taking ownership:

- **Immutable references** (`&T`): Multiple concurrent read-only references are allowed.
- **Mutable references** (`&mut T`): Only one active reference at a time; can modify the value.

**The Rule**: You can have either one mutable reference OR multiple immutable references, but not both at the same time.

```rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &s; // OK
    let r2 = &s; // OK
    println!("{} and {}", r1, r2);

    let r3 = &mut s; // OK - r1 and r2 are no longer used after this point
    r3.push_str(", world");
    println!("{}", r3);
}
```

### 2.3 Lifetimes

Lifetimes ensure that references remain valid for as long as they are needed:

- Prevents dangling pointers.
- Usually inferred by the compiler.
- Sometimes require explicit annotations (`'a`).

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

## 3. Design Patterns Related to Ownership (15 minutes)

### 3.1 Passing Ownership

Used when you need to transfer full responsibility for a value:

```rust
fn process_and_consume(data: String) {
    println!("Processing: {}", data);
} // data is automatically dropped here

fn main() {
    let s = String::from("hello");
    process_and_consume(s);
    // s is no longer valid here
}
```

### 3.2 Borrowing with References

Used for temporary access:

```rust
fn analyze(data: &String) {
    println!("Analyzing: {}", data);
}

fn main() {
    let s = String::from("hello");
    analyze(&s);
    println!("Original: {}", s); // Still valid
}
```

### 3.3 Taking and Returning Ownership

Used for transformation:

```rust
fn transform(mut data: String) -> String {
    data.push_str(" world");
    data // Return ownership
}

fn main() {
    let s1 = String::from("hello");
    let s2 = transform(s1);
    // s2 is the new owner
    println!("Transformed: {}", s2);
}
```

### 3.4 RAII (Resource Acquisition Is Initialization)

Using structs to manage resources like database connections or file handles.

```rust
struct ResourceManager {
    resource: String,
}

impl ResourceManager {
    fn new(resource: String) -> ResourceManager {
        println!("Resource acquired: {}", resource);
        ResourceManager { resource }
    }
}

impl Drop for ResourceManager {
    fn drop(&mut self) {
        println!("Resource released: {}", self.resource);
    }
}
```

## 4. When to use Clone vs. Copy (10 minutes)

### 4.1 The Copy Trait

For simple types stored on the stack:

- Primitives: `i32`, `f64`, `bool`, `char`.
- Tuples or arrays containing only `Copy` types.

### 4.2 The Clone Trait

For complex types on the heap; creates a deep copy.

### 4.3 Guidelines

- **Use Clone when**: You must keep the original data but need a copy for another part of the program, or when borrowing rules are too restrictive for a specific use case.
- **Avoid Clone when**: Working with large data sets where performance is critical. Prefer borrowing.

## 5. Optimization through Ownership (15 minutes)

### 5.1 Using &str instead of &String

Passing `&str` is more flexible as it accepts both `String` and string literals.

### 5.2 Capacity Management

Use `String::with_capacity` if you know the final size to avoid multiple reallocations.

```rust
fn build_greeting(name: &str, title: &str) -> String {
    let mut result = String::with_capacity(20 + name.len() + title.len());
    result.push_str("Dear ");
    result.push_str(title);
    result.push_str(" ");
    result.push_str(name);
    result.push_str(", welcome!");
    result
}
```

## 6. Practical Project: Document Management App (20 minutes)

### 6.1 Requirements

- Create, read, and update documents.
- Keyword search.
- Statistics (word count, sentence count).
- Efficient ownership management.

### 6.2 Implementation Snippets

```rust
struct TextDocument {
    title: String,
    content: String,
}

impl TextDocument {
    fn new(title: &str, content: &str) -> Self {
        TextDocument {
            title: String::from(title),
            content: String::from(content),
        }
    }

    fn search(&self, keyword: &str) -> Vec<usize> {
        self.content.match_indices(keyword).map(|(i, _)| i).collect()
    }

    fn word_count(&self) -> usize {
        self.content.split_whitespace().count()
    }

    fn summary(&self, max_length: usize) -> &str {
        if self.content.len() <= max_length {
            &self.content
        } else {
            &self.content[..max_length] // Simple slice
        }
    }
}
```

## 7. Summary and Final Exercises (5 minutes)

### Key Takeaways

- Ownership is Rust's unique way of achieving memory safety and efficiency.
- Borrowing allows shared access without cloning.
- Use references and slices for high-performance code.

### Homework

1. Extend the `TextDocument` to support version history.
2. Implement a merge function for two documents that avoids unnecessary allocations.
3. Research the `Drop` trait and implement a custom cleanup routine.

## 8. Resources

1. [Rust Book - Ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html)
2. [Rust Performance Book](https://nnethercote.github.io/perf-book/)
