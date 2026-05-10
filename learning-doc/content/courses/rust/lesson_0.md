# Rust Core - From Basic to Advanced

### PART 1: GETTING STARTED WITH RUST (5 lessons)

#### Lesson 1: Introduction to Rust - Why Should You Learn Rust?

- **Content:**
  - History and philosophy of Rust
  - Advantages of Rust: memory safety, high performance, concurrency
  - Comparison with other languages (C++, Python, JavaScript)
  - Application areas of Rust
  - Demo of a simple Rust application
- **Activities:**
  - General course overview
  - Environment installation guide

#### Lesson 2: Installing and Using Rust Tools

- **Content:**
  - Installing Rust via Rustup
  - Introduction to Cargo (Rust's package manager)
  - Creating the first project with `cargo new`
  - Compiling and running programs with `cargo build` and `cargo run`
  - Checking code with `cargo check`
- **Activities:**
  - Demo: Creating a "Hello World" project
  - Explanation of the project directory structure

#### Lesson 3: Basic Data Types and Variables

- **Content:**
  - Variable declaration with `let` and immutability
  - Primitive data types: integer, float, boolean, character
  - Type annotation and type inference
  - Constants and static variables
  - Shadowing in Rust
- **Activities:**
  - Demo: Real-world examples
  - Explanation of errors when modifying immutable variables

#### Lesson 4: Control Structures and Loops

- **Content:**
  - if-else and if let statements
  - Loops: loop, while, for
  - Break and continue
  - Expressions vs. Statements in Rust
- **Activities:**
  - Write a program to calculate Fibonacci numbers
  - Demo: Using if as an expression

#### Lesson 5: Functions and Scope in Rust

- **Content:**
  - Defining and calling functions
  - Parameters and return values
  - Expressions and return values
  - Scope and ownership (introduction)
- **Activities:**
  - Write a program to calculate factorials
  - Explanation of implicit return expressions

### PART 2: OWNERSHIP MECHANISM IN RUST (5 lessons)

#### Lesson 6: Ownership - The Core Concept

- **Content:**
  - Understanding ownership and memory management mechanisms
  - Stack vs. Heap
  - Ownership principles in Rust
  - Move and copy
- **Activities:**
  - Visual illustration of the ownership mechanism
  - Debugging common ownership errors

#### Lesson 7: Borrowing and References

- **Content:**
  - References and borrowing
  - Immutable references vs. mutable references
  - Borrowing rules
  - Dangling references and how Rust prevents them
- **Activities:**
  - Write a program illustrating borrowing
  - Analysis of errors and how to fix them

#### Lesson 8: Slices in Rust

- **Content:**
  - String slices (`&str`)
  - Array slices (`&[T]`)
  - Methods for working with slices
  - Pattern matching with slices
- **Activities:**
  - Write a function to find the first word in a sentence
  - Compare performance of slices and cloning

#### Lesson 9: Lifetimes in Rust

- **Content:**
  - The concept of lifetimes
  - Lifetime annotation
  - Lifetime elision rules
  - Static lifetime
- **Activities:**
  - Demo: Cases requiring explicit lifetime specification
  - Debugging common lifetime errors

#### Lesson 10: Ownership in Practice

- **Content:**
  - Recap: Ownership, borrowing, lifetime
  - Design patterns related to ownership
  - When to use Clone and Copy
  - Optimization with ownership
- **Activities:**
  - Refactor code to optimize ownership
  - Small project: building a text management application

### PART 3: COMPLEX DATA TYPES (5 lessons)

#### Lesson 11: Structs and Method Syntax

- **Content:**
  - Defining and initializing structs
  - Field init shorthand
  - Struct update syntax
  - Method syntax with `impl`
  - Associated functions
- **Activities:**
  - Build a Rectangle struct with methods
  - Demo: Geometry calculation application

#### Lesson 12: Enums and Pattern Matching

- **Content:**
  - Defining and using enums
  - Enums with data
  - Option enum
  - Pattern matching with `match`
  - if let and while let
- **Activities:**
  - Build a state processing application
  - Demo: Error handling with Option and Result

#### Lesson 13: Collections - Vectors

- **Content:**
  - Vec<T> and its methods
  - Push, pop, and element access
  - Ownership with vectors
  - Iterating through vectors
  - Vectors and generics
- **Activities:**
  - Write a to-do list management program
  - Comparison with arrays and slices

#### Lesson 14: Collections - Strings

- **Content:**
  - String vs. &str
  - UTF-8 and Unicode in Rust
  - String processing methods
  - String concatenation and formatting
  - Performance when working with strings
- **Activities:**
  - Write a text analysis application
  - Demo: Handling complex Unicode strings

#### Lesson 15: Collections - HashMaps

- **Content:**
  - HashMap<K, V> and its methods
  - Inserting and retrieving
  - Ownership with HashMap
  - Updating based on old value
  - Hashing functions
- **Activities:**
  - Write a word counting program
  - Use HashMap to store configuration

### PART 4: ERROR HANDLING AND GENERIC TYPES (5 lessons)

#### Lesson 16: Error Handling in Rust

- **Content:**
  - panic! and unrecoverable errors
  - Result<T, E> and recoverable errors
  - Propagating errors with ?
  - Custom error types
  - thiserror and anyhow crates
- **Activities:**
  - Write a file reading and processing application
  - Improve error messages in an application

#### Lesson 17: Generic Types

- **Content:**
  - Defining structs and enums with generics
  - Generic function parameters
  - Generics with method definitions
  - Performance of generic code
  - Monomorphization
- **Activities:**
  - Build generic data structures
  - Refactor code to use generics

#### Lesson 18: Traits - Characteristics in Rust

- **Content:**
  - Defining and implementing traits
  - Default implementations
  - Trait bounds
  - Trait objects and dynamic dispatch
  - Standard library traits (Display, Debug, Clone, etc.)
- **Activities:**
  - Build a trait hierarchy for an application
  - Implement Display and Debug traits

#### Lesson 19: Lifetimes with Generics

- **Content:**
  - Generic lifetime parameters
  - Combining lifetime and generic type parameters
  - Lifetime bounds
  - Static lifetime
  - Approaching effective lifetime annotation
- **Activities:**
  - Analyze and fix lifetime errors
  - Build an API with generics and lifetimes

#### Lesson 20: Advanced Trait Patterns

- **Content:**
  - Associated types
  - Default type parameters
  - Operator overloading
  - Fully qualified syntax
  - Supertraits
  - Newtype pattern
- **Activities:**
  - Implement the Iterator trait for a data structure
  - Use operator overloading

### PART 5: CONCURRENCY AND REAL-WORLD APPLICATIONS (10 lessons)

#### Lesson 21: Closures in Rust

- **Content:**
  - Syntax and semantics of closures
  - Closure type inference and annotation
  - Capturing environment: moving and borrowing
  - FnOnce, FnMut, and Fn traits
  - Closures with iterators
- **Activities:**
  - Use closures with collections
  - Implement a custom sorting function

#### Lesson 22: Iterators

- **Content:**
  - Iterator trait and next method
  - Consuming adaptors: sum, collect
  - Iterator adaptors: map, filter, chain
  - Creating custom iterators
  - Iterator performance
- **Activities:**
  - Implement Iterator for a custom data structure
  - Benchmark performance with iterators

#### Lesson 23: Smart Pointers - Box

- **Content:**
  - Box<T> and heap allocation
  - Recursive types with Box
  - Deref trait
  - Drop trait
  - Sizing considerations
- **Activities:**
  - Implement recursive data structures (linked list, tree)
  - Demo: Memory management with Box

#### Lesson 24: Smart Pointers - Rc and RefCell

- **Content:**
  - Rc<T> and shared ownership
  - Reference counting
  - Interior mutability with RefCell<T>
  - Combining Rc and RefCell
  - Weak<T> and memory leaks
- **Activities:**
  - Implement a graph data structure
  - Debug memory leaks with RefCell and Rc

#### Lesson 25: Threads and Shared State Concurrency

- **Content:**
  - Spawning threads
  - Thread communication
  - Thread::spawn and join handles
  - Send and Sync traits
  - Arc<T> for thread safety
- **Activities:**
  - Write a simple multi-threaded program
  - Demo: Race conditions and how to avoid them

#### Lesson 26: Mutex and Atomic Types

- **Content:**
  - Mutex<T> and mutual exclusion
  - Poisoned locks
  - Atomic types (AtomicBool, AtomicUsize, etc.)
  - Compare and swap operations
  - Lock-free programming
- **Activities:**
  - Implement a thread-safe counter
  - Compare performance of Mutex and Atomic

#### Lesson 27: Channels and Message Passing

- **Content:**
  - Message passing concurrency
  - mpsc channels (multi-producer, single-consumer)
  - Sending and receiving messages
  - Blocking and non-blocking receives
  - Multiple producers
- **Activities:**
  - Write a producer-consumer application
  - Build a simple worker pool

#### Lesson 28: Async/Await and Futures

- **Content:**
  - Asynchronous programming with Rust
  - Futures and poll method
  - async/await syntax
  - Tokio runtime
  - Error handling with async
- **Activities:**
  - Write an HTTP client using reqwest
  - Compare performance with the synchronous model

#### Lesson 29: Web Development with Rust

- **Content:**
  - Introduction to web frameworks (Actix, Rocket, Warp)
  - Routing and handlers
  - Request and response
  - Middleware
  - Database connections
- **Activities:**
  - Build a simple REST API
  - Connect to a database

#### Lesson 30: Final Project - Building a Complete Application

- **Content:**
  - Synthesize learned knowledge
  - System design
  - Testing and benchmarking
  - Documentation
  - Deployment
- **Activities:**
  - Execute project: CLI app or Web service
  - Code review and refactoring
