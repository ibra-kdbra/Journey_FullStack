# FastAPI Python Course (33 Lessons) – Basic to Intermediate

---

## Lesson 1: Introduction to FastAPI and Workspace Setup

- Basic Content:

  - What is FastAPI? Advantages of FastAPI
  - Installing Python, pip, and FastAPI
  - Installing and configuring a virtual environment (virtualenv)
  - Introduction to `uv`, a new tool developed by Astral (authors of `ruff`)

- Activities:
  - Install a virtual environment
  - Install FastAPI and uv
  - Create a simple `main.py` file and run the FastAPI application

---

## Lesson 2: Creating Basic Routes in FastAPI

- Basic Content:

  - The concept of routes (endpoints)
  - Creating the first GET route
  - Returning a simple JSON response

- Activities:
  - Write a `/hello` route returning "Hello, FastAPI!"
  - Create various GET routes

---

## Lesson 3: Using Path Parameters and Query Parameters

- Basic Content:

  - Path parameters: retrieving data from the URL
  - Query parameters: retrieving data from the query string

- Activities:
  - Create a route with a path param (e.g., `/items/{item_id}`)
  - Create a route with a query param (e.g., `/search?query=abc`)

---

## Lesson 4: Request Body and Basic Data Types

- Basic Content:

  - Declaring Pydantic data types (BaseModel)
  - Receiving JSON data from the client via POST requests

- Activities:
  - Create an Item model with name, description, and price fields
  - Write a POST route that receives and returns item data

---

## Lesson 5: Using Other HTTP Methods (PUT, DELETE)

- Basic Content:

  - Utilizing PUT and DELETE methods in FastAPI
  - Differences between POST, PUT, and PATCH

- Activities:
  - Write a PUT route to update item data
  - Write a DELETE route to remove an item by ID

---

## Lesson 6: Temporary Data Management (In-Memory Storage)

- Basic Content:

  - Creating dictionary or list variables to store temporary data in memory
  - Operations to add, edit, and delete data in memory

- Activities:
  - Build a basic CRUD system using temporary variables to store items

---

## Lesson 7: Advanced Validation with Pydantic

- Basic Content:

  - Advanced data types: constr, conint, etc.
  - Input data validation
  - Using Field to add descriptions, defaults, and limits

- Activities:
  - Create a model with validation (e.g., price must be greater than 0)
  - Test by sending invalid data to check for errors

---

## Lesson 8: Response Model and Custom Responses

- Basic Content:

  - Response Model: limiting data returned to the client
  - Returning custom HTTP status codes
  - Returning JSON responses with a custom structure

- Activities:
  - Use `response_model` in a route
  - Return status code 201 for POST requests

---

## Lesson 9: Error Handling and Exceptions in FastAPI

- Basic Content:

  - Handling 404, 400, and 422 errors with HTTPException
  - Creating custom exception handlers

- Activities:
  - Trigger a 404 error when an item does not exist
  - Create a custom error with a specific message

---

## Lesson 10: Basic Dependency Injection

- Basic Content:

  - The concept of dependencies in FastAPI
  - Creating basic function dependencies

- Activities:
  - Create a shared dependency for routes (e.g., retrieving the current user)
  - Integrate the dependency into a route

---

## Lesson 11: Using Headers and Cookies

- Basic Content:

  - Reading header and cookie data in a request

- Activities:
  - Write a route to read the `User-Agent` header
  - Write a route to read a cookie named `session_id`

---

## Lesson 12: Creating and Using Middleware

- Basic Content:

  - What is Middleware? How to create simple middleware

- Activities:
  - Write middleware to log request time
  - Middleware to check for a custom header

---

## Lesson 13: CORS in FastAPI

- Basic Content:

  - Introduction to Cross-Origin Resource Sharing (CORS)
  - Configuring CORS middleware in FastAPI

- Activities:
  - Allow specific domains to call the API

---

## Lesson 14: Using Background Tasks

- Basic Content:

  - The concept of background tasks
  - Executing asynchronous tasks after returning a response

- Activities:
  - Write a background task to simulate sending an email

---

## Lesson 15: Simple File Upload and Download

- Basic Content:

  - Receiving file uploads in a request
  - Returning files for client download

- Activities:
  - Write an API for image file uploads
  - Write an API to return a sample PDF file to the client

---

## Lesson 16: Template Rendering with Jinja2

- Basic Content:

  - Integrating Jinja2 to render HTML templates

- Activities:
  - Write a route to render a dynamic HTML page with data

---

## Lesson 17: Handling Form Data

- Basic Content:

  - Receiving data from HTML forms (form-urlencoded)

- Activities:
  - Write a route to receive user registration data via a form

---

## Lesson 18: Working with Advanced Query Parameters

- Basic Content:

  - Advanced query parameter types: list, enum

- Activities:
  - Write a route to receive a list of tags from query parameters
  - Write a route using an enum in a query parameter

---

## Lesson 19: Pagination (Simple Pagination)

- Basic Content:

  - The idea of pagination in an API
  - Creating `skip` and `limit` query parameters

- Activities:
  - Write an API that returns a paginated list of items

---

## Lesson 20: Using Enums in FastAPI

- Basic Content:

  - Defining Enums and using them as data types

- Activities:
  - Create an Enum for item status (e.g., active, inactive)

---

## Lesson 21: Creating APIs with Complex Dynamic Paths

- Basic Content:

  - Paths with multiple segments and complex types

- Activities:
  - Write a route with multiple path params (e.g., `/users/{user_id}/items/{item_id}`)

---

## Lesson 22: Using OAuth2 Password (Basics)

- Basic Content:

  - Introduction to OAuth2 Password Flow (no deep dive into security)
  - Creating mock tokens for user login

- Activities:
  - Write a login route that returns a mock token (dummy token)

---

## Lesson 23: User Authentication with Tokens (Basic)

- Basic Content:

  - Checking tokens in the Authorization Header

- Activities:
  - Write a dependency to verify a valid token before accessing the API

---

## Lesson 24: Introduction to SQLAlchemy and SQLite Connection

- Basic Content:

  - Creating a SQLite DB connection with SQLAlchemy
  - Creating simple ORM models

- Activities:
  - Create an `items` table in SQLite
  - Perform add, edit, and delete operations on the DB via ORM

---

## Lesson 25: Complete CRUD with a Database

- Basic Content:

  - Writing a CRUD API connected to a SQLite DB

- Activities:
  - Write real-world CRUD routes that interact with the DB

---

## Lesson 26: Simple Migrations with Alembic (Basics)

- Basic Content:

  - Introduction to Alembic and DB migrations

- Activities:
  - Initialize Alembic and create the first migration

---

## Lesson 27: Configuring Logging in FastAPI

- Basic Content:

  - Setting up standard Python logging for the application

- Activities:
  - Create a log file to record error requests and information

---

## Lesson 28: Basic WebSocket Usage

- Basic Content:

  - Introduction to WebSockets
  - Creating a simple WebSocket route

- Activities:
  - Write a basic WebSocket chat server

---

## Lesson 29: Pagination with DB and SQLAlchemy

- Basic Content:

  - Real-world DB query pagination

- Activities:
  - Write a paginated API for data retrieved from the DB

---

## Lesson 30: Uploading Files to a Server Directory

- Basic Content:

  - Saving uploaded files to the server

- Activities:
  - Write a route to upload files and save them to a folder

---

## Lesson 31: Advanced CORS Management

- Basic Content:

  - Detailed CORS configuration by domain and method

- Activities:
  - Set up CORS for a specific domain with limited methods

---

## Lesson 32: Packaging and Deploying FastAPI Applications

- Basic Content:

  - Packaging the application (requirements.txt, simple Dockerfile)
  - Running the application with Uvicorn or Gunicorn

- Activities:
  - Write a Dockerfile for FastAPI
  - Run the FastAPI application in a Docker container

---

## Lesson 33: Summary and Final Practice Exercises

- Basic Content:

  - Review learned knowledge
  - Guidance on completing a small project (e.g., product management API)

- Activities:
  - Complete a CRUD project combining validation, DB, and simple auth
  - Test and self-correct errors
