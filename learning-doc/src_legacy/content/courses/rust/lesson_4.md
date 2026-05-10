# Lesson 4: Control Structures and Loops in Rust

## 🎯 Lesson Objectives

- Understand and apply `if-else` and `if let` conditional statements in Rust.
- Master the types of loops: `loop`, `while`, and `for`.
- Proficiently use `break` and `continue` to control loop flow.
- Distinguish between Expressions and Statements in Rust.
- Understand how Rust treats control structures as expressions with return values.

## 📝 Detailed Content

### 1. The if-else Conditional Statement

In Rust, `if-else` structures do not require parentheses `()` around the condition but always require curly braces `{}`:

```rust
let number = 7;

// Basic syntax
if number < 5 {
    println!("Number is less than 5");
} else if number < 10 {
    println!("Number is between 5 and 9");
} else {
    println!("Number is 10 or greater");
}
```

#### Important Features

- The condition in `if` **must** be of type `bool` - Rust does not automatically cast numbers to booleans.
- Code blocks are always enclosed in curly braces `{}`.

#### if as an Expression

In Rust, `if` can be used as an expression to assign values:

```rust
let condition = true;
let number = if condition { 5 } else { 6 };
println!("Value of number: {}", number); // 5
```

Note: All branches of the `if` must return the same data type.

### 2. if let - Simplified Pattern Matching

`if let` is concise syntax for pattern matching a value and executing code if it matches a specific pattern:

```rust
let some_value = Some(3);

// Traditional approach with match
match some_value {
    Some(value) => println!("Value exists: {}", value),
    None => (),
}

// Concise approach with if let
if let Some(value) = some_value {
    println!("Value exists: {}", value);
}
```

`if let` is especially useful when you only care about one specific pattern and want to ignore others.

### 3. Loops in Rust

Rust provides three forms of loops: `loop`, `while`, and `for`.

#### a. loop - Infinite Loop

The `loop` keyword starts an infinite loop that continues until an explicit `break` is encountered:

```rust
let mut counter = 0;

let result = loop {
    counter += 1;

    if counter == 10 {
        break counter * 2; // Returns a value after break
    }
};

println!("Result: {}", result); // 20
```

#### b. while - Conditional Loop

The `while` loop runs as long as a condition remains true:

```rust
let mut number = 3;

while number != 0 {
    println!("{}!", number);
    number -= 1;
}

println!("Finished!");
```

#### c. for - Iterating over Collections

The `for` loop is used to iterate over items in a collection or a range:

```rust
// Iterating over a range (1..4 means from 1 up to but not including 4)
for number in 1..4 {
    println!("{}!", number);
}

// Iterating over array elements
let a = [10, 20, 30, 40, 50];
for element in a.iter() {
    println!("Value: {}", element);
}
```

### 4. Break and Continue

#### Break

- `break` terminates the loop immediately.
- It can carry a return value: `break value;`.
- You can use loop labels to break out of nested loops:

```rust
'outer: for i in 1..5 {
    for j in 1..5 {
        if i * j > 10 {
            println!("Exiting at i={}, j={}", i, j);
            break 'outer; // Exits the labeled outer loop
        }
    }
}
```

#### Continue

- `continue` skips the rest of the current iteration and starts the next one:

```rust
for i in 1..6 {
    if i % 2 == 0 {
        continue; // Skip even numbers
    }
    println!("Odd number: {}", i);
}
```

### 5. Expressions vs. Statements in Rust

Rust is an expression-oriented language:

#### Statements

- Do not return a value.
- End with a semicolon `;`.
- Examples: variable declarations, assignments.

```rust
let x = 5; // Statement
```

#### Expressions

- Return a value.
- Do not end with a trailing semicolon.
- Examples: function calls, operators, block code `{}`.

```rust
let y = {
    let x = 3;
    x + 1 // Expression - no semicolon
}; // y = 4
```

In Rust, many constructs are expressions:

- Block code `{}` is an expression returning its last evaluated expression.
- `if` is an expression.
- `match` is an expression.
- Even `loop` can be an expression using `break value`.

## 🏆 Hands-on Exercise

### Exercise 1: Fibonacci Sequence

Write a program to calculate and print the first n Fibonacci numbers.

```rust
fn main() {
    let n = 10; // Number of Fibonacci numbers to calculate

    println!("First {} Fibonacci numbers:", n);

    let mut a = 0;
    let mut b = 1;

    print!("{}, {}", a, b);

    for _ in 2..n {
        let next = a + b;
        print!(", {}", next);
        a = b;
        b = next;
    }
    println!();
}
```

### Exercise 2: if as an Expression

Write a program using `if` as an expression to determine the largest of three numbers.

### Exercise 3: Pattern Matching with if let

Write a program using `if let` to handle an `Option` result.

## 🔑 Key Points to Remember

1. **Boolean Conditions Only**: Rust requires `if` and `while` conditions to be strictly `bool`.
2. **Mandatory Braces**: `{}` are always required for code blocks.
3. **Type Consistency**: When using `if` as an expression, all branches must return the same type.
4. **Loop Performance**: `for` loops with iterators are safe and efficient, avoiding manual bounds checking.
5. **Expression-oriented**: Leverage Rust's expression nature for more concise and clear code.
6. **Ownership in Loops**: Be mindful of ownership when iterating over collections (`.iter()`, `.iter_mut()`, `.into_iter()`).

## 📝 Homework

### Task 1: Prime Number Check

Write a program to determine if a number is prime using control structures and loops.

### Task 2: FizzBuzz

Classic FizzBuzz: Print numbers 1-100, but "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for both.

### Task 3: Pascal's Triangle

Print the first n rows of Pascal's triangle using nested loops.

### Task 4: Binary Search Algorithm

Implement a binary search algorithm using a `while` or `loop` structure. Return the index or `None`.
