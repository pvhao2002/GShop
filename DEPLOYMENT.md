# Deployment Guide

This guide covers deployment strategies for the full-stack e-commerce platform across different environments.

## Table of Contents

- [Overview](#overview)
- [Backend Deployment](#backend-deployment)
- [Mobile App Deployment](#mobile-app-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Overview

The platform consists of three deployable components:

1. **Backend API** - Spring Boot application (JAR/Docker)
2. **Customer Mobile App** - React Native app (iOS/Android)
3. **Admin Mobile App** - React Native app (iOS/Android)

## Backend Deployment

### Local Development

```bash
# Clone and setup
git clone <repository-url>
cd backend

# Configure database
mysql -u root -p
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';

# Run application
mvn spring-boot:run
```

### Production JAR Deployment

#### 1. Build Production JAR

```bash
# Build with production profile
mvn clean package -Pprod

# JAR will be created at target/ecommerce-backend-1.0.0.jar
```

#### 2. Server Setup

```bash
# Create application user
sudo useradd -r -s /bin/false ecommerce
sudo mkdir /opt/ecommerce
sudo chown ecommerce:ecommerce /opt/ecommerce

# Copy JAR file
sudo cp target/ecommerce-backend-1.0.0.jar /opt/ecommerce/
sudo chown ecommerce:ecommerce /opt/ecommerce/ecommerce-backend-1.0.0.jar
```

#### 3. Systemd Service Configuration

```bash
# Create service file
sudo nano /etc/systemd/system/ecommerce-backend.service
```

```ini
[Unit]
Description=E-commerce Backend API
After=network.target mysql.service

[Service]
Type=simple
User=ecommerce
Group=ecommerce
WorkingDirectory=/opt/ecommerce
ExecStart=/usr/bin/java -jar ecommerce-backend-1.0.0.jar
Restart=always
RestartSec=10

# Environment variables
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=DB_USERNAME=ecommerce_user
Environment=DB_PASSWORD=your_secure_password
Environment=JWT_SECRET=your_jwt_secret_256_bits_minimum
Environment=MOMO_PARTNER_CODE=your_momo_partner_code
Environment=MOMO_ACCESS_KEY=your_momo_access_key
Environment=MOMO_SECRET_KEY=your_momo_secret_key
Environment=VNPAY_TMN_CODE=your_vnpay_tmn_code
Environment=VNPAY_HASH_SECRET=your_vnpay_hash_secret

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/ecommerce/logs

[Install]
WantedBy=multi-user.target
```

#### 4. Start and Enable Service

```bash
# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable ecommerce-backend
sudo systemctl start ecommerce-backend

# Check status
sudo systemctl status ecommerce-backend

# View logs
sudo journalctl -u ecommerce-backend -f
```

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Multi-stage build
FROM openjdk:22-jdk-slim as builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build application
RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:22-jre-slim

# Create app user
RUN groupadd -r ecommerce && useradd -r -g ecommerce ecommerce

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/ecommerce-backend-*.jar app.jar

# Change ownership
RUN chown ecommerce:ecommerce app.jar

# Switch to app user
USER ecommerce

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 2. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ecommerce-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: ecommerce_db
      MYSQL_USER: ecommerce_user
      MYSQL_PASSWORD: ecommerce_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - ecommerce-network
    restart: unless-stopped

  backend:
    build: .
    container_name: ecommerce-backend
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USERNAME: ecommerce_user
      DB_PASSWORD: ecommerce_password
      JWT_SECRET: ${JWT_SECRET}
      MOMO_PARTNER_CODE: ${MOMO_PARTNER_CODE}
      MOMO_ACCESS_KEY: ${MOMO_ACCESS_KEY}
      MOMO_SECRET_KEY: ${MOMO_SECRET_KEY}
      VNPAY_TMN_CODE: ${VNPAY_TMN_CODE}
      VNPAY_HASH_SECRET: ${VNPAY_HASH_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - ecommerce-network
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    container_name: ecommerce-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - ecommerce-network
    restart: unless-stopped

volumes:
  mysql_data:

networks:
  ecommerce-network:
    driver: bridge
```

#### 3. Environment Variables File

```bash
# .env file
JWT_SECRET=your_256_bit_jwt_secret_key_here
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
```

#### 4. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Scale backend if needed
docker-compose up -d --scale backend=3

# Stop services
docker-compose down
```

### Kubernetes Deployment

#### 1. Create Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecommerce-config
  namespace: ecommerce
data:
  SPRING_PROFILES_ACTIVE: "prod"
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  DB_NAME: "ecommerce_db"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecommerce-secrets
  namespace: ecommerce
type: Opaque
stringData:
  DB_USERNAME: "ecommerce_user"
  DB_PASSWORD: "your_secure_password"
  JWT_SECRET: "your_256_bit_jwt_secret"
  MOMO_PARTNER_CODE: "your_momo_partner_code"
  MOMO_ACCESS_KEY: "your_momo_access_key"
  MOMO_SECRET_KEY: "your_momo_secret_key"
  VNPAY_TMN_CODE: "your_vnpay_tmn_code"
  VNPAY_HASH_SECRET: "your_vnpay_hash_secret"

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecommerce-backend
  namespace: ecommerce
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecommerce-backend
  template:
    metadata:
      labels:
        app: ecommerce-backend
    spec:
      containers:
      - name: backend
        image: ecommerce-backend:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: ecommerce-config
        - secretRef:
            name: ecommerce-secrets
        livenessProbe:
          httpGet:
            path: /api/actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ecommerce-backend-service
  namespace: ecommerce
spec:
  selector:
    app: ecommerce-backend
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecommerce-ingress
  namespace: ecommerce
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: ecommerce-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ecommerce-backend-service
            port:
              number: 80
```

#### 2. Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
kubectl get ingress -n ecommerce

# View logs
kubectl logs -f deployment/ecommerce-backend -n ecommerce

# Scale deployment
kubectl scale deployment ecommerce-backend --replicas=5 -n ecommerce
```

## Mobile App Deployment

### Expo Application Services (EAS)

#### 1. Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS in your project
cd customer  # or admin
eas build:configure
```

#### 2. Configure Build Profiles

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "API_URL": "http://localhost:8080/api"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_URL": "https://staging-api.yourdomain.com/api"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://api.yourdomain.com/api"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### 3. Build and Deploy

```bash
# Build for development
eas build --profile development --platform all

# Build for production
eas build --profile production --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Manual Build Process

#### iOS Deployment

```bash
# Prerequisites
# - Xcode installed
# - iOS Developer account
# - Provisioning profiles configured

# Build for iOS
cd customer  # or admin
npx expo run:ios --configuration Release

# Archive and upload to App Store Connect
# Use Xcode Organizer or Application Loader
```

#### Android Deployment

```bash
# Build APK for testing
cd customer  # or admin
npx expo build:android --type apk

# Build AAB for Play Store
npx expo build:android --type app-bundle

# Sign the APK/AAB
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore app-release-unsigned.apk alias_name

# Align the APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## Database Setup

### Production MySQL Configuration

#### 1. Install and Configure MySQL

```bash
# Install MySQL 8.0
sudo apt update
sudo apt install mysql-server-8.0

# Secure installation
sudo mysql_secure_installation

# Configure MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

```ini
[mysqld]
# Basic settings
bind-address = 0.0.0.0
port = 3306
max_connections = 200
max_allowed_packet = 64M

# InnoDB settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Logging
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Binary logging for replication
server-id = 1
log-bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7
```

#### 2. Create Database and User

```sql
-- Connect as root
mysql -u root -p

-- Create database
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'ecommerce_user'@'%' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'%';

-- Create read-only user for reporting
CREATE USER 'ecommerce_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON ecommerce_db.* TO 'ecommerce_readonly'@'%';

FLUSH PRIVILEGES;
```

#### 3. Database Backup Strategy

```bash
# Create backup script
sudo nano /opt/backup/mysql-backup.sh
```

```bash
#!/bin/bash

# Configuration
DB_NAME="ecommerce_db"
DB_USER="ecommerce_user"
DB_PASS="your_password"
BACKUP_DIR="/opt/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  $DB_NAME > $BACKUP_DIR/ecommerce_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/ecommerce_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ecommerce_backup_$DATE.sql.gz"
```

```bash
# Make script executable
sudo chmod +x /opt/backup/mysql-backup.sh

# Add to crontab for daily backups
sudo crontab -e
# Add line: 0 2 * * * /opt/backup/mysql-backup.sh
```

### Database Replication Setup

#### Master Configuration

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog_format = ROW
binlog_do_db = ecommerce_db
```

```sql
-- Create replication user
CREATE USER 'replication_user'@'%' IDENTIFIED BY 'replication_password';
GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'%';
FLUSH PRIVILEGES;

-- Get master status
SHOW MASTER STATUS;
```

#### Slave Configuration

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
server-id = 2
relay-log = mysql-relay-bin
read_only = 1
```

```sql
-- Configure slave
CHANGE MASTER TO
  MASTER_HOST='master_ip_address',
  MASTER_USER='replication_user',
  MASTER_PASSWORD='replication_password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

-- Start replication
START SLAVE;

-- Check status
SHOW SLAVE STATUS\G
```

## Environment Configuration

### Production Environment Variables

#### Backend Environment Variables

```bash
# /etc/environment or systemd service file
SPRING_PROFILES_ACTIVE=prod
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USERNAME=ecommerce_user
DB_PASSWORD=secure_password_here

# JWT Configuration
JWT_SECRET=your_256_bit_secret_key_minimum_32_characters
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# MoMo Payment Gateway
MOMO_PARTNER_CODE=your_production_partner_code
MOMO_ACCESS_KEY=your_production_access_key
MOMO_SECRET_KEY=your_production_secret_key
MOMO_ENDPOINT=https://payment.momo.vn
MOMO_RETURN_URL=https://yourapp.com/payment/momo/return
MOMO_NOTIFY_URL=https://api.yourdomain.com/api/payment/momo/notify

# VNPay Payment Gateway
VNPAY_TMN_CODE=your_production_tmn_code
VNPAY_HASH_SECRET=your_production_hash_secret
VNPAY_URL=https://pay.vnpay.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourapp.com/payment/vnpay/return

# Redis Configuration (if using)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# File Upload Configuration
UPLOAD_DIR=/opt/ecommerce/uploads
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

### SSL/TLS Configuration

#### Nginx SSL Configuration

```nginx
# /etc/nginx/sites-available/ecommerce
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy Configuration
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Static file serving
    location /uploads/ {
        alias /opt/ecommerce/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Let's Encrypt SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### Application Monitoring

#### Prometheus and Grafana Setup

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ecommerce-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/api/actuator/prometheus'
    scrape_interval: 5s
```

#### Log Management with ELK Stack

```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    container_name: logstash
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

### Health Checks and Alerts

#### Application Health Checks

```bash
# Health check script
#!/bin/bash

API_URL="https://api.yourdomain.com/api/actuator/health"
EXPECTED_STATUS="UP"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    health_status=$(curl -s $API_URL | jq -r '.status')
    if [ "$health_status" = "$EXPECTED_STATUS" ]; then
        echo "Application is healthy"
        exit 0
    else
        echo "Application health check failed: $health_status"
        exit 1
    fi
else
    echo "Application is not responding: HTTP $response"
    exit 1
fi
```

#### Database Health Monitoring

```sql
-- Database health check queries
SELECT 
    SCHEMA_NAME as 'Database',
    ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.SCHEMATA s
LEFT JOIN information_schema.TABLES t ON s.SCHEMA_NAME = t.TABLE_SCHEMA
WHERE s.SCHEMA_NAME = 'ecommerce_db'
GROUP BY s.SCHEMA_NAME;

-- Check for slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY query_time DESC
LIMIT 10;

-- Check connection usage
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
```

### Backup and Recovery

#### Automated Backup Strategy

```bash
#!/bin/bash
# /opt/backup/full-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backup/$DATE"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u ecommerce_user -p$DB_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  ecommerce_db > $BACKUP_DIR/database.sql

# Application files backup
tar -czf $BACKUP_DIR/uploads.tar.gz /opt/ecommerce/uploads/
tar -czf $BACKUP_DIR/logs.tar.gz /opt/ecommerce/logs/

# Configuration backup
cp /etc/systemd/system/ecommerce-backend.service $BACKUP_DIR/
cp /etc/nginx/sites-available/ecommerce $BACKUP_DIR/

# Compress entire backup
tar -czf /opt/backup/ecommerce_backup_$DATE.tar.gz -C /opt/backup $DATE
rm -rf $BACKUP_DIR

# Upload to cloud storage (optional)
# aws s3 cp /opt/backup/ecommerce_backup_$DATE.tar.gz s3://your-backup-bucket/

# Cleanup old backups (keep last 30 days)
find /opt/backup -name "ecommerce_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: ecommerce_backup_$DATE.tar.gz"
```

#### Disaster Recovery Plan

1. **Database Recovery**
   ```bash
   # Stop application
   sudo systemctl stop ecommerce-backend
   
   # Restore database
   mysql -u root -p ecommerce_db < backup/database.sql
   
   # Restore files
   tar -xzf backup/uploads.tar.gz -C /
   
   # Start application
   sudo systemctl start ecommerce-backend
   ```

2. **Application Recovery**
   ```bash
   # Restore configuration
   sudo cp backup/ecommerce-backend.service /etc/systemd/system/
   sudo cp backup/ecommerce /etc/nginx/sites-available/
   
   # Reload services
   sudo systemctl daemon-reload
   sudo systemctl reload nginx
   ```

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_products_category_active ON products(category_id, active);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Optimize table structure
OPTIMIZE TABLE products;
OPTIMIZE TABLE orders;
OPTIMIZE TABLE order_items;

-- Analyze table statistics
ANALYZE TABLE products;
ANALYZE TABLE orders;
```

#### Application Performance Tuning

```yaml
# application-prod.yml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
        batch_versioned_data: true
  
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    connection-timeout: 20000
    max-connections: 8192
    accept-count: 100
```

This deployment guide provides comprehensive instructions for deploying the full-stack e-commerce platform in various environments, from development to production. Follow the appropriate sections based on your deployment requirements and infrastructure setup.