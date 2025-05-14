# Secure Task Manager API

## Overview
A Spring Boot REST API for managing personal tasks, secured via Keycloak using JWT/OAuth2. Registered users can create, read, update, and delete their own tasks, with all endpoints protected and ownership enforced.

## Table of Contents
- [Secure Task Manager API](#secure-task-manager-api)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Keycloak Setup](#keycloak-setup)
  - [Build \& Run](#build--run)
  - [Obtaining a JWT](#obtaining-a-jwt)
  - [API Endpoints](#api-endpoints)
  - [Examples (curl \& Postman)](#examples-curl--postman)
    - [Create Task (curl)](#create-task-curl)
    - [List Tasks (curl)](#list-tasks-curl)
    - [See Postman Collection](#see-postman-collection)
  - [Design Decisions \& Justifications](#design-decisions--justifications)
    - [Unit \& Integration Tests](#unit--integration-tests)

---

## Keycloak Setup
1. **Run Keycloak** (Dev Mode):
   ```bash
   docker run --name keycloak -p 8080:8080 \
     -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:24.0.0 start-dev
   ```

2. **Create Realm**: `task-manager`.
3. **Create Client**: `task-manager-client`.

   * Access Type: `confidential` (or `public` for no client secret).
   * Valid Redirect URIs: `*`
   * Web Origins: `*`
4. **Define Role**: Create role `user` under `task-realm`.
5. **Add Users**: Create users (example: `alice` / `alicepwd`), assign role `user`.

## Build & Run

1. **Build**:
    ```bash
    mvn clean package -DskipTests
    ```

2. **Run**:
    ```bash
    docker-compose up --build -d
    ```

3. **Application URL**: `http://localhost:8080` or `http://localhost:8081` based on your machine, I configured it on 8081 on my linux machine.

## Obtaining a JWT

1. **Token Request (Password Grant)**:

   ```bash
   TOKEN=$(curl -s -X POST \
     "http://localhost:8080/realms/task-manager/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=password&client_id=task-manager-client&client_secret=<SECRET>&username=alice&password=alicepwd" \
     | jq -r .access_token)
   echo $TOKEN
   ```
2. **Verify Token**:

   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/tasks
   ```

## API Endpoints

| Method | Endpoint             | Description                                   |
| ------ | -------------------- | --------------------------------------------- |
| POST   | `/api/v1/tasks`      | Create a new task.                            |
| GET    | `/api/v1/tasks`      | Retrieve all tasks of the authenticated user. |
| GET    | `/api/v1/tasks/{id}` | Retrieve a specific owned task.               |
| PUT    | `/api/v1/tasks/{id}` | Update a specific owned task.                 |
| DELETE | `/api/v1/tasks/{id}` | Delete a specific owned task.                 |

All endpoints require `Authorization: Bearer <JWT>` header.

## Examples (curl & Postman)

### Create Task (curl)

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write report",
    "description": "Quarterly financial analysis",
    "dueDate": "2025-06-01",
    "status": "PENDING"
  }'
```

### List Tasks (curl)

```bash
curl http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### See [Postman Collection](./taskmanager-collection.json)

## Design Decisions & Justifications

1. **Authorization Logic**: Centralized in service layer (`TaskService`) for clear business-rule enforcement and ease of unit testing, rather than scattering `@PreAuthorize` annotations.
2. **Keycloak Integration**: Leveraged Spring Security OAuth2 Resource Server with `issuer-uri` and `jwk-set-uri` for automatic JWKS retrieval and JWT validation.
3. **JPA Choices**: Default `LAZY` fetch strategy, explicit CRUD operations without cascade, `ddl-auto=update` for dev agility; in production, use `validate` or migrations.
4. **DTO Pattern**: Decoupled API layer from persistence, ensuring validation (`@Valid`) and shielded entity integrity.
5. **Error Handling**: Custom exceptions and a global `@ControllerAdvice` ensure standardized JSON error responses with fields: `timestamp`, `status`, `error`, `message`, `path`.


### Unit & Integration Tests

* **Unit Tests (Service Layer)**: `TaskServiceTest.java` using JUnit 5 & Mockito.
* **Integration Tests (Controller)**: `TaskControllerIntegrationTest.java` with Spring Boot Test, `MockMvc`, and `@WithMockJwt` custom annotation to simulate authenticated JWT.
* **Coverage**: Assertions for CRUD flows, security checks (403 expected when accessing others' tasks).