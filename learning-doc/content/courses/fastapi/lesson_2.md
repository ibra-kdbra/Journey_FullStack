# Lesson 2: Creating Basic Routes in FastAPI

---

## 🎯 Lesson Objectives

After this lesson, students will be able to:

- Clearly understand the **concept of a route (endpoint)** in a web API application.
- Know how to **create simple GET routes** in FastAPI to return data.
- Understand how FastAPI **automatically returns responses as JSON**.
- Practice writing multiple GET routes to become familiar with the FastAPI application structure.
- Know how to run a FastAPI application and test routes using a browser or tools like Postman.

---

## 📝 Detailed Content

### 1. Concept of a Route (Endpoint)

- A **Route (or Endpoint)** is a URL address on a server that a client can send an HTTP request to in order to receive data or perform a specific action.
- Example: When you access `https://api.example.com/users`, `/users` is the route.
- Each route is defined to handle a specific HTTP method such as GET, POST, PUT, or DELETE.
- In FastAPI, you use decorators like `@app.get()` and `@app.post()` to create the corresponding routes.

> **Goal:** Students understand what a route is, its function, and its role in an API.

---

### 2. Creating Your First GET Route in FastAPI

- FastAPI allows you to declare routes using very intuitive decorators.
- The simplest example is creating a route that returns the string "Hello, FastAPI!" when a user accesses `/hello`.

**Explanation:**

- `@app.get("/hello")` means creating a route with the GET method at the path `/hello`.
- The function beneath the decorator will return the data, and FastAPI automatically converts it into a JSON response.

**Code Example:**

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
def read_hello():
    return {"message": "Hello, FastAPI!"}
```

- When running the application and accessing `http://localhost:8000/hello`, you will receive the following JSON:

```json
{ "message": "Hello, FastAPI!" }
```

---

### 3. Automatically Returning JSON Responses

- FastAPI automatically serializes (converts) Python dictionaries into standard JSON responses.
- You don't need to call `jsonify` or perform manual operations.
- This makes API development fast and easy.

---

### 4. Creating Multiple Different GET Routes

- You can create many different routes with different paths.
- Each route will have its own separate handler function.
- Example of creating additional routes:

```python
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

@app.get("/items")
def read_items():
    return [{"item_id": 1, "name": "Item One"}, {"item_id": 2, "name": "Item Two"}]

@app.get("/about")
def about():
    return {"info": "This is a sample FastAPI application."}
```

- Further Explanation:

  - The `/` route returns a welcome message.
  - The `/items` route returns a list of items as JSON.
  - The `/about` route returns introductory information.

- Students can access these directly in the browser or use API client tools like Postman or Insomnia.

---

### 5. Running the FastAPI Application and Testing Routes

- Use the following command to run the server:

```bash
uvicorn main:app --reload
```

- `--reload` enables automatic reloading whenever you modify the code.
- Access the route paths in a browser or API client to test them.
- FastAPI also provides an automatic API documentation page at `http://localhost:8000/docs`, which is very useful for testing and understanding the API.

---

## 🏆 Hands-on Exercise with Detailed Solution

### Task

> Write a FastAPI application with the following routes:
>
> 1. Route `/` returns JSON with the message: "Welcome to the FastAPI course!"
> 2. Route `/hello` returns JSON with the message: "Hello FastAPI!"
> 3. Route `/items` returns a list of items consisting of:
>
>    - {"id": 1, "name": "Pen"},
>    - {"id": 2, "name": "Notebook"},
>    - {"id": 3, "name": "Handbag"}

### Detailed Solution

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    # Return a welcome message
    return {"message": "Welcome to the FastAPI course!"}

@app.get("/hello")
def read_hello():
    # Return a simple greeting
    return {"message": "Hello FastAPI!"}

@app.get("/items")
def read_items():
    # Return a list of items in JSON format
    items = [
        {"id": 1, "name": "Pen"},
        {"id": 2, "name": "Notebook"},
        {"id": 3, "name": "Handbag"}
    ]
    return items
```

**Step-by-step Analysis:**

- Initialize the FastAPI application with `app = FastAPI()`.
- Create the `/` route using `@app.get("/")` returning a dictionary with the key `message`.
- Create the `/hello` route returning a different message.
- Create the `/items` route returning a Python list; FastAPI automatically converts it into a JSON array.
- Run the server using uvicorn and test each route in the browser.

---

## 🔑 Key Points to Remember

- **Routes in FastAPI are defined through decorators like `@app.get()` and `@app.post()`.**
- **The HTTP method (GET, POST, PUT, DELETE) determines the action of the route. In this lesson, only GET is used.**
- **FastAPI automatically returns data in JSON format, so you only need to return a Python dictionary or list.**
- **The function name defining the route can be anything, but it should be clear for easier management.**
- **Each route must have a unique path to avoid conflicts.**
- **Use `uvicorn` to run the application and add `--reload` for automatic reloading during code edits.**

---

## 📝 Homework

> Write a FastAPI application with the following GET routes:
>
> 1. Route `/welcome` returns JSON with the message: "Welcome to FastAPI!"
> 2. Route `/users` returns a list of 3 users, each with an `id` and a `username`.
> 3. Route `/status` returns JSON with the key `status` and value `"OK"`.
>
> _Requirement:_ Run the application and test the routes using a browser or Postman. Prepare the code for discussion in the next session.
