# Lesson 12: Enums and Pattern Matching in Rust

## 1. Introduction

Welcome back! Today we will explore some of the most powerful features in Rust: Enums and Pattern Matching. These tools allow us to write flexible, safe, and maintainable code.

### Lesson Objectives

- Understand how to define and use enums.
- Master working with enums that contain data.
- Become proficient with the `Option` enum for handling optional values.
- Master pattern matching with the `match` expression.
- Use `if let` and `while let` for concise pattern handling.

## 2. Enums in Rust

### 2.1. Basic Enum Definition

An Enum (short for enumeration) allows you to define a type by enumerating its possible variants.

```rust
// Basic enum definition
enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let direction = Direction::North;

    // Using enum in a function
    print_direction(direction);
}

fn print_direction(direction: Direction) {
    match direction {
        Direction::North => println!("North"),
        Direction::South => println!("South"),
        Direction::East => println!("East"),
        Direction::West => println!("West"),
    }
}
```

> **Key Point**: Unlike C/C++, enums in Rust are first-class data types, not just named integers.

### 2.2. Enums with Data

A powerful feature of Rust enums is the ability to attach data to each variant.

```rust
// Enum with different data for each variant
enum Message {
    Quit,                       // No data
    Move { x: i32, y: i32 },    // Inline struct
    Write(String),              // Single-element tuple
    ChangeColor(i32, i32, i32), // Three-element tuple
}

fn main() {
    let messages = [
        Message::Quit,
        Message::Move { x: 10, y: 5 },
        Message::Write(String::from("Hello!")),
        Message::ChangeColor(255, 0, 0),
    ];

    for msg in messages {
        process_message(msg);
    }
}

fn process_message(msg: Message) {
    match msg {
        Message::Quit => println!("Quit program"),
        Message::Move { x, y } => println!("Move to position: ({}, {})", x, y),
        Message::Write(text) => println!("Message: {}", text),
        Message::ChangeColor(r, g, b) => println!("Change color to RGB: ({}, {}, {})", r, g, b),
    }
}
```

> **Tip**: Enums with data help us model concepts that can exist in multiple forms, each with its own associated information.

## 3. The Option Enum

### 3.1. Introduction to Option

`Option` is a pre-defined enum in the Rust standard library used to handle values that might be absent. It eliminates the "null pointer" problem found in many other languages.

```rust
// Definition of Option in the standard library
enum Option<T> {
    None,    // No value
    Some(T), // Contains a value of type T
}
```

### 3.2. Working with Option

```rust
fn main() {
    // Option examples
    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;

    // Accessing values in Option
    match some_number {
        Some(value) => println!("Has value: {}", value),
        None => println!("Has no value"),
    }

    // Using Option methods
    let doubled = some_number.map(|x| x * 2);
    println!("Doubled value: {:?}", doubled);

    // unwrap_or method
    let value = absent_number.unwrap_or(0);
    println!("Value or default: {}", value);
}
```

> **Safety Warning**: Avoid using `unwrap()` in production code as it can cause a panic if it encounters `None`. Use `unwrap_or()`, `unwrap_or_else()`, or pattern matching instead.

## 4. Pattern Matching with `match`

### 4.1. Basic match Syntax

```rust
fn main() {
    let number = 13;

    match number {
        // Match a specific value
        0 => println!("Zero"),

        // Match multiple values
        1 | 2 => println!("One or two"),

        // Match a range
        3..=9 => println!("Between three and nine"),

        // Guard condition
        n if n % 2 == 0 => println!("{} is even", n),

        // Catch-all case
        _ => println!("{} is an odd number greater than 9", number),
    }
}
```

### 4.2. Destructuring with Pattern Matching

```rust
struct Point {
    x: i32,
    y: i32,
}

enum Shape {
    Circle(Point, i32),         // Center and radius
    Rectangle(Point, Point),    // Top-left and bottom-right
}

fn main() {
    let shapes = [
        Shape::Circle(Point { x: 0, y: 0 }, 5),
        Shape::Rectangle(
            Point { x: -1, y: 2 },
            Point { x: 3, y: -4 }
        ),
    ];

    for shape in shapes {
        // Destructuring nested structures
        match shape {
            Shape::Circle(Point { x, y }, radius) => {
                println!("Circle centered at ({}, {}) with radius {}", x, y, radius);
            },
            Shape::Rectangle(Point { x: x1, y: y1 }, Point { x: x2, y: y2 }) => {
                println!("Rectangle with points ({}, {}) and ({}, {})", x1, y1, x2, y2);
                println!("Area: {}", (x2 - x1).abs() * (y2 - y1).abs());
            },
        }
    }
}
```

> **Best Practice**: Pattern matching in Rust must be exhaustive. The compiler checks that all possible cases are covered to ensure safety.

## 5. if let and while let

### 5.1. if let - Handling a Single Pattern

`if let` allows us to handle one specific pattern without having to list all other cases required by `match`.

```rust
fn main() {
    let some_value = Some(42);

    // Using match
    match some_value {
        Some(value) => println!("Value is: {}", value),
        None => (), // Do nothing if None
    }

    // Equivalent but more concise with if let
    if let Some(value) = some_value {
        println!("Value is: {}", value);
    }

    // if let with else
    if let Some(value) = some_value {
        println!("Value is: {}", value);
    } else {
        println!("No value provided");
    }
}
```

### 5.2. while let - Handling Patterns in a Loop

`while let` allows us to repeat an action as long as a pattern matches.

```rust
fn main() {
    let mut stack = Vec::new();

    stack.push(1);
    stack.push(2);
    stack.push(3);

    // Pop and process elements until the stack is empty
    while let Some(top) = stack.pop() {
        println!("Top element: {}", top);
    }
}
```

## 6. Result Enum and Error Handling

### 6.1. Introduction to Result

`Result` is a built-in enum used to handle operations that can either succeed or fail.

```rust
// Definition of Result in the standard library
enum Result<T, E> {
    Ok(T),  // Success with a value of type T
    Err(E), // Failure with an error of type E
}
```

### 6.2. Error Handling with Result

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_file_contents(path: &str) -> Result<String, io::Error> {
    let mut file = match File::open(path) {
        Ok(file) => file,
        Err(error) => return Err(error),
    };

    let mut contents = String::new();
    match file.read_to_string(&mut contents) {
        Ok(_) => Ok(contents),
        Err(error) => Err(error),
    }
}

fn main() {
    let result = read_file_contents("hello.txt");

    match result {
        Ok(contents) => println!("File contents:\n{}", contents),
        Err(error) => println!("Error reading file: {}", error),
    }

    // Using the ? operator
    fn read_file_simplified(path: &str) -> Result<String, io::Error> {
        let mut file = File::open(path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        Ok(contents)
    }
}
```

> **Pro Tip**: The `?` operator makes error handling much cleaner. It automatically unwraps an `Ok` value or returns early with an `Err`.

## 7. Practical Application: Building a State Handler

Let's build a simple application simulating an Automated Teller Machine (ATM) using enums and pattern matching.

```rust
enum ATMState {
    Idle,
    CardInserted(String),  // Card number
    PinEntered(String, String),  // Card number, PIN
    AmountSelected(String, String, u64),  // Card number, PIN, amount
}

enum ATMOperation {
    InsertCard(String),
    EnterPin(String),
    SelectAmount(u64),
    Cancel,
}

enum ATMResult {
    Success(String),
    Error(String),
}

fn process_atm_operation(current_state: ATMState, operation: ATMOperation) -> (ATMState, ATMResult) {
    match (current_state, operation) {
        (ATMState::Idle, ATMOperation::InsertCard(card_num)) => {
            (ATMState::CardInserted(card_num), ATMResult::Success(String::from("Please enter PIN")))
        },
        (ATMState::CardInserted(card_num), ATMOperation::EnterPin(pin)) => {
            (ATMState::PinEntered(card_num, pin), ATMResult::Success(String::from("Please select amount")))
        },
        (ATMState::PinEntered(card_num, pin), ATMOperation::SelectAmount(amount)) => {
            if amount <= 1000 {
                (
                    ATMState::AmountSelected(card_num, pin, amount),
                    ATMResult::Success(format!("Processing withdrawal of {} USD", amount))
                )
            } else {
                (
                    ATMState::PinEntered(card_num, pin),
                    ATMResult::Error(String::from("Amount exceeds limit!"))
                )
            }
        },
        (_, ATMOperation::Cancel) => {
            (ATMState::Idle, ATMResult::Success(String::from("Transaction cancelled")))
        },
        (state, _) => {
            (state, ATMResult::Error(String::from("Invalid operation for current state")))
        }
    }
}
```

## 8. Summary

In this lesson, we covered:

1. **Basic Enums**: How to define and use enums in Rust.
2. **Enums with Data**: Attaching and accessing information within variants.
3. **Option Enum**: Safely handling optional values.
4. **Result Enum**: Clear and robust error handling.
5. **Pattern Matching**: Using `match` to handle diverse cases.
6. **Concise Syntax**: `if let` and `while let` for simplified pattern handling.

Enums and pattern matching are standout features of Rust, enabling the creation of code that is safe, readable, and resilient.

## 9. Exercises

1. **Basic**: Create a `TrafficLight` enum with Red, Yellow, and Green variants. Write a function that describes the action for each light.
2. **Intermediate**: Define a `Payment` enum with variants like Cash, CreditCard, and MobilePayment (each with appropriate data). Write a processing function using pattern matching.
3. **Advanced**: Build a simple state machine to simulate an online order process (Created, Processing, Shipped, Delivered, Cancelled).

## 10. Additional Resources

- [Rust Book - Enums](https://doc.rust-lang.org/book/ch06-00-enums.html)
- [Rust Book - Pattern Matching](https://doc.rust-lang.org/book/ch18-00-patterns.html)
- [Rust By Example - Match](https://doc.rust-lang.org/rust-by-example/flow_control/match.html)
