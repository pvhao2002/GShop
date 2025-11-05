# E-commerce Backend API

A Spring Boot REST API for a full-stack e-commerce platform.

## Technology Stack

- **Java 22**
- **Spring Boot 3.2.0**
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **MySQL 8** as primary database
- **Flyway** for database migrations
- **Swagger/OpenAPI** for API documentation
- **Maven** for dependency management

## Prerequisites

- Java 22 or higher
- Maven 3.6+
- MySQL 8.0+

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Update database configuration in `src/main/resources/application.yml` if needed.

## Environment Variables

Set the following environment variables for production:

```bash
# Database
DB_USERNAME=ecommerce_user
DB_PASSWORD=ecommerce_password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# MoMo Payment Gateway
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
MOMO_ENDPOINT=https://test-payment.momo.vn
MOMO_RETURN_URL=http://localhost:3000/payment/momo/return
MOMO_NOTIFY_URL=http://localhost:8080/api/payment/momo/notify

# VNPay Payment Gateway
VNPAY_TMN_CODE=your-vnpay-tmn-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay/return
```

## Running the Application

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

Or with a specific profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

4. The API will be available at `http://localhost:8080/api`

## API Documentation

The backend provides comprehensive RESTful APIs with full OpenAPI/Swagger documentation.

### 📚 Interactive Documentation

- **Swagger UI:** `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/api/api-docs`
- **Detailed Guide:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 🔑 Authentication

The API uses JWT (JSON Web Token) authentication:
```bash
# Get token
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Use token in requests
Authorization: Bearer <your-jwt-token>
```

### 📋 API Endpoints Overview

| Category | Base Path | Description | Auth Required |
|----------|-----------|-------------|---------------|
| **Authentication** | `/auth` | Login, register, token refresh | Varies |
| **Products** | `/products` | Product catalog management | Public/Admin |
| **Categories** | `/categories` | Product categories | Public/Admin |
| **Orders** | `/orders` | Order processing & tracking | User/Admin |
| **Payment** | `/payment` | Payment gateway integration | User/Admin |
| **Users** | `/users` | User profile management | User/Admin |
| **Statistics** | `/statistics` | Analytics & reporting | Admin Only |
| **Images** | `/images` | Static image serving | Public |

### 🚀 Quick API Testing

1. **Access Swagger UI:**
   ```
   http://localhost:8080/api/swagger-ui.html
   ```

2. **Test authentication:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

### 📖 Documentation Features

- **Comprehensive Coverage:** All endpoints with examples and schemas
- **Interactive Testing:** Try endpoints directly from Swagger UI
- **Authentication Integration:** Built-in JWT token management
- **Error Documentation:** Detailed error codes and responses
- **Request/Response Examples:** Real-world usage scenarios
- **API Grouping:** Organized by functionality (Public, User, Admin)

## Profiles

- **dev**: Development profile with debug logging and SQL logging enabled
- **prod**: Production profile with optimized logging and security settings

## Project Structure

```
backend/
├── src/main/java/com/ecommerce/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── dto/            # Data Transfer Objects
│   │   ├── request/    # Request DTOs
│   │   └── response/   # Response DTOs
│   ├── entity/         # JPA entities
│   ├── repository/     # Data repositories
│   ├── service/        # Business logic services
│   ├── security/       # Security components
│   └── util/           # Utility classes
├── src/main/resources/
│   ├── application.yml # Application configuration
│   └── db/migration/   # Flyway migration scripts
└── src/test/java/      # Test classes
```

## Building for Production

```bash
mvn clean package -Pprod
```

The JAR file will be created in the `target/` directory.

## Health Check

The application includes Spring Boot Actuator for monitoring:
- Health endpoint: http://localhost:8080/actuator/health
- Info endpoint: http://localhost:8080/actuator/info
- Metrics endpoint: http://localhost:8080/actuator/metrics

## Troubleshooting

### Common Issues

#### Database Connection Issues

1. **MySQL Connection Refused**
   ```bash
   # Check if MySQL is running
   sudo systemctl status mysql  # Linux
   brew services list | grep mysql  # macOS
   
   # Start MySQL if not running
   sudo systemctl start mysql  # Linux
   brew services start mysql  # macOS
   ```

2. **Access Denied for User**
   ```sql
   # Reset user permissions
   mysql -u root -p
   DROP USER IF EXISTS 'ecommerce_user'@'localhost';
   CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';
   GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Database Does Not Exist**
   ```sql
   # Create database if missing
   mysql -u root -p
   CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

#### Application Startup Issues

1. **Port 8080 Already in Use**
   ```bash
   # Find process using port 8080
   lsof -i :8080  # macOS/Linux
   netstat -ano | findstr :8080  # Windows
   
   # Kill the process or change port in application.yml
   server:
     port: 8081
   ```

2. **Java Version Issues**
   ```bash
   # Check Java version
   java -version
   
   # Should be Java 22 or higher
   # Update JAVA_HOME if needed
   export JAVA_HOME=/path/to/java22
   ```

3. **Maven Build Failures**
   ```bash
   # Clean and rebuild
   mvn clean
   mvn compile
   
   # Skip tests if needed
   mvn clean install -DskipTests
   ```

#### JWT Token Issues

1. **Invalid JWT Secret**
   - Ensure JWT_SECRET environment variable is set
   - Secret should be at least 256 bits (32 characters)
   - Use a strong, random secret in production

2. **Token Expiration**
   - Check JWT_EXPIRATION setting (default: 24 hours)
   - Implement token refresh in client applications
   - Monitor token expiration in logs

#### Payment Gateway Issues

1. **MoMo Integration Errors**
   ```bash
   # Test MoMo connectivity
   curl -X POST https://test-payment.momo.vn/v2/gateway/api/create \
     -H "Content-Type: application/json" \
     -d '{"partnerCode":"TEST","requestId":"test123"}'
   ```

2. **VNPay Integration Errors**
   - Verify TMN_CODE and HASH_SECRET
   - Check return URL accessibility
   - Validate request signature generation

#### Performance Issues

1. **Slow Database Queries**
   ```yaml
   # Enable SQL logging in application.yml
   logging:
     level:
       org.hibernate.SQL: DEBUG
       org.hibernate.type.descriptor.sql.BasicBinder: TRACE
   ```

2. **Memory Issues**
   ```bash
   # Increase JVM heap size
   java -Xmx2g -Xms1g -jar target/ecommerce-backend.jar
   ```

### Development Tips

1. **Hot Reload with Spring Boot DevTools**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-devtools</artifactId>
       <scope>runtime</scope>
   </dependency>
   ```

2. **Database Schema Updates**
   ```bash
   # Generate migration script
   mvn flyway:migrate
   
   # Validate migrations
   mvn flyway:validate
   ```

3. **API Testing with curl**
   ```bash
   # Test authentication
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   
   # Test protected endpoint
   curl -X GET http://localhost:8080/api/products \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Production Deployment

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM openjdk:22-jdk-slim
   COPY target/ecommerce-backend.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java","-jar","/app.jar"]
   ```

2. **Build and Run**
   ```bash
   # Build application
   mvn clean package -Pprod
   
   # Build Docker image
   docker build -t ecommerce-backend .
   
   # Run container
   docker run -p 8080:8080 \
     -e DB_USERNAME=ecommerce_user \
     -e DB_PASSWORD=ecommerce_password \
     -e JWT_SECRET=your-production-secret \
     ecommerce-backend
   ```

### Environment Configuration

**Production application.yml**:
```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce_db?useSSL=true&serverTimezone=UTC
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    com.ecommerce: INFO
    org.springframework.security: WARN
  file:
    name: logs/ecommerce-backend.log

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

### Security Checklist

- [ ] Use strong JWT secrets (256+ bits)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable SQL injection protection
- [ ] Configure secure headers
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] Secure payment gateway credentials

### Monitoring

1. **Application Metrics**
   - Use Spring Boot Actuator endpoints
   - Integrate with Prometheus/Grafana
   - Monitor response times and error rates

2. **Database Monitoring**
   - Monitor connection pool usage
   - Track slow queries
   - Set up alerts for connection failures

3. **Log Management**
   - Centralized logging with ELK stack
   - Structured logging with JSON format
   - Log rotation and retention policies