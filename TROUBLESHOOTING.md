# Troubleshooting Guide

This comprehensive guide covers common issues and solutions for the full-stack e-commerce platform.

## Table of Contents

- [Backend Issues](#backend-issues)
- [Customer App Issues](#customer-app-issues)
- [Admin App Issues](#admin-app-issues)
- [Database Issues](#database-issues)
- [Payment Gateway Issues](#payment-gateway-issues)
- [Development Environment Issues](#development-environment-issues)
- [Production Deployment Issues](#production-deployment-issues)

## Backend Issues

### Application Startup Problems

#### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in application.yml
server:
  port: 8081
```

#### Java Version Mismatch
```bash
# Check Java version
java -version

# Should show Java 22 or higher
# Set JAVA_HOME if needed
export JAVA_HOME=/path/to/java22  # macOS/Linux
set JAVA_HOME=C:\path\to\java22  # Windows
```

#### Maven Build Failures
```bash
# Clean and rebuild
mvn clean compile

# Skip tests if needed
mvn clean install -DskipTests

# Update dependencies
mvn dependency:resolve
```

### Database Connection Issues

#### MySQL Connection Refused
```bash
# Check MySQL status
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Start MySQL
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS
```

#### Access Denied Errors
```sql
-- Reset user permissions
mysql -u root -p
DROP USER IF EXISTS 'ecommerce_user'@'localhost';
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Database Schema Issues
```bash
# Run Flyway migrations
mvn flyway:migrate

# Validate migrations
mvn flyway:validate

# Reset database (development only)
mvn flyway:clean
mvn flyway:migrate
```

### JWT Authentication Problems

#### Invalid JWT Secret
- Ensure JWT_SECRET environment variable is set
- Secret must be at least 256 bits (32 characters)
- Use a cryptographically secure random string

```bash
# Generate secure JWT secret
openssl rand -base64 32
```

#### Token Expiration Issues
```yaml
# Adjust token expiration in application.yml
jwt:
  expiration: 86400000  # 24 hours in milliseconds
  refresh-expiration: 604800000  # 7 days
```

### API Performance Issues

#### Slow Database Queries
```yaml
# Enable SQL logging
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

#### Memory Issues
```bash
# Increase JVM heap size
java -Xmx2g -Xms1g -jar target/ecommerce-backend.jar

# Monitor memory usage
jstat -gc <PID>
```

## Customer App Issues

### Installation and Setup

#### Node.js Version Problems
```bash
# Check Node.js version (should be 16+)
node --version

# Use nvm for version management
nvm install 18
nvm use 18
```

#### Expo CLI Issues
```bash
# Install/update Expo CLI
npm install -g @expo/cli

# Clear Expo cache
npx expo install --fix
```

#### Dependency Installation Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try yarn if npm fails
yarn install
```

### Development Server Issues

#### Metro Bundler Problems
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro cache completely
npx expo start --reset-cache

# Start with tunnel (for network issues)
npx expo start --tunnel
```

#### Port Conflicts
```bash
# Start on different port
npx expo start --port 19001

# Check for port conflicts
lsof -i :19000  # Default Expo port
```

### Device Connection Issues

#### iOS Simulator Problems
```bash
# Install Xcode command line tools
xcode-select --install

# Open simulator manually
open -a Simulator

# Run directly on iOS
npx expo run:ios
```

#### Android Emulator Issues
```bash
# Check Android SDK setup
echo $ANDROID_HOME

# Start emulator manually
emulator -avd YOUR_AVD_NAME

# Run directly on Android
npx expo run:android

# For Windows users
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

#### Physical Device Connection
- Enable Developer Mode on device
- Install Expo Go app from app store
- Ensure device and computer on same WiFi network
- Try USB debugging for Android devices

### API Connection Issues

#### Network Request Failures
```typescript
// Check API configuration
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'ios' 
    ? 'http://localhost:8080/api'      // iOS Simulator
    : 'http://10.0.2.2:8080/api'      // Android Emulator
  : 'https://your-api.com/api';       // Production
```

#### CORS Issues
- Verify backend CORS configuration allows mobile app origins
- Check if backend is running on correct port
- Test API endpoints with Postman/curl first

#### Authentication Token Issues
```typescript
// Debug token storage
import * as SecureStore from 'expo-secure-store';

const debugToken = async () => {
  const token = await SecureStore.getItemAsync('authToken');
  console.log('Stored token:', token);
  
  if (token) {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token expires:', new Date(payload.exp * 1000));
  }
};
```

## Admin App Issues

### Chart Rendering Problems

#### Victory Native Issues
```bash
# Ensure Victory Native is properly installed
npm install victory-native

# For iOS, may need to run
cd ios && pod install
```

#### Chart Performance Issues
```typescript
// Optimize chart data
const optimizeChartData = (data) => {
  // Limit data points for better performance
  return data.slice(-50); // Last 50 points
};

// Use memo for expensive chart calculations
const ChartComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    optimizeChartData(data), [data]
  );
  
  return <VictoryChart data={processedData} />;
});
```

### State Management Issues

#### Zustand Store Problems
```typescript
// Debug store state
import { subscribeWithSelector } from 'zustand/middleware';

const useStore = create(
  subscribeWithSelector((set, get) => ({
    // Store implementation
  }))
);

// Subscribe to state changes for debugging
useStore.subscribe(
  (state) => state.user,
  (user) => console.log('User changed:', user)
);
```

#### Data Synchronization Issues
```typescript
// Implement retry logic for API calls
const apiWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Database Issues

### MySQL Configuration Problems

#### Character Set Issues
```sql
-- Set proper character set for Unicode support
ALTER DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Check current character set
SHOW VARIABLES LIKE 'character_set%';
```

#### Connection Pool Issues
```yaml
# Optimize connection pool in application.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

#### Performance Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_product_active ON products(active);

-- Analyze query performance
EXPLAIN SELECT * FROM products WHERE category_id = 1;
```

### Data Migration Issues

#### Flyway Migration Failures
```bash
# Check migration status
mvn flyway:info

# Repair failed migrations
mvn flyway:repair

# Baseline existing database
mvn flyway:baseline
```

#### Data Integrity Issues
```sql
-- Check for orphaned records
SELECT * FROM order_items oi 
LEFT JOIN orders o ON oi.order_id = o.id 
WHERE o.id IS NULL;

-- Fix foreign key constraints
ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_order 
FOREIGN KEY (order_id) REFERENCES orders(id) 
ON DELETE CASCADE;
```

## Payment Gateway Issues

### MoMo Integration Problems

#### Authentication Errors
```bash
# Test MoMo API connectivity
curl -X POST https://test-payment.momo.vn/v2/gateway/api/create \
  -H "Content-Type: application/json" \
  -d '{
    "partnerCode": "YOUR_PARTNER_CODE",
    "requestId": "test123",
    "amount": 10000,
    "orderId": "test_order_123",
    "orderInfo": "Test payment",
    "redirectUrl": "https://your-app.com/return",
    "ipnUrl": "https://your-api.com/momo/notify",
    "extraData": "",
    "requestType": "captureWallet",
    "signature": "CALCULATED_SIGNATURE"
  }'
```

#### Signature Generation Issues
```java
// Verify signature calculation
public String calculateSignature(String rawData, String secretKey) {
    try {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        return Hex.encodeHexString(sha256_HMAC.doFinal(rawData.getBytes()));
    } catch (Exception e) {
        throw new RuntimeException("Error calculating signature", e);
    }
}
```

### VNPay Integration Problems

#### Hash Validation Errors
```java
// Verify VNPay hash calculation
public String createSecureHash(Map<String, String> params, String hashSecret) {
    List<String> fieldNames = new ArrayList<>(params.keySet());
    Collections.sort(fieldNames);
    
    StringBuilder hashData = new StringBuilder();
    for (String fieldName : fieldNames) {
        String fieldValue = params.get(fieldName);
        if (fieldValue != null && !fieldValue.isEmpty()) {
            hashData.append(fieldName).append("=").append(fieldValue).append("&");
        }
    }
    
    if (hashData.length() > 0) {
        hashData.setLength(hashData.length() - 1); // Remove last &
    }
    
    return hmacSHA512(hashSecret, hashData.toString());
}
```

#### Return URL Issues
- Ensure return URLs are accessible from the internet
- Use HTTPS in production
- Validate URL encoding for special characters

## Development Environment Issues

### IDE and Editor Problems

#### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

#### ESLint and Prettier Conflicts
```json
// .eslintrc.js
module.exports = {
  extends: [
    '@expo/eslint-config',
    'prettier'
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

### Git and Version Control

#### Large File Issues
```bash
# Remove large files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large/file' \
  --prune-empty --tag-name-filter cat -- --all
```

#### Merge Conflicts in Package Files
```bash
# Reset package-lock.json and reinstall
git checkout HEAD -- package-lock.json
npm install
git add package-lock.json
```

## Production Deployment Issues

### Docker Deployment Problems

#### Container Build Failures
```dockerfile
# Multi-stage build for smaller images
FROM openjdk:22-jdk-slim as builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:22-jre-slim
COPY --from=builder /app/target/ecommerce-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### Container Networking Issues
```bash
# Check container connectivity
docker network ls
docker network inspect bridge

# Create custom network for multi-container setup
docker network create ecommerce-network
docker run --network ecommerce-network --name mysql mysql:8
docker run --network ecommerce-network --name backend ecommerce-backend
```

### SSL/HTTPS Configuration

#### Certificate Issues
```yaml
# Configure SSL in application.yml
server:
  port: 8443
  ssl:
    key-store: classpath:keystore.p12
    key-store-password: password
    key-store-type: PKCS12
    key-alias: ecommerce
```

#### Reverse Proxy Configuration (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Performance Issues in Production

#### Database Performance
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

#### Application Performance Monitoring
```yaml
# Enable actuator endpoints for monitoring
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
```

### Mobile App Store Issues

#### iOS App Store Rejection
- Ensure app follows Apple's Human Interface Guidelines
- Test on physical iOS devices
- Verify all required app metadata is provided
- Check for usage of private APIs

#### Android Play Store Issues
- Ensure target SDK version meets requirements
- Test on various Android devices and versions
- Verify app permissions are properly declared
- Check for security vulnerabilities

## Getting Help

### Log Analysis

#### Backend Logs
```bash
# View application logs
tail -f logs/ecommerce-backend.log

# Search for specific errors
grep -i "error" logs/ecommerce-backend.log

# Monitor real-time logs
journalctl -u ecommerce-backend -f
```

#### Mobile App Debugging
```bash
# View React Native logs
npx react-native log-ios    # iOS
npx react-native log-android  # Android

# Expo development tools
npx expo start --dev-client
```

### Community Resources

- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **React Native Documentation**: https://reactnative.dev/
- **Expo Documentation**: https://docs.expo.dev/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Stack Overflow**: Search for specific error messages
- **GitHub Issues**: Check project repositories for known issues

### Professional Support

For complex issues that cannot be resolved using this guide:

1. **Collect Diagnostic Information**:
   - Application logs
   - Error messages and stack traces
   - System configuration details
   - Steps to reproduce the issue

2. **Create Detailed Issue Reports**:
   - Environment details (OS, versions, etc.)
   - Expected vs actual behavior
   - Minimal reproduction case
   - Screenshots or videos if applicable

3. **Contact Support Channels**:
   - Project maintainers
   - Community forums
   - Professional support services
   - Consulting services for complex deployments

Remember to never share sensitive information like API keys, passwords, or personal data when seeking help from public forums or communities.