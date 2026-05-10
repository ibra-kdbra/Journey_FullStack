# Lesson 3: Using Path Parameters and Query Parameters

---

## 🎯 Lesson Objectives

After completing this lesson, students will:

- Clearly understand the concepts of **Path Parameters** and **Query Parameters** in HTTP APIs.
- Know how to declare, receive, and process **path parameters** in FastAPI.
- Know how to declare, receive, and process **query parameters** in FastAPI.
- Be able to distinguish between path parameters and query parameters.
- Practice writing basic routes using path and query parameters in FastAPI.
- Enhance skills in reading and writing APIs that accept input parameters in the URL.

---

## 📝 Detailed Content

### 1. Overview of URL Parameters

Before diving into FastAPI, we need to understand **URL Parameters**:

- **Path Parameters**: These are part of the URL defined in the path, used to identify a specific resource. Example: `/items/5` — here `5` is the path parameter, representing the item with ID = 5.

- **Query Parameters**: These are added after a `?` in the URL, used for filtering, searching, or passing optional parameters. Example: `/search?query=apple&limit=10` — there are 2 query parameters: `query` and `limit`.

---

### 2. Path Parameters in FastAPI

- **Concept:** Path parameters are variables attached directly to the URL path, defined in the route as `{variable_name}`.

- **Declaration:** In FastAPI, you declare a path parameter by using curly braces in the route decorator:

```python
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
```

- **Explanation:**

  - `item_id` is the path parameter.
  - FastAPI automatically extracts the value from the URL and casts it to an `int` (or whichever type you declare).
  - If an invalid type is passed (e.g., passing the string `"abc"` when an `int` is expected), FastAPI will return a 422 error.

- **Notes:**

  - Path parameters are always required.
  - You can use multiple path parameters in a single URL, for example: `/users/{user_id}/items/{item_id}`.

---

### 3. Query Parameters in FastAPI

- **Concept:** Query parameters are parameters passed as key-value pairs after the `?` symbol in the URL.

- **Declaration:** Unlike path parameters, query parameters are not declared in the path but appear in the function signature by defining parameters with default values.

```python
@app.get("/search")
def search_items(query: str = None, limit: int = 10):
    return {"query": query, "limit": limit}
```

- **Explanation:**

  - `query` and `limit` are query parameters.
  - If `query` is not provided, the default value `None` will be used.
  - If `limit` is not provided, the default value `10` will be used.
  - If you want a parameter to be mandatory, do not assign a default value (e.g., `query: str`), and FastAPI will require the client to provide this parameter.

- **Sample URLs:**

  - `/search?query=apple&limit=5`
  - `/search?query=banana`
  - `/search` (with `query=None`, `limit=10`)

---

### 4. Distinguishing Path Parameters and Query Parameters

| Feature                | Path Parameters                | Query Parameters                              |
| ---------------------- | ------------------------------ | --------------------------------------------- |
| Position in URL        | In the path itself             | After the `?` in the query string             |
| Example URL            | `/items/5`                     | `/items/?skip=10&limit=5`                     |
| Mandatory?             | Yes                            | Usually optional, depends on declaration      |
| Used for               | Identifying specific resources | Filtering, pagination, passing options        |
| Declaration in FastAPI | Inside the decorator path      | Function parameters with defaults or Optional |

---

### 5. Practical Illustration

```python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# Path parameter: fetch item by id
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id, "message": f"This is item number {item_id}"}

# Query parameter: search for items
@app.get("/search")
def search_items(query: Optional[str] = None, limit: int = 10):
    results = [f"item_{i}" for i in range(1, limit+1)]
    return {"query": query, "limit": limit, "results": results}
```

- You can access:

  - `http://localhost:8000/items/3` returns item 3.
  - `http://localhost:8000/search?query=apple&limit=5` returns 5 dummy items for the keyword "apple".
  - `http://localhost:8000/search` returns the default 10 items.

---

## 🏆 Hands-on Exercise with Detailed Solution

### Task

Write an API for an online store with the following requirements:

1. Create a route `/products/{product_id}` to retrieve product details by `product_id` (integer).
2. Create a route `/products/` that can accept query parameters:

   - `category` (string, optional)
   - `max_price` (float, optional, defaults to 1000.0)
   - Return a list of dummy products that satisfy these filter conditions.

### Detailed Solution

```python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# Dummy product data
products_db = [
    {"product_id": 1, "name": "T-shirt", "category": "clothing", "price": 200},
    {"product_id": 2, "name": "Phone", "category": "electronics", "price": 1500},
    {"product_id": 3, "name": "Tablet", "category": "electronics", "price": 800},
    {"product_id": 4, "name": "Jeans", "category": "clothing", "price": 300},
]

# Route to get product details by product_id (path param)
@app.get("/products/{product_id}")
def get_product(product_id: int):
    for product in products_db:
        if product["product_id"] == product_id:
            return product
    return {"error": "Product not found"}

# Route to list products with filter query params
@app.get("/products/")
def list_products(category: Optional[str] = None, max_price: float = 1000.0):
    filtered = []
    for product in products_db:
        if category and product["category"] != category:
            continue
        if product["price"] > max_price:
            continue
        filtered.append(product)
    return {"products": filtered}
```

### Step-by-step Analysis

- **`/products/{product_id}`**:

  - Receives `product_id` from the URL (path parameter).
  - Searches for the corresponding product in `products_db`.
  - Returns a simple error message if not found.

- **`/products/`**:

  - Receives query parameters `category` and `max_price`.
  - Filters the product list based on conditions:

    - If `category` exists, only include products of that category.
    - Only include products with a price less than or equal to `max_price`.

  - Returns the list of matching products.

---

## 🔑 Key Points to Remember

- **Path parameters are mandatory**; they must be present in the URL when calling the API.
- **Query parameters are usually optional**; you should declare default values or use `Optional` to avoid errors.
- FastAPI automatically checks parameter data types; it returns a 422 error if they are invalid.
- When declaring path parameters, the variable name in the decorator and the function must match.
- You cannot have a query parameter with the same name as a path parameter in the same route.
- Use `Optional[type]` or assign a default value to make a query parameter optional.
- You can use multiple path and query parameters in a single route.
- Query parameters are highly suitable for filtering, pagination, searching, etc., in an API.

---

## 📝 Homework

### Task

1. Write an API with the route `/users/{user_id}/orders/` to retrieve a list of orders for a user identified by `user_id` (path param).

2. This API should include additional query parameters:

   - `status` (string, optional) to filter orders by state (e.g., "pending", "completed").
   - `limit` (int, defaults to 5) to limit the number of orders returned.

3. Simulate order data in the code with at least 5 orders belonging to different users and with various statuses.

4. Return a JSON result containing the list of orders that satisfy the filtering criteria.

### Requirements

- Code must be clear with comments for each section.
- Ensure handling of the case where no orders are found.
- Verify that input data types are correct.
