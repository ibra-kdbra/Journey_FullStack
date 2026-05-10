# Lesson 11: Structs and Method Syntax in Rust

## Lesson Objectives

- Understand and effectively use structs in Rust.
- Master different initialization methods for structs.
- Gain proficiency in method syntax and implementation.
- Understand associated functions.
- Apply these concepts to a real-world application.

## 1. Introduction to Structs

### 1.1 What is a Struct?

A struct (short for structure) is a complex data type that allows you to package together multiple related values of different types into a meaningful unit. Each piece of data in a struct is called a field.

Structs help model real-world entities such as users, products, geometric shapes, etc.

### 1.2 Why Use Structs?

- **Data Organization**: Groups related data into a cohesive unit.
- **Code Reusability**: Define once, use many times.
- **Abstraction**: Hides implementation details and exposes only necessary interfaces.
- **Real-world Modeling**: Represents real-world objects directly in code.

## 2. Defining and Initializing Structs

### 2.1 Struct Definition Syntax

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

### 2.2 Initializing a Struct

```rust
fn main() {
    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

    // Accessing fields
    println!("Email: {}", user1.email);
}
```

### 2.3 Struct Properties

- Each field can have a different data type.
- Fields are accessed using the dot (`.`) operator.
- Struct instances are immutable by default.
- Use the `mut` keyword to make an instance mutable and allow field modification.

### 2.4 Mutable Structs

```rust
fn main() {
    let mut user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

    // Modifying a field
    user1.email = String::from("new_email@example.com");
    println!("New email: {}", user1.email);
}
```

## 3. Field Init Shorthand

### 3.1 The Redundancy Problem

When variable names match field names, repeating them can be verbose:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

### 3.2 Field Init Shorthand

Rust provides shorthand to avoid this repetition:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,      // Instead of email: email
        username,   // Instead of username: username
        active: true,
        sign_in_count: 1,
    }
}
```

## 4. Struct Update Syntax

### 4.1 Creating from Other Instances

Creating a new instance based on an existing one by copying fields can be tedious:

```rust
fn main() {
    // user1 already declared...

    let user2 = User {
        email: String::from("another@example.com"),
        username: String::from("anotherusername"),
        active: user1.active,
        sign_in_count: user1.sign_in_count,
    };
}
```

### 4.2 Struct Update Syntax

Use `..` to copy remaining fields from another instance:

```rust
fn main() {
    // user1 already declared...

    let user2 = User {
        email: String::from("another@example.com"),
        username: String::from("anotherusername"),
        ..user1  // Copy remaining fields from user1
    };
}
```

### 4.3 Ownership Note

- If the struct has fields that implement the `Copy` trait (like `u32`, `bool`), values are copied.
- If it has fields that do not implement `Copy` (like `String`), ownership is transferred.
- In the example above, `user1` may become invalid if `User` contains `String` fields that were moved.

## 5. Tuple Structs

### 5.1 What are Tuple Structs?

Tuple structs have the naming benefit of structs but fields only have types, not names:

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);

    // Access by index
    println!("First value: {}", black.0);
}
```

### 5.2 When to Use Tuple Structs?

- To give a name to an entire tuple for type safety.
- When individual field names are unnecessary.
- To create a "newtype" that is semantically distinct from a plain tuple.

## 6. Unit-Like Structs

### 6.1 What are Unit-Like Structs?

Structs without any fields:

```rust
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```

### 6.2 Use Cases

- Implementing a trait on a type that doesn't need to store data.
- Creating distinct marker types.
- Useful in certain design patterns.

## 7. Method Syntax

### 7.1 What are Methods?

Methods are functions defined within the context of a struct (or enum/trait). Their first parameter is always `self`, representing the instance the method is called on.

### 7.2 Defining Methods with `impl`

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("Area: {} square pixels", rect1.area());
}
```

### 7.3 The `self` Parameter Types

- `&self`: Immutable borrow.
- `&mut self`: Mutable borrow.
- `self`: Takes ownership (rarely used, often for transformation/destruction).

```rust
impl Rectangle {
    // Immutable borrow
    fn area(&self) -> u32 {
        self.width * self.height
    }

    // Mutable borrow
    fn resize(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;
    }

    // Take ownership
    fn destroy(self) -> String {
        String::from("Rectangle consumed")
    }
}
```

## 8. Associated Functions

### 8.1 What are Associated Functions?

Associated functions are defined within an `impl` block but do **not** take `self` as a parameter:

```rust
impl Rectangle {
    // Associated function (constructor)
    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
}

fn main() {
    // Call using :: operator
    let square = Rectangle::square(20);
}
```

### 8.2 Common Uses

- Constructors (e.g., `new`).
- Factory methods for specific configurations.
- Type-related utility functions.
- Similar to static methods in other languages.

### 8.3 Multiple `impl` Blocks

A struct can have multiple `impl` blocks:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

## 9. Practical Examples

### 9.1 Geometry Calculations

```rust
#[derive(Debug)]
struct Point {
    x: f64,
    y: f64,
}

#[derive(Debug)]
struct Circle {
    center: Point,
    radius: f64,
}

impl Point {
    fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    fn distance_to(&self, other: &Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        (dx * dx + dy * dy).sqrt()
    }
}

impl Circle {
    fn new(center: Point, radius: f64) -> Self {
        Self { center, radius }
    }

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }

    fn contains(&self, point: &Point) -> bool {
        self.center.distance_to(point) <= self.radius
    }
}

fn main() {
    let origin = Point::new(0.0, 0.0);
    let p1 = Point::new(5.0, 5.0);

    println!("Distance: {}", origin.distance_to(&p1));

    let circle = Circle::new(origin, 10.0);
    println!("Area: {}", circle.area());
    println!("Contains p1? {}", circle.contains(&p1));
}
```

## Hands-on Exercise

### Exercise 1: Bank Account Management System

Create structs and methods to represent a bank account system with the following functionalities:

- Create a new account.
- Deposit money.
- Withdraw money.
- Transfer funds between accounts.
- Display account details.

### Exercise 2: Geometric Shapes Library

Build a system to represent and calculate properties of various shapes:

- `Point`, `Line`, `Triangle`, `Rectangle`, `Circle`.
- Methods for area, perimeter, intersection checks, etc.

## Summary

### Key Points

1. Structs group related data into meaningful units.
2. Three types: Classic, Tuple, and Unit-like.
3. Field init shorthand reduces boilerplate for matching names.
4. Struct update syntax facilitates instance creation from existing data.
5. Methods are instance-bound functions (`self`).
6. Associated functions are type-bound functions (no `self`).
7. Rust focuses on composition and functionality over traditional OOP inheritance.

### Additional Resources

- [The Rust Book - Chapter 5: Structs](https://doc.rust-lang.org/book/ch05-00-structs.html)
- [Rust By Example - Structs](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html)

## Next Lesson

Lesson 12: Enums and Pattern Matching
