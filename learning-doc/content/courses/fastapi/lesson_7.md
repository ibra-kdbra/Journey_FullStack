# Lesson 7: Advanced Validation with Pydantic

## 🎯 Lesson Objectives

After this lesson, students will be able to:

- Clearly understand advanced data types in Pydantic such as `constr`, `conint`, `confloat`, etc., for custom validation.
- Know how to use `Field` to add descriptions, default values, length constraints, value limits, regex, etc.
- Define simple custom validations using the `@validator` decorator.
- Practice handling validation errors when receiving input data in FastAPI.
- Apply advanced validation to real-world data models to increase API safety and accuracy.

---

## 📝 Detailed Content

### 1. Introduction to Advanced Validation in Pydantic

In previous lessons, we learned how to create models with basic data types like `str`, `int`, `float`, and `bool`. However, in practice, input data needs stricter control: for example, a name must have minimum and maximum lengths, age must be within a certain range, email must be correctly formatted, and prices must be positive.

Pydantic provides extended data types that allow you to easily declare these constraints in an intuitive and efficient way.

---

### 2. Advanced Types: `constr`, `conint`, `confloat`, `conlist`, etc

- `constr`: string with length limits, regex, space stripping, etc.
- `conint`: integer with min, max, gt (greater than), lt (less than) limits.
- `confloat`: float with similar constraints.
- `conlist`: list with minimum and maximum element counts.

**Example:**

```python
from pydantic import BaseModel, constr, conint

class User(BaseModel):
    username: constr(min_length=3, max_length=20)  # String from 3-20 characters
    age: conint(ge=18, le=100)  # Integer from 18 to 100 (inclusive)
```

Explanation:

- `min_length=3, max_length=20`: username must be at least 3 characters and no more than 20.
- `ge=18, le=100`: age must be greater than or equal to 18 and less than or equal to 100.

---

### 3. Using `Field` for Additional Customization

`Field` allows you to declare:

- Default values
- Descriptions for OpenAPI documentation
- Value constraints (e.g., gt, lt)
- Examples
- And many other customizations

**Example:**

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Product Name")
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    description: str = Field(None, max_length=300, description="Product Description (optional)")
```

Explanation:

- `...` in `Field(...)` means this field is mandatory.
- `gt=0` constraint means `greater than 0`.
- `description` helps generate better API documentation, supporting FastAPI's auto-docs.

---

### 4. Creating Custom Validation with `@validator`

Beyond built-in constraints, you can write more complex check functions.

**Example:** Checking that a name does not contain numeric characters

```python
from pydantic import BaseModel, validator

class User(BaseModel):
    username: str

    @validator('username')
    def username_no_digits(cls, v):
        if any(char.isdigit() for char in v):
            raise ValueError('Username must not contain digits')
        return v
```

Explanation:

- The `username_no_digits` function runs automatically when `username` is initialized.
- If a digit is found in the name, a validation error is raised.

---

### 5. Practicing Validation in FastAPI

FastAPI automatically uses Pydantic models to validate input data.

**Example:**

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field, conint

app = FastAPI()

class Item(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    price: float = Field(..., gt=0)
    quantity: conint(ge=1)  # Integer >= 1

@app.post("/items/")
async def create_item(item: Item):
    return {"message": "Valid Item", "item": item}
```

If the client sends invalid data, FastAPI returns a 422 error with detailed error information.

---

### 6. Handling Validation Errors and User Experience

You can try sending:

- `name` too short: `"a"`
- `price` as 0 or negative
- `quantity` as 0 or negative

The response will indicate which field is incorrect and provide a clear reason. This strength makes your API secure and easy to debug.

---

## 🏆 Hands-on Exercise with Detailed Solution

### Task

Create an API that receives user registration information with the following requirements:

- `username`: string from 4 to 20 characters, containing no digits.
- `email`: must be a valid email format.
- `age`: integer from 18 to 80.
- `password`: string of at least 8 characters, containing at least 1 uppercase letter, 1 lowercase letter, and 1 digit.

Requirements:

- Use Pydantic for input validation.
- Return a success message or specific errors.

---

### Detailed Solution

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field, EmailStr, validator, conint
import re

app = FastAPI()

class UserRegister(BaseModel):
    username: str = Field(..., min_length=4, max_length=20)
    email: EmailStr
    age: conint(ge=18, le=80)
    password: str = Field(..., min_length=8)

    @validator('username')
    def username_no_digits(cls, v):
        if any(char.isdigit() for char in v):
            raise ValueError('Username must not contain digits')
        return v

    @validator('password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v

@app.post("/register/")
async def register_user(user: UserRegister):
    return {"message": "Registration successful", "user": user}
```

**Analysis:**

- `EmailStr`: Pydantic data type specifically used for email validation.
- `conint(ge=18, le=80)`: Age between 18 and 80.
- Validator checks that `username` has no digits.
- Validator checks that `password` meets character requirements.
- When invalid data is sent, FastAPI returns a detailed error.

---

## 🔑 Key Points to Remember

- Pydantic has built-in advanced data types that are very convenient for quick validation without writing much code.
- `Field` helps declare descriptions, default values, and constraints, which is very useful for FastAPI's auto-generated documentation.
- `@validator` helps check more complex conditions that data types alone cannot handle.
- Validation not only ensures data safety but also creates a clear, user-friendly API experience.
- When validation fails, FastAPI returns a 422 error and detailed information, which you can use for debugging or guiding users.
- Always check input data carefully to prevent errors or incorrect data from affecting the system.

---

## 📝 Homework

**Task:**

Build a `BlogPost` model with the following fields:

- `title`: string of at least 10 characters.
- `content`: string of at least 50 characters.
- `tags`: list of strings, each tag maximum 15 characters, maximum 5 tags per list.
- `published`: boolean, defaults to False.
- `rating`: float from 0.0 to 5.0, can be null (None).

Requirements:

- Use advanced data types and `Field` for declarations.
- Create a POST API that receives BlogPost data and returns the received data.
- Test for errors by sending invalid data.
