# Implementation Plan

- [x] 1. Set up Spring Boot project structure and dependencies
  - Create Maven project with Spring Boot 3.3.x and Java 22
  - Add dependencies for Spring Web, Spring Security, Spring Data JPA, MySQL, JWT, Lombok, and Validation
  - Configure application.properties with database connection and JWT settings
  - Set up main application class with proper annotations
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Implement core data models and JPA entities
  - [x] 2.1 Create User entity with JPA annotations
    - Implement User entity with all fields, relationships, and Lombok annotations
    - Create Address embeddable class for user addresses
    - Define Role enum for user roles (USER, ADMIN)
    - Add proper JPA annotations for table mapping and constraints
    - _Requirements: 1.1, 2.2, 7.4, 9.4_

  - [x] 2.2 Create Product and Category entities
    - Implement Product entity with name, description, price, and images
    - Create Category entity with hierarchical structure support
    - Build ProductVariant entity for size, color, and inventory management
    - Set up proper JPA relationships between entities
    - _Requirements: 3.3, 4.4, 9.4_

  - [x] 2.3 Create Order and OrderItem entities
    - Implement Order entity with user relationship and shipping address
    - Create OrderItem entity linking orders to products and variants
    - Define OrderStatus and PaymentMethod enums
    - Add proper JPA annotations and relationships
    - _Requirements: 5.1, 5.2, 6.2, 9.4_

- [x] 3. Set up Spring Data JPA repositories
  - [x] 3.1 Create repository interfaces for all entities
    - Implement UserRepository with custom query methods for email lookup
    - Create ProductRepository with search and category filtering methods
    - Build OrderRepository with user-specific and admin query methods
    - Add CategoryRepository for category management operations
    - _Requirements: 3.1, 4.1, 5.4, 7.1_

  - [x] 3.2 Add custom repository methods and queries
    - Implement product search by name with case-insensitive matching
    - Create order filtering by status, date, and user
    - Add user search and filtering capabilities for admin
    - Build dashboard metrics calculation queries
    - _Requirements: 3.2, 6.1, 6.3, 7.3_

- [x] 4. Implement JWT authentication and security
  - [x] 4.1 Create JWT utility class and configuration
    - Implement JwtUtil class for token generation, validation, and parsing
    - Create JWT authentication entry point for handling unauthorized access
    - Build JWT request filter for token validation on each request
    - Configure JWT secret and expiration properties
    - _Requirements: 1.2, 1.3, 10.2_

  - [x] 4.2 Set up Spring Security configuration
    - Configure SecurityFilterChain with proper endpoint permissions
    - Set up CORS configuration for mobile app access
    - Implement role-based authorization for admin endpoints
    - Add password encoder bean with BCrypt
    - _Requirements: 2.1, 2.2, 2.3, 12.2_

  - [x] 4.3 Create UserDetailsService implementation
    - Implement custom UserDetailsService for loading user by email
    - Create UserPrincipal class implementing UserDetails interface
    - Add proper authority mapping for roles
    - _Requirements: 1.2, 2.1_

- [-] 5. Build authentication service and controller
  - [x] 5.1 Implement AuthService with core authentication logic
    - Create user registration with password encryption and validation
    - Implement login authentication with JWT token generation
    - Add token refresh functionality for session management
    - Build forgot password and reset password functionality
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 5.2 Create AuthController with REST endpoints
    - Build POST /api/auth/register endpoint with validation
    - Implement POST /api/auth/login endpoint with authentication
    - Add POST /api/auth/refresh endpoint for token refresh
    - Create forgot password and reset password endpoints
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 6. Implement product management service and controller
  - [x] 6.1 Create ProductService with business logic
    - Implement product retrieval with pagination and filtering
    - Add product search functionality by name
    - Create category management operations
    - Build product detail retrieval with variants
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.2 Build ProductController with public endpoints
    - Create GET /api/products endpoint with pagination and filtering
    - Implement GET /api/products/{id} for product details
    - Add GET /api/products/search for product search
    - Build GET /api/products/categories for category listing
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Add admin product management functionality
    - Implement product creation with image upload support
    - Add product update functionality with validation
    - Create product deletion with proper error handling
    - Build inventory management for product variants
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Create order processing service and controller
  - [x] 7.1 Implement OrderService with order management logic
    - Create order creation with item validation and total calculation
    - Add user order history retrieval with pagination
    - Implement order detail retrieval with security checks
    - Build order cancellation functionality for users
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [x] 7.2 Build OrderController with user endpoints
    - Create POST /api/orders endpoint for order creation
    - Implement GET /api/orders/my-orders for user order history
    - Add GET /api/orders/{id} for order detail retrieval
    - Build POST /api/orders/{id}/cancel for order cancellation
    - _Requirements: 5.1, 5.4, 5.5_

  - [x] 7.3 Add payment method integration structure
    - Create payment method enum and validation
    - Implement payment processing interface for future gateway integration
    - Add order status tracking and updates
    - _Requirements: 5.3_

- [x] 8. Build admin management functionality
  - [x] 8.1 Create AdminController with order management
    - Implement GET /api/admin/orders for all orders retrieval
    - Add PUT /api/admin/orders/{id}/status for status updates
    - Create order filtering by status and date
    - Build order analytics and metrics calculation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 Add admin user management endpoints
    - Create GET /api/admin/users for user listing with pagination
    - Implement PUT /api/admin/users/{id}/status for account management
    - Add user search and filtering capabilities
    - Build user activity monitoring endpoints
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 8.3 Implement admin dashboard with analytics
    - Create GET /api/admin/dashboard endpoint for metrics
    - Calculate total orders, revenue, users, and products
    - Add time-based analytics and reporting
    - Build dashboard data aggregation logic
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 9. Create user profile management
  - [x] 9.1 Implement UserService with profile operations
    - Add user profile retrieval functionality
    - Create profile update with validation and security checks
    - Implement password change with current password verification
    - Build user activity logging and audit trail
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 9.2 Build UserController with profile endpoints
    - Create GET /api/users/profile for profile retrieval
    - Implement PUT /api/users/profile for profile updates
    - Add PUT /api/users/change-password for password changes
    - Build user-specific endpoints with proper authorization
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 10. Implement global error handling and validation
  - [x] 10.1 Create global exception handler
    - Implement @RestControllerAdvice for centralized error handling
    - Add specific exception handlers for validation, not found, and unauthorized errors
    - Create consistent error response format with proper HTTP status codes
    - Build logging for all exceptions and security events
    - _Requirements: 10.3, 10.4_

  - [x] 10.2 Add request/response DTOs with validation
    - Create request DTOs for all endpoints with Bean Validation annotations
    - Implement response DTOs for consistent API responses
    - Add custom validation annotations where needed
    - Build DTO mapping utilities or use MapStruct
    - _Requirements: 11.5, 12.1_

- [x] 11. Set up logging and monitoring
  - [x] 11.1 Configure structured logging with Lombok
    - Add @Slf4j annotations to all service and controller classes
    - Implement request/response logging for API monitoring
    - Create security event logging for authentication and authorization
    - Configure log levels and output formats
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 11.2 Add application monitoring and health checks
    - Configure Spring Boot Actuator for health monitoring
    - Add custom health indicators for database and external services
    - Implement application metrics and performance monitoring
    - _Requirements: 10.5_

- [x] 12. Database setup and configuration
  - [x] 12.1 Create database schema and migrations
    - Set up MySQL database connection configuration
    - Create database initialization scripts
    - Add sample data for testing and development
    - Configure JPA properties for optimal performance
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 12.2 Optimize database queries and indexing
    - Add proper database indexes for search and filtering operations
    - Optimize JPA queries to prevent N+1 problems
    - Configure connection pooling and transaction management
    - _Requirements: 9.1, 9.3_

- [x] 13. API documentation and CORS configuration
  - [x] 13.1 Configure CORS for mobile app integration
    - Set up CORS configuration for cross-origin requests
    - Configure allowed origins, methods, and headers
    - Test CORS configuration with mobile app requirements
    - _Requirements: 12.2_

  - [x] 13.2 Add API versioning and response formatting
    - Implement consistent API versioning strategy
    - Create standardized response wrapper for all endpoints
    - Add pagination support for list endpoints
    - Configure request/response compression
    - _Requirements: 12.1, 12.3, 12.4, 12.5_

- [ ]* 14. Testing implementation
  - [ ]* 14.1 Write unit tests for services and repositories
    - Create unit tests for AuthService with mocked dependencies
    - Write tests for ProductService and OrderService business logic
    - Add repository tests using @DataJpaTest with H2 database
    - Test JWT utility methods and security configurations
    - _Requirements: All requirements_

  - [ ]* 14.2 Create integration tests for API endpoints
    - Write integration tests for authentication endpoints
    - Create tests for product and order management APIs
    - Add admin endpoint testing with role-based access
    - Use TestContainers for realistic database testing
    - _Requirements: All requirements_

- [ ] 15. Final configuration and deployment preparation
  - [ ] 15.1 Environment configuration and profiles
    - Set up different application profiles (dev, test, prod)
    - Configure environment-specific properties
    - Add configuration for external services and secrets management
    - Create Docker configuration for containerized deployment
    - _Requirements: 11.1, 11.3_

  - [ ] 15.2 Performance optimization and security hardening
    - Optimize application startup time and memory usage
    - Add security headers and HTTPS configuration
    - Implement rate limiting and request throttling
    - Configure production-ready logging and monitoring
    - _Requirements: 10.5, 12.4_