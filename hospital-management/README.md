# Hospital Management Microservices

An enterprise-grade hospital management system built with **Java Spring Boot 3**, following **Clean Architecture** and **SOLID** principles. This project demonstrates high-scale microservices architecture with 60+ business use cases.

## 🏗️ Architecture

The project follows the **Clean Architecture** (Onion Architecture) pattern to ensure that the core business logic is independent of frameworks, UI, and databases.

### Layer Separation
- **Domain Layer**: Contains pure business entities and repository interfaces. No dependencies on external libraries.
- **Application Layer**: Contains Use Cases that orchestrate the business flow.
- **Infrastructure Layer**: Framework-specific implementations (Spring Data JPA, REST Controllers, Configuration).

### Microservices Ecosystem
| Service | Responsibility | Port |
|:---|:---|:---|
| **Discovery Server** | Service registration and discovery via Netflix Eureka. | `8761` |
| **API Gateway** | Central entry point with routing and load balancing. | `8080` |
| **Patient Service** | Manages patient profiles, insurance, and emergency data. | `8081` |
| **Clinical Service** | Manages doctors, departments, and medical records. | `TBD` |
| **Scheduling Service** | Handles appointments and availability logic. | `TBD` |
| **Billing Service** | Manages invoicing, payments, and discounts. | `TBD` |

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** (Environment Default)
- **Maven 3.9+**
- **PostgreSQL** (Running on port 5432)

### Running the System
1. **Start Discovery Server**:
   ```bash
   cd discovery-server && mvn spring-boot:run
   ```
2. **Start API Gateway**:
   ```bash
   cd api-gateway && mvn spring-boot:run
   ```
3. **Start Business Services**:
   ```bash
   cd patient-service && mvn spring-boot:run
   ```

---

## 📖 API Documentation

Each business microservice is integrated with **SpringDoc OpenAPI (Swagger)**.

- **Swagger UI**: `http://localhost:[service-port]/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:[service-port]/v3/api-docs`

### Key Endpoints (Gateway)
- **Register Patient**: `POST http://localhost:8080/api/v1/patients`
- **Get Patient**: `GET http://localhost:8080/api/v1/patients/{id}`

---

## 🛠️ Tech Stack & Patterns
- **Spring Boot 3.4**: Core framework.
- **Spring Cloud 2024**: Microservices orchestration (Eureka, Gateway).
- **Spring Data JPA**: Database abstraction.
- **MapStruct**: High-performance object mapping.
- **Lombok**: Boilerplate reduction.
- **SOLID Principles**: Strict adherence to SRP, OCP, LSP, ISP, and DIP.
- **Clean Architecture**: Domain-driven design with layer isolation.

---

## 🧪 Testing & Quality
- **Unit Tests**: Business logic tested in isolation using JUnit 5 and Mockito.
- **Integration Tests**: Web layer and JPA repository testing using `MockMvc`.
- **Stress Testing**: A bash-based load test script is provided in `stress-test.sh`.

## 📊 Monitoring & Debugging
- **Spring Boot Actuator**: Health, Metrics, and Env endpoints exposed at `/actuator`.
- **Micrometer/Prometheus**: Real-time metric export for visualization.
- **Swagger UI**: Interactive API documentation at `/swagger-ui.html`.

## ⚖️ Load Balancing
- **Spring Cloud Gateway**: Implements client-side load balancing via **Spring Cloud LoadBalancer** using the `lb://` protocol for internal service calls.
