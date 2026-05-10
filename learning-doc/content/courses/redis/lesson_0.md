# Redis CRUD Operations Course With Frameworks (21 lessons)

### Lesson 1: Redis CRUD with Node.js and Express.js

**Building the project from scratch:**

- Development environment setup
- Initialize Node.js project with npm/yarn
- Install and configure Express.js
- Standard project directory structure

**Redis Setup with Docker Compose:**

- Create docker-compose.yml for Redis
- Configure Redis container with persistent storage
- Setup Redis Insight container for monitoring
- Network configuration between containers

**Core Content - Redis CRUD Operations:**

- **SET**: Store data with `client.set(key, value)`
- **GET**: Retrieve data with `client.get(key)`
- **UPDATE**: Update data with `client.set(key, newValue)` or atomic operations
- **DELETE**: Delete data with `client.del(key)`
- Error handling for operations
- JSON data serialization/deserialization

**Hands-on Activities:**

- Build a REST API from scratch with CRUD endpoints
- POST /users (SET user data)
- GET /users/:id (GET user data)
- PUT /users/:id (UPDATE user data)
- DELETE /users/:id (DELETE user data)
- Use Redis Insight to monitor CRUD operations

### Lesson 2: Redis CRUD with Next.js

**Building the project from scratch:**

- Create Next.js app with TypeScript
- Configure ESLint and Prettier
- Setup Tailwind CSS
- Project structure with API routes

**Redis Setup with Docker Compose:**

- Next.js app + Redis + Redis Insight
- Environment variables configuration
- Development and production environments

**Core Content - Redis CRUD Operations:**

- **SET**: API routes to create new data
- **GET**: Server-side data fetching with Redis
- **UPDATE**: Partial updates and full replacement
- **DELETE**: Soft delete and hard delete patterns
- Client-side state synchronization
- Form handling with Redis backend

**Hands-on Activities:**

- Build a blog platform from scratch
- Create post (SET operation)
- Display posts (GET operations)
- Edit posts (UPDATE operations)
- Delete posts (DELETE operations)
- Real-time preview with Redis caching

### Lesson 3: Redis CRUD with Vue.js

**Building the project from scratch:**

- Vue 3 project setup with Vite
- Composition API configuration
- Pinia state management setup
- Vue Router configuration

**Redis Setup with Docker Compose:**

- Vue dev server + Redis backend API + Redis Insight
- Proxy configuration for API calls
- CORS setup for development

**Core Content - Redis CRUD Operations:**

- **SET**: Form submission to create data
- **GET**: Reactive data fetching
- **UPDATE**: Two-way data binding with Redis
- **DELETE**: Confirmation dialogs and cleanup
- Vuex/Pinia integration with Redis operations
- Component state management

**Hands-on Activities:**

- Vue task management app from scratch
- Add tasks (SET operations)
- View task list (GET operations)
- Edit tasks (UPDATE operations)
- Delete tasks (DELETE operations)
- Filter and search functionality

### Lesson 4: Redis CRUD with React.js

**Building the project from scratch:**

- Create React App or Vite setup
- TypeScript configuration
- useState and useEffect hooks
- Axios HTTP client setup

**Redis Setup with Docker Compose:**

- React dev server + Backend API + Redis + Redis Insight
- Development workflow optimization

**Core Content - Redis CRUD Operations:**

- **SET**: Form handling and data creation
- **GET**: useEffect data fetching patterns
- **UPDATE**: Controlled components and state updates
- **DELETE**: Optimistic updates and rollback
- Custom hooks for Redis operations
- Error boundary handling

**Hands-on Activities:**

- React contact manager from scratch
- Create contacts (SET with form validation)
- Display contacts (GET with pagination)
- Edit contacts (UPDATE with inline editing)
- Delete contacts (DELETE with confirmation)
- Search and filter contacts

### Lesson 5: Redis CRUD with Angular

**Building the project from scratch:**

- Angular CLI project setup
- Service and component architecture
- Reactive forms setup
- HTTP client configuration

**Redis Setup with Docker Compose:**

- Angular dev server + Backend API + Redis + Redis Insight
- Development proxy configuration

**Core Content - Redis CRUD Operations:**

- **SET**: Reactive forms with Redis backend
- **GET**: Observable patterns for data fetching
- **UPDATE**: Form validation and error handling
- **DELETE**: Service injection and HTTP operations
- Angular services for Redis CRUD
- Template-driven vs reactive forms

**Hands-on Activities:**

- Angular inventory management from scratch
- Add products (SET with form validation)
- View inventory (GET with sorting)
- Update stock (UPDATE operations)
- Remove products (DELETE with confirmation)
- Export/import functionality

### Lesson 6: Redis CRUD with Spring Boot (Java)

**Building the project from scratch:**

- Spring Boot project with Maven
- Spring Data Redis setup
- RestController configuration
- Model/Entity classes

**Redis Setup with Docker Compose:**

- Spring Boot app + Redis + Redis Insight
- JVM optimization in container

**Core Content - Redis CRUD Operations:**

- **SET**: `redisTemplate.opsForValue().set(key, value)`
- **GET**: `redisTemplate.opsForValue().get(key)`
- **UPDATE**: Conditional updates and transactions
- **DELETE**: `redisTemplate.delete(key)`
- Repository pattern with Redis
- JSON serialization with Jackson

**Hands-on Activities:**

- Spring Boot product catalog from scratch
- POST /products (CREATE - SET operation)
- GET /products/{id} (READ - GET operation)
- PUT /products/{id} (UPDATE operation)
- DELETE /products/{id} (DELETE operation)
- Exception handling and validation

### Lesson 7: Redis CRUD with Gin Framework (Golang)

**Building the project from scratch:**

- Go module initialization
- Gin framework setup
- Struct definitions for data models
- go-redis client configuration

**Redis Setup with Docker Compose:**

- Go app + Redis + Redis Insight
- Multi-stage Docker build

**Core Content - Redis CRUD Operations:**

- **SET**: `rdb.Set(ctx, key, value, expiration)`
- **GET**: `rdb.Get(ctx, key).Result()`
- **UPDATE**: Atomic operations and pipelines
- **DELETE**: `rdb.Del(ctx, key)`
- JSON marshaling/unmarshaling
- Context handling and timeouts

**Hands-on Activities:**

- Go user management API from scratch
- POST /users (SET user data)
- GET /users/:id (GET user data)
- PUT /users/:id (UPDATE user data)
- DELETE /users/:id (DELETE user data)
- Middleware for error handling

### Lesson 8: Redis CRUD with Django (Python)

**Building the project from scratch:**

- Django project with virtual environment
- Django models and Redis integration
- Views and URL configuration
- Django REST Framework setup

**Redis Setup with Docker Compose:**

- Django + Redis + Redis Insight + PostgreSQL
- Static files serving

**Core Content - Redis CRUD Operations:**

- **SET**: `cache.set(key, value, timeout)`
- **GET**: `cache.get(key, default=None)`
- **UPDATE**: Cache invalidation strategies
- **DELETE**: `cache.delete(key)`
- Model serialization with Redis
- Cache-aside pattern implementation

**Hands-on Activities:**

- Django blog system from scratch
- Create posts (SET with caching)
- List posts (GET with pagination caching)
- Update posts (UPDATE with cache invalidation)
- Delete posts (DELETE with cleanup)
- Comment system with Redis

### Lesson 9: Redis CRUD with Flask (Python)

**Building the project from scratch:**

- Flask application factory pattern
- Blueprint organization
- SQLAlchemy models with Redis caching
- Flask-WTF forms

**Redis Setup with Docker Compose:**

- Flask + Redis + Redis Insight
- Development server configuration

**Core Content - Redis CRUD Operations:**

- **SET**: `redis_client.set(key, json.dumps(data))`
- **GET**: `json.loads(redis_client.get(key))`
- **UPDATE**: Compare-and-swap operations
- **DELETE**: `redis_client.delete(key)`
- Session management with Redis
- Form data caching

**Hands-on Activities:**

- Flask e-commerce cart from scratch
- Add to cart (SET cart items)
- View cart (GET cart contents)
- Update quantities (UPDATE operations)
- Remove items (DELETE from cart)
- Checkout process with Redis

### Lesson 10: Redis CRUD with Laravel (PHP)

**Building the project from scratch:**

- Laravel project with Composer
- Eloquent models and Redis facade
- Route and Controller setup
- Blade templates

**Redis Setup with Docker Compose:**

- Laravel + Redis + Redis Insight + MySQL + Nginx
- PHP-FPM optimization

**Core Content - Redis CRUD Operations:**

- **SET**: `Redis::set($key, $value)`
- **GET**: `Redis::get($key)`
- **UPDATE**: `Redis::setex($key, $ttl, $newValue)`
- **DELETE**: `Redis::del($key)`
- Cache tags and invalidation
- Eloquent model caching

**Hands-on Activities:**

- Laravel news portal from scratch
- Publish articles (SET operations)
- Display articles (GET with caching)
- Edit articles (UPDATE with cache refresh)
- Delete articles (DELETE with cleanup)
- Category and tag management

### Lesson 11: Redis CRUD with Ruby on Rails

**Building the project from scratch:**

- Rails 7 application setup
- ActiveRecord models
- Controllers and routes
- Redis gem configuration

**Redis Setup with Docker Compose:**

- Rails + Redis + Redis Insight + PostgreSQL
- Asset pipeline configuration

**Core Content - Redis CRUD Operations:**

- **SET**: `$redis.set(key, value.to_json)`
- **GET**: `JSON.parse($redis.get(key))`
- **UPDATE**: Atomic increments and updates
- **DELETE**: `$redis.del(key)`
- Rails.cache integration
- ActiveRecord callbacks with Redis

**Hands-on Activities:**

- Rails forum application from scratch
- Create topics (SET operations)
- Browse topics (GET with caching)
- Edit posts (UPDATE operations)
- Delete content (DELETE operations)
- User reputation system

### Lesson 12: Redis CRUD with ASP.NET Core (C#)

**Building the project from scratch:**

- .NET Web API project
- Models and DTOs
- Controllers with dependency injection
- StackExchange.Redis setup

**Redis Setup with Docker Compose:**

- ASP.NET Core + Redis + Redis Insight
- Health check endpoints

**Core Content - Redis CRUD Operations:**

- **SET**: `await db.StringSetAsync(key, JsonSerializer.Serialize(value))`
- **GET**: `JsonSerializer.Deserialize<T>(await db.StringGetAsync(key))`
- **UPDATE**: Conditional sets with when conditions
- **DELETE**: `await db.KeyDeleteAsync(key)`
- Async/await patterns
- Generic repository pattern

**Hands-on Activities:**

- ASP.NET Core order management from scratch
- Create orders (SET customer orders)
- Retrieve orders (GET order details)
- Update order status (UPDATE operations)
- Cancel orders (DELETE operations)
- Order tracking system

### Lesson 13: Redis CRUD with Flutter (Mobile Development)

**Building the project from scratch:**

- Flutter project initialization
- HTTP client setup (dio/http)
- State management with Provider
- Local storage integration

**Redis Setup with Docker Compose:**

- Backend API + Redis + Redis Insight
- Mobile-friendly API endpoints

**Core Content - Redis CRUD Operations:**

- **SET**: HTTP POST requests to Redis backend
- **GET**: HTTP GET requests with offline caching
- **UPDATE**: HTTP PUT requests with optimistic updates
- **DELETE**: HTTP DELETE with local synchronization
- Offline-first architecture
- Data synchronization strategies

**Hands-on Activities:**

- Flutter note-taking app from scratch
- Create notes (POST/SET operations)
- Display notes (GET operations)
- Edit notes (PUT/UPDATE operations)
- Delete notes (DELETE operations)
- Offline sync with Redis backend

### Lesson 14: Redis CRUD with React Native (Mobile Development)

**Building the project from scratch:**

- React Native CLI setup
- AsyncStorage configuration
- HTTP client with axios
- Navigation setup

**Redis Setup with Docker Compose:**

- React Native backend + Redis + Redis Insight
- WebSocket for real-time updates

**Core Content - Redis CRUD Operations:**

- **SET**: API calls to create data
- **GET**: Fetch data with refresh functionality
- **UPDATE**: Optimistic updates with rollback
- **DELETE**: Confirmation dialogs
- AsyncStorage caching
- Background sync with Redis

**Hands-on Activities:**

- React Native expense tracker from scratch
- Add expenses (SET operations)
- View expense history (GET operations)
- Edit expenses (UPDATE operations)
- Delete expenses (DELETE operations)
- Category management and reports

### Lesson 15: Redis CRUD with Docker and Kubernetes

**Building the project from scratch:**

- Multi-container application
- Dockerfile for CRUD operations
- Kubernetes manifests
- ConfigMaps for Redis connection

**Redis Setup with Docker Compose:**

- Production-grade Redis setup
- Redis Insight deployment
- Persistent volumes

**Core Content - Redis CRUD Operations:**

- **SET**: Distributed SET operations
- **GET**: Load-balanced GET operations
- **UPDATE**: Consistent UPDATE across replicas
- **DELETE**: Safe DELETE with backup
- Container orchestration
- Health checks for CRUD endpoints

**Hands-on Activities:**

- Containerized CRUD microservice from scratch
- Kubernetes deployment with Redis
- Auto-scaling based on CRUD load
- Monitoring CRUD operations
- Backup and restore procedures

### Lesson 16: Redis CRUD with GraphQL

**Building the project from scratch:**

- GraphQL server setup
- Schema design for CRUD operations
- Resolvers implementation
- DataLoader configuration

**Redis Setup with Docker Compose:**

- GraphQL server + Redis + Redis Insight
- GraphQL playground

**Core Content - Redis CRUD Operations:**

- **SET**: Mutation resolvers with Redis SET
- **GET**: Query resolvers with Redis GET
- **UPDATE**: Update mutations with validation
- **DELETE**: Delete mutations with cleanup
- Batch operations with DataLoader
- Subscription for real-time updates

**Hands-on Activities:**

- GraphQL library system from scratch
- addBook mutation (SET book data)
- books query (GET book list)
- updateBook mutation (UPDATE book info)
- deleteBook mutation (DELETE book)
- Real-time book availability

### Lesson 17: Redis CRUD with Microservices Architecture

**Building the project from scratch:**

- Multiple microservices design
- Service-to-service communication
- API gateway setup
- Event-driven architecture

**Redis Setup with Docker Compose:**

- Multi-service with shared Redis
- Service discovery
- Load balancer configuration

**Core Content - Redis CRUD Operations:**

- **SET**: Distributed data creation
- **GET**: Cross-service data retrieval
- **UPDATE**: Eventual consistency patterns
- **DELETE**: Cascading deletes across services
- Inter-service communication
- Data consistency strategies

**Hands-on Activities:**

- E-commerce microservices from scratch
- User service (user CRUD)
- Product service (product CRUD)
- Order service (order CRUD)
- Inventory service (stock CRUD)
- Service orchestration

### Lesson 18: Redis CRUD with ElasticSearch Integration

**Building the project from scratch:**

- ElasticSearch setup
- Redis-ES data synchronization
- Search API development
- Index management

**Redis Setup with Docker Compose:**

- ElasticSearch + Redis + Redis Insight
- Kibana for visualization

**Core Content - Redis CRUD Operations:**

- **SET**: Dual write to Redis and ES
- **GET**: Fast retrieval from Redis
- **UPDATE**: Sync updates across stores
- **DELETE**: Consistent deletion
- Search result caching
- Data pipeline patterns

**Hands-on Activities:**

- Search platform from scratch
- Index documents (SET operations)
- Search documents (GET operations)
- Update documents (UPDATE operations)
- Delete documents (DELETE operations)
- Analytics dashboard

### Lesson 19: Redis CRUD with Real-time Features

**Building the project from scratch:**

- WebSocket server setup
- Real-time event handling
- Client-side real-time updates
- Pub/Sub pattern implementation

**Redis Setup with Docker Compose:**

- WebSocket server + Redis + Redis Insight
- Multiple client connections

**Core Content - Redis CRUD Operations:**

- **SET**: Real-time data creation broadcasts
- **GET**: Live data updates
- **UPDATE**: Instant update notifications
- **DELETE**: Real-time deletion alerts
- Pub/Sub for real-time events
- WebSocket connection management

**Hands-on Activities:**

- Real-time collaboration tool from scratch
- Create documents (SET with broadcast)
- View documents (GET with live updates)
- Edit documents (UPDATE with sync)
- Delete documents (DELETE with notifications)
- Multi-user editing

### Lesson 20: Redis CRUD Performance Optimization

**Building the project from scratch:**

- Benchmarking setup
- Performance testing tools
- Optimization strategies
- Monitoring implementation

**Redis Setup with Docker Compose:**

- Redis cluster setup
- Performance monitoring stack
- Load testing environment

**Core Content - Redis CRUD Operations:**

- **SET**: Optimized SET operations (pipelines, batching)
- **GET**: Efficient GET patterns (connection pooling)
- **UPDATE**: Atomic UPDATE operations
- **DELETE**: Bulk DELETE strategies
- Memory optimization
- Connection pooling

**Hands-on Activities:**

- High-performance CRUD API from scratch
- Benchmark CRUD operations
- Optimize SET performance
- Optimize GET performance
- Memory usage optimization
- Load testing and tuning

### Lesson 21: Redis CRUD Production Best Practices

**Building the project from scratch:**

- Production architecture design
- Security implementation
- Backup strategies
- Monitoring setup

**Redis Setup with Docker Compose:**

- Production-ready configuration
- High availability setup
- Security hardening
- Complete monitoring

**Core Content - Redis CRUD Operations:**

- **SET**: Production SET with error handling
- **GET**: Reliable GET with fallbacks
- **UPDATE**: Safe UPDATE with validation
- **DELETE**: Secure DELETE with audit logs
- Data backup and recovery
- Security best practices

**Hands-on Activities:**

- Production CRUD system from scratch
- Security audit for CRUD operations
- Backup/restore procedures
- Performance monitoring
- Final project: Enterprise CRUD solution

## Summary of CRUD Operations in Redis

### Core Commands

- **CREATE/SET**: `SET key value`, `SETEX key seconds value`
- **READ/GET**: `GET key`, `MGET key1 key2`
- **UPDATE**: `SET key newValue` (overwrite), atomic operations
- **DELETE**: `DEL key`, `UNLINK key` (async delete)

### Advanced Patterns

- Conditional operations: `SET key value NX`, `SET key value XX`
- Atomic operations: `INCR`, `DECR`, `INCRBY`
- Batch operations: `MSET`, `MGET`, `PIPELINE`
- Expiration: `EXPIRE key seconds`, `TTL key`
