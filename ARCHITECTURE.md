# Architecture Guidelines & SOLID Principles

This document outlines the architectural patterns, SOLID principles, and clean code standards used across all projects in this repository.

## Table of Contents
- [SOLID Principles](#solid-principles)
- [Clean Architecture](#clean-architecture)
- [Folder Structure Standards](#folder-structure-standards)
- [Pattern Guidelines](#pattern-guidelines)
- [Framework-Specific Implementations](#framework-specific-implementations)

---

## SOLID Principles

### S - Single Responsibility Principle (SRP)
> A class should have only one reason to change.

**Example Implementation:**
```typescript
// ❌ Bad - Multiple responsibilities
class UserService {
  createUser(data: UserDTO) { /* ... */ }
  sendWelcomeEmail(user: User) { /* ... */ }
  generateReport(users: User[]) { /* ... */ }
}

// ✅ Good - Single responsibility
class UserService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
  ) {}
  
  createUser(data: UserDTO) { /* ... */ }
}

class EmailService implements IEmailService {
  sendWelcomeEmail(user: User) { /* ... */ }
}

class ReportService implements IReportService {
  generateReport(users: User[]) { /* ... */ }
}
```

**Projects demonstrating SRP:**
- [`react-s.o.l.i.d/src/principles/srp`](react-s.o.l.i.d/src/principles/srp)
- [`nodejs-s.o.l.i.d/src/services`](nodejs-s.o.l.i.d/src/services)
- [`nestjs-s.o.l.i.d/src/modules/SRP`](nestjs-s.o.l.i.d/src/modules/SRP)

---

### O - Open/Closed Principle (OCP)
> Software entities should be open for extension but closed for modification.

**Example Implementation:**
```typescript
// ❌ Bad - Requires modification for new exporters
class FileExporter {
  export(data: any, type: 'pdf' | 'excel') {
    if (type === 'pdf') { /* PDF logic */ }
    else if (type === 'excel') { /* Excel logic */ }
  }
}

// ✅ Good - Open for extension
interface IFileExporter {
  export(data: any): Promise<void>;
}

class PdfExporter implements IFileExporter {
  async export(data: any) { /* PDF logic */ }
}

class ExcelExporter implements IFileExporter {
  async export(data: any) { /* Excel logic */ }
}

// Adding new exporter doesn't modify existing code
class CsvExporter implements IFileExporter {
  async export(data: any) { /* CSV logic */ }
}
```

**Projects demonstrating OCP:**
- [`nodejs-s.o.l.i.d/src/classes/ExportHandler`](nodejs-s.o.l.i.d/src/classes/ExportHandler)
- [`react-s.o.l.i.d/src/principles/OCP`](react-s.o.l.i.d/src/principles/OCP)
- [`nestjs-s.o.l.i.d/src/modules/OCP`](nestjs-s.o.l.i.d/src/modules/OCP)

---

### L - Liskov Substitution Principle (LSP)
> Subtypes must be substitutable for their base types.

**Example Implementation:**
```typescript
// ❌ Bad - Subclass breaks parent contract
class Rectangle {
  setWidth(width: number) { this.width = width; }
  setHeight(height: number) { this.height = height; }
  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(width: number) { this.width = this.height = width; }
  setHeight(height: number) { this.width = this.height = height; }
}

// ✅ Good - Proper abstraction
interface IShape {
  getArea(): number;
}

class Rectangle implements IShape {
  constructor(private width: number, private height: number) {}
  getArea() { return this.width * this.height; }
}

class Square implements IShape {
  constructor(private side: number) {}
  getArea() { return this.side * this.side; }
}
```

**Projects demonstrating LSP:**
- [`react-s.o.l.i.d/src/principles/LSP`](react-s.o.l.i.d/src/principles/LSP)
- [`nestjs-s.o.l.i.d/src/modules/LSP`](nestjs-s.o.l.i.d/src/modules/LSP)

---

### I - Interface Segregation Principle (ISP)
> Clients should not be forced to depend on interfaces they don't use.

**Example Implementation:**
```typescript
// ❌ Bad - Fat interface
interface IWorker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// ✅ Good - Segregated interfaces
interface IWorkable {
  work(): void;
}

interface IFeedable {
  eat(): void;
}

interface ISleepable {
  sleep(): void;
}

class Human implements IWorkable, IFeedable, ISleepable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
}

class Robot implements IWorkable {
  work() { /* ... */ }
}
```

**Projects demonstrating ISP:**
- [`nodejs-s.o.l.i.d/src/interfaces`](nodejs-s.o.l.i.d/src/interfaces)
- [`react-s.o.l.i.d/src/principles/ISP`](react-s.o.l.i.d/src/principles/ISP)
- [`nestjs-s.o.l.i.d/src/modules/ISP`](nestjs-s.o.l.i.d/src/modules/ISP)

---

### D - Dependency Inversion Principle (DIP)
> High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Example Implementation:**
```typescript
// ❌ Bad - Direct dependency
class UserService {
  private database = new MySQLDatabase();
  
  getUser(id: string) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// ✅ Good - Depends on abstraction
interface IUserRepository {
  findById(id: string): Promise<User | null>;
}

class UserService {
  constructor(private userRepository: IUserRepository) {}
  
  getUser(id: string) {
    return this.userRepository.findById(id);
  }
}

// Implementations can be swapped
class MySQLUserRepository implements IUserRepository { /* ... */ }
class MongoUserRepository implements IUserRepository { /* ... */ }
class InMemoryUserRepository implements IUserRepository { /* ... */ }
```

**Projects demonstrating DIP:**
- [`API_s.o.l.i.d_TS/src/modules/cars/repositories`](API_s.o.l.i.d_TS/src/modules/cars/repositories)
- [`react-s.o.l.i.d/src/principles/DIP`](react-s.o.l.i.d/src/principles/DIP)
- [`nestjs-s.o.l.i.d/src/modules/DIP`](nestjs-s.o.l.i.d/src/modules/DIP)

---

## Clean Architecture

### Layer Separation

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  (Controllers, Routes, Views, Components)                    │
│  - HTTP request/response handling                           │
│  - Input validation                                         │
│  - UI components                                            │
├─────────────────────────────────────────────────────────────┤
│                     APPLICATION LAYER                        │
│  (Use Cases, Services)                                       │
│  - Business logic orchestration                             │
│  - Application-specific rules                               │
│  - Coordinate entities and external services                │
├─────────────────────────────────────────────────────────────┤
│                       DOMAIN LAYER                           │
│  (Entities, Domain Services, Interfaces)                     │
│  - Core business entities                                   │
│  - Business rules and validations                           │
│  - Repository interfaces (not implementations)              │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                      │
│  (Repositories, External Services, Database)                 │
│  - Repository implementations                               │
│  - ORM entities and migrations                              │
│  - External API clients                                     │
│  - Database connections                                     │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule
Dependencies point inward. Inner layers know nothing about outer layers.

**Projects demonstrating Clean Architecture:**
- [`rn_clean_architecture`](rn_clean_architecture/) - Full implementation with domain/data/presentation layers
- [`vue3-clean-architecture`](vue3-clean-architecture/) - Vue 3 implementation
- [`nuxt-clean-architecture`](nuxt-clean-architecture/) - Nuxt.js implementation

---

## Folder Structure Standards

### Backend Projects (TypeScript/Node.js)

```
src/
├── modules/                          # Feature modules
│   └── [feature]/                    # e.g., users, cars, rentals
│       ├── domain/                   # Business logic (optional if simple)
│       │   └── entities/             # Domain entities
│       ├── dtos/                     # Data Transfer Objects
│       │   ├── ICreate[Entity]DTO.ts
│       │   └── IUpdate[Entity]DTO.ts
│       ├── repositories/             # Repository interfaces
│       │   ├── I[Entity]Repository.ts
│       │   └── in-memory/            # Test implementations
│       │       └── [Entity]RepositoryInMemory.ts
│       ├── useCases/                 # Business operations
│       │   └── create[Entity]/
│       │       ├── Create[Entity]Controller.ts
│       │       ├── Create[Entity]UseCase.ts
│       │       └── Create[Entity]UseCase.spec.ts
│       └── infra/                    # Infrastructure implementations
│           └── typeorm/
│               ├── entities/
│               └── repositories/
├── shared/                           # Cross-cutting concerns
│   ├── container/                    # Dependency injection setup
│   │   └── index.ts
│   ├── errors/                       # Custom error classes
│   │   └── AppError.ts
│   ├── helpers/                      # Utility functions
│   └── middlewares/                  # Express/HTTP middlewares
└── main.ts                           # Application entry point
```

### Frontend Projects (React/Vue/Angular)

```
src/
├── domain/                           # Core business logic
│   ├── entities/                     # Business entities
│   └── repositories/                 # Repository interfaces
│       └── I[Entity]Repository.ts
├── data/                             # Data layer
│   ├── repositories/                 # Repository implementations
│   │   └── [Entity]Repository.ts
│   └── datasources/                  # API clients, local storage
│       └── api/
├── presentation/                     # UI layer
│   ├── components/                   # Reusable UI components
│   ├── pages/                        # Page components
│   ├── hooks/                        # Custom hooks (React)
│   └── stores/                       # State management
├── di/                               # Dependency injection
│   └── container.ts
└── main.tsx                          # Application entry point
```

---

## Pattern Guidelines

### Repository Pattern

**Interface Definition:**
```typescript
// repositories/IUserRepository.ts
export interface IUserRepository {
  create(data: ICreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: IUpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**In-Memory Implementation (for testing):**
```typescript
// repositories/in-memory/UserRepositoryInMemory.ts
export class UserRepositoryInMemory implements IUserRepository {
  private users: User[] = [];

  async create(data: ICreateUserDTO): Promise<User> {
    const user = new User({ ...data, id: uuid() });
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }
  
  // ... other methods
}
```

**Database Implementation:**
```typescript
// infra/typeorm/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  constructor(private repository: Repository<UserEntity>) {}

  async create(data: ICreateUserDTO): Promise<User> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }
  
  // ... other methods
}
```

### Use Case Pattern

```typescript
// useCases/createUser/CreateUserUseCase.ts
@injectable()
export class CreateUserUseCase {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("EmailService") private emailService: IEmailService,
  ) {}

  async execute(data: ICreateUserDTO): Promise<User> {
    // 1. Validate business rules
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // 2. Create entity
    const user = await this.userRepository.create(data);

    // 3. Side effects
    await this.emailService.sendWelcomeEmail(user);

    return user;
  }
}
```

### Dependency Injection Container

```typescript
// shared/container/index.ts
import { container } from "tsyringe";

// Register repositories
container.registerSingleton<IUserRepository>(
  "UserRepository",
  UserRepository
);

container.registerSingleton<IEmailService>(
  "EmailService",
  EmailService
);

export { container };
```

### Error Handling

```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Usage
throw new AppError("User not found", 404);
throw new AppError("Invalid input", 400);
throw new AppError("Unauthorized", 401);
```

---

## Framework-Specific Implementations

### React Implementation

**Repository with Context-based DI:**
```typescript
// di/ServicesContext.tsx
interface Services {
  userRepository: IUserRepository;
  productRepository: IProductRepository;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const services: Services = useMemo(() => ({
    userRepository: new UserRepository(),
    productRepository: new ProductRepository(),
  }), []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): Services {
  const context = useContext(ServicesContext);
  if (!context) throw new Error("Services not initialized");
  return context;
}
```

**Custom Hook with Repository:**
```typescript
// hooks/useUsers.ts
export function useUsers() {
  const { userRepository } = useServices();
  
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userRepository.findAll(),
  });
}
```

### Vue 3 Implementation

**Composable Repository:**
```typescript
// composables/useUserRepository.ts
export function useUserRepository(): IUserRepository {
  const api = useApi();
  
  return {
    async findAll() {
      const { data } = await api.get('/users');
      return data;
    },
    async findById(id: string) {
      const { data } = await api.get(`/users/${id}`);
      return data;
    },
    // ... other methods
  };
}
```

### Angular Implementation

**Repository Service:**
```typescript
// services/user.repository.ts
@Injectable({ providedIn: 'root' })
export class UserRepository implements IUserRepository {
  constructor(private http: HttpClient) {}

  findAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  findById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

### NestJS Implementation

**Module with DI:**
```typescript
// users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## Best Practices Checklist

### Code Organization
- [ ] Each module has its own folder
- [ ] Interfaces are defined separately from implementations
- [ ] In-memory implementations exist for testing
- [ ] DTOs are used for input/output contracts
- [ ] Use cases encapsulate single business operations

### Dependency Injection
- [ ] All dependencies are injected, not instantiated
- [ ] DI container is properly configured
- [ ] Mock implementations can be easily swapped

### Testing
- [ ] Unit tests use in-memory repositories
- [ ] Integration tests use real databases
- [ ] Each use case has corresponding tests

### Error Handling
- [ ] Custom error classes are used
- [ ] Errors include proper status codes
- [ ] Error middleware handles all exceptions

---

## Reference Projects

| Category | Best Example | Description |
|----------|--------------|-------------|
| **Backend API** | [`API_s.o.l.i.d_TS`](API_s.o.l.i.d_TS/) | Complete implementation with DI, use cases, repositories |
| **NestJS** | [`nestjs-s.o.l.i.d`](nestjs-s.o.l.i.d/) | Enterprise patterns with NestJS |
| **Node.js** | [`nodejs-s.o.l.i.d`](nodejs-s.o.l.i.d/) | Express with interfaces and handlers |
| **React Native** | [`rn_clean_architecture`](rn_clean_architecture/) | Clean architecture on mobile |
| **Vue 3** | [`vue3-clean-architecture`](vue3-clean-architecture/) | Vue with composition API |
| **Nuxt** | [`nuxt-clean-architecture`](nuxt-clean-architecture/) | Layered architecture in Nuxt |

---

## Additional Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- [Domain-Driven Design](https://dddcommunity.org/learning-ddd/what_is_ddd/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
