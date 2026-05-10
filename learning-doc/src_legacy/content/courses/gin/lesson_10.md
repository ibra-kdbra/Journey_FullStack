# Lesson 10: Advanced GORM Operations

## 🎯 Lesson Objectives

After this lesson, students will:

- Understand and apply different types of **Associations** in GORM: One-to-One, One-to-Many, Many-to-Many.
- Perform complex queries with **joins** and **preloading** to optimize performance.
- Use **transactions** to ensure data consistency in multi-step operations.
- Leverage **hooks (callbacks)** to automatically process logic before or after database operations.
- Build a simple Blog API model where Users and Posts have a One-to-Many relationship.

## 📝 Detailed Content

### 1. **Associations in GORM**

**Concept:**
Associations are how GORM manages relationships between database tables, for example:

- **One-to-One:** One record in table A corresponds to exactly one record in table B.
- **One-to-Many:** One record in table A can have multiple associated records in table B.
- **Many-to-Many:** Multiple records in table A can be linked to multiple records in table B through a join table.

### 2. **Modeling Associations**

GORM automatically sets up relationships based on struct tags and field names.

Example:

- `User` has many `Posts` (One-to-Many).
- `Post` belongs to `User`.

GORM automatically handles the foreign key (`UserID`) and the association.

### 3. **Query Optimization: Preloading & Joins**

- **Preload:** Loads association data (eager loading) to avoid the N+1 query problem.
- **Joins:** Uses standard SQL joins for more complex queries across multiple tables.

### 4. **Transactions**

- Groups multiple database operations into a single atomic block.
- If an error occurs, all operations are rolled back to maintain data consistency.

### 5. **Hooks (Callbacks)**

- Functions automatically called before or after data operations (Create, Update, Delete, etc.).
- Used for validation, logging, or data normalization.

## Project Illustration: Gin + GORM Structure

```
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   └── blog.go
│   ├── models/
│   │   └── blog.go
│   └── db/
│       └── db.go
├── go.mod
└── go.sum
```

### 1. **Data Models (models/blog.go)**

```go
package models

import (
    "gorm.io/gorm"
    "time"
)

type User struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    Name      string         `json:"name"`
    Email     string         `gorm:"uniqueIndex" json:"email"`
    Posts     []Post         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"posts"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
}

type Post struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    Title     string         `json:"title"`
    Content   string         `json:"content"`
    UserID    uint           `json:"user_id"` // foreign key linking to User
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
}

// Hook: Automatically check post title before creation
func (p *Post) BeforeCreate(tx *gorm.DB) (err error) {
    if len(p.Title) < 5 {
        return tx.AddError(gorm.ErrInvalidData) // or return a custom error
    }
    return nil
}
```

### 2. **Database Configuration (internal/db/db.go)**

```go
package db

import (
    "log"
    "gorm.io/driver/sqlite" // Or mysql/postgres
    "gorm.io/gorm"

    "your_module_path/internal/models"
)

var DB *gorm.DB

func ConnectDatabase() {
    var err error
    DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database: ", err)
    }

    // Auto migrate
    err = DB.AutoMigrate(&models.User{}, &models.Post{})
    if err != nil {
        log.Fatal("AutoMigrate failed: ", err)
    }
}
```

### 3. **Example Handler: CRUD with Associations (internal/handlers/blog.go)**

```go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "your_module_path/internal/db"
    "your_module_path/internal/models"
)

// Create User with Posts (using a transaction)
func CreateUserWithPosts(c *gin.Context) {
    var input struct {
        Name  string           `json:"name" binding:"required"`
        Email string           `json:"email" binding:"required,email"`
        Posts []models.Post    `json:"posts"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    err := db.DB.Transaction(func(tx *gorm.DB) error {
        user := models.User{
            Name:  input.Name,
            Email: input.Email,
            Posts: input.Posts,
        }
        if err := tx.Create(&user).Error; err != nil {
            return err
        }
        return nil
    })

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "User and posts created successfully"})
}

// Get User with Posts (preloading)
func GetUserWithPosts(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user id"})
        return
    }

    var user models.User
    if err := db.DB.Preload("Posts").First(&user, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        }
        return
    }

    c.JSON(http.StatusOK, user)
}
```

### 4. **main.go**

```go
package main

import (
    "your_module_path/internal/db"
    "your_module_path/internal/handlers"

    "github.com/gin-gonic/gin"
)

func main() {
    db.ConnectDatabase()

    r := gin.Default()

    v1 := r.Group("/api/v1")
    {
        v1.POST("/users", handlers.CreateUserWithPosts)
        v1.GET("/users/:id", handlers.GetUserWithPosts)
    }

    r.Run(":8080")
}
```

## 🏆 Hands-on Exercise with Detailed Solution

### Task

**Build a Blog Management API with the following requirements:**

- Models `User` and `Post` have a One-to-Many relationship (1 user has many posts).
- Create an endpoint to create a new user along with a list of posts (use a transaction for consistency).
- Create an endpoint to retrieve user info along with their list of posts (use Preload).
- Implement a hook to validate post titles before creation (title must be >= 5 characters).
- Handle errors and return appropriate responses.

### Solution Analysis

- **Step 1:** Create User and Post models with explicit relationships.
- **Step 2:** Define the `BeforeCreate` hook for the `Post` model.
- **Step 3:** Write the `CreateUserWithPosts` handler using `db.DB.Transaction`.
- **Step 4:** Write the `GetUserWithPosts` handler using `Preload("Posts")`.
- **Step 5:** Add JSON input validation and error handling for client responses.
- **Step 6:** Test the API using Postman or curl.

## 🔑 Key Points to Remember

- **Association Types:**
  GORM automatically recognizes relationships based on struct field names and foreign keys (e.g., `UserID`). Ensure naming conventions are followed to avoid errors.

- **Preload vs. Joins:**
  `Preload` is ideal for simple relationship loading. `Joins` should be used when complex filtering or multi-table calculations are required.

- **Transactions:**
  Use transactions to ensure atomicity; always rollback if an error occurs during a multi-step operation.

- **Hooks:**
  Hooks ensure data validity before operations but keep them simple to maintain debuggability.

- **Error Handling:**
  Always check for errors during database operations and return clear responses to help the client.

## 📝 Homework

### Task

**Extend the Blog API:**

- Add a Many-to-Many relationship between `Post` and `Tag` (each post can have many tags, and each tag can belong to many posts).
- Create a `Tag` model with a `Name` field.
- Write an endpoint to create a new post along with tags (create the tag if it doesn't exist).
- Write an endpoint to retrieve a post along with its list of tags.
- Ensure tags are preloaded when fetching a post.
- Validate that tag names cannot be empty.

### Requirements

- Apply knowledge of Many-to-Many associations in GORM.
- Use transactions when creating posts and related tags.
- Follow the established project architecture.
- Include clear comments and explanations in your code.
