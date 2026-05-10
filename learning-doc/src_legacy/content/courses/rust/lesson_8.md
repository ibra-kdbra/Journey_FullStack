# Lesson 8: Slices in Rust

## 1. Introduction

### Welcome

- Welcome to Lesson 8 of the Rust series.
- Recap: Ownership and borrowing concepts from previous lessons.
- Introduction to Slices: One of Rust's most powerful and essential features.

### Definition of a Slice

- A slice is a reference (pointer) to a contiguous sequence of elements in a collection.
- Slices **do not own** the underlying data.
- They provide safe, efficient access to a portion of data without the need for ownership transfer.
- Memory safety is guaranteed via Rust's borrowing system.

### Visual Representation

- Imagine a slice as a "window" or "view" into the original data.
- Unlike Python or JavaScript which often create copies, Rust slices are pointers with length information.

## 2. String Slices

### Basic Syntax

```rust
let s = String::from("Learning Rust");
let slice = &s[0..8]; // "Learning"
```

### Detailed String Slice Examples

```rust
let s = String::from("Hello World");

// Various ways to create slices
let slice1 = &s[0..5];    // "Hello"
let slice2 = &s[6..11];   // "World"
let slice3 = &s[..5];     // "Hello" (from the beginning)
let slice4 = &s[6..];     // "World" (to the end)
let slice5 = &s[..];      // "Hello World" (the entire string)

println!("slice1: {}", slice1);
println!("slice2: {}", slice2);
println!("slice3: {}", slice3);
println!("slice4: {}", slice4);
println!("slice5: {}", slice5);
```

### String Literals and &str

- String literals are actually string slices pointing to a specific part of the binary.

```rust
let s: &str = "This is a string literal";
```

- **Comparison**: `String` is an owned, heap-allocated buffer. `&str` is a borrowed view.
- **Guideline**: Use `&str` for function parameters to make them more flexible.

### Common UTF-8 Pitfall

```rust
let s = String::from("नमस्ते");
// Error: slices must align with UTF-8 character boundaries.
// let bad_slice = &s[0..1]; // This will crash if it splits a multi-byte character!

// Correct way to iterate through characters
for (i, c) in s.char_indices() {
    println!("Position {}: '{}'", i, c);
}
```

### Practicing with String Slices

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}

fn main() {
    let s = String::from("Rust is fun");
    let word = first_word(&s);
    println!("First word: {}", word);

    // String slices prevent bugs
    // s.clear(); // ERROR: cannot borrow `s` as mutable because it is already borrowed as immutable!

    // Works with string literals
    let literal = "Hello World";
    let first = first_word(literal);
    println!("First word of literal: {}", first);
}
```

## 3. Array Slices

### Syntax and Usage

```rust
let numbers = [1, 2, 3, 4, 5];
let slice = &numbers[1..4];  // [2, 3, 4]

println!("Slice: {:?}", slice);
```

### Advanced Examples with Generic Slices

```rust
fn sum_of_slice(slice: &[i32]) -> i32 {
    let mut sum = 0;
    for &item in slice {
        sum += item;
    }
    sum
}

fn main() {
    let numbers = [1, 2, 3, 4, 5];

    println!("Total sum: {}", sum_of_slice(&numbers));
    println!("Sum of first 3: {}", sum_of_slice(&numbers[0..3]));
    println!("Sum of last 2: {}", sum_of_slice(&numbers[3..]));
}
```

### Slices with Other Data Structures

```rust
let vec = vec![10, 20, 30, 40, 50];
let vec_slice = &vec[..3];  // [10, 20, 30]

println!("Vector slice: {:?}", vec_slice);
```

## 4. Working with Slice Methods

### String Slice Methods

```rust
fn main() {
    let s = String::from("Rust programming language");

    println!("Length: {}", s.len());
    println!("Contains 'program': {}", s.contains("program"));
    println!("Starts with 'Rust': {}", s.starts_with("Rust"));
    println!("Ends with 'age': {}", s.ends_with("age"));

    // Splitting strings
    let parts: Vec<&str> = s.split(' ').collect();
    println!("Parts: {:?}", parts);

    // Trimming
    let text = "   Hello   ";
    println!("Trimmed: '{}'", text.trim());

    // Case conversion
    println!("Uppercase: {}", s.to_uppercase());
}
```

### Array Slice Methods

```rust
fn main() {
    let numbers = [10, 20, 30, 40, 50];
    let slice = &numbers[..];

    println!("First element: {:?}", slice.first());
    println!("Last element: {:?}", slice.last());
    println!("Element at index 2: {:?}", slice.get(2));
    println!("Out of bounds: {:?}", slice.get(10)); // Returns None, no crash!

    println!("Is empty? {}", slice.is_empty());

    // Windows and Chunks
    for window in slice.windows(2) {
        println!("Adjacent pair: {:?}", window);
    }

    for chunk in slice.chunks(2) {
        println!("Chunk of 2: {:?}", chunk);
    }
}
```

## 5. Pattern Matching with Slices

### Basic Syntax

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];

    match numbers {
        [1, second, ..] => println!("The second element is: {}", second),
        _ => println!("No match found"),
    }
}
```

### Advanced Pattern Matching Example

```rust
fn analyze_slice(slice: &[i32]) {
    match slice {
        [] => println!("Empty slice"),
        [single] => println!("Exactly one element: {}", single),
        [first, second] => println!("Exactly two: {} and {}", first, second),
        [first, .., last] => println!("Multiple elements, first: {}, last: {}", first, last),
    }
}
```

## 6. Optimization: Slices vs. Cloning

### Performance Comparison

- **Slices**: O(1) time and space overhead. Just copying a pointer and a length.
- **Cloning**: O(n) time and space. Allocates new memory and copies all data.
- **Rule of Thumb**: Use slices whenever you only need to read data. Use clones only when you need to own or modify the data independently.

## 7. Conclusion

### Key Takeaways

- Slices are safe references to contiguous parts of a collection.
- They are indispensable for efficient and ergonomic Rust code.
- They integrate perfectly with pattern matching.
- Slices prevent common memory errors by strictly following borrowing rules.

### Next Steps

- Link to ownership and borrowing.
- Up next: Structs and Enums in Rust.

### Homework

1. Write a function `find_substring` that returns the first index of a substring within a string.
2. Write a function that finds the last word in a sentence.
3. Implement `split_at_nth_word` which returns two slices separated at the nth word.

## 8. Resources

- [The Rust Book - Chapter 4.3: Slices](https://doc.rust-lang.org/book/ch04-03-slices.html)
- [Rust By Example - Slices](https://doc.rust-lang.org/rust-by-example/primitives/array.html)
