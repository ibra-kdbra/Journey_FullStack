# Lesson 14: Collections - Strings in Rust

## 1. Introduction

Welcome back! In today's lesson, we will dive deep into one of the most important data types in programming: character strings. Rust has a unique approach to strings compared to other languages, especially regarding Unicode handling and performance. Understanding how Rust handles strings will help you write efficient code and avoid many common errors.

### Lesson Objectives

- Understand the difference between `String` and `&str`.
- Master how Rust handles UTF-8 and Unicode.
- Become proficient with string manipulation methods.
- Learn how to concatenate and format strings efficiently.
- Optimize performance when working with strings.

## 2. String vs. &str

### 2.1. Two Basic String Types

Rust has two primary string types: `String` and `&str`. The difference between them relates to ownership, memory allocation, and mutability.

#### String

- An owned type.
- Allocated on the heap.
- Mutable (can be modified).
- Similar to a `Vec<u8>` but guaranteed to be valid UTF-8.
- Used when you need to change the content of the string.

```rust
// Initializing a String
let mut s1 = String::new(); // Empty string
let s2 = String::from("Hello"); // From a literal
let s3 = "Rust".to_string(); // Using the to_string() method

// Modifying a String
s1.push_str("Learning Rust!"); // s1 is now "Learning Rust!"
```

#### &str (String Slice)

- A reference type.
- Points to a valid UTF-8 sequence somewhere in memory.
- Immutable (cannot be changed).
- Efficient because it doesn't require new memory allocation.
- Used when you only need to read the data.

```rust
// String literals are &str
let greeting: &str = "Hello Vietnam";

// Creating a string slice from a String
let s = String::from("Learning Rust programming");
let slice: &str = &s[0..8]; // slice = "Learning"
```

### 2.2. When to use String vs. &str

```rust
// Use &str in function parameters for flexibility
fn print_greeting(message: &str) {
    println!("{}", message);
}

// You can pass both String and &str
let s1: String = String::from("Hello");
let s2: &str = "Hello";

print_greeting(&s1); // &String is automatically converted to &str
print_greeting(s2);
```

**General Rule:**

- Use `&str` for function parameters when you only need read access.
- Use `String` when you need ownership or plan to modify the string.
- Use `&str` for fixed strings (literals).

## 3. UTF-8 and Unicode in Rust

### 3.1. Native UTF-8 Support

Rust supports UTF-8 natively. This means:

- All `String` and `&str` instances are valid UTF-8.
- Rust guarantees UTF-8 integrity—you cannot create an invalid string.
- Unicode characters can occupy between 1 and 4 bytes.

### 3.2. Challenges with Unicode

Unicode brings some challenges to string processing:

```rust
let vi_text = "Tiếng Việt";
println!("Length: {}", vi_text.len()); // Not the number of characters, but the number of bytes!

// Getting the 2nd character - does NOT work as expected with multi-byte characters
// let second_char = vi_text[1]; // Error! Rust does not allow direct index access.

// Correct way to iterate through Unicode codepoints
for c in vi_text.chars() {
    println!("{}", c);
}

// Counting the number of characters (graphemes)
println!("Character count: {}", vi_text.chars().count());
```

### 3.3. Units in Unicode Strings

Rust provides several ways to work with different units in a Unicode string:

- **Bytes**: Raw UTF-8 data.

  ```rust
  for b in "Hello".bytes() {
      println!("{}", b);
  }
  ```

- **Scalar Values (chars)**: Unicode code points.

  ```rust
  for c in "Hello".chars() {
      println!("{}", c);
  }
  ```

- **Grapheme Clusters**: Visual characters (requires an external crate like `unicode-segmentation`).

## 4. String Manipulation Methods

### 4.1. Initialization and Conversion

```rust
// Initializing a String
let mut s = String::new();
let s = String::with_capacity(20); // Pre-allocate space for performance

// Converting between types
let s = "hello".to_string(); // &str -> String
let s = String::from("hello"); // &str -> String
let s_slice: &str = &s; // String -> &str
```

### 4.2. Adding and Editing

```rust
let mut s = String::from("Hello ");

// Appending
s.push('!'); // Push a single character
s.push_str("world"); // Push a string slice

// Deleting
s.clear(); // Clear all content, keep capacity
s.truncate(3); // Keep only the first 3 bytes
```

### 4.3. Searching and Extraction

```rust
let text = "Rust is a wonderful programming language";

// Searching
if text.contains("Rust") {
    println!("Found 'Rust'");
}

// Checking prefix/suffix
if text.starts_with("Rust") {
    println!("Starts with 'Rust'");
}

if text.ends_with("language") {
    println!("Ends with 'language'");
}

// Position of a word
if let Some(pos) = text.find("wonderful") {
    println!("'wonderful' starts at byte index {}", pos);
}

// Extracting a substring
let sub = &text[0..4]; // "Rust"
// Caution: must slice at valid UTF-8 character boundaries!
```

### 4.4. Transformation

```rust
let text = "  Rust Programming  ";

// Trimming
let trimmed = text.trim(); // "Rust Programming"

// Replacing
let replaced = text.replace("Rust", "Go"); // "  Go Programming  "

// Case conversion
// text.to_lowercase();
// text.to_uppercase();
```

## 5. String Concatenation and Formatting

### 5.1. Concatenation Methods

Rust provides several ways to join strings:

#### Using the `+` operator

```rust
let s1 = String::from("Hello ");
let s2 = String::from("world");
let s3 = s1 + &s2; // Note: s1 is moved here and can no longer be used.
```

#### Using the `push_str` method

```rust
let mut s1 = String::from("Hello ");
let s2 = String::from("world");
s1.push_str(&s2); // s1 = "Hello world", s2 remains usable.
```

#### Using the `format!` macro

```rust
let s1 = String::from("Hello");
let s2 = String::from("world");
let s3 = String::from("!");
let result = format!("{} {}{}", s1, s2, s3); // "Hello world!"
// All variables remain usable.
```

## 6. Performance Optimization

### 6.1. Pre-allocation

Use `String::with_capacity(n)` if you know the approximate size to avoid multiple heap re-allocations.

### 6.2. Passing References

Always prefer passing `&str` to functions instead of `String` or `&String` to avoid unnecessary cloning.

## 7. Practical Activities

### 7.1. Text Analysis App

Let's build a small text analysis tool applying what we've learned.

```rust
struct TextAnalyzer<'a> {
    text: &'a str,
}

impl<'a> TextAnalyzer<'a> {
    fn new(text: &'a str) -> Self {
        TextAnalyzer { text }
    }

    fn word_count(&self) -> usize {
        self.text.split_whitespace().count()
    }

    fn sentence_count(&self) -> usize {
        self.text.split(['.', '!', '?']).filter(|s| !s.trim().is_empty()).count()
    }

    fn average_word_length(&self) -> f64 {
        let words: Vec<&str> = self.text.split_whitespace().collect();
        if words.is_empty() { return 0.0; }

        let total_chars: usize = words.iter().map(|w| w.chars().count()).sum();
        total_chars as f64 / words.len() as f64
    }
}
```

## 8. Summary and Key Points

1. **String vs &str**: `String` is owned and mutable; `&str` is borrowed and immutable.
2. **UTF-8**: Rust strings are always valid UTF-8. Be careful with byte vs. character indexing.
3. **Methods**: Use `.push_str()`, `.contains()`, `.find()`, and `.trim()` for common tasks.
4. **Formatting**: `format!` is the most flexible way to join strings without losing ownership.
5. **Efficiency**: Pre-allocate capacity and use references whenever possible.

## 9. Homework

1. Write a function that counts the number of words in a text, excluding those shorter than 3 characters.
2. Write a program that reverses every word in a sentence while keeping the word order the same.
3. Create a simple email address validator.
4. Expand the `TextAnalyzer` to calculate text complexity based on sentence and word lengths.

## 10. References

1. [Rust Book - Strings](https://doc.rust-lang.org/book/ch08-02-strings.html)
2. [Standard Library - String](https://doc.rust-lang.org/std/string/struct.String.html)
3. [Rust by Example - Strings](https://doc.rust-lang.org/rust-by-example/std/str.html)
