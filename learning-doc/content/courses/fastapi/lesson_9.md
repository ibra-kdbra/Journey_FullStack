# Lesson 9: Error Handling and Exceptions in FastAPI

---

## 🎯 Lesson Objectives

After completing this lesson, students will:

- Understand how to use **HTTPException** to return errors to the client.
- Know how to customize error messages and HTTP status codes.
- Learn how to create **Custom Exception Handlers** to manage specific errors globally.
- Be able to override default FastAPI exception handlers (like validation errors).
- Practice writing robust code that handles edge cases and provides clear feedback to API users.

---

## 📝 Detailed Content

### 1. Using `HTTPException`

FastAPI provides `HTTPException` to return HTTP responses with error status codes and descriptive messages.

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {"foo": "The Foo Wrestlers"}

@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": items[item_id]}
```

**Key Parameters:**

- `status_code`: The HTTP status code (e.g., 404, 400, 403).
- `detail`: The error message returned in the JSON body.
- `headers`: Optional dictionary of custom headers.

### 2. Adding Custom Headers to Exceptions

Sometimes you need to add security headers or other metadata to your error responses.

```python
@app.get("/items-header/{item_id}")
async def read_item_header(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={"X-Error": "There goes my hero"},
        )
    return {"item": items[item_id]}
```

### 3. Creating Custom Exception Handlers

You can define how the application should react to specific Python exceptions using the `@app.exception_handler()` decorator.

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class MyCustomException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(MyCustomException)
async def custom_exception_handler(request: Request, exc: MyCustomException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something wrong."},
    )

@app.get("/unicorn/{name}")
async def read_unicorn(name: str):
    if name == "yolo":
        raise MyCustomException(name=name)
    return {"unicorn_name": name}
```

### 4. Overriding Default Exception Handlers

FastAPI has default handlers for `RequestValidationError` and `HTTPException`. You can override them to change the error format.

```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body, "custom_msg": "Input validation failed"},
    )
```

---

## 🏆 Hands-on Exercise with Detailed Solution

### Task

1. Create a simulated database of users.
2. Implement a route `/users/{user_id}`.
3. If the user is found, return their data.
4. If the user is not found, raise a 404 error with the message "User with ID {user_id} does not exist".
5. If the `user_id` is less than 1, raise a 400 error with the message "Invalid User ID".

### Detailed Solution

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

users_db = {
    1: {"name": "Alice", "role": "Admin"},
    2: {"name": "Bob", "role": "User"},
}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    if user_id < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid User ID. ID must be positive."
        )

    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} does not exist"
        )

    return users_db[user_id]
```

---

## 🔑 Key Points to Remember

- Use `raise HTTPException` to stop execution and send an error response immediately.
- Use the `status` module from `fastapi` for cleaner status code references.
- Custom exception handlers are great for global error management (e.g., database connection errors).
- Overriding validation handlers allows you to simplify or translate error messages for frontend clients.
- Always provide helpful `detail` messages to make your API easier to debug.

---

## 📝 Homework

### Task

1. Define a custom Python exception called `InsufficientFunds`.
2. Create a global exception handler for `InsufficientFunds` that returns a 402 (Payment Required) status code.
3. Create a POST route `/withdraw/` that accepts an `amount` and a `balance`.
4. If `amount > balance`, raise `InsufficientFunds`.
5. Test the route to ensure it returns your custom JSON error.
