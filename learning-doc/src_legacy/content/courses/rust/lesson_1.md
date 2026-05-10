# Lesson 1: Introduction to Rust

## 🎯 Lesson Objectives

1. Understand the origin and philosophy of the Rust programming language.
2. Grasp the key advantages of Rust compared to other languages.
3. Identify suitable areas for applying Rust.

## 📝 Detailed Content

### 1. History and Philosophy of Rust

- **Origin**

  - Developed by Graydon Hoare at Mozilla Research starting in 2006.
  - Version 1.0 was officially released in May 2015.
  - Currently managed by the Rust Foundation (established in 2021).

- **Core Philosophy**
  - Focuses on three core values: Performance, Reliability, and Productivity.

### 2. Advantages of Rust

- **Memory Safety**

  - The ownership and borrowing system prevents memory errors at compile time.
  - No garbage collector is used, yet memory safety is guaranteed.

- **High Performance**

  - Execution speed is comparable to C/C++.
  - No runtime overhead.

- **Safe Concurrency**

  - The ownership model helps avoid data races at compile time.

- **Modern Development Ecosystem**
  - Cargo: A robust package manager and build system.

### 3. Comparison with Other Languages

- **Versus C/C++**

  - Safer memory and thread management.
  - Modern compilation process (Cargo vs. Make/CMake).

- **Versus Python/JavaScript**

  - Many times higher performance.
  - Statically typed instead of dynamically typed.

- **Versus Go**
  - Finer-grained memory control without a garbage collector.
  - More powerful generic features.

### 4. Application Areas for Rust

- **Systems Development**
- **Web Development (via WebAssembly and backend frameworks)**
- **Network Programming**
- **Cloud and Distributed Systems**
- **Game Development**

### 5. Setting Up the Rust Environment

- **Installing Rustup (Rust version manager)**

  - Windows: Download and run `rustup-init.exe` from rustup.rs.
  - macOS/Linux: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Verify installation: `rustc --version` and `cargo --version`.

- **Core Tools**

  - `rustc`: The Rust compiler.
  - `cargo`: The package and project manager.
  - `rustup`: The version manager.

- **IDEs and Text Editors**
  - Visual Studio Code with the `rust-analyzer` extension is highly recommended.

### 6. Demo: Your First Rust Program

- **Create a New Project**

  ```bash
  cargo new hello_rust
  cd hello_rust
  ```

- **Project Structure**
  - `Cargo.toml`: Project configuration file.
  - `src/main.rs`: Main source code file.

## 🏆 Hands-on Exercise

### Exercise 1: Install Rust Environment and Confirm Version

**Task:** Install Rust on your computer and verify the installed version using the command line.

### Exercise 2: Create and Run Your First Rust Program

**Task:** Create a simple Rust program that displays "Hello from [your name]!".

## 🔑 Key Points to Remember

1. **Ownership is the core concept**: Rust differs from other languages primarily due to its ownership system.
2. **Steep learning curve**: Rust has a steeper learning curve than many other common languages.
3. **Utilize official documentation**: Rust has excellent official documentation. "The Rust Book" (doc.rust-lang.org/book) is a fantastic starting point.

## 📝 Homework

1. **Practice**: Create a simple Rust program that takes a username as input and displays a greeting along with the current time.
2. **Research**: Read chapters 1 and 2 of "The Rust Book" and summarize the key concepts you learned.
