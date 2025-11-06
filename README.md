# E-commerce Backend API

A Spring Boot REST API backend system that serves an e-commerce clothing mobile application built with Expo SDK 54.

## Features

- JWT-based authentication and authorization
- Role-based access control (USER/ADMIN)
- Product and category management
- Order processing and management
- User profile management
- Admin dashboard with analytics
- MySQL database integration
- Comprehensive error handling and validation

## Technology Stack

- **Java**: 22
- **Spring Boot**: 3.3.x
- **Database**: MySQL 8.x
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Code Reduction**: Lombok
- **Validation**: Bean Validation (Hibernate Validator)
- **Testing**: JUnit 5, Mockito, TestContainers

## Prerequisites

- Java 22 or higher
- Maven 3.6 or higher
- MySQL 8.x
- IDE with Lombok plugin support

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-backend-api
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE ecommerce_db;
CREATE DATABASE ecommerce_dev;
CREATE DATABASE ecommerce_test;
```

### 3. Configuration

Update the database configuration in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Build and Run

```bash
# Build the project
mvn clean compile

# Run tests
mvn test

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

Once the application is running, you can access:

- Health Check: `http://localhost:8080/actuator/health`
- Application Info: `http://localhost:8080/actuator/info`

## Project Structure

```
src/
├── main/
│   ├── java/com/ecommerce/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entity/         # JPA entities
│   │   ├── exception/      # Custom exceptions
│   │   ├── repository/     # Spring Data repositories
│   │   ├── security/       # Security configurations
│   │   ├── service/        # Business logic services
│   │   └── util/           # Utility classes
│   └── resources/
│       ├── application.properties
│       ├── application-dev.properties
│       ├── application-test.properties
│       └── application-prod.properties
└── test/
    └── java/com/ecommerce/  # Test classes
```

## Environment Profiles

- **default**: Basic configuration
- **dev**: Development environment with detailed logging
- **test**: Test environment with H2 in-memory database
- **prod**: Production environment with security optimizations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.