# E-commerce Backend API Documentation

## Overview

This document provides comprehensive information about the E-commerce Backend API, including authentication, endpoints, error handling, and usage examples.

## Base URL

- **Development:** `http://localhost:8080/api`
- **Production:** `https://api.ecommerce.com/api`

## Interactive Documentation

- **Swagger UI:** `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/api/api-docs`

## Authentication

### JWT Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting Started

1. **Register a new account:**
   ```bash
   POST /auth/register
   {
     "email": "user@example.com",
     "password": "SecurePass123",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890"
   }
   ```

2. **Login to get tokens:**
   ```bash
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "SecurePass123"
   }
   ```

3. **Use the access token for authenticated requests:**
   ```bash
   GET /users/profile
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Token Management

- **Access Token:** Valid for 24 hours
- **Refresh Token:** Valid for 7 days
- **Refresh endpoint:** `POST /auth/refresh`

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |

### Products (`/products`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/products` | Get all products (paginated) | No | No |
| GET | `/products/{id}` | Get product by ID | No | No |
| GET | `/products/search` | Search products | No | No |
| GET | `/products/category/{categoryId}` | Get products by category | No | No |
| GET | `/products/filter` | Filter products | No | No |
| POST | `/products` | Create new product | Yes | Yes |
| PUT | `/products/{id}` | Update product | Yes | Yes |
| DELETE | `/products/{id}` | Delete product | Yes | Yes |
| PUT | `/products/{id}/stock` | Update stock | Yes | Yes |
| GET | `/products/{id}/availability` | Check availability | No | No |

### Categories (`/categories`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/categories` | Get all categories | No | No |
| GET | `/categories/{id}` | Get category by ID | No | No |
| GET | `/categories/root` | Get root categories | No | No |
| GET | `/categories/{parentId}/children` | Get child categories | No | No |
| GET | `/categories/search` | Search categories | No | No |
| POST | `/categories` | Create category | Yes | Yes |
| PUT | `/categories/{id}` | Update category | Yes | Yes |
| DELETE | `/categories/{id}` | Delete category | Yes | Yes |

### Orders (`/orders`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/orders` | Create new order | Yes | No |
| GET | `/orders/my-orders` | Get user's orders | Yes | No |
| GET | `/orders` | Get all orders | Yes | Yes |
| GET | `/orders/{id}` | Get order by ID | Yes | No* |
| GET | `/orders/tracking/{trackingNumber}` | Get order by tracking | Yes | No* |
| PUT | `/orders/{id}/status` | Update order status | Yes | Yes |
| PUT | `/orders/{id}/cancel` | Cancel order | Yes | No* |

*Users can only access their own orders

### Payment (`/payment`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/payment/process` | Process payment | Yes | No |
| POST | `/payment/cod` | Process COD payment | Yes | No |
| POST | `/payment/momo` | Process MoMo payment | Yes | No |
| POST | `/payment/vnpay` | Process VNPay payment | Yes | No |
| GET | `/payment/status/{orderId}` | Get payment status | Yes | No |
| GET | `/payment/transaction/{transactionId}` | Get payment by transaction | Yes | No |
| POST | `/payment/cod/confirm/{orderId}` | Confirm COD payment | Yes | Yes |

### Users (`/users`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/users/profile` | Get current user profile | Yes | No |
| PUT | `/users/profile` | Update user profile | Yes | No |
| PUT | `/users/change-password` | Change password | Yes | No |
| GET | `/users/{userId}` | Get user by ID | Yes | Yes |
| PUT | `/users/{userId}/status` | Update user status | Yes | Yes |

### Statistics (`/statistics`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/statistics/dashboard` | Get dashboard stats | Yes | Yes |
| GET | `/statistics/sales` | Get sales analytics | Yes | Yes |
| GET | `/statistics/products` | Get product analytics | Yes | Yes |
| GET | `/statistics/users` | Get user analytics | Yes | Yes |
| GET | `/statistics/overview` | Get comprehensive overview | Yes | Yes |

### Images (`/images`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/images/{filename}` | Serve product image | No |

## Request/Response Format

### Standard Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Pagination Response

List endpoints return paginated responses:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "content": [
      // Array of items
    ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10,
    "first": true,
    "last": false
  }
}
```

### Error Response Format

Error responses include detailed information:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (for validation errors)
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing JWT token |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `ACCESS_DENIED` | 403 | Insufficient privileges |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `INSUFFICIENT_STOCK` | 409 | Not enough inventory |
| `PAYMENT_ERROR` | 400 | Payment processing failed |
| `INTERNAL_ERROR` | 500 | Server error |

## Usage Examples

### Complete Order Flow

1. **Browse Products:**
   ```bash
   GET /products?page=0&size=10&sortBy=name&sortDir=asc
   ```

2. **Get Product Details:**
   ```bash
   GET /products/1
   ```

3. **Create Order:**
   ```bash
   POST /orders
   Authorization: Bearer <token>
   {
     "orderItems": [
       {
         "productId": 1,
         "quantity": 2,
         "selectedSize": "M",
         "selectedColor": "Blue"
       }
     ],
     "shippingAddress": "123 Main St, City, State 12345",
     "paymentMethod": "COD",
     "notes": "Please deliver after 6 PM"
   }
   ```

4. **Process Payment:**
   ```bash
   POST /payment/process
   Authorization: Bearer <token>
   {
     "orderId": 1,
     "paymentMethod": "COD",
     "amount": 59.98
   }
   ```

5. **Track Order:**
   ```bash
   GET /orders/tracking/ORD-2024-001
   Authorization: Bearer <token>
   ```

### Admin Operations

1. **Create Product:**
   ```bash
   POST /products
   Authorization: Bearer <admin-token>
   {
     "name": "Premium Cotton T-Shirt",
     "description": "High-quality cotton t-shirt",
     "price": 29.99,
     "categoryId": 1,
     "stockQuantity": 100,
     "sizes": ["S", "M", "L", "XL"],
     "colors": ["White", "Black", "Navy"]
   }
   ```

2. **Update Order Status:**
   ```bash
   PUT /orders/1/status
   Authorization: Bearer <admin-token>
   {
     "status": "SHIPPED",
     "trackingNumber": "TRACK123456",
     "notes": "Package shipped via FedEx"
   }
   ```

3. **View Analytics:**
   ```bash
   GET /statistics/dashboard
   Authorization: Bearer <admin-token>
   ```

## Rate Limiting

- **General endpoints:** 100 requests per minute per IP
- **Authentication endpoints:** 10 requests per minute per IP
- **Admin endpoints:** 200 requests per minute per user

## Testing

### Using Swagger UI

1. Navigate to `http://localhost:8080/api/swagger-ui.html`
2. Click "Authorize" and enter your JWT token
3. Test endpoints directly from the interface

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token for authenticated requests
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer <your-token>"
```

### Using Postman

1. Import the OpenAPI specification from `/api-docs`
2. Set up environment variables for base URL and tokens
3. Use the pre-configured requests

## Support

For API support and questions:
- **Email:** support@ecommerce.com
- **Documentation:** [Swagger UI](http://localhost:8080/api/swagger-ui.html)
- **GitHub:** [Repository Issues](https://github.com/ecommerce-team/backend/issues)

## Changelog

### Version 1.0.0
- Initial API release
- JWT authentication
- Product catalog management
- Order processing
- Payment integration (COD, MoMo, VNPay)
- Admin analytics dashboard
- Comprehensive OpenAPI documentation