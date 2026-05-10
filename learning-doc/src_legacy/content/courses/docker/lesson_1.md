# 🎓 **Lesson 1: Installing and Setting Up Docker on Windows**

## 🎯 **Learning Objectives**

After this lesson, students will:

- Understand **what Docker is**, and why Docker should be used in software development, especially when working with Redis.
- Know how to **install Docker Desktop on Windows** and verify that the Docker environment is working correctly.
- Grasp the **core concepts of Docker**: Image, Container, Dockerfile, Volume, Port Mapping.
- Manually build and run a **Next.js** application within Docker, from initialization to creating and running a Docker Image.
- Establish a foundation for deploying Redis using Docker in subsequent lessons.

## 📝 **Detailed Content**

### 1. 📦 What is Docker?

- Docker is an **open-source platform** that helps package applications and their dependencies into a **container** – a lightweight, portable, and independent unit.
- Helps ensure applications **"run anywhere"**: from a personal computer to physical servers or the cloud.
- Docker solves the **"it works on my machine, but not on yours"** problem caused by environmental differences.

### 2. 💻 Installing Docker Desktop on Windows

#### Step 1: Check System Requirements

- Windows 10/11 Pro, Enterprise, or Education (Supports WSL2 or Hyper-V).
- For Windows Home: Requires enabling **WSL2 (Windows Subsystem for Linux v2)**.

#### Step 2: Download Docker Desktop

- Visit: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- Select the version for Windows and download.

#### Step 3: Install Docker Desktop

- Open the `.exe` file and follow the installation instructions.
- Start Docker Desktop and wait for it to report “Docker is running”.

#### Step 4: Verify Installation

Open **Command Prompt** or **PowerShell**:

```bash
docker --version
docker info
```

If information is displayed, Docker has been successfully installed.

### 3. 🔍 Basic Concepts in Docker

| Concept          | Simple Explanation                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Image**        | A template containing the operating system + source code + application runtime environment   |
| **Container**    | A running instance of an Image (similar to "running a program")                              |
| **Dockerfile**   | A text file containing instructions on how to build an Image                                 |
| **Volume**       | A persistent data storage area outside the container (ensures data is not lost when deleted) |
| **Port mapping** | Links a port inside the container to a port on the host machine                              |

### 4. 🚀 Real-world Example: Initializing and Running a Next.js Project with Docker

#### Step 1: Create a Next.js Application

```bash
npx create-next-app@latest nextjs-docker-demo
cd nextjs-docker-demo
```

#### Step 2: Write the Dockerfile

Create a `Dockerfile` in the root directory:

```Dockerfile
# Base image
FROM node:20.10-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code
COPY . .

# Build project
RUN npm run build

# Expose application port
EXPOSE 3000

# Command to run when the container starts
CMD ["npm", "start"]
```

#### Step 3: Write the `.dockerignore` file

```txt
node_modules
npm-debug.log
.next
```

#### Step 4: Build the Docker Image

```bash
docker build -t nextjs-docker-demo .
```

#### Step 5: Run the Container

```bash
docker run -d -p 3000:3000 nextjs-docker-demo
```

- Access the browser: `http://localhost:3000` to verify.

## 🔑 **Key Points to Remember**

1. **Docker Image vs Container**:

   - An Image is a "blueprint," while a Container is a "live instance."
   - Multiple containers can run from the same image.

2. **Avoid running Docker with Admin privileges unless necessary** to reduce security risks.

3. **Be careful when using volumes**: data may be lost if not declared correctly when deleting containers.

4. **The Dockerfile must be placed in the project root directory**, alongside `package.json`.

5. **When running Docker for the first time**, Docker Desktop will prompt you to enable WSL2 or Hyper-V – please follow the instructions.
