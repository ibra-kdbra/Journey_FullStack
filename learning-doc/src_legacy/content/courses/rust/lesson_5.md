# Lesson 5: Functions and Scope in Rust

Welcome back! Today we will explore functions and scope in Rust—one of the most fundamental concepts of this language.

## 🎯 Lesson Objectives

- Understand how to build and call functions in Rust.
- Master passing parameters and returning values from functions.
- Distinguish between statements and expressions in Rust.
- Become familiar with the concept of scope and get a brief introduction to ownership.
- Apply this knowledge to solve practical problems.

## 📝 Detailed Content

### 1. Defining and Calling Functions

#### Basic Syntax

```rust
fn function_name(parameter1: data_type1, parameter2: data_type2) -> return_type {
    // Function body
    // Statements and expressions
}
```

#### Simple Example

```rust
fn say_hello() {
    println!("Hello, everyone!");
}

fn main() {
    say_hello(); // Call the function
}
```

#### Naming Conventions

- Function names in Rust follow the `snake_case` convention (all lowercase, words joined by underscores).
- Function names should accurately describe the action they perform.

### 2. Parameters and Return Values

#### Passing Parameters

```rust
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    greet("John Doe");

    let student = "Jane Smith";
    greet(student);
}
```

#### Functions with Return Values

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    let sum = add(5, 3);
    println!("Sum: {}", sum); // Sum: 8
}
```

#### Functions without Return Values

```rust
fn print_info() -> () { // or simply omit "-> ()"
    println!("This is a function that returns nothing.");
}
```

### 3. Expressions and Return Values

#### Statements vs. Expressions

- **Statement**: A command that performs an action but does not return a value.
- **Expression**: A piece of code that evaluates to and returns a value.

```rust
fn main() {
    let x = 5; // Statement (assignment)

    let y = {  // Expression block
        let a = 3;
        a + 1  // Expression - no trailing semicolon
    };

    println!("The value of y is: {}", y); // 4
}
```

#### Implicit Return Values

In Rust, the last expression in a function body is returned if it does not have a trailing semicolon (;):

```rust
fn square(num: i32) -> i32 {
    num * num  // No semicolon -> returns the value
}

fn main() {
    let result = square(5);
    println!("5 squared = {}", result); // 25
}
```

#### The `return` Keyword

```rust
fn absolute(num: i32) -> i32 {
    if num >= 0 {
        return num; // Early return with the return keyword
    }

    -num // Implicit return
}
```

### 4. Scope and Introduction to Ownership

#### Scope in Rust

- Scope is the range within which a variable exists and can be accessed.
- Variables in Rust are created upon declaration and destroyed when they go out of scope.

```rust
fn main() {
    // outer_var exists throughout the entire main function
    let outer_var = 10;

    {
        // inner_var only exists inside this block
        let inner_var = 20;
        println!("Inside block: outer_var = {}, inner_var = {}", outer_var, inner_var);
    } // inner_var is destroyed here

    // The following line would cause a compilation error
    // println!("inner_var = {}", inner_var);

    println!("Outside block: outer_var = {}", outer_var);
}
```

#### Introduction to Ownership

- Rust uses an ownership system to manage memory.
- Every value in Rust has a variable called its "owner".
- When the owner goes out of scope, the value is destroyed.

```rust
fn main() {
    let s = String::from("hello"); // s is the owner of the string "hello"

    takes_ownership(s); // Ownership is moved to the function

    // The following line would cause an error because s is no longer valid
    // println!("{}", s);
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
} // some_string goes out of scope and is destroyed
```

## 🏆 Hands-on Exercise with Detailed Solutions

### Exercise 1: Factorial Calculation

**Task:** Write a `factorial` function to calculate the factorial of a non-negative integer.

**Solution:**

```rust
fn factorial(n: u64) -> u64 {
    if n == 0 || n == 1 {
        1
    } else {
        n * factorial(n - 1)
    }
}

fn main() {
    println!("0! = {}", factorial(0)); // 1
    println!("5! = {}", factorial(5)); // 120
    println!("10! = {}", factorial(10)); // 3628800
}
```

**Explanation:**

- Uses the `u64` data type to store potentially large results.
- A recursive function with base cases 0! = 1 and 1! = 1.
- Uses implicit return values without the `return` keyword.

**Improved Version (Iterative):**

```rust
fn factorial_iterative(n: u64) -> u64 {
    let mut result = 1;
    for i in 1..=n {
        result *= i;
    }
    result
}

fn main() {
    println!("0! = {}", factorial_iterative(0)); // 1
    println!("5! = {}", factorial_iterative(5)); // 120
    println!("10! = {}", factorial_iterative(10)); // 3628800
}
```

### Exercise 2: Implicit Return Expressions

**Task:** Write a `max_of_three` function that takes three integers and returns the largest using implicit returns.

**Solution:**

```rust
fn max_of_three(a: i32, b: i32, c: i32) -> i32 {
    let max_ab = if a > b { a } else { b };

    if max_ab > c {
        max_ab  // Implicit return expression
    } else {
        c       // Implicit return expression
    }
}

fn main() {
    println!("Max of 10, 5, 15 is: {}", max_of_three(10, 5, 15)); // 15
    println!("Max of 7, 12, 3 is: {}", max_of_three(7, 12, 3));   // 12
    println!("Max of 20, 20, 10 is: {}", max_of_three(20, 20, 10)); // 20
}
```

## 🔑 Key Points to Remember

1. **Function Syntax:**

   - Use the `fn` keyword to declare functions.
   - Parameters must have specified types.
   - Return types are declared after the `->` arrow.
   - No `return` keyword is needed if the last expression has no semicolon.

2. **Parameters and Scope:**

   - Parameters only exist within the function's scope.
   - Variables are destroyed when they exit their scope.

3. **Expressions vs. Statements:**

   - Expressions return values; statements do not.
   - A semicolon (;) turns an expression into a statement.
   - The last expression in a block (without a semicolon) is the return value of that block.

4. **Ownership:**

   - Passing complex types (like `String` or `Vec`) to a function moves ownership by default.
   - Primitive types (like `i32` or `bool`) are copied, not moved.

5. **Recursion:**
   - Rust supports recursion but has stack size limits. Consider iterative solutions for very deep recursive calls.

## 📝 Homework

1. **Basic Task:** Write functions to calculate the sum of numbers from 1 to n using both iterative and recursive methods.
2. **Intermediate Task:** Write a `fibonacci(n: u32) -> u64` function to calculate the nth Fibonacci number.
3. **Advanced Task:** Write an `is_palindrome(s: &str) -> bool` function that checks if a string is a palindrome.
4. **Challenge:** Write a program that takes a simple mathematical expression (+, -, \*, / with integers) and calculates the result, breaking it into separate functions.
5. **Ownership Practice:** Write a function that takes a vector of integers and returns a new sorted vector. Pay close attention to how ownership is handled.
