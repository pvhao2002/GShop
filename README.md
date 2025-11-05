# Full-Stack E-commerce Platform

A comprehensive e-commerce solution built with Spring Boot backend and React Native mobile applications for both customers and administrators.

## 🏗️ Architecture Overview

This platform consists of three main components:

```
┌─────────────────┐    ┌─────────────────┐
│   Customer App  │    │    Admin App    │
│  React Native   │    │  React Native   │
│     + Expo      │    │     + Expo      │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │  Backend API    │
          │  Spring Boot    │
          │    + MySQL      │
          └─────────────────┘
```

### Components

| Component | Technology | Purpose | Documentation |
|-----------|------------|---------|---------------|
| **Backend API** | Spring Boot + MySQL | REST API, Authentication, Business Logic | [Backend README](./backend/README.md) |
| **Customer App** | React Native + Expo | Mobile shopping experience | [Customer README](./customer/README.md) |
| **Admin App** | React Native + Expo | Administrative management | [Admin README](./admin/README.md) |

## 🚀 Quick Start

### Prerequisites

- **Java 22+** (for backend)
- **Node.js 16+** (for mobile apps)
- **MySQL 8.0+** (for database)
- **Expo CLI** (for mobile development)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Set up MySQL database
mysql -u root -p
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080/api`

### 2. Customer App Setup

```bash
# Navigate to customer app directory
cd customer

# Install dependencies
npm install

# Start development server
npx expo start
```

### 3. Admin App Setup

```bash
# Navigate to admin app directory
cd admin

# Install dependencies
npm install

# Start development server
npx expo start
```

## 📱 Features

### Customer App Features
- 🔐 **User Authentication** - Secure JWT-based login/registration
- 🛍️ **Product Browsing** - Search, filter, and browse products by category
- 🛒 **Shopping Cart** - Add/remove items, manage quantities
- 💳 **Multiple Payment Methods** - COD, MoMo, VNPay integration
- 📦 **Order Tracking** - Real-time order status updates
- 🔔 **Push Notifications** - Order updates and promotions
- 🌙 **Dark/Light Mode** - Automatic theme switching
- 👤 **Profile Management** - Update personal information and preferences

### Admin App Features
- 🔑 **Admin Authentication** - Role-based access control
- 📊 **Analytics Dashboard** - Sales metrics, trends, and insights
- 📦 **Product Management** - CRUD operations for products and categories
- 🛍️ **Order Management** - Process orders, update status, handle refunds
- 👥 **User Management** - Manage customer accounts and permissions
- 📈 **Statistics & Reports** - Interactive charts and data visualization
- 🔔 **Real-time Notifications** - Order alerts and system updates

### Backend API Features
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🏪 **Product Catalog** - Complete product and category management
- 🛒 **Order Processing** - Full order lifecycle management
- 💰 **Payment Integration** - Multiple payment gateway support
- 📊 **Analytics Engine** - Business intelligence and reporting
- 🔔 **Notification System** - Push notifications and alerts
- 📚 **API Documentation** - Comprehensive Swagger/OpenAPI docs

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 22
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **Documentation**: Swagger/OpenAPI
- **Build Tool**: Maven

### Mobile Apps
- **Framework**: React Native with Expo SDK 49+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit (Customer), Zustand (Admin)
- **UI Library**: Native Base
- **Charts**: Victory Native (Admin)
- **HTTP Client**: Axios

## 📚 API Documentation

The backend provides comprehensive REST API documentation:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/api-docs
- **Detailed Guide**: [API Documentation](./backend/API_DOCUMENTATION.md)

### Key API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | User authentication | No |
| `/api/auth/register` | POST | User registration | No |
| `/api/products` | GET | List products | No |
| `/api/products/{id}` | GET | Get product details | No |
| `/api/orders` | GET/POST | Order management | Yes |
| `/api/payment/*` | POST | Payment processing | Yes |
| `/api/statistics` | GET | Analytics data | Admin |

## 🔧 Configuration

### Environment Variables

Create `.env` files or set environment variables:

**Backend (`backend/src/main/resources/application.yml`)**:
```yaml
# Database
spring:
  datasource:
    username: ${DB_USERNAME:ecommerce_user}
    password: ${DB_PASSWORD:ecommerce_password}

# JWT
jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: ${JWT_EXPIRATION:86400000}

# Payment Gateways
momo:
  partner-code: ${MOMO_PARTNER_CODE}
  access-key: ${MOMO_ACCESS_KEY}
  secret-key: ${MOMO_SECRET_KEY}

vnpay:
  tmn-code: ${VNPAY_TMN_CODE}
  hash-secret: ${VNPAY_HASH_SECRET}
```

**Mobile Apps**:
Update API endpoints in respective `src/services/apiService.ts` files.

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Mobile App Testing
```bash
# Customer app
cd customer
npm test

# Admin app
cd admin
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
mvn clean package -Pprod
```

### Mobile Apps
```bash
# Install EAS CLI
npm install -g eas-cli

# Build customer app
cd customer
eas build --platform all

# Build admin app
cd admin
eas build --platform all
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
1. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `application.yml`
   - Ensure database `ecommerce_db` exists

2. **Port Already in Use**
   - Change port in `application.yml`: `server.port: 8081`
   - Or kill process using port 8080: `lsof -ti:8080 | xargs kill -9`

#### Mobile App Issues
1. **Metro Bundler Issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS Simulator Not Starting**
   - Ensure Xcode is installed
   - Try: `npx expo run:ios`

3. **Android Emulator Issues**
   - Check Android Studio setup
   - Try: `npx expo run:android`

4. **API Connection Failed**
   - Verify backend is running on correct port
   - Check API base URL configuration
   - For Android emulator, use `10.0.2.2` instead of `localhost`

#### Payment Gateway Issues
1. **MoMo Integration**
   - Verify partner code and keys
   - Check return/notify URLs are accessible
   - Test with MoMo sandbox environment first

2. **VNPay Integration**
   - Validate TMN code and hash secret
   - Ensure return URL is properly configured
   - Test with VNPay sandbox

### Debug Mode

Enable debug logging:

**Backend**:
```yaml
logging:
  level:
    com.ecommerce: DEBUG
    org.springframework.security: DEBUG
```

**Mobile Apps**:
```bash
npx expo start --dev-client
```

## 📖 Additional Documentation

### Component Documentation
- [Backend API Documentation](./backend/API_DOCUMENTATION.md)
- [JWT Authentication Guide](./backend/JWT_AUTHENTICATION.md)
- [Payment Integration Guide](./backend/PAYMENT_INTEGRATION.md)
- [Product Management Guide](./admin/PRODUCT_MANAGEMENT.md)

### Setup and Deployment
- [Comprehensive Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Production Deployment Guide](./DEPLOYMENT.md)
- [Backend Setup Guide](./backend/README.md)
- [Customer App Setup Guide](./customer/README.md)
- [Admin App Setup Guide](./admin/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Use TypeScript for all new mobile app code
- Follow REST API best practices for backend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review component-specific README files
3. Check API documentation for backend issues
4. Review Expo documentation for mobile app issues

## 🎯 Project Status

This is a complete full-stack e-commerce platform with the following implementation status:

- ✅ **Backend API**: Complete with all features
- ✅ **Customer Mobile App**: Complete with all features  
- ✅ **Admin Mobile App**: Complete with all features
- ✅ **Payment Integration**: MoMo, VNPay, and COD support
- ✅ **Authentication**: JWT-based security
- ✅ **Documentation**: Comprehensive API and setup docs

The platform is production-ready and includes all essential e-commerce functionality including product management, order processing, payment integration, and administrative tools.