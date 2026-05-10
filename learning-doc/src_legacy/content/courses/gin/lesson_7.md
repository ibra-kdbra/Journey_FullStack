# Lesson 7: Error Handling in Golang Gin Framework

## 🎯 Lesson Objectives

After this lesson, students will:

- Clearly understand basic error handling concepts in Golang and Gin.
- Grasp common patterns in API error handling with Gin.
- Know how to create and use custom error types for better error management.
- Know how to create a global error handling middleware.
- Build a consistent and easy-to-track error response format.
- Understand how to log errors and handle validation errors effectively.
- Apply knowledge to build Gin APIs that handle errors gracefully, professionally, and in a user-friendly manner.

## 📝 Detailed Content

### 1. **Concept of Error Handling in Golang**

- **What is an Error?**
  In Go, `error` is a standard interface defining the method:

  ```go
  type error interface {
      Error() string
  }
  ```

- **How Go Handles Errors:**
  Go does not use exceptions; instead, it returns errors directly from functions. For example:

  ```go
  result, err := SomeFunc()
  if err != nil {
      // Handle the error
  }
  ```

- **Why Careful Error Handling Matters:**
  To prevent crashes, provide clear error messages to the client, facilitate debugging, and protect the application from unexpected states.

### 2. **Error Handling in Gin Framework**

- Gin supports returning errors via HTTP status codes and JSON responses.
- Standardizing the error format returned by the API is crucial for client clarity.
- A global error handling middleware prevents code duplication across multiple handlers.

### 3. **Custom Error Types**

- Creating custom error types makes it easier to distinguish between different categories of errors (e.g., validation, system, not found).
- Example:

```go
package errors

import "fmt"

type APIError struct {
    Code    int    // HTTP status code
    Message string // User-friendly error message
}

func (e *APIError) Error() string {
    return fmt.Sprintf("code: %d, message: %s", e.Code, e.Message)
}

func NewAPIError(code int, message string) *APIError {
    return &APIError{Code: code, Message: message}
}
```

### 4. **Global Error Handling Middleware**

- The middleware intercepts all unhandled errors in handlers, returns a unified error response, and logs the issue.
- Example middleware:

```go
package middleware

import (
    "github.com/gin-gonic/gin"
    "log"
    "net/http"
    "your_project/internal/errors"
)

func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next() // Process handlers first

        errs := c.Errors
        if len(errs) > 0 {
            // Process the first error
            err := errs[0].Err
            var apiErr *errors.APIError
            if ok := errors.As(err, &apiErr); ok {
                // Custom APIError
                c.JSON(apiErr.Code, gin.H{"error": apiErr.Message})
                log.Printf("APIError: %v", apiErr)
            } else {
                // Unknown error
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
                log.Printf("Unknown error: %v", err)
            }
            c.Abort()
            return
        }
    }
}
```

### 5. **Handling Validation Errors in Gin**

- Gin supports binding with struct tags for data validation.
- Validation errors should be caught and returned clearly to the client.
- Example validation error handling:

```go
package handlers

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "your_project/internal/errors"
)

type UserRegisterRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

func RegisterUser(c *gin.Context) {
    var req UserRegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.Error(errors.NewAPIError(http.StatusBadRequest, "Invalid input data"))
        return
    }

    // Process successful registration
    c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}
```

### 6. **Logging Errors**

- Use the `log` package or external libraries like `logrus` to log errors to files or central systems.
- Logging is vital for debugging and monitoring production systems.

### 7. **Standard Error Response Format**

- A common JSON error structure:

```json
{
  "error": {
    "code": 400,
    "message": "Invalid email format",
    "details": {}
  }
}
```

- Helps clients process and display accurate error information.

## 🏆 Hands-on Exercise with Detailed Solution

### Task

**Build a User Registration API with the following requirements:**

- POST endpoint `/api/register`.
- Receive JSON body with `email` (required, valid format) and `password` (required, at least 6 characters).
- If data is invalid, return status 400 with the standard error format.
- Use a custom error type and global error handling middleware.
- Log errors when they occur.
- Apply a standard project structure:

```
│
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   └── user.go
│   ├── middleware/
│   │   └── error_handler.go
│   └── errors/
│       └── api_error.go
├── go.mod
└── go.sum
```

### Detailed Solution (Code)

#### 1. `internal/errors/api_error.go`

```go
package errors

import "fmt"

type APIError struct {
    Code    int
    Message string
}

func (e *APIError) Error() string {
    return fmt.Sprintf("code: %d, message: %s", e.Code, e.Message)
}

func NewAPIError(code int, message string) *APIError {
    return &APIError{Code: code, Message: message}
}
```

#### 2. `internal/middleware/error_handler.go`

```go
package middleware

import (
    "log"
    "net/http"
    "your_project/internal/errors"

    "github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()

        if len(c.Errors) > 0 {
            err := c.Errors[0].Err
            var apiErr *errors.APIError
            if ok := errors.As(err, &apiErr); ok {
                log.Printf("[API ERROR] %v", apiErr)
                c.JSON(apiErr.Code, gin.H{
                    "error": gin.H{
                        "code":    apiErr.Code,
                        "message": apiErr.Message,
                    },
                })
            } else {
                log.Printf("[UNKNOWN ERROR] %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{
                    "error": gin.H{
                        "code":    http.StatusInternalServerError,
                        "message": "Internal Server Error",
                    },
                })
            }
            c.Abort()
        }
    }
}
```

#### 3. `internal/handlers/user.go`

```go
package handlers

import (
    "net/http"
    "your_project/internal/errors"

    "github.com/gin-gonic/gin"
)

type UserRegisterRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

func RegisterUser(c *gin.Context) {
    var req UserRegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        // Return validation error
        c.Error(errors.NewAPIError(http.StatusBadRequest, "Invalid input data: email must be valid, password min 6 chars"))
        return
    }

    // Mock successful registration logic
    c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}
```

#### 4. `cmd/main.go`

```go
package main

import (
    "your_project/internal/handlers"
    "your_project/internal/middleware"

    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.New()

    // Standard logger and recovery middleware
    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    // Global error handling middleware
    r.Use(middleware.ErrorHandler())

    api := r.Group("/api")
    {
        api.POST("/register", handlers.RegisterUser)
    }

    r.Run(":8080")
}
```

### Solution Analysis

- **Custom error types** separate API errors and improve manageability.
- **ErrorHandler middleware** centralizes error processing, standardizes responses, and logs issues, preventing redundant error handling logic.
- **Validation errors** are caught in handlers and reported clearly.
- **Standard project structure** ensures clear separation of concerns.

## 🔑 Key Points to Remember

- In Go, **always check errors** after calling functions that can return them.
- In Gin, errors should be passed via `c.Error()` to be handled by a central middleware for cleaner code.
- Use **custom error types** to categorize errors, making handling and logging easier.
- Error response formats should be **consistent and client-friendly**.
- Error handling middleware should be registered after logger and recovery middleware.
- Validation is a critical input check layer that protects the API.
- Error logging accelerates bug detection and resolution in production.

## 📝 Homework

### Task

- Extend the user registration API (POST `/api/register`) by adding:

  - A `username` field (required, at least 3 characters).
  - Check for a duplicate mock username (e.g., `admin` is already taken).
  - Return a clear error if the username exists with a 409 status code.
  - Re-apply error handling, middleware, and logging techniques.
  - Maintain the project structure.

### Requirements

- Send a request with JSON body containing `username`, `email`, and `password`.
- If the username exists, return a standard JSON error with status 409.
- If data is invalid, return a 400 error.
- If successful, return a confirmation message.
