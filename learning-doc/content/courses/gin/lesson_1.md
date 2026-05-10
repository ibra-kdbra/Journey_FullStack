# Lesson 1: Introduction to Gin Framework and Project Setup

## 🎯 Lesson Objectives

1. Understand what Gin Framework is and its advantages for API development with Go.
2. Grasp the differences between Gin and other Go frameworks.
3. Learn how to structure a modern API project according to Domain-Driven Design (DDD).

## 📝 Detailed Content

### 1. Introduction to Gin Framework

#### 1.1 What is Gin?

Gin is a web framework written in Go (Golang), designed with the goal of creating high-performance APIs and maintainable code.

```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()

    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "pong",
        })
    })

    r.Run(":8080")
}
```

#### 1.2 Advantages of the Gin Framework

1. **High Performance**: Optimized for speed and minimal memory allocation.
2. **Flexible Middleware**: Easy to plug in custom logic for requests and responses.
3. **Powerful Routing**: Supports grouping, parameters, and wildcards.
4. **Binding and Validation**: Easily map request data to Go structs with validation.
5. **Integrated Error Handling**: Standardized ways to manage errors.
6. **JSON Rendering**: Fast and simple JSON response generation.
7. **Large Community and Support**: Extensive ecosystem and documentation.

### 2. Comparing Gin with Other Go Frameworks

#### 2.1 Gin vs. Standard Library (net/http)

**Standard Library (net/http)**:

- Advantages: No extra dependencies, simple, good performance.
- Disadvantages: Lacks advanced features, verbose code for complex tasks.

**Gin**:

- Advantages: Simple API, high performance, many built-in features.
- Disadvantages: Adds an external dependency to the project.

#### 2.2 Gin vs. Echo

**Echo**:

- Performance comparable to Gin.
- Slightly different API style, but also very intuitive.

#### 2.3 Gin vs. Fiber

**Fiber**:

- Inspired by Express.js from Node.js.
- Built on the `fasthttp` library instead of `net/http`.
- Good performance and friendly API, but less compatible with standard Go libraries.

### 3. Modern API Project Structure

#### 3.1 Domain-Driven Design (DDD) in Go

Domain-Driven Design is a software design approach focused on understanding and modeling the business domain of the application.

#### 3.2 Directory Structure according to DDD

```
vievlog-gin/
├── api/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── validators/
│
├── config/
│   ├── config.go
│   ├── database.go
│   └── server.go
│
├── internal/
│   ├── domain/
│   └── utils/
│
├── pkg/
│   └── jwt/
│
├── storage/
│   ├── cache/
│   ├── database/
│   └── repositories/
│
├── tests/
│   ├── integration/
│   └── unit/
│
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
├── README.md
└── main.go
```

#### 3.3 Advantages of This Structure

- **Clear separation of concerns**: Each layer has a specific responsibility.
- **Reduced dependency between modules**: Easier to swap components.
- **Easily scalable and maintainable**: Simple to add new features.
- **Adheres to SOLID principles**: Promotes clean and robust code.

### 4. Setting Up the Development Environment

#### 4.1 Install Go

Download and install Go from the official website.

#### 4.2 Install Git

Ensure Git is installed for version control.

#### 4.3 Install an IDE/Editor

VS Code or GoLand are recommended.

### 5. Initializing the Project with Go Modules

#### 5.1 Create Project Directory

```bash
mkdir vievlog-gin
cd vievlog-gin
```

#### 5.2 Initialize Go module

```bash
go mod init github.com/khieu-dv/vievlog-gin
```

This command creates a `go.mod` file in the project directory.

#### 5.3 Install Gin framework

```bash
go get -u github.com/gin-gonic/gin
```

### 6. Creating the Project Directory Structure

Follow the DDD structure outlined in section 3.2.

### 7. Writing the First API Endpoint: "Hello World"

#### 7.1 Create main.go file

#### 7.2 Create basic routes structure

### 8. Running and Testing the First API

#### 8.1 Run the Application

#### 8.2 Test the API with cURL

## 🔑 Key Points to Remember

1. **Project structure is a crucial foundation**: Following a good structure from the start makes the project easier to maintain and scale.
2. **Go Modules**: Always use Go Modules for dependency management.
3. **Gin Middleware**: `gin.Default()` integrates two important middlewares by default: Logger and Recovery.
4. **API Versioning**: Always design APIs with versioning (e.g., `/api/v1/...`) to allow for future upgrades without breaking existing clients.
5. **Environment Configuration**: In real projects, use environment variables and `.env` files instead of hardcoding values like the server port.
