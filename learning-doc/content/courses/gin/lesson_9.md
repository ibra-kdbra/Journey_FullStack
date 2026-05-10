# Lesson 9: Database Integration with GORM

## 🎯 Lesson Objectives

After this lesson, students will:

- Clearly understand what GORM is and its role in Golang application development.
- Know how to set up database connections (MySQL/PostgreSQL) with GORM in a Gin project.
- Master how to define models and configure automatic migrations.
- Be able to perform basic CRUD operations using GORM.
- Apply knowledge to build a complete user management API with Gin and GORM following a standard architecture.

## 📝 Detailed Content

### 1. Introduction to GORM

**What is GORM?**

GORM is the most popular ORM (Object-Relational Mapping) in the Golang community. It helps us interact with databases by manipulating structs and methods directly, without writing much manual SQL.

**Benefits of GORM:**

- Automatic mapping of structs to database tables.
- Support for automatic schema migration.
- Easy CRUD operations.
- Support for relationships between tables.
- Query optimization, support for transactions, and hooks.

### 2. Installing GORM and Database Drivers

The example below uses MySQL (can be replaced with PostgreSQL, SQLite, etc.).

```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/mysql
```

### 3. Setting Up Database Connection

First, configure the DB connection in `internal/models/db.go` for easy reuse.

**Explanation:**
We will create an `InitDB()` function to open the connection, handle errors, configure migration, and return the DB object.

### 4. Defining Models (Structs)

Example User model:

- Auto-incrementing ID.
- Name, Email, Password.
- Timestamps: CreatedAt, UpdatedAt.

GORM supports automatic handling of these timestamp fields.

### 5. Automatic Schema Migration

GORM supports `AutoMigrate`, which helps create tables and modify schemas based on structs.

### 6. Basic CRUD Operations

- **Create**: Add a new record.
- **Read**: Retrieve records (by ID, all, or filtered).
- **Update**: Update existing records.
- **Delete**: Remove records.

### 7. Real-world Application: Building a User Management API with Gin + GORM

- API endpoints:
  - GET `/users` — list users
  - GET `/users/:id` — view user details
  - POST `/users` — create new user
  - PUT `/users/:id` — update user
  - DELETE `/users/:id` — delete user

## 🔥 Practical Example with Detailed Solution

### 1. Directory Structure

```
project-root/
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   └── user.go
│   ├── models/
│   │   ├── db.go
│   │   └── user.go
├── go.mod
└── go.sum
```

### 2. Detailed Code

#### internal/models/db.go

```go
package models

import (
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "log"
)

var DB *gorm.DB

func InitDB(dsn string) {
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    DB = db

    // Auto migration
    err = DB.AutoMigrate(&User{})
    if err != nil {
        log.Fatalf("AutoMigrate failed: %v", err)
    }
}
```

#### internal/models/user.go

```go
package models

import (
    "time"
)

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"type:varchar(100);not null" json:"name"`
    Email     string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"email"`
    Password  string    `gorm:"type:varchar(255);not null" json:"-"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

#### internal/handlers/user.go

```go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "your_module_name/internal/models"
)

// GET /users
func GetUsers(c *gin.Context) {
    var users []models.User
    result := models.DB.Find(&users)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, users)
}

// GET /users/:id
func GetUserByID(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var user models.User
    result := models.DB.First(&user, id)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    c.JSON(http.StatusOK, user)
}

// POST /users
func CreateUser(c *gin.Context) {
    var input struct {
        Name     string `json:"name" binding:"required"`
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required,min=6"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user := models.User{
        Name:     input.Name,
        Email:    input.Email,
        Password: input.Password, // Note: In reality, hash password before saving
    }

    if err := models.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, user)
}

// PUT /users/:id
func UpdateUser(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var user models.User
    if err := models.DB.First(&user, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    var input struct {
        Name     *string `json:"name"`
        Email    *string `json:"email"`
        Password *string `json:"password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if input.Name != nil {
        user.Name = *input.Name
    }
    if input.Email != nil {
        user.Email = *input.Email
    }
    if input.Password != nil {
        user.Password = *input.Password
    }

    if err := models.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, user)
}

// DELETE /users/:id
func DeleteUser(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    if err := models.DB.Delete(&models.User{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
```

#### cmd/main.go

```go
package main

import (
    "github.com/gin-gonic/gin"
    "your_module_name/internal/handlers"
    "your_module_name/internal/models"
    "log"
    "os"
)

func main() {
    // Example MySQL DSN: "user:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
    dsn := os.Getenv("MYSQL_DSN")
    if dsn == "" {
        log.Fatal("Please set MYSQL_DSN environment variable")
    }

    models.InitDB(dsn)

    r := gin.Default()

    userRoutes := r.Group("/users")
    {
        userRoutes.GET("", handlers.GetUsers)
        userRoutes.GET("/:id", handlers.GetUserByID)
        userRoutes.POST("", handlers.CreateUser)
        userRoutes.PUT("/:id", handlers.UpdateUser)
        userRoutes.DELETE("/:id", handlers.DeleteUser)
    }

    r.Run(":8080")
}
```

## 🏆 Hands-on Exercise with Solution

### Task

Build an API to manage products with the following fields:

- ID (Auto-increment)
- Name (string, non-empty)
- Price (float64, greater than 0)
- Description (string, can be empty)

Requirements:

- Implement the Product model with GORM.
- Set up automatic migration.
- Build CRUD APIs similar to the User API.
- Validate input data (name required, price > 0).
- Return clear error messages for invalid validation.

### Solution

1. Create `internal/models/product.go`

```go
package models

type Product struct {
    ID          uint    `gorm:"primaryKey" json:"id"`
    Name        string  `gorm:"type:varchar(255);not null" json:"name"`
    Price       float64 `gorm:"not null" json:"price"`
    Description string  `gorm:"type:text" json:"description,omitempty"`
}
```

1. Modify `internal/models/db.go` to add Product migration

```go
// ... InitDB section ...
err = DB.AutoMigrate(&User{}, &Product{})
```

1. Create `internal/handlers/product.go`

```go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "your_module_name/internal/models"
)

func GetProducts(c *gin.Context) {
    var products []models.Product
    if err := models.DB.Find(&products).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, products)
}

func GetProductByID(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }
    var product models.Product
    if err := models.DB.First(&product, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }
    c.JSON(http.StatusOK, product)
}

func CreateProduct(c *gin.Context) {
    var input struct {
        Name        string  `json:"name" binding:"required"`
        Price       float64 `json:"price" binding:"required,gt=0"`
        Description string  `json:"description"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    product := models.Product{
        Name:        input.Name,
        Price:       input.Price,
        Description: input.Description,
    }

    if err := models.DB.Create(&product).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, product)
}

func UpdateProduct(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    var product models.Product
    if err := models.DB.First(&product, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    var input struct {
        Name        *string  `json:"name"`
        Price       *float64 `json:"price" binding:"omitempty,gt=0"`
        Description *string  `json:"description"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if input.Name != nil {
        product.Name = *input.Name
    }
    if input.Price != nil {
        product.Price = *input.Price
    }
    if input.Description != nil {
        product.Description = *input.Description
    }

    if err := models.DB.Save(&product).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    if err := models.DB.Delete(&models.Product{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}
```

1. Modify `cmd/main.go` to add product routes:

```go
productRoutes := r.Group("/products")
{
    productRoutes.GET("", handlers.GetProducts)
    productRoutes.GET("/:id", handlers.GetProductByID)
    productRoutes.POST("", handlers.CreateProduct)
    productRoutes.PUT("/:id", handlers.UpdateProduct)
    productRoutes.DELETE("/:id", handlers.DeleteProduct)
}
```

## 🔑 Key Points to Remember

- **DSN (Data Source Name)** must be correct for a successful DB connection; pay attention to `parseTime=True` so GORM handles time correctly.
- `AutoMigrate` only helps with basic table creation and updates; do not rely on it entirely for complex schema changes.
- GORM automatically manages `ID`, `CreatedAt`, and `UpdatedAt` fields if correctly typed.
- Always validate input data before interacting with the database to prevent errors and ensure security.
- In practice, never store plain-text passwords; hash them before saving.
- Use pointers in input structs to distinguish whether a field was sent during an update.
- Handle errors thoroughly and return clear responses to help clients debug easily.

## 📝 Homework

### Task

Build an API to manage `Orders` with the following fields:

- ID (uint, auto-increment)
- UserID (uint, non-null)
- ProductID (uint, non-null)
- Quantity (int, greater than 0)
- TotalPrice (float64) — calculated as Quantity \* Product.Price

Requirements:

- Define the model and set up automatic migration.
- Build CRUD APIs with input validation.
- When creating or updating an Order, automatically recalculate `TotalPrice` based on `Product.Price`.
- Create an API `GET /orders/user/:userID` to retrieve a list of orders by user.
- Write code adhering to a clear, maintainable project structure.
