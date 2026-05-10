# Lesson 6: Temporary Data Management (In-Memory Storage)

---

## 🎯 Lesson Objectives

After completing this lesson, students will:

- Clearly understand the concept of **in-memory data storage** in web applications.
- Know how to create and use temporary storage variables (such as `dict` or `list`) to manage data in FastAPI.
- Be proficient in CRUD (Create, Read, Update, Delete) operations on in-memory storage.
- Grasp the advantages and disadvantages of temporary storage compared to database storage.
- Know how to handle temporary data across multiple endpoints and understand its limitations in real-world applications.

---

## 📝 Detailed Content

### 1. **Concept of In-Memory Storage**

- **In-memory storage** refers to storing data directly in the application's RAM while the program is running.
- Data will **disappear when the server restarts or shuts down**.
- It is commonly used for demos, rapid development, or storing temporary data that doesn't require persistence.
- Advantages: Very fast operations, simple, no database connection required.
- Disadvantages: Data loss on server shutdown, not suitable for critical data.

---

### 2. **Creating Temporary Storage Variables in FastAPI**

- We typically use global variables in the form of:

```python
items = {}  # Dictionary storing items with a key like ID or name
# or
items_list = []  # List storing data without fixed keys
```

- These variables are accessed and modified within the API routes.

---

### 3. **CRUD Operations on Temporary Variables**

- **Create**: Add a new element to the dict or list.
- **Read**: Retrieve data by key or iterate through the list.
- **Update**: Update values by key or index.
- **Delete**: Remove an element from the dict or list.

---

### 4. **Practical Illustration**

#### 4.1. Defining the `Item` Model with Pydantic

```python
from pydantic import BaseModel

class Item(BaseModel):
    id: int
    name: str
    description: str = None
    price: float
```

> Description: `Item` represents a product, containing id, name, description, and price fields.

#### 4.2. Creating Temporary Storage

```python
items = {}
```

#### 4.3. Creating a CRUD API with FastAPI Using the `items` Variable

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/items/")
def create_item(item: Item):
    if item.id in items:
        raise HTTPException(status_code=400, detail="Item ID already exists")
    items[item.id] = item
    return item

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    items[item_id] = item
    return item

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    del items[item_id]
    return {"detail": "Deleted successfully"}

@app.get("/items/")
def list_items():
    return list(items.values())
```

> Explanation of each route:
>
> - `POST /items/`: Adds a new item to `items`.
> - `GET /items/{item_id}`: Retrieves an item by its ID.
> - `PUT /items/{item_id}`: Updates an item by its ID.
> - `DELETE /items/{item_id}`: Deletes an item by its ID.
> - `GET /items/`: Retrieves a list of all items.

---

### 5. **Important Considerations When Using Temporary Storage**

- Data stored in the `items` variable will be lost if the server restarts.
- Do not use temporary storage for critical or long-term data management.
- Data only exists within a single server instance. In a production environment with load balancing, data is not shared across instances.
- Usually only used for testing, learning, or temporary session data.

---

## 🏆 Hands-on Exercise with Detailed Solution

### Task

Build a ToDo List management API using in-memory storage with the following requirements:

- Each task has an `id` (int), `title` (str), and `completed` (bool).
- Support the following APIs:

  - Add a new task.
  - Get a list of all tasks.
  - Update the completion status of a task by its `id`.
  - Delete a task by its `id`.

- If a task does not exist during update or deletion, return a 404 error.

---

### Detailed Solution

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class TodoItem(BaseModel):
    id: int
    title: str
    completed: bool = False

todos = {}

@app.post("/todos/")
def create_todo(todo: TodoItem):
    if todo.id in todos:
        raise HTTPException(status_code=400, detail="Todo ID already exists")
    todos[todo.id] = todo
    return todo

@app.get("/todos/")
def get_todos():
    return list(todos.values())

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, completed: bool):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo does not exist")
    todos[todo_id].completed = completed
    return todos[todo_id]

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo does not exist")
    del todos[todo_id]
    return {"detail": "Task deleted successfully"}
```

---

### Step-by-step Analysis

- **Create the `TodoItem` model** using Pydantic to define the data structure.
- **Use the `todos` dict to temporarily store data**.
- **POST route** to add new tasks and check for duplicate IDs.
- **GET route** to return a list of all tasks.
- **PUT route** to update the `completed` field of a task.
- **DELETE route** to remove a task by its ID.
- **Error handling with `HTTPException`** to return appropriate status codes.

---

## 🔑 Key Points to Remember

- **Temporary storage variables are global**, so avoid using them for large or persistent data.
- Data **is not automatically shared across multiple server instances**.
- **When the server restarts, all data is lost**; therefore, do not use it for critical information.
- Ensure **error handling for non-existent data** to maintain API stability.
- Understand the **difference between temporary storage and persistent storage (DB)** to design your API appropriately.

---

## 📝 Homework

**Task:**
Build an in-memory storage API to manage a student list with the following fields:

- `student_id` (int)
- `name` (str)
- `grade` (float)

Requirements:

- APIs to add, edit, delete, and list students.
- When editing the `grade`, ensure it is within the range of 0 to 10; otherwise, return a 400 error.
- Implement error handling for cases where the `student_id` does not exist.
