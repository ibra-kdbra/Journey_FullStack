# 🎓 LESSON 1: Redis CRUD with Node.js and Express.js

## 🎯 Learning Objectives

✅ Understand what Redis is  
✅ Know how to install and run Redis using Docker Compose  
✅ Know how to connect Express.js to Redis  
✅ Build a simple RESTful API using Redis as a data store

## 📝 Detailed Content

### 1. Introduction to Redis

**What is Redis?**
Redis (REmote DIctionary Server) is an **in-memory key-value database**

👉 Characteristics:

- Stores data in RAM → extremely fast speed
- Can store key-value pairs in formats like string, list, hash, set, etc.

### 2. Setting Up the Development Environment

**Requirements:**

- Node.js (>= v16)
- Docker + Docker Compose
- Visual Studio Code

### 3. Initializing the Express.js Project

```bash
mkdir redis-crud-express && cd redis-crud-express
npm init -y
npm install express redis dotenv cors
npm install --save-dev nodemon
```

**Directory Structure:**

```
redis-crud-express/
├── docker-compose.yml
├── .env
├── app.js
└── routes/
    └── users.js
```

### 4. Setting Up Redis with Docker Compose

**`docker-compose.yml` file:**

```yaml
version: "3.8"
services:
  redis:
    image: redis:7
    container_name: redis_server
    command: redis-server --requirepass mypass
    ports:
      - "6379:6379"
    volumes:
      - ./redis_data:/data
```

**Run Redis and Redis Insight:**

```bash
docker-compose up -d
```

## 🔑 Key Points to Remember

| ⚠️ Issue                                                |
| ------------------------------------------------------- |
| Redis only stores data as strings                       |
| Redis is schema-less                                    |
| Redis does not store data permanently unless configured |

## 📝 Homework

### Task

**Build a REST API to create a product list using Redis, with the following fields: `id`, `name`, `price`**

Implementation:

- POST /products
- GET /products/:id
- PUT /products/:id
- DELETE /products/:id
