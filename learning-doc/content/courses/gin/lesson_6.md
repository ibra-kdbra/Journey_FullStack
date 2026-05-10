# Lesson 6: Basic Middleware in Gin Framework

## 🎯 Lesson Objectives

After this lesson, students will:

- Clearly understand what **middleware** is, how it works, and its role in the Gin framework.
- Know how to use **built-in** middleware such as `Logger`, `Recovery`, and `CORS`.
- Be able to create **custom middleware** to handle specific requirements.
- Know how to apply middleware **globally**, to **route groups**, or to **individual routes**.
- Master how to test middleware to ensure it functions correctly.

## 📝 Detailed Content

### 1. What is Middleware?

**Middleware** refers to functions called between the time the server receives a request and before it sends a response to the client. Simply put, middleware acts as intermediary processing layers that help:

- Process, modify, or inspect request/response data.
- Perform common tasks like logging, authentication, and error handling.
- Create a sequential request processing pipeline.

**Example:** When a request comes in, the `Logger` middleware records request information in the log before forwarding it to the main handler.

### 2. How Middleware Works in Gin

Middleware in Gin are functions of the type:

```go
func(c *gin.Context)
```

In which:

- `c.Next()` calls the next middleware or the handler.
- If a middleware does not call `c.Next()`, the request stops at that middleware.

Explanation: Middleware forms a chain of request processing. When a request arrives, Gin calls each middleware in the order they were registered. A middleware can halt the request (e.g., if authentication fails) or continue running to the handler.

### 3. Popular Built-in Middleware in Gin

- `gin.Logger()`: Logs request information (method, path, status code, latency).
- `gin.Recovery()`: Catches panics, prevents server crashes, and returns a safe 500 error.
- `cors` middleware (usually uses an external library like `github.com/gin-contrib/cors`).

### 4. Creating Custom Middleware

You can write your own middleware to perform specific tasks like token authentication, processing time measurement, permission checks, etc.

**Example: Request Processing Time Logging Middleware**

```go
func TimingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next() // continue processing
        duration := time.Since(start)
        log.Printf("Request %s took %v", c.Request.URL.Path, duration)
    }
}
```

### 5. Applying Middleware in Gin

- **Globally (Whole Application):**

```go
r := gin.New()
r.Use(gin.Logger(), gin.Recovery(), TimingMiddleware())
```

- **Route Groups:**

```go
apiGroup := r.Group("/api")
apiGroup.Use(AuthMiddleware())
apiGroup.GET("/profile", ProfileHandler)
```

- **Individual Routes:**

```go
r.GET("/dashboard", AuthMiddleware(), DashboardHandler)
```

### 6. Other Common Middleware

- **Simple Authentication Middleware:** checks if the `Authorization` header exists; if not, returns a 401 error.

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }
        // Valid token check logic can be added here
        c.Next()
    }
}
```

## 🛠️ Project Example with Standard Structure

```
myginapp/
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   └── user_handler.go
│   ├── middleware/
│   │   └── auth.go
│   └── models/
│       └── user.go
├── go.mod
└── go.sum
```

### File: `cmd/main.go`

```go
package main

import (
    "log"
    "myginapp/internal/handlers"
    "myginapp/internal/middleware"
    "time"

    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.New()

    // Use built-in middleware
    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    // Use custom middleware
    r.Use(middleware.TimingMiddleware())

    // Route that doesn't require auth
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "pong"})
    })

    // Grouped routes that require auth
    authGroup := r.Group("/api")
    authGroup.Use(middleware.AuthMiddleware())
    authGroup.GET("/profile", handlers.GetProfile)

    if err := r.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}
```

### File: `internal/middleware/timing.go`

```go
package middleware

import (
    "log"
    "time"

    "github.com/gin-gonic/gin"
)

func TimingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        duration := time.Since(start)
        log.Printf("Request %s took %v", c.Request.URL.Path, duration)
    }
}
```

### File: `internal/middleware/auth.go`

```go
package middleware

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }
        // Add token validation check if needed
        c.Next()
    }
}
```

### File: `internal/handlers/user_handler.go`

```go
package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
    // Example returning a dummy profile
    c.JSON(http.StatusOK, gin.H{
        "user": "John Doe",
        "email": "john@example.com",
    })
}
```

## 🏆 Hands-on Exercise with Detailed Solution

### Task

Build a middleware named `RequestIDMiddleware` that:

- Generates a unique `request_id` (string) for each request (you can use a UUID or timestamp + random).
- Attaches this `request_id` to the **response header** with the key `"X-Request-ID"`.
- Attaches this `request_id` to the **Gin context** so that handlers can retrieve and use it.
- Create a `/hello` route using this middleware that returns a JSON response containing the `request_id`.

### Solution

**1. Install UUID library (if using UUIDs):**

```bash
go get github.com/google/uuid
```

**2. Middleware code `RequestIDMiddleware`**

```go
package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

const RequestIDKey = "RequestID"

func RequestIDMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Generate UUID
        requestID := uuid.New().String()

        // Attach to response header
        c.Writer.Header().Set("X-Request-ID", requestID)

        // Attach to Gin context
        c.Set(RequestIDKey, requestID)

        c.Next()
    }
}
```

**3. Using the middleware and retrieving the request_id in the handler**

```go
package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "myginapp/internal/middleware"
)

func HelloHandler(c *gin.Context) {
    requestID, exists := c.Get(middleware.RequestIDKey)
    if !exists {
        requestID = "unknown"
    }

    c.JSON(http.StatusOK, gin.H{
        "message":    "Hello, Middleware!",
        "request_id": requestID,
    })
}
```

**4. Register middleware and routes in `main.go`**

```go
package main

import (
    "log"
    "myginapp/internal/handlers"
    "myginapp/internal/middleware"

    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.New()
    r.Use(gin.Logger(), gin.Recovery())

    // Apply RequestIDMiddleware to the /hello route
    r.GET("/hello", middleware.RequestIDMiddleware(), handlers.HelloHandler)

    if err := r.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}
```

### Step-by-step Explanation

- The middleware generates a unique `request_id`.
- The middleware pushes the `request_id` into the HTTP header for the client.
- The middleware saves the `request_id` in the Gin context for use by handlers.
- The handler reads the `request_id` from the context and returns it in a JSON response.

## 🔑 Key Points to Remember

- Middleware in Gin is a chain of functions called sequentially in registration order.
- Call `c.Next()` in middleware to continue processing; if omitted, execution stops at that middleware.
- `c.Abort()` or `c.AbortWithStatus()` is used to halt the middleware/handler chain.
- Middleware can be applied globally (`r.Use()`), to route groups (`group.Use()`), or to individual routes.
- Middleware should be lightweight to avoid slowing down request processing.
- Be mindful of registration order, as it can affect processing logic.

## 📝 Homework

### Task

Write a `RateLimitMiddleware` that:

- Limits the number of requests to a maximum of **5 requests per minute** per client based on IP address.
- If the limit is exceeded, return an HTTP status of `429 Too Many Requests` and an appropriate error JSON.
- Apply this middleware to an `/api` route group.
- Create an `/api/data` route that returns JSON: `"data": "some secure data"`.

_Hint:_ You can use a `map[string]int` to store request counts and `time.Ticker` or `time.AfterFunc` to periodically reset them. No complex caching or Redis is required for this exercise.
