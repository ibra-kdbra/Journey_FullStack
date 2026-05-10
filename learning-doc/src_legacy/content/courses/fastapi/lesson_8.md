# Lesson 8: Response Model and Custom Responses

---

## 🎯 Lesson Objectives

After this lesson, students will be able to:

- Understand the concept of a **Response Model** and its role in data security and API structure.
- Use Pydantic to filter and transform data before returning it to the client.
- Customize **HTTP Status Codes** to follow RESTful API standards.
- Return custom responses like JSON, HTML, or plain text.
- Practice using `response_model` in FastAPI routes to optimize and secure returned data.

---

## 📝 Detailed Content

### 1. What is a Response Model?

- A **Response Model** is a Pydantic model used to define the structure of the data returned by the API.
- It helps:
  - **Filter data**: Exclude sensitive information (like passwords) or internal data.
  - **Validate output**: Ensure the API always returns data in the correct format.
  - **Auto-document**: Help FastAPI generate accurate API documentation (OpenAPI).

### 2. Using `response_model` in FastAPI

To use a response model, declare it in the route decorator using the `response_model` parameter.

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from typing import List

app = FastAPI()

class UserIn(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserOut(BaseModel):
    username: str
    email: EmailStr

@app.post("/user/", response_model=UserOut)
async def create_user(user: UserIn):
    return user
```

**Explanation:**

- The client sends `UserIn` (including `password`).
- The API returns `UserOut` (only `username` and `email`).
- FastAPI automatically filters out the `password` field.

### 3. Customizing HTTP Status Codes

By default, FastAPI returns `200 OK`. You can change this using `status_code`.

```python
from fastapi import status

@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}
```

Common status codes:

- `200 OK`: Success.
- `201 Created`: Resource created successfully.
- `204 No Content`: Successful request, no content returned (often used for DELETE).
- `404 Not Found`: Resource not found.

### 4. Returning Various Response Types

You can return different types of responses using FastAPI's built-in classes.

```python
from fastapi.responses import JSONResponse, HTMLResponse, PlainTextResponse

@app.get("/html/", response_class=HTMLResponse)
async def get_html():
    return "<h1>Hello, HTML!</h1>"

@app.get("/custom-json/")
async def get_custom():
    return JSONResponse(content={"message": "Custom JSON"}, status_code=202)
```

---

## 🏆 Hands-on Exercise with Solution

### Task

Create an API for product management with:

1. A POST route `/products/` to create a product. It should receive `name`, `description`, and `price`. It must return the product info but **exclude** the internal `id` from the response. It should return status code `201 Created`.
2. A GET route `/products/{id}` that returns product details.

### Solution

```python
from fastapi import FastAPI, status, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Data models
class ProductIn(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ProductOut(BaseModel):
    name: str
    price: float

# Fake database
db = {}

@app.post("/products/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductIn):
    product_id = len(db) + 1
    db[product_id] = product.dict()
    return product

@app.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int):
    if product_id not in db:
        raise HTTPException(status_code=404, detail="Product not found")
    return db[product_id]
```

---

## 🔑 Key Points to Remember

- Use `response_model` to filter sensitive data and define the output structure.
- Declare the appropriate `status_code` for each action (e.g., 201 for POST).
- Models used for output can be simpler than models used for input.
- Use `status` from `fastapi` to avoid hardcoding status code numbers.
- Response models also help improve the performance of JSON serialization in FastAPI.

---

## 📝 Homework

### Task

1. Build a `UserProfile` API.
2. The input model should include `username`, `email`, `full_name`, `bio`, and `private_notes`.
3. The response model should **only** include `username` and `full_name`.
4. Create a POST route to "save" the profile and a GET route to "retrieve" it.
5. Ensure the POST route returns status code `201`.
