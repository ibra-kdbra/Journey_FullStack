# Lesson 4: Request Binding and Validation

## 🎯 **Lesson Objectives**

- Clearly understand what **request binding** is.
- Know how to use `c.ShouldBindJSON()`, `c.ShouldBindQuery()`, and `c.ShouldBind()`.
- Apply **struct tags** to perform automatic **validation**.
- Create simple **custom validation rules**.
- Handle and return validation errors professionally.

## 📝 **Detailed Content**

### 📌 **1. What is Request Binding?**

**Request Binding** is the process of mapping data from an HTTP request (body, form, query, path) into a struct in Go.

### 📌 **2. Common Binding Methods in Gin**

| Binding Type                 | Method                    |
| ---------------------------- | ------------------------- |
| JSON                         | `c.ShouldBindJSON(&obj)`  |
| Form (x-www-form-urlencoded) | `c.ShouldBind(&obj)`      |
| Query                        | `c.ShouldBindQuery(&obj)` |
| URI Params                   | `c.ShouldBindUri(&obj)`   |

#### 🔹 **Example: JSON Binding**

```go
type RegisterRequest struct {
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
}
```

### 📌 **3. What is Validation and Why is it Necessary?**

**Validation** is the process of checking input data to ensure it is correctly formatted and meets the system's requirements.

#### 🔹 **Common Validation Tags:**

- `required` – Field must be present and non-zero.
- `email` – Must be a valid email format.
- `min`, `max`, `len` – Constraints for length or value.
- `gte`, `lte` – Comparison constraints (Greater Than or Equal, Less Than or Equal).
- `binding:"required,email"` – Combined tags.

## 🏆 **Hands-on Exercise**

### 📌 Task

Create a `POST /contact` API for users to submit feedback with the following information:

- `name`: mandatory, at least 2 characters.
- `email`: mandatory, valid email format.
- `message`: mandatory, at least 10 characters.

After the user submits feedback, store the information and provide a `GET /contacts` API to retrieve the list of feedback.

## 🔑 **Key Points to Remember**

| Note                                          | Explanation                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `binding:"required"` won't bind `""`          | An empty string is still considered missing data.                      |
| `ShouldBindJSON()` requires valid JSON format | If the request format is incorrect, it will fail immediately.          |
| Validation failure returns all errors         | You can use `validator.ValidationErrors` to process individual errors. |
| Struct tags don't support automatic trimming  | You must manually trim whitespace if needed.                           |
| Use both JSON and Binding tags correctly      | `json:"email" binding:"required,email"` avoids mapping issues.         |

## 📝 **Homework**

### 📌 Task

Build a `POST /feedback` API for users to submit product reviews with the following requirements:

- `username`: mandatory, between 3-20 characters.
- `product_id`: mandatory, positive integer.
- `comment`: mandatory, at least 15 characters.

After submitting a review, store the data and provide a `GET /feedbacks` API to list all reviews.

**Hints:**

- Create a `models/feedback.go` file.
- Handle binding and validation errors in `handlers/feedback_handler.go`.
- Integrate routes in `cmd/main.go`.
