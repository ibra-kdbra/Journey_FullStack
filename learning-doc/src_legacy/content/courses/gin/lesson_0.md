# Golang Gin API Course Plan

# Script Lesson 1: Introduction and Gin API Project Structure

## INTRODUCTION (2-3 minutes)

[Start video with intro and course logo]

**Greeting**:
Hello everyone! Welcome to the Building APIs with Golang and Gin Framework course. Today we begin our journey of building a full-featured API using Golang.

**Course Introduction**:
This course is designed for those who already have basic knowledge of Golang and want to learn how to build a complete, scalable API ready for real-world deployment. Over 16 lessons, we will build a RESTful API from scratch, connect to a PostgreSQL database, handle authentication, and deploy to a production environment.

**Comparison with other frameworks**:

- **Gin vs. net/http Standard Library**: Gin is based on net/http but provides many more features.
- **Gin vs. Echo**: Gin has a larger community and more extensive documentation.
- **Gin vs. Fiber**: Gin is based on the standard net/http, while Fiber uses fasthttp.

## Introduction to the sample project directory structure

```
vievlog-gin/
├── api/                  # All API-related components
│   ├── controllers/      # Handles HTTP request logic
│   │   ├── post.go       # Controller for post endpoints
│   │   ├── auth.go       # Controller for authentication endpoints
│   │   └── user.go       # Controller for user endpoints
│   │
│   ├── middleware/       # Middleware for processing request/response
│   │   ├── auth.go       # Authentication middleware
│   │   ├── cors.go       # CORS middleware
│   │   └── logging.go    # Logging middleware
│   │
│   ├── routes/           # Router configuration
│   │   ├── post.go       # Post routes
│   │   ├── auth.go       # Authentication routes
│   │   ├── router.go     # Main router setup
│   │   └── user.go       # User routes
│   │
│   └── validators/       # Request validation
│       ├── post.go       # Validation for post requests
│       ├── auth.go       # Validation for authentication requests
│       ├── base.go       # Base validation logic
│       └── user.go       # Validation for user requests
│
├── config/               # Application configuration
│   ├── config.go         # Main config loader
│   ├── database.go       # Database configuration
│   └── server.go         # Server configuration
│
├── internal/             # Internal packages not intended for external import
│   ├── domain/           # Business domain models
│   │   ├── post.go       # Post domain model
│   │   ├── errors.go     # Domain errors
│   │   └── user.go       # User domain model
│   │
│   └── utils/            # Utility functions
│       ├── crypto.go     # Cryptography utilities
│       ├── helpers.go    # Helper functions
│       └── validator.go  # Common validation helpers
│
├── pkg/                  # Reusable packages
│   └── jwt/              # JWT utilities
│       └── jwt.go        # JWT operations
│
├── storage/              # Data storage and repositories
│   ├── cache/            # Cache implementation (Redis)
│   │   └── redis.go      # Redis operations
│   │
│   ├── database/         # Database operations
│   │   └── database.go   # PostgreSQL connection
│   │
│   └── repositories/     # Data access layer
│       ├── post.go       # Post repository
│       ├── repository.go # Base repository interface
│       └── user.go       # User repository
│
├── tests/                # Tests
│   ├── integration/      # Integration tests
│   │   └── api_test.go   # API integration tests
│   └── unit/             # Unit tests
│       ├── controllers/  # Controller tests
│       └── repositories/ # Repository tests
│
│
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── go.mod                # Go module dependencies
├── go.sum                # Go dependencies checksums
├── README.md             # Project documentation
└── main.go               # Application entry point
```

**Purpose of this structure**:

- Clear separation of concerns
- Reduced dependencies between modules
- Easy scalability and maintenance
- Compliance with SOLID principles

# Golang Gin Framework Course

## **PART I: BASICS (Lessons 1-8)**

### **Lesson 1: Introduction to Gin Framework**

**Basic Content:**

- What is Gin Framework and why should you use it?
- Comparing Gin with other frameworks (Echo, Fiber, net/http)
- Advantages and disadvantages of Gin
- Overall architecture of Gin

**Practice Activities:**

- Install Go and set up the development environment
- Initialize a new Go module
- Install the Gin package: `go get github.com/gin-gonic/gin`
- Create the first "Hello World" application
- Run the server and test via a browser

### **Lesson 2: Project Structure and Basic Routing**

**Basic Content:**

- Standard directory structure for a Gin project
- Concept of Routing in Gin
- Basic HTTP methods (GET, POST, PUT, DELETE)
- Route parameters and query parameters

**Practice Activities:**

- Organize the project directory structure
- Create basic routes with GET, POST, PUT, DELETE
- Handle route parameters: `/users/:id`
- Handle query parameters: `/users?name=john&age=30`
- Test all routes using Postman or curl

### **Lesson 3: Handlers and Context**

**Basic Content:**

- Handler functions in Gin
- Gin Context and important methods
- Returning JSON, XML, HTML responses
- Status codes and headers

**Practice Activities:**

- Write handler functions for endpoints
- Use `c.JSON()`, `c.XML()`, `c.HTML()`
- Read and write headers
- Return different status codes
- Create a simple API to manage a product list

### **Lesson 4: Request Binding and Validation**

**Basic Content:**

- Binding JSON, Form data, Query parameters
- Struct tags for validation
- Custom validation rules
- Error handling in binding

**Practice Activities:**

- Create a struct with validation tags
- Bind JSON request body: `c.ShouldBindJSON()`
- Bind form data: `c.ShouldBind()`
- Bind query parameters: `c.ShouldBindQuery()`
- Handle validation errors
- Create a user registration API with validation

### **Lesson 5: Template Rendering**

**Basic Content:**

- Template engine in Gin
- HTML template syntax
- Passing data to templates
- Static file serving

**Practice Activities:**

- Set up a template directory
- Create a layout template
- Render HTML templates with data
- Serve static files (CSS, JS, images)
- Create a simple webpage with a form

### **Lesson 6: Basic Middleware**

**Basic Content:**

- What is middleware and how it works
- Built-in middlewares: Logger, Recovery, CORS
- Create custom middleware
- Middleware for specific routes and route groups

**Practice Activities:**

- Use `gin.Logger()` and `gin.Recovery()`
- Create custom logging middleware
- Create a simple authentication middleware
- Apply middleware to route groups
- Test the middleware functionality

### **Lesson 7: Error Handling**

**Basic Content:**

- Error handling patterns in Gin
- Custom error responses
- Error middleware
- Logging errors

**Practice Activities:**

- Create custom error types
- Implement global error handler middleware
- Handle validation errors
- Log errors to a file
- Create a consistent error response format

### **Lesson 8: File Upload and Download**

**Basic Content:**

- Single file upload
- Multiple file uploads
- File validation (size, type)
- File download and streaming

**Practice Activities:**

- Create an endpoint for single file upload
- Validate file type and size
- Upload multiple files
- Create an endpoint for file download
- Stream large files
- Create a simple file management API

## **PART II: INTERMEDIATE (Lessons 9-16)**

### **Lesson 9: Database Integration with GORM**

**Basic Content:**

- Introduction to GORM
- Database connection and configuration
- Model definition and migration
- Basic CRUD operations

**Practice Activities:**

- Install GORM and database driver
- Set up database connection
- Create models and run migration
- Implement CRUD operations
- Create a user management API with a database

### **Lesson 10: Advanced GORM Operations**

**Basic Content:**

- Associations (One-to-One, One-to-Many, Many-to-Many)
- Query optimization
- Transactions
- Hooks and callbacks

**Practice Activities:**

- Create models with relationships
- Implement complex queries with joins
- Use transactions
- Create hooks for validation
- Build a blog API with user-post relationship

### **Lesson 11: JWT Authentication**

**Basic Content:**

- What are JWT tokens
- Creating and verifying JWT tokens
- Login/logout functionality
- Protected routes

**Practice Activities:**

- Implement registration and login
- Generate JWT tokens on login
- Create JWT verification middleware
- Protect routes that require authentication
- Implement logout and token blacklist

### **Lesson 12: Authorization and Role-Based Access**

**Basic Content:**

- Distinguishing Authentication vs. Authorization
- Role-based access control (RBAC)
- Permission-based authorization
- Middleware for authorization

**Practice Activities:**

- Create role and permission models
- Implement RBAC middleware
- Create admin and user roles
- Protect endpoints by roles
- Test authorization with different users

### **Lesson 13: API Versioning**

**Basic Content:**

- Why API versioning is needed
- URL versioning vs. Header versioning
- Backward compatibility
- Version deprecation

**Practice Activities:**

- Implement URL-based versioning (/v1/, /v2/)
- Create version-specific handlers
- Maintain multiple API versions
- Implement version deprecation warnings
- Test with different API versions

### **Lesson 14: Rate Limiting and Security**

**Basic Content:**

- Rate limiting strategies
- Security headers
- Input sanitization
- SQL injection prevention

**Practice Activities:**

- Implement rate limiting middleware
- Add security headers (CORS, CSP, etc.)
- Input validation and sanitization
- Prevent common security vulnerabilities
- Load testing with rate limits

### **Lesson 15: Caching Strategies**

**Basic Content:**

- In-memory caching
- Redis integration
- Cache invalidation strategies
- HTTP caching headers

**Practice Activities:**

- Implement in-memory cache
- Integrate Redis for distributed caching
- Cache database queries
- Implement cache-aside pattern
- Set proper HTTP cache headers

### **Lesson 16: Background Jobs and Message Queues**

**Basic Content:**

- Background job processing
- Message queue patterns
- Integration with Redis/RabbitMQ
- Job scheduling

**Practice Activities:**

- Implement background email sending
- Set up Redis queue
- Create job workers
- Schedule periodic tasks
- Handle job failures and retries

## **PART III: ADVANCED (Lessons 17-22)**

### **Lesson 17: Testing Gin Applications**

**Basic Content:**

- Unit testing handlers
- Integration testing
- Mocking dependencies
- Test coverage

**Practice Activities:**

- Write unit tests for handlers
- Mock database and external services
- Integration tests with a test database
- Measure and improve test coverage
- Set up a CI/CD pipeline with tests

### **Lesson 18: API Documentation with Swagger**

**Basic Content:**

- Swagger/OpenAPI specification
- Auto-generating documentation
- Interactive API docs
- API documentation best practices

**Practice Activities:**

- Install and set up gin-swagger
- Add Swagger annotations
- Generate interactive documentation
- Customize documentation
- Deploy documentation with the API

### **Lesson 19: Monitoring and Logging**

**Basic Content:**

- Structured logging
- Metrics collection
- Health checks
- APM integration

**Practice Activities:**

- Implement structured logging with logrus
- Add metrics endpoints
- Create health check endpoints
- Integrate with Prometheus
- Set up a monitoring dashboard

### **Lesson 20: WebSocket and Real-time Features**

**Basic Content:**

- WebSocket integration
- Real-time notifications
- Chat applications
- Connection management

**Practice Activities:**

- Implement WebSocket endpoints
- Create a real-time chat room
- Handle connection lifecycle
- Broadcast messages
- Integration with frontend

### **Lesson 21: Microservices with Gin**

**Basic Content:**

- Microservices architecture
- Service discovery
- Inter-service communication
- API Gateway pattern

**Practice Activities:**

- Split monolith into microservices
- Implement service discovery
- Service-to-service authentication
- Create an API gateway
- Handle distributed transactions

### **Lesson 22: Deployment and Production Best Practices**

**Basic Content:**

- Production configuration
- Docker containerization
- Load balancing
- Performance optimization
- Security hardening

**Practice Activities:**

- Create a production Dockerfile
- Set up a load balancer
- Implement graceful shutdown
- Performance profiling and optimization
- Deploy to a cloud platform (AWS/GCP/DigitalOcean)
- Set up monitoring and alerting

## **Required Resources and Tools:**

- Go 1.19+
- Gin Framework
- GORM
- PostgreSQL/MySQL
- Redis
- Docker
- Postman
- Git
- IDE: VS Code or GoLand

## **Final Project:**

Build a complete REST API for an E-commerce system with all the features learned, including authentication, authorization, payment integration, real-time notifications, and deployment to production.
