# Lesson 3: Basic Data Types and Variables in Rust

## 🎯 Lesson Objectives

- Understand and apply the variable declaration mechanism in Rust using the `let` keyword.
- Master the concept of immutability - one of Rust's most important features.
- Become familiar with basic primitive data types in Rust.
- Understand the difference between type annotation and type inference.
- Distinguish between constants, static variables, and regular variables.
- Understand and apply the concept of shadowing in Rust.
- Identify and fix common errors related to variable management.

## 📝 Detailed Content

### 1. Variable Declaration with `let` and Immutability

#### 1.1. Basic Variable Declaration

In Rust, we declare variables using the `let` keyword:

```rust
let x = 5;
```

A unique feature of Rust compared to many other languages: **All variables are immutable by default**. This means once a value is assigned to a variable, you cannot change its value.

```rust
let x = 5;
x = 6; // Error: cannot assign twice to immutable variable
```

#### 1.2. Mutable Variables

If you want to create a variable whose value can change, you must use the `mut` keyword:

```rust
let mut y = 5;
y = 6; // Valid
println!("The value of y is: {}", y);
```

#### 1.3. Why is Rust Immutable by Default?

- **Memory Safety**: Rust is designed for memory safety.
- **Bug Prevention**: Immutability helps prevent unwanted side effects.
- **Optimization**: The compiler can optimize code better when it knows values won't change.
- **Concurrency**: Easier to handle multi-threaded programming.

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

You can represent integers in various ways:

```rust
let decimal = 98_222; // Decimal with _ for readability
let hex = 0xff; // Hexadecimal
let octal = 0o77; // Octal
let binary = 0b1111_0000; // Binary
let byte = b'A'; // u8 only, ASCII value of 'A'
```

#### 2.2. Floating-Point Types

Rust has two floating-point types:

- `f32`: 32-bit float, single precision.
- `f64`: 64-bit float, double precision (default).

```rust
let x = 2.0; // default f64
let y: f32 = 3.0; // f32 with type annotation
```

#### 2.3. Boolean Type

```rust
let t = true;
let f: bool = false; // with explicit type annotation
```

#### 2.4. Character Type (`char`)

The `char` type in Rust is 4 bytes and represents a Unicode Scalar Value, not just ASCII:

```rust
let c = 'z';
let z: char = 'ℤ'; // with explicit type annotation
let heart_eyed_cat = '😻'; // Valid Unicode!
```

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
let x = 5; // Rust infers x is i32
let y = 3.14; // Rust infers y is f64
```

#### 3.3. When is Type Annotation Required?

- When declaring a variable without initializing it immediately.
- When you want to use a type other than the default.
- When precision is required for correctness.
- To improve code readability for others.

```rust
let guess: u32 = "42".parse().expect("Not a number!");
// Without type annotation, the compiler wouldn't know the target type
// because .parse() can return many different types.
```

### 4. Constants and Static Variables

#### 4.1. Constants

Constants in Rust are values that cannot change and must be assignable at compile time:

```rust
const MAX_POINTS: u32 = 100_000;
```

Features of constants:

- Always immutable, cannot use `mut`.
- Must specify a data type.
- Can be declared in any scope, including global.
- Value must be a compile-time computable expression.
- Conventionally named in UPPER_CASE with underscores.

#### 4.2. Static Variables

Static variables are similar to constants but have a fixed memory address:

```rust
static HELLO_WORLD: &str = "Hello, world!";
```

Features of static variables:

- Fixed memory address.
- Can be declared as `mut` (but access is unsafe).
- Persist for the entire duration of the program.
- Use with caution, especially `static mut`.

```rust
static mut COUNTER: u32 = 0;

fn add_to_counter(inc: u32) {
    // Accessing and modifying static mut is unsafe
    unsafe {
        COUNTER += inc;
    }
}
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
let x = x + 1; // x is now 6, previous x is hidden
let x = x * 2; // x is now 12, previous x is hidden
```

#### 5.1. Advantages of Shadowing

- Avoids having to invent unique names for the same logical concept.
- Allows changing the data type while keeping the same variable name.

```rust
let spaces = "   "; // type &str
let spaces = spaces.len(); // type usize, count of spaces
```

#### 5.2. Difference between Shadowing and `mut`

- `mut` allows changing the value but not the type.
- Shadowing allows changing both the value and the type.

```rust
let mut spaces = "   ";
// spaces = spaces.len(); // Error! Cannot change type from &str to usize
```

#### 5.3. Shadowing Scope

Shadowing only lasts within the scope it is declared:

```rust
let x = 5;
{
    let x = 12; // Valid only in this block
    println!("Value of x in inner block: {}", x); // x = 12
}
println!("Value of x: {}", x); // x = 5, outer variable unaffected
```

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Experiment with Immutable and Mutable Variables

**Task**: Write a program that demonstrates the difference between immutable and mutable variables.

**Solution**:

```rust
fn main() {
    // Immutable variable
    let x = 5;
    println!("The value of x is: {}", x);

    // Cannot change value of immutable variable
    // x = 6; // Uncomment this line to see the error

    // Mutable variable
    let mut y = 10;
    println!("Initial value of y: {}", y);

    // Can change value of mutable variable
    y = 15;
    println!("New value of y: {}", y);
}
```

**Explanation**:

- Variable `x` is declared without `mut`, making it immutable.
- Uncommenting `x = 6` causes a compilation error.
- Variable `y` is declared with `mut`, allowing reassignment.

### Exercise 2: Explore Integer Data Types

**Task**: Write a program that displays different integer types and their ranges.

**Solution**:

```rust
fn main() {
    // i8 type
    let a: i8 = 127;
    // let a_overflow: i8 = 128; // Error: exceeds range of i8
    println!("i8 max: {}", a);

    // u8 type
    let b: u8 = 255;
    // let b_overflow: u8 = 256; // Error: exceeds range of u8
    println!("u8 max: {}", b);

    // i32 type (default for integers)
    let c = 2_147_483_647;
    println!("i32 max: {}", c);

    // u32 type
    let d: u32 = 4_294_967_295;
    println!("u32 max: {}", d);

    // Various integer representations
    let decimal = 98_222;
    let hex = 0xff;
    let octal = 0o77;
    let binary = 0b1111_0000;
    let byte = b'A';

    println!("Decimal: {}", decimal);
    println!("Hex: {}", hex);
    println!("Octal: {}", octal);
    println!("Binary: {}", binary);
    println!("Byte: {}", byte);
}
```

**Explanation**:

- Demonstrates various integer types and their maximum values.
- Highlights that exceeding bounds results in overflow errors.
- Shows support for different numeric bases.

### Exercise 3: Comparison of Shadowing and Mutable

**Task**: Write a program that demonstrates the differences between shadowing and using the `mut` keyword.

**Solution**:

```rust
fn main() {
    // Shadowing with type change
    let spaces = "   ";
    println!("initial spaces: '{}' (type &str)", spaces);

    let spaces = spaces.len();
    println!("spaces after shadowing: {} (type usize)", spaces);

    // Mutability experiment
    let mut word = "hello";
    println!("initial word: '{}' (type &str)", word);

    word = "world"; // Valid, same type
    println!("word after mutation: '{}' (still &str)", word);

    // Cannot change type with mut
    // word = word.len(); // Error: cannot assign usize to &str

    // But can do this with shadowing
    let word = word.len();
    println!("word after shadowing: {} (now type usize)", word);
}
```

**Explanation**:

- Shadowing allows reusing the name `spaces` while changing its type from `&str` to `usize`.
- Mutation with `mut` requires maintaining the same data type.

### Exercise 4: Using Constants and Static Variables

**Task**: Write a program illustrating the use of constants and static variables.

**Solution**:

```rust
// Constants
const MAX_USERS: u32 = 100_000;
const PI: f64 = 3.14159265359;

// Static variables
static PROGRAM_NAME: &str = "Rust Demo";
static mut COUNTER: u32 = 0;

fn main() {
    println!("Program: {}", PROGRAM_NAME);
    println!("Max users: {}", MAX_USERS);
    println!("Pi value: {}", PI);

    // Use unsafe block for static mut access
    unsafe {
        println!("Initial counter: {}", COUNTER);
        COUNTER += 1;
        println!("Counter after increment: {}", COUNTER);
    }

    // Calculation with constants
    let radius = 5.0;
    let area = PI * radius * radius;
    println!("Area of circle with radius {}: {}", radius, area);
}
```

**Explanation**:

- Demonstrates global declarations for constants and static variables.
- Shows requirement for `unsafe` blocks when dealing with mutable static variables.

## 🔑 Key Points to Remember

1. **Default Immutability**: Rust defaults to immutability for safety.
2. **Intentional use of `mut`**: Only use `mut` when mutation is actually needed.
3. **Rich Type System**: Choose appropriate types to optimize performance and memory.
4. **Shadowing != Mutation**: Shadowing creates a new binding; mutation changes the current value.
5. **Purpose-driven design**: Think about data management. Immutability is especially powerful in concurrent systems.
6. **Annotation as needed**: Use explicit types for clarity or when the compiler needs assistance.
7. **Constants vs. Static**: Constants are inlined; static variables reside in a fixed memory location.
8. **Variable Scope**: Memory is freed automatically when a variable goes out of scope.
9. **Avoid Overflows**: Be cautious with integer ranges to prevent runtime panics.
10. **Unsafe strictly for necessity**: Only use `unsafe` when absolutely required and understood.

## 📝 Homework

### Task 1: Temperature Conversion

Write a Rust program to convert Celsius to Fahrenheit using constants for conversion factors.

### Task 2: Geometry Calculations

Calculate the area and perimeter of basic shapes using shadowing to reuse variable names.

### Task 3: Range Limits

Write a program to display the MIN and MAX for all standard integer types.

### Task 4: Student Data Processing

Take student information (name, age, grade) and output whether they passed. Apply shadowing for formatting.

### Task 5: Compound Interest

Calculate compound interest over several years using constants for rates and shadowing for annual value updates.
