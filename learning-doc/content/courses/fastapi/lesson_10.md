# Lesson 10: Basic Dependency Injection

---

## 🎯 Lesson Objectives

After completing this lesson, students will:

- Understand the concept of **Dependency Injection (DI)** and why it is useful in web development.
- Know how to use the `Depends` class in FastAPI to inject dependencies into routes.
- Learn how to create simple function-based dependencies.
- Be able to share logic (like authentication or database connections) across multiple endpoints using DI.
- Practice creating and using dependencies to make code more modular and testable.

---

## 📝 Detailed Content

### 1. What is Dependency Injection?

**Dependency Injection** is a design pattern where an object or function receives other objects or functions that it depends on, rather than creating them internally.

In FastAPI, DI allows you to:

- Shared logic (database connections, security, etc.).
- Enforce requirements (authentication, permissions).
- Automatically parse and validate data needed by multiple routes.

### 2. Basic Syntax with `Depends`

To use a dependency in a route, you import `Depends` and use it as a default value for a parameter in your path operation function.

```python
from fastapi import Depends, FastAPI

app = FastAPI()

async def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons

@app.get("/users/")
async def read_users(commons: dict = Depends(common_parameters)):
    return commons
```

**Explanation:**

- `common_parameters` is the dependency function.
- `read_items` and `read_users` both "depend" on it.
- FastAPI calls the dependency function for you and passes the result into your route.

### 3. Why Use Dependency Injection?

- **Code Reuse**: Write logic once, use it in 50 routes.
- **Consistency**: Ensure all routes handle parameters (like pagination) the same way.
- **Testability**: You can easily replace (override) a dependency with a mock during testing.
- **Clean Code**: Keeps your path operation functions focused on their primary task.

### 4. Class-Based Dependencies

You can also use classes as dependencies to maintain state or provide more complex logic.

```python
class CommonQueryParams:
    def __init__(self, q: str | None = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items-class/")
async def read_items_class(commons: CommonQueryParams = Depends(CommonQueryParams)):
    return commons
```

---

## 🏆 Hands-on Exercise with Detailed Solution

### Task

1. Create a dependency function called `get_api_key` that looks for a query parameter named `api_key`.
2. If the `api_key` is missing or is not equal to `"secret123"`, raise an `HTTPException` with status code 403 (Forbidden).
3. Create a route `/protected-data/` that uses this dependency.

### Detailed Solution

```python
from fastapi import FastAPI, Depends, HTTPException, status

app = FastAPI()

# Dependency function
def get_api_key(api_key: str | None = None):
    if api_key != "secret123":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API Key"
        )
    return api_key

@app.get("/protected-data/")
async def get_private_info(key: str = Depends(get_api_key)):
    return {
        "message": "You have access to this protected data!",
        "used_key": key
    }
```

---

## 🔑 Key Points to Remember

- Dependencies are just functions (or classes) that FastAPI calls for you.
- Use `Depends(your_function)` to inject.
- Dependencies can themselves have dependencies (Hierarchical DI).
- You can define dependencies that don't return anything but perform checks (e.g., security).
- Dependencies help keep your code DRY (Don't Repeat Yourself).

---

## 📝 Homework

### Task

1. Create a dependency function `verify_user` that checks for a `user_id` query parameter.
2. If `user_id` is `"admin"`, return a dictionary `{"user": "admin", "access": "full"}`.
3. For any other `user_id`, return `{"user": "guest", "access": "limited"}`.
4. Create two routes: `/dashboard/` and `/profile/`, both requiring this `verify_user` dependency.
5. Test the routes with different `user_id` values.
