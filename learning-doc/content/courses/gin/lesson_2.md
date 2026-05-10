# Lesson 2: Project Structure and Basic Routing

## 🎯 Lesson Objectives

- **Design project structure** according to standard Go project layouts and best practices.
- **Understand Routing** and how Gin handles HTTP requests.
- **Proficiently use basic HTTP methods** (GET, POST, PUT, DELETE).

## 📝 Detailed Content

### 1. Standard Project Structure

#### 1.1 Why a Good Project Structure Matters?

A well-structured project helps with:

- **Scalability and Maintainability**
- **Effective Collaboration**
- **Separation of concerns**
- **Ease of Testing**

#### 1.2 Standard Go Project Layout

```
bookstore-api/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   ├── models/
│   ├── middleware/
│   └── config/
├── pkg/
│   └── database/
├── web/
│   ├── static/
│   └── templates/
├── docs/
├── scripts/
├── go.mod
├── go.sum
└── README.md
```

### 2. The Concept of Routing in Gin

#### 2.1 What is Routing?

**Routing** is the process of determining how an application responds to a client request to a specific endpoint. An endpoint is defined by:

- **HTTP Method** (GET, POST, PUT, DELETE...)
- **URL Path** (/users, /products/:id...)

#### 2.2 How Gin Handles Routing

Gin uses the **Radix Tree** algorithm to match routes efficiently:

```go
router := gin.Default()

// Static route
router.GET("/users", getUsersHandler)

// Dynamic route with parameter
router.GET("/users/:id", getUserByIDHandler)
```

### 3. HTTP Methods and RESTful APIs

#### 3.1 Basic HTTP Methods

| Method     | Purpose                | Example           |
| ---------- | ---------------------- | ----------------- |
| **GET**    | Retrieve data          | `GET /users`      |
| **POST**   | Create new             | `POST /users`     |
| **PUT**    | Update entire resource | `PUT /users/1`    |
| **PATCH**  | Partial update         | `PATCH /users/1`  |
| **DELETE** | Remove resource        | `DELETE /users/1` |

#### 3.2 RESTful API Design Principles

```go
// ✅ Good RESTful design
GET    /books
GET    /books/123
POST   /books
PUT    /books/123
DELETE /books/123

// ❌ Poor design
GET    /getBooks
POST   /createBook
GET    /getBookById/123
```

### 4. Route Parameters and Query Parameters

#### 4.1 Route Parameters (Path Parameters)

Route parameters are used to identify a specific resource.

#### 4.2 Query Parameters

Query parameters are used for filtering, sorting, and pagination.

#### 4.3 Parameter Validation

```go
router.GET("/users/:id", func(c *gin.Context) {
    idStr := c.Param("id")

    // Validate parameter
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid user ID"})
        return
    }

    if id <= 0 {
        c.JSON(400, gin.H{"error": "User ID must be positive"})
        return
    }

    // Process with valid ID...
})
```

### 5. Route Groups

Route groups help organize code and apply middleware to a group of routes:

```go
v1 := router.Group("/api/v1")
{
    v1.GET("/users", getUsersHandler)
    v1.POST("/users", createUserHandler)
}

v2 := router.Group("/api/v2")
{
    v2.GET("/users", getUsersV2Handler)
}

admin := router.Group("/admin")
admin.Use(AuthMiddleware())
{
    admin.GET("/users", adminGetUsersHandler)
    admin.DELETE("/users/:id", adminDeleteUserHandler)
}
```

## 🏆 Hands-on Exercise

### Task: Build a Simple Book Management API

Create a basic API to manage a list of books with 4 functionalities:

1. **Get all books** (GET)
2. **Get book by ID** (GET with parameter)
3. **Add a new book** (POST)
4. **Delete a book** (DELETE)

## 🔑 Key Points to Remember

### 1. **Route Parameters vs. Query Parameters**

- **Route Parameters** (`/users/:id`): To identify specific resources.
- **Query Parameters** (`/users?age=25`): For filtering, sorting, and pagination.

### 2. **Important HTTP Status Codes**

- **200 OK**: Success
- **201 Created**: Resource created
- **400 Bad Request**: Client error
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side error

## 📝 Homework

### Exercise 1: Phone Contacts Management API

Create a simple API to manage a contact list with a `Contact` struct:

```go
type Contact struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Phone string `json:"phone"`
}
```

**Requirements:**

1. `GET /contacts` - Retrieve all contacts.
2. `GET /contacts/:id` - Retrieve a contact by ID.
3. `POST /contacts` - Add a new contact.
4. `DELETE /contacts/:id` - Delete a contact.

**Validation:**

- Name cannot be empty.
- Phone must have at least 10 digits.
