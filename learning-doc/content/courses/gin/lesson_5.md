# Lesson 5: Template Rendering in Golang Gin Framework

## 🎯 Lesson Objectives

After this lesson, students will:

- Clearly understand the concept of **Template Rendering** in the Gin Framework.
- Know how to **install and configure a standard template directory**.
- Master basic HTML template syntax in Go (Go's `html/template`).
- Know how to **pass data from a handler to a template** for dynamic display.
- Understand how to use **layout templates** to reuse common UI components.
- Know how to serve **static files** like CSS, JS, and images in a project.
- Be able to build a simple web page with a form and display results.
- Become familiar with organizing code according to standard project structure (`cmd/`, `internal/handlers`, `internal/models`).

## 📝 Detailed Content

### 1. Concept of Template Rendering

**Template rendering** is the process of taking a template file containing HTML with placeholders, then replacing these placeholders with actual data to create a dynamic HTML page sent to the browser.

- In Gin, template rendering is based on Go's standard `html/template` library.
- It helps separate data processing logic from the presentation layer.
- It supports building dynamic web pages such as lists, input forms, dashboards, etc.

### 2. How Gin Uses the Template Engine

- Gin supports loading multiple HTML templates from a specified directory.
- Templates can inherit from layouts and use `{{ define "name" }}` for reuse.
- Gin's `c.HTML()` method is used to render a template with passed data.

### 3. Directory Structure for Templates and Static Files

- By default, we can place templates in a directory like: `templates/`
- Static files (CSS, JS, images) are placed in a directory like: `assets/` or `static/`

Example directory structure:

```
project-root/
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   └── web.go
│   ├── models/
│   └── templates/
│       ├── layout.html
│       ├── index.html
│       └── form.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── go.mod
└── go.sum
```

### 4. Basic Template Syntax in Go

- `{{.}}` represents the entire data passed in.
- `{{.FieldName}}` accesses a specific field of a struct or map.
- Control statements: `{{if}}`, `{{range}}`, `{{with}}`.
- Defining sub-templates: `{{define "name"}} ... {{end}}`.
- Inheriting layouts via `{{ template "layout" .}}`.

### 5. Practical Example: Rendering a Simple Home Page

- Create a `layout.html` with common header/footer sections.
- Create an `index.html` that inherits the layout, displaying a title and a list.
- The `Index` handler in `handlers/web.go` returns this page with data.

### 6. Serving Static Files

- Use `router.Static("/assets", "./assets")` to serve CSS, JS, and images.
- In the template, use the path `/assets/css/style.css` to link the file.

### 7. Creating HTML Forms and Handling Form Data

- Create a form in the `form.html` template.
- The handler displays the form and receives POST requests to process data.
- Return the input results or a notification.

## 🏆 Hands-on Exercise with Detailed Solution

### Task

**Build a small web application with the following requirements:**

- Display a home page with a list of products (Product) including: ID, Name, Price.
- Use a template to render the home page with a common layout.
- Create a form page to add a new product with fields: Name, Price.
- Handle the POST form, adding the product to the list (stored temporarily in memory).
- After adding, redirect to the home page to see the new product.

### Detailed Solution

#### Directory Structure (as required)

```
project/
├── cmd/
│   └── main.go
├── internal/
│   ├── handlers/
│   │   └── product.go
│   ├── models/
│   │   └── product.go
│   └── templates/
│       ├── layout.html
│       ├── index.html
│       └── form.html
├── assets/
│   └── css/
│       └── style.css
├── go.mod
└── go.sum
```

#### 1. Model - internal/models/product.go

```go
package models

type Product struct {
    ID    int
    Name  string
    Price float64
}

// In-memory temporary data
var Products []Product

func AddProduct(p Product) {
    p.ID = len(Products) + 1
    Products = append(Products, p)
}
```

#### 2. Handlers - internal/handlers/product.go

```go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "your_module_name/internal/models"
)

// Displays the home page with the product list
func Index(c *gin.Context) {
    c.HTML(http.StatusOK, "index.html", gin.H{
        "title":    "Product List",
        "products": models.Products,
    })
}

// Displays the form to add a new product
func ShowAddForm(c *gin.Context) {
    c.HTML(http.StatusOK, "form.html", gin.H{
        "title": "Add New Product",
    })
}

// Handles the add product form submission
func AddProduct(c *gin.Context) {
    name := c.PostForm("name")
    priceStr := c.PostForm("price")

    price, err := strconv.ParseFloat(priceStr, 64)
    if err != nil || name == "" {
        c.HTML(http.StatusBadRequest, "form.html", gin.H{
            "title": "Add New Product",
            "error": "Product Name and Price must be valid",
        })
        return
    }

    models.AddProduct(models.Product{
        Name:  name,
        Price: price,
    })

    c.Redirect(http.StatusSeeOther, "/")
}
```

#### 3. Templates - internal/templates/

**layout.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{ .title }}</title>
    <link rel="stylesheet" href="/assets/css/style.css" />
  </head>
  <body>
    <header>
      <h1>Product Management App</h1>
      <nav>
        <a href="/">Home</a> |
        <a href="/products/new">Add Product</a>
      </nav>
    </header>

    <main>{{ block "content" . }}{{ end }}</main>

    <footer>
      <p>© 2025 Golang Gin Course</p>
    </footer>
  </body>
</html>
```

**index.html**

```html
{{ define "content" }}
<h2>Product List</h2>

{{ if .products }}
<table border="1" cellpadding="5">
  <tr>
    <th>ID</th>
    <th>Name</th>
    <th>Price</th>
  </tr>
  {{ range .products }}
  <tr>
    <td>{{ .ID }}</td>
    <td>{{ .Name }}</td>
    <td>{{ printf "%.2f" .Price }}</td>
  </tr>
  {{ end }}
</table>
{{ else }}
<p>No products available yet.</p>
{{ end }} {{ end }}
```

**form.html**

```html
{{ define "content" }}
<h2>Add New Product</h2>

{{ if .error }}
<p style="color: red;">{{ .error }}</p>
{{ end }}

<form action="/products" method="POST">
  <label for="name">Product Name:</label><br />
  <input type="text" id="name" name="name" /><br />

  <label for="price">Price:</label><br />
  <input type="text" id="price" name="price" /><br /><br />

  <button type="submit">Add Product</button>
</form>
{{ end }}
```

#### 4. Main - cmd/main.go

```go
package main

import (
    "github.com/gin-gonic/gin"
    "your_module_name/internal/handlers"
    "html/template"
    "net/http"
)

func main() {
    router := gin.Default()

    // Serve static files
    router.Static("/assets", "./assets")

    // Load templates with layouts
    router.LoadHTMLGlob("internal/templates/*.html")

    // Routes
    router.GET("/", handlers.Index)
    router.GET("/products/new", handlers.ShowAddForm)
    router.POST("/products", handlers.AddProduct)

    // Run server
    router.Run(":8080")
}
```

### Step-by-step Analysis

- **Model:** We use a slice to temporarily store the product list, focusing on template rendering.
- **Handler:** Handlers are divided by function (list display, form display, form processing).
- **Template:** A common layout is used to reuse header/footer. Sub-pages `index.html` and `form.html` define the `content` block to be injected into the layout.
- **Static files:** CSS is placed in `assets/css/` and served via `router.Static`.
- **Run server:** Templates and static files are configured correctly.

## 🔑 Key Points to Remember

- **Go's template syntax is quite different from other template engines;** pay attention to `{{}}` braces and data passing.
- Always **separate layouts from smaller templates** for easier maintenance.
- When passing data from a handler to a template, **ensure correct types and field names** for template access.
- `router.Static()` is essential for serving CSS, JS, and images; otherwise, they won't load.
- For forms, POST data must be handled carefully (basic validation before saving).
- Avoid storing long-term state in temporary slices in production; this is for educational purposes only.
- Use `router.LoadHTMLGlob()` or `LoadHTMLFiles()` to load templates.
- Use `c.Redirect()` to navigate after form processing to avoid re-submissions.

## 📝 Homework

### Task

**Develop additional features for the product management application:**

1. Create a product detail page at the path `/products/:id`.
2. The detail page should display product information, including ID, Name, and Price.
3. From the home page, each product should have a link to its detail page.
4. If a product doesn't exist, return a 404 error page with an appropriate message.
5. Use separate templates for the detail page and error page, still inheriting from the common layout.

### Requirements

- Apply knowledge of template rendering, data passing, and routing with parameters.
- Maintain a clear code structure and appropriate handler division.
- This exercise helps students practice using templates with dynamic data, route parameters, and simple error handling.
