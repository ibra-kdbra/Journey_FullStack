# Lesson 1: Introduction to FastAPI and Environment Setup

## 🎯 Lesson Objectives

- Understand **what FastAPI is**
- Master how to **install Python and uv**
- Learn how to install and use the **`uv`** tool
- Successfully create your first FastAPI application

## 📝 Detailed Content

### 1. What is FastAPI?

- **FastAPI** is a modern, high-performance, and powerful web framework written in Python, designed to build APIs easily and efficiently.
- Key Highlights:
  - **High Performance**: Comparable to NodeJS and Go, thanks to Starlette and Pydantic.
  - **Easy to Use**: Designed to be easy to learn and use, with less time spent reading documentation.
  - **Auto-generated API Documentation**: Automatically creates interactive documentation (Swagger UI and ReDoc).
  - **Strong Data Validation**: Leveraging Pydantic for data validation and serialization.

### 2. Installing Python and UV

### 2.1 Installing Python

- **Python**: The programming language used to run FastAPI. It is recommended to use version 3.7 or higher, as FastAPI leverages async/await.

_Installation Guide_:

- For Windows/Mac/Linux, download Python from the official website: [https://www.python.org/downloads/](https://www.python.org/downloads/)

```bash
python --version
```

### 2.2 Installing UV

`uv` is an extremely fast Python package and project manager, written in Rust, developed by Astral. It helps:

✅ Manage **virtual environments**
✅ Install & run **libraries** incredibly fast (10–100x faster than `pip`)
✅ Create and lock dependencies (`lockfile`) similar to `poetry`
✅ Run **scripts and tools** like `pipx`, `pyenv`, `twine`, `virtualenv`
✅ Manage multiple Python versions

#### 🎯 Goal: Use `uv` to replace the entire FastAPI installation process as follows

| Traditional (`pip`)           | With `uv` (Simpler and Faster)     |
| ----------------------------- | ---------------------------------- |
| `python3 -m venv env`         | `uv venv`                          |
| `source env/bin/activate`     | Not needed - `uv run` uses the env |
| `pip install fastapi uvicorn` | `uv add fastapi uvicorn`           |
| `python main.py`              | `uv run main.py`                   |

> ✅ No need for `source env/bin/activate`
> ✅ Automatically uses the correct environment
> ✅ Many times faster than `pip` + `uvicorn`

### 🧰 Installing `uv` (Run once)

#### On macOS or Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

> Then add the following line to your `.bashrc` or `.zshrc` if it wasn't added automatically:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Verification

```bash
uv --version
```

### 🛠️ Useful `uv` Commands

| Task                         | `uv` Command          |
| ---------------------------- | --------------------- |
| Initialize a new project     | `uv init .`           |
| Add a library                | `uv add <package>`    |
| Run a command in the venv    | `uv run <command>`    |
| Create a virtual environment | `uv venv`             |
| Lock versions (lockfile)     | `uv lock`             |
| Sync dependencies            | `uv sync`             |
| Remove a library             | `uv remove <package>` |

## 🏆 Hands-on Exercise

### Task

Create a simple FastAPI application with a `/welcome` route that returns a JSON object containing the message `"welcome to FastAPI course!"`.

**Requirements:**

- Create a virtual environment
- Install FastAPI and uv
- Create a `main.py` file with the `/welcome` route
- Run the application and check the results in your browser

## 📝 Homework

- Create a new FastAPI application with the following routes:

  1. `/hello` returns `{"msg": "Hello World!"}`
  2. `/goodbye` returns `{"msg": "Goodbye from FastAPI!"}`

## Hints

#### Initialize a new project

```bash
mkdir fastapi-example
cd fastapi-example
uv init .
```

#### Add FastAPI and Uvicorn libraries

```bash
uv add fastapi uvicorn
```

#### Run the FastAPI application

```bash
uv run -- uvicorn main:app --reload
```
