# Lesson 3: Handlers and Context

## 🎯 **Lesson Objectives**

- Clearly understand the concept of **Handler functions**.
- Learn how to use **`*gin.Context`**.
- Return responses in various formats.
- Utilize status codes and headers in responses.
- Be able to write a simple API using comprehensive handler logic.

## 📝 **Detailed Content**

### 1. What is a Handler Function?

**Concept:**
In Gin, a **handler** is a function responsible for processing an HTTP request. Gin uses the `func(*gin.Context)` type to define a handler.

```go
func handler(c *gin.Context) {
    // processing logic
}
```

### 2. Introducing `*gin.Context`

**Concept:**
`*gin.Context` is the **central structure** of Gin, representing the **context** of a request. It helps you:

- Access request information: params, query, body, headers, etc.
- Send responses back to the client: JSON, HTML, XML, etc.
- Control the flow of middleware and handlers.

**Common Methods:**

| Method              | Purpose                            |
| ------------------- | ---------------------------------- |
| `c.Param("name")`   | Get URL path parameters            |
| `c.Query("key")`    | Get URL query parameters           |
| `c.PostForm("key")` | Get form data from POST request    |
| `c.JSON(...)`       | Return JSON response               |
| `c.String(...)`     | Return plain text response         |
| `c.XML(...)`        | Return XML response                |
| `c.HTML(...)`       | Return HTML response from template |
| `c.Status(...)`     | Set HTTP status code               |
| `c.Header(...)`     | Set custom response headers        |

### 3. Returning Responses

#### 3.1 Returning JSON

```go
c.JSON(200, gin.H{
    "message": "Success",
    "data":    []string{"apple", "banana", "orange"},
})
```

#### 3.2 Returning HTML

```go
c.HTML(200, "index.html", gin.H{
    "title": "Home Page",
})
```

#### 3.3 Returning XML

```go
c.XML(200, gin.H{"status": "OK", "user": "John Doe"})
```

#### 3.4 Returning String (Plain Text)

```go
c.String(200, "Welcome to the Gin course!")
```

### 4. Status Codes and Headers

#### 4.1 Returning a Status Code

```go
c.JSON(http.StatusBadRequest, gin.H{
    "error": "Invalid parameters",
})
```

#### 4.2 Adding a Custom Header

```go
c.Header("X-App-Version", "1.0.0")
c.JSON(200, gin.H{"message": "Header has been set"})
```

## 🏆 **Hands-on Exercise**

### **Task:**

Write a student information management API:

- `GET /students`: Returns a list of students.
- `GET /students/:id`: Returns a student by their `id`.
- `POST /students`: Adds a new student (receives JSON `{ "id": 3, "name": "Alice", "age": 22 }`).

## 🔑 **Key Points to Remember**

| Concept        | Key Takeaway                                        |
| -------------- | --------------------------------------------------- |
| `*gin.Context` | The heart of every request                          |
| Handler        | Always has the signature `func(c *gin.Context)`     |
| JSON/XML/HTML  | Each response type has its own method               |
| Status code    | Use `http.Status...` constants for clarity          |
| Headers        | Call `c.Header(key, value)` before sending response |

## 📝 **Homework**

### **Task:**

Write a mini book management API:

- `GET /books`: Returns a list of books.
- `POST /books`: Adds a new book from JSON `{ "id": 1, "title": "Clean Code", "author": "Robert C. Martin" }`.
- `GET /books/:id`: Retrieves book information by `id`.

**Hints:**

- Create a `Book` struct.
- Use a slice to store the book list.
- Use `c.Param()` and `c.ShouldBindJSON()`.
