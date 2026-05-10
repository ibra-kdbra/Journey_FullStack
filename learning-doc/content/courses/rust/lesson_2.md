# Lesson 2: Basic Data Types and Variables in Rust

## 🎯 Lesson Objectives

- Understand and apply the variable declaration mechanism in Rust using the `let` keyword.
- Master the concept of immutability - one of Rust's most important features.
- Become familiar with basic primitive data types in Rust.
- Understand the difference between type annotation and type inference.
- Distinguish between constants, static variables, and regular variables.

## 📝 Detailed Content

### 1. Variable Declaration with `let` and Immutability

#### 1.1. Basic Variable Declaration

In Rust, we declare variables using the `let` keyword:

```rust
let x = 5;
```

#### 1.2. Mutable Variables

If you want to create a variable whose value can change, you must use the `mut` keyword:

```rust
let mut y = 5;
y = 6; // Valid
println!("The value of y is: {}", y);
```

#### 1.3. Why is Rust Immutable by Default?

- **Memory Safety**: Predictable data state.
- **Bug Prevention**: Avoids unintended side effects.
- **Optimization**: The compiler can optimize code better when it knows values won't change.
- **Concurrency**: Easier to reason about shared data across threads.

### 2. Primitive Data Types in Rust

#### 2.1. Integer Types

Rust provides several integer types with different sizes:

| Type  | Size                   | Range                                   |
| ----- | ---------------------- | --------------------------------------- |
| i8    | 8-bit                  | -128 to 127                             |
| u8    | 8-bit                  | 0 to 255                                |
| i16   | 16-bit                 | -32,768 to 32,767                       |
| u16   | 16-bit                 | 0 to 65,535                             |
| i32   | 32-bit                 | -2,147,483,648 to 2,147,483,647         |
| u32   | 32-bit                 | 0 to 4,294,967,295                      |
| i64   | 64-bit                 | -2^63 to 2^63 - 1                       |
| u64   | 64-bit                 | 0 to 2^64 - 1                           |
| i128  | 128-bit                | -2^127 to 2^127 - 1                     |
| u128  | 128-bit                | 0 to 2^128 - 1                          |
| isize | Architecture dependent | 32 or 64 bits (used for indexing)       |
| usize | Architecture dependent | 32 or 64 bits (used for sizes/indexing) |

#### 2.2. Floating-Point Types

Rust has two floating-point types:

- `f32`: 32-bit float.
- `f64`: 64-bit float (default).

```rust
let x = 2.0; // f64
let y: f32 = 3.0; // f32
```

#### 2.3. Boolean Type

```rust
let t = true;
let f: bool = false;
```

#### 2.4. Character Type (`char`)

The `char` type in Rust is 4 bytes and represents a Unicode Scalar Value, covering much more than just ASCII.

### 3. Type Annotation and Type Inference

#### 3.1. Type Annotation

Type annotation is when we explicitly specify the data type:

```rust
let x: i32 = 5;
let y: f64 = 3.14;
let active: bool = true;
```

#### 3.2. Type Inference

Rust can often infer the data type from the initial value:

```rust
let x = 5; // inferred as i32
let y = 3.14; // inferred as f64
```

#### 3.3. When is Type Annotation Required?

- When declaring a variable without initializing it immediately.
- When you want to use a type other than the default.
- When the compiler needs help disambiguating types (e.g., parsing strings).

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

### 4. Constants and Static Variables

#### 4.1. Constants

Constants in Rust are values that cannot change and must be assignable at compile time:

```rust
const MAX_POINTS: u32 = 100_000;
```

#### 4.2. Static Variables

Static variables are similar to constants but have a fixed memory address:

```rust
static HELLO_WORLD: &str = "Hello, world!";
```

#### 4.3. Constants vs. Static Variables

| Feature        | Constants        | Static Variables        |
| -------------- | ---------------- | ----------------------- |
| Immutability   | Always immutable | Can be mutable (unsafe) |
| Memory Address | Not fixed        | Fixed                   |
| Inlining       | Usually inlined  | Not inlined             |
| Scope          | Any scope        | Any scope               |
| Evaluation     | Compile-time     | Compile-time            |

### 5. Shadowing in Rust

Shadowing allows you to declare a new variable with the same name as a previous one, effectively "hiding" the old variable:

```rust
let x = 5;
let x = x + 1;
let x = x * 2;
```

#### 5.1. Advantages of Shadowing

- Avoids having to invent unique names for the same logical concept.
- Allows changing the data type while keeping the same variable name.

```rust
let spaces = "   ";
let spaces = spaces.len();
```

#### 5.2. Difference between Shadowing and `mut`

- `mut` allows changing the value but not the type.
- Shadowing allows changing both the value and the type.

#### 5.3. Shadowing Scope

Shadowing only lasts within the scope it is declared:

```rust
let x = 5;
{
    let x = 12;
    println!("Value of x in inner block: {}", x);
}
println!("Value of x: {}", x);
```

## 🏆 Hands-on Exercise

### Exercise 1: Experiment with Immutable and Mutable Variables

**Task**: Write a program that demonstrates the difference between immutable and mutable variables.

### Exercise 2: Explore Integer Data Types

**Task**: Write a program that displays different integer types and their ranges.

### Exercise 3: Shadowing vs. Mutable

**Task**: Write a program that demonstrates the specific differences between shadowing and using the `mut` keyword.

## 🔑 Key Points to Remember

1. **Default Immutability**: Encourages safer programming patterns.
2. **Intentional Use of `mut`**: Use it only when necessary.
3. **Rich Type System**: Understand the widths and purposes of different primitives.
4. **Shadowing is not Mutation**: It creates a new binding.
5. **Annotation as Needed**: Let the compiler infer most types, but step in when ambiguity exists.

## 📝 Homework

### Task 1: Temperature Conversion

Write a Rust program that allows a user to input a temperature in Celsius and converts it to Fahrenheit (formula: F = C \* 9/5 + 32). Use constants for conversion factors.

### Task 2: Geometry Calculations

Write a program to calculate the area and perimeter of a rectangle, circle, and triangle. Use shadowing to reuse variable names during the multi-step calculations.

### Task 3: Data Type Limits

Write a program that prints the maximum and minimum values for various integer types (i8, u8, etc.) using built-in constants like `std::i8::MAX`.
