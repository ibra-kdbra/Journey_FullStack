# Lesson 5: Using Other HTTP Methods (PUT, DELETE)

---

## 🎯 Lesson Objectives

After completing this lesson, students will be able to:

- Understand common HTTP methods besides GET and POST, specifically PUT and DELETE.
- Distinguish between POST, PUT, and PATCH methods in a REST API.
- Know how to declare and use FastAPI routes for PUT and DELETE methods.
- Perform data update and deletion operations via API with FastAPI.
- Grasp best practices when handling PUT and DELETE requests.

---

## 📝 Detailed Content

### 1. Overview of HTTP Methods

In a RESTful API, HTTP methods represent different actions that a client wants to perform on a resource:

- **GET**: Retrieve data
- **POST**: Create a new resource
- **PUT**: Update a resource (replaces the entire resource)
- **PATCH**: Partially update a resource
- **DELETE**: Delete a resource

> **Note:** This lesson focuses on PUT and DELETE; POST and GET methods were covered in previous lessons.

---

### 2. Concepts of PUT and DELETE

#### PUT

- Used to **replace the entire resource** at a specific URL.
- If the resource does not exist, some APIs may create a new one.
- PUT typically requires a full payload representing the resource.
- Example: Updating product information (name, price, description).

#### DELETE

- Used to **delete a resource** at a specific URL.
- After deletion, the resource no longer exists.

---

### 3. Comparing POST, PUT, and PATCH

| Method | Purpose                | Payload      | Impact                        |
| ------ | ---------------------- | ------------ | ----------------------------- |
| POST   | Create a new resource  | New data     | Adds a new resource           |
| PUT    | Replace or full update | Full data    | Replaces the current resource |
| PATCH  | Partial update         | Partial data | Only updates sent fields      |

---

### 4. How to Define PUT and DELETE Routes in FastAPI

FastAPI provides specific decorators for each HTTP method:

- `@app.put("/items/{item_id}")`
- `@app.delete("/items/{item_id}")`

We will combine these with Pydantic data models to receive JSON data and process it.

---

### 5. Practical Illustration

Suppose we have a dictionary in memory to temporarily store products (items).

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Pydantic model for an item
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float

# Temporary data (mock database)
items = {
    1: {"name": "Apple", "description": "Fresh red apple", "price": 0.5},
    2: {"name": "Banana", "description": "Yellow banana", "price": 0.3},
}

# PUT: Fully update an item by ID
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    items[item_id] = item.dict()
    return {"message": "Item updated", "item": items[item_id]}

# DELETE: Delete an item by ID
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    del items[item_id]
    return {"message": "Item deleted"}
```

---

### 6. Code Explanation

- The **`Item` model** is used to validate data when sent by the client.
- **PUT `/items/{item_id}`**:
  - Checks if the item exists; if not, returns a 404 error.
  - Updates (replaces) all item information with new data.
- **DELETE `/items/{item_id}`**:
  - Checks for existence.
  - Deletes the item from the dictionary.

---

### 7. Key Considerations

- PUT should be used when the client sends full resource data for updating.
- If you want to update only a small part (e.g., just the name), you should use PATCH (covered in a later lesson).
- DELETE typically does not require a body; it only needs to identify the resource via the URL.
- Return appropriate HTTP status codes: 200 or 204 for success, 404 when not found.

---

## 🏆 Hands-on Exercise with Solution

### Task

Create an API to manage a user list with the following operations:

- PUT `/users/{user_id}`: Fully update user information by `user_id`.
- DELETE `/users/{user_id}`: Delete a user by `user_id`.

User information includes:

- `username` (string)
- `email` (string)
- `age` (int)

Use a temporary dictionary to store users and return a 404 error if the user does not exist.

---

### Detailed Solution

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

app = FastAPI()

class User(BaseModel):
    username: str
    email: EmailStr
    age: int

# Temporary mock database
users = {
    1: {"username": "john", "email": "john@example.com", "age": 30},
    2: {"username": "anna", "email": "anna@example.com", "age": 25},
}

@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    users[user_id] = user.dict()
    return {"message": "User updated", "user": users[user_id]}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    del users[user_id]
    return {"message": "User deleted"}
```

#### Step-by-step Analysis

- Create the `User` model with 3 fields, where `email` is validated as a standard email format using `EmailStr`.
- Initialize the `users` dictionary for temporary data storage.
- Write a PUT route that checks for user existence and updates data from the request body.
- Write a DELETE route that removes the user from the dictionary.
- Handle 404 errors when a user is not found to ensure a standard API response.

---

## 🔑 Key Points to Remember

- **PUT** is generally used to replace an entire resource, so all fields should be sent during an update.
- **DELETE** only needs the resource identifier in the URL for deletion; it does not require a body.
- Always check for resource existence before attempting an update or deletion to avoid unexpected errors.
- Return clear HTTP status codes and error messages to help the client handle responses easily.
- Avoid updating via PUT with incomplete data, as it may overwrite old data.
- For partial resource updates, the **PATCH** method is a more appropriate choice (different from PUT).

---

## 📝 Homework

### Task

Build an API to manage a product list with the following routes:

- PUT `/products/{product_id}`: Fully update product information including `name` (string), `price` (float), and `description` (string, optional).
- DELETE `/products/{product_id}`: Delete a product by `product_id`.

Use a dictionary to store temporary data. Include checks to return a 404 error when a product is not found. Provide clear feedback to the client.
