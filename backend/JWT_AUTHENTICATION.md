# JWT Authentication Implementation

This document describes the JWT authentication and security configuration implemented for the e-commerce backend.

## Overview

The authentication system uses JSON Web Tokens (JWT) for stateless authentication with role-based access control supporting `ROLE_USER` and `ROLE_ADMIN` roles.

## Components

### 1. JWT Token Provider (`JwtTokenProvider.java`)
- Generates and validates JWT tokens
- Supports both access tokens and refresh tokens
- Extracts user information from tokens
- Configurable token expiration times

### 2. User Principal (`UserPrincipal.java`)
- Implements Spring Security's `UserDetails` interface
- Represents authenticated user in security context
- Provides role-based authorization methods

### 3. User Details Service (`UserDetailsServiceImpl.java`)
- Loads user details for authentication
- Integrates with `UserRepository` for database access
- Supports loading users by email or ID

### 4. JWT Authentication Filter (`JwtAuthenticationFilter.java`)
- Processes JWT tokens from HTTP requests
- Sets authentication in security context
- Handles token validation and user loading

### 5. Security Configuration (`SecurityConfig.java`)
- Configures Spring Security with JWT authentication
- Defines role-based access control rules
- Sets up CORS and exception handling

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Test Endpoints
- `GET /api/test/public` - Public endpoint (no authentication)
- `GET /api/test/user` - Authenticated user endpoint
- `GET /api/test/admin` - Admin-only endpoint

## Security Rules

### Public Endpoints
- Authentication endpoints (`/api/auth/**`)
- API documentation (`/api-docs/**`, `/swagger-ui/**`)
- Health checks (`/actuator/health`, `/actuator/info`)
- Product browsing (`GET /api/products/**`, `GET /api/categories/**`)
- Payment webhooks (`POST /api/payment/*/notify`)

### Role-Based Access
- **ROLE_USER**: Can access user endpoints, create orders, manage profile
- **ROLE_ADMIN**: Full access including product management, user management, statistics

### Protected Endpoints
- Product management (POST, PUT, DELETE) - Admin only
- User management - Admin only
- Statistics and analytics - Admin only
- Order management - Users can access own orders, admins can access all

## Token Configuration

Tokens are configured in `application.yml`:

```yaml
jwt:
  secret: ${JWT_SECRET:mySecretKey123456789012345678901234567890}
  expiration: ${JWT_EXPIRATION:86400000} # 24 hours
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000} # 7 days
```

## Usage

### 1. Register a new user
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Use access token
Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### 4. Refresh token
```bash
POST /api/auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

## Security Utilities

The `SecurityUtils` class provides helper methods:
- `getCurrentUser()` - Get current authenticated user
- `getCurrentUserId()` - Get current user ID
- `isCurrentUserAdmin()` - Check if current user is admin
- `canAccessResource(userId)` - Check resource access permissions

## Error Handling

The system provides comprehensive error handling for:
- Invalid credentials
- Expired tokens
- Access denied scenarios
- Validation errors
- Authentication failures

All errors return standardized JSON responses with appropriate HTTP status codes.