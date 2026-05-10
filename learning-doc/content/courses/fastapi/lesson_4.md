# Lesson 4: Request Body and Basic Data Types

---

## 🎯 Lesson Objectives

After this lesson, students will be able to:

- Clearly understand the concept of a **Request Body** in HTTP and how to receive data sent from a client via FastAPI.
- Know how to declare and use **Pydantic BaseModel** to define data types for the request body.
- Practice creating basic data models with common types like `str`, `int`, `float`, and `Optional`.
- Write API endpoints that receive JSON data, automatically validate it, and return the corresponding results.
- Understand how FastAPI powerfully integrates Pydantic to handle input data simply and accurately.

---

## 📝 Detailed Content

### 1. What is a Request Body?

- A **Request Body** is the data sent by a client to a server in an HTTP request, typically used with methods like POST, PUT, and PATCH.
- Usually, data is sent in formats like JSON, XML, or others.
- In modern APIs, JSON is the most common format for transmitting data from a client to a server.

> **Example:** When you submit registration information (name, email, password), that data is contained within the Request Body.

---

### 2. Why Define Data Types for the Request Body?

- To ensure the server correctly understands the structure of the data sent by the client, avoiding errors and enabling data validation.
- To automatically check if data fields are valid (e.g., price must be a positive number, mandatory fields must be present).
- To help FastAPI automatically generate clear and easy-to-use API documentation (OpenAPI/Swagger).

---

### 3. Introduction to Pydantic and BaseModel

- **Pydantic** is a library that helps define data models by inheriting from `BaseModel`.
- Each model corresponds to a data structure (e.g., `Item`, `User`, `Order`).
- Pydantic supports standard Python types like `str`, `int`, `float`, `bool`, and `Optional`.
- When a model is used as a type hint for a request body, FastAPI automatically parses and validates the data sent by the client.

---

### 4. How to Define a Model with BaseModel

```python
from pydantic import BaseModel
from typing import Optional

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
```

- `name`: mandatory field, type `str`
- `description`: optional field (`Optional`), defaults to `None`
- `price`: mandatory field, type `float`

---

### 5. Writing a POST API to Receive JSON Data from a Client

- Use the `@app.post("/items/")` decorator to create a route that accepts POST requests.
- In the route handler function, declare a parameter with the model type (`Item`) so that FastAPI automatically retrieves data from the Request Body and converts it into an object.

```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return {"item_name": item.name, "item_price": item.price}
```

- When a client sends JSON like:

```json
{
  "name": "Ballpoint Pen",
  "description": "Smooth writing pen",
  "price": 15000.5
}
```

- FastAPI will automatically parse it and return:

```json
{
  "item_name": "Ballpoint Pen",
  "item_price": 15000.5
}
```

---

### 6. Explaining the Request Body Processing Workflow in FastAPI

- FastAPI automatically:

  - Reads JSON data from the request body.
  - Uses Pydantic to parse the data into the `Item` model.
  - Checks the validity of the data fields.
  - If the data is invalid, returns an HTTP 422 error with details.
  - If valid, passes the `item` object into the handler function.

---

### 7. Basic Pydantic Data Types You Should Know

| Python Data Type | Meaning                           |
| ---------------- | --------------------------------- |
| `str`            | String of characters              |
| `int`            | Integer number                    |
| `float`          | Floating-point number             |
| `bool`           | Boolean value (True/False)        |
| `Optional[type]` | Optional field (can be None)      |
| `List[type]`     | List of elements of the same type |

---

## 🏆 Hands-on Exercise (with Solution)

### Task

Create a POST API `/products/` that accepts product information with the following fields:

- `title`: product name (mandatory, string)
- `description`: product description (optional)
- `price`: product price (mandatory, float)
- `tax`: product tax (optional, float, defaults to 0.0)

The API should return a JSON object containing:

- `title`
- `price_with_tax`: total price = `price + tax`

### Solution

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Product(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = 0.0

@app.post("/products/")
async def create_product(product: Product):
    total_price = product.price + (product.tax or 0)
    return {"title": product.title, "price_with_tax": total_price}
```

### Analysis

- Used `Optional` to allow description and tax fields to be optional.
- Declared a default value for `tax = 0.0` so that if the client doesn't provide it, the tax is calculated as 0.
- Calculated `price_with_tax` inside the handler function and returned the result.
- Data validation is automatically performed when the request arrives.

---

## 🔑 Key Points to Remember

- **Request Body only applies to methods like POST, PUT, and PATCH; it is not used for GET.**
- JSON data sent must be correctly formatted; otherwise, FastAPI returns a 422 error.
- When using Pydantic, data types are strictly checked (e.g., `price` cannot be a string).
- `Optional` helps you declare optional fields; if a field is missing in the JSON, its value will be `None` or the default value.
- The parameter name in the route handler function matches the model name for FastAPI to understand it should retrieve data from the Request Body.
- Always declare data types clearly to avoid unexpected errors and ensure accurate automatic API documentation.

---

## 📝 Homework

### Task

Build a POST API `/users/` that accepts user data with the following fields:

- `username` (mandatory, string)
- `email` (mandatory, string)
- `full_name` (optional, string)
- `age` (optional, integer, defaults to 18)

The API should return a JSON object containing:

- `username`
- `email`
- `age`

> **Requirements:**
>
> - Write a suitable Pydantic model.
> - Write a route to receive the data and return the result as described above.
> - Ensure data is validated correctly according to its type.
> - If mandatory fields are missing, the API should return an appropriate error.
