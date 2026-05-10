# Lesson 9: Lifetimes in Rust

## Lecture Overview

- **Duration**: 30-40 minutes
- **Target Students**: Developers with basic Rust knowledge.
- **Prerequisites**: Understanding of data types, borrowing, and ownership in Rust.

## Lesson Objectives

After this lesson, students will:

- Clearly understand the concept of lifetimes in Rust and why they are necessary.
- Know how to use lifetime annotations.
- Grasp the lifetime elision rules.
- Understand the `'static` lifetime and its typical use cases.
- Be able to debug common lifetime errors.

## 1. Introduction (3-5 minutes)

- Welcome to Lesson 9 of the Rust course.
- Quick recap of the previous lesson on structs/traits/enums.
- Introducing the challenge of memory management: When should references be deallocated?
- **Key Note**: Lifetimes are often considered one of the most challenging but crucial concepts in Rust.

## 2. PART 1: The Concept of Lifetimes (7-8 minutes)

### Definition and Role

- A lifetime is the "scope" for which a reference is valid.
- The compiler uses lifetimes to ensure references never point to invalid memory (dangling references).
- **Comparison**: Unlike C++ (manual management/dangling pointers) or Java/C# (garbage collection), Rust manages this at compile time.

### The Problem to Solve: Dangling References

- Simple demo of a dangling reference:

```rust
fn main() {
    let r;
    {
        let x = 5;
        r = &x; // `x` does not live long enough!
    }
    println!("r: {}", r); // Error: borrowed value does not live long enough
}
```

- Explanation: The difference between a variable's scope and its lifetime.

### How Rust Solves This

- **Borrow Checker**: The part of the compiler that compares scopes to ensure all borrows are valid.
- **Lifetime Annotations**: Syntax used to describe relationships between the lifetimes of various references.
- **Visual Representation**: Think of timelines representing the lifespan of data and its references.

## 3. PART 2: Lifetime Annotations (8-10 minutes)

### Basic Syntax

- Symbol: `'a`, `'b`, `'c`, etc.
- **Lifetimes in Functions**:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

### Lifetimes in Structs

```rust
struct BookExcerpt<'a> {
    content: &'a str,
}
```

### Lifetimes in Impl Blocks

```rust
impl<'a> BookExcerpt<'a> {
    fn get_first_line(&self) -> &str {
        self.content.lines().next().unwrap_or("")
    }
}
```

### Multiple Lifetime Parameters

```rust
fn complex_function<'a, 'b>(x: &'a str, _y: &'b str) -> &'a str {
    // Function body
    x
}
```

## 4. PART 3: Lifetime Elision Rules (7-8 minutes)

The Rust compiler allows you to omit lifetime annotations in common patterns.

### Rule 1: Input Lifetimes

- Each reference parameter is assigned its own unique lifetime parameter.

```rust
fn foo(x: &i32)                  // actually: fn foo<'a>(x: &'a i32)
fn foo(x: &i32, y: &i32)         // actually: fn foo<'a, 'b>(x: &'a i32, y: &'b i32)
```

### Rule 2: Output Lifetimes from `self`

- If there is an input parameter `&self` or `&mut self`, the lifetime of `self` is assigned to all output parameters.

```rust
impl<'a> BookExcerpt<'a> {
    fn get_content(&self) -> &str {  // actually: -> &'a str
        self.content
    }
}
```

### Rule 3: Single Input Parameter

- If there is exactly one input lifetime parameter, that lifetime is assigned to all output parameters.

```rust
fn first_word(s: &str) -> &str {  // actually: fn first_word<'a>(s: &'a str) -> &'a str
    // Function body
}
```

### When Elision Fails

- Demo cases where elision cannot be applied:

```rust
fn longest(x: &str, y: &str) -> &str {  // Error: explicit lifetime required
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

## 5. PART 4: The Static Lifetime (5-6 minutes)

### Definition

- `'static` denotes a lifetime that lasts for the entire duration of the program.
- String literals have a static lifetime by default.

```rust
let s: &'static str = "Hello, world!";
```

### Usage

- Used for constants and static variables.
- **Warning**: Do not use `'static` as a "hack" to fix compiler errors if you don't truly need it.

## 6. PART 5: Debugging Common Lifetime Errors (8-10 minutes)

### Common Mistakes

1. **Borrowed value does not live long enough**

   ```rust
   fn main() {
       let string1 = String::from("long string is long");
       let result;
       {
           let string2 = String::from("xyz");
           result = longest(string1.as_str(), string2.as_str());
       }
       println!("The longest string is {}", result); // Lỗi!
   }
   ```

2. **Missing lifetime specifier**

   ```rust
   struct User {
       // name: &str, // Error: missing lifetime annotation
   }
   ```

3. **Lifetime mismatch**

   ```rust
   fn invalid_mix<'a, 'b>(x: &'a str, y: &'b str) -> &'a str {
       let result = y; // Error: cannot return y because it has lifetime 'b
       result
   }
   ```

### Debugging Approach

- Read and understand compiler error messages.
- Use `rustc --explain` for detailed help.
- Draw visualization diagrams for lifetimes.
- Practical demo of step-by-step debugging.

## 7. Summary (3-4 minutes)

- Lifetimes ensure references are always valid.
- Most of the time, Rust infers them automatically (elision).
- Manual annotations are needed when relationships between multiple lifetimes are ambiguous.
- Understanding lifetimes is key to mastering the Borrow Checker.

## 📝 Homework

1. Write a function that takes two string slices and returns the one that appears first alphabetically.
2. Create a `Document` struct that holds references to different parts of a larger text buffer.
3. Fix a provided code snippet containing a "borrowed value does not live long enough" error.

## 8. Resources

- [The Rust Programming Language Book - Chapter 10.3](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html)
- [Rust By Example - Lifetimes](https://doc.rust-lang.org/rust-by-example/scope/lifetime.html)
- [Rust Nomicon - Lifetimes](https://doc.rust-lang.org/nomicon/lifetimes.html)

## DEMO CODE SAMPLES

Full code snippets for classroom demonstration:

### Demo 1: Longest string function

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {}", result);
}
```

### Demo 2: Struct with lifetime

```rust
struct BookExcerpt<'a> {
    content: &'a str,
}

impl<'a> BookExcerpt<'a> {
    fn get_first_sentence(&self) -> &str {
        match self.content.find('.') {
            Some(idx) => &self.content[..=idx],
            None => self.content,
        }
    }

    fn contains(&self, pattern: &str) -> bool {
        self.content.contains(pattern)
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let excerpt = BookExcerpt {
        content: &novel[..],
    };

    let first = excerpt.get_first_sentence();
    println!("First sentence: {}", first);
}
```

### Demo 3: Multiple lifetime parameters

```rust
fn first_char_of_either<'a, 'b>(x: &'a str, _y: &'b str) -> &'a str {
    &x[0..1]
}

fn main() {
    let string1 = String::from("hello");
    let string2 = String::from("world");

    let result = first_char_of_either(string1.as_str(), string2.as_str());
    println!("First character: {}", result);
}
```

### Demo 4: Debugging a lifetime error

```rust
// Code with error
fn main() {
    /*
    let result;
    {
        let s = String::from("hello");
        result = &s;
    } // s goes out of scope here
    println!("{}", result); // Error: `s` does not live long enough
    */
}

// Fixed code
fn main() {
    let s = String::from("hello");
    let result = &s;
    println!("{}", result); // OK
}
```

### Demo 5: Static lifetime

```rust
fn main() {
    let s: &'static str = "I have a static lifetime.";

    // Creating String from static str
    let dynamic_string = String::from(s);

    // Reference to dynamic_string is NOT 'static
    let dynamic_ref: &str = &dynamic_string;

    println!("Static string: {}", s);
    println!("Dynamic reference: {}", dynamic_ref);
}
```
