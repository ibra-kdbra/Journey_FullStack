# Lesson 1: Introduction to Golang

## 🎯 Lesson Objectives

- Understand the history, philosophy, and reasons behind the creation of the Go language.
- Grasp the strengths and typical real-world applications of Go.
- Successfully install Go and set up the development environment.
- Create and run your first Go program.
- Become familiar with the basic syntax and structure of a Go program.

## 📝 Detailed Content

### 1. History and Philosophy of Golang

#### 1.1. Development History

- **Birth Year**: 2007 (internally at Google), 2009 (public release).

#### 1.2. Design Philosophy

- **Simplicity and Clarity**: Lightweight syntax, easy to read, and easy to learn.
- **High Performance**: Fast compilation and execution.

### 2. Strengths and Common Applications

#### 2.1. Strengths of Go

- **High Performance**: Speed close to C/C++ but easier to develop.
- **Fast Compilation**: Short compilation times increase development efficiency.

#### 2.2. Common Applications

- **Microservices Systems**: Docker, Kubernetes, Istio.
- **Cloud Infrastructure**: Google Cloud tools, AWS, Dropbox.

#### 2.3. Companies Using Go

- Google, Uber, Twitch, Dropbox, Netflix, Cloudflare, PayPal, Meta, Shopify, DigitalOcean...

### 3. Installing Go and Setting Up the Development Environment

#### 3.1. Installing Go

- **Windows**:

  - Download the installer from [golang.org/dl](https://golang.org/dl/).
  - Run the installer and follow the instructions.
  - Check environment variables `GOPATH` and `GOROOT`.

- **macOS**:

  - Use Homebrew: `brew install go`.
  - Or download the installer from [golang.org/dl](https://golang.org/dl/).
  - Check environment variables in `~/.bash_profile` or `~/.zshrc`.

- **Linux**:
  - Ubuntu/Debian: `sudo apt-get update && sudo apt-get install golang-go`.
  - CentOS/RHEL: `sudo yum install golang`.
  - Or download and install from [golang.org/dl](https://golang.org/dl/).

#### 3.2. Verification

```bash
go version
```

#### 3.3. Standard Go Directory Structure

- **GOPATH**: Path to your Go workspace.
  - `/bin`: Contains executable files.
  - `/pkg`: Contains compiled packages.
  - `/src`: Contains Go source code.

#### 3.4. Development Tools (IDE/Editor)

- **Visual Studio Code + Go extension**: Popular and full-featured.
- **GoLand by JetBrains**: A dedicated IDE for Go.

### 4. Structure of a Simple Go Program

#### 4.1. Hello World Program

```go
// hello.go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World! Welcome to Golang!")
}
```

#### 4.2. Go Modules - Modern Dependency Management

```bash
# Initialize a new module
go mod init example.com/hello

# Automatically add dependencies to go.mod
go mod tidy
```

### 5. Go Playground - Online Testing Tool

- **Address**: [play.golang.org](https://play.golang.org/)
- **Features**:
  - Run Go code on Google's servers.
  - Easily share code via URL.

## 🏆 Hands-on Exercise

### Exercise 1: Install Go and Check Version

**Requirement**: Install Go and verify the installed version.

### Exercise 2: Create and Run Hello World

**Requirement**: Create a `hello.go` file and run the program to print "Hello, World!".

1. Result: The terminal displays `Hello, World!`.

### Exercise 3: Extend Hello World

**Requirement**: Extend the program to display additional personal information.

### Exercise 4: Explore Go Playground

**Requirement**: Use the Go Playground to run a simple program and share the URL.

## 🔑 Key Points to Remember

1. **Go is a compiled language**: Go programs are compiled into machine code, not interpreted like Python or JavaScript, leading to faster execution speeds.

2. **Simplicity philosophy**: Go is designed to be simple and readable, avoiding complex features to help newcomers get started easily.

3. **Naming and Formatting Conventions**:
   - Go is very strict about code formatting; use `gofmt` to standardize.
   - Variable/function names starting with an uppercase letter are exported (visible) outside the package.

## 📝 Homework

1. **Self-Study**:

   - Research the development history of Go and compare it with other languages.

2. **Installation and Setup**:

   - Install Go on your personal computer.

3. **Basic Practice**:

   - Write a program that prints "Hello, [your name]!".

4. **Explore the Standard Library**:

   - Research 3 packages in the standard library: `fmt`, `time`, and `os`.

5. **Self-Challenge**:
   - Write a program that asks the user to input their name and age, then prints their birth year.
