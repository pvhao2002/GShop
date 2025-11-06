# Database Setup Guide

This directory contains database migration scripts and setup instructions for the E-commerce Backend API.

## Prerequisites

- MySQL 8.0 or higher
- Java 22
- Maven 3.6+

## Database Setup

### 1. Create Databases

Run the following script to create the required databases:

```sql
-- Connect to MySQL as root or admin user
mysql -u root -p

-- Run the database creation script
source src/main/resources/db/create_database.sql;
```

### 2. Configure Application Properties

Update the database connection settings in the appropriate properties file:

- **Development**: `src/main/resources/application-dev.properties`
- **Production**: `src/main/resources/application-prod.properties`
- **Testing**: `src/main/resources/application-test.properties`

### 3. Run Migrations

The application uses Flyway for database migrations. Migrations will run automatically when the application starts.

#### Migration Files

- `V1__Create_initial_schema.sql` - Creates all tables and basic indexes
- `V2__Insert_sample_data.sql` - Inserts sample data for development and testing
- `V3__Add_performance_indexes.sql` - Adds performance optimization indexes

## Database Schema

### Tables

1. **users** - User accounts and authentication
2. **categories** - Product categories with hierarchical support
3. **products** - Product catalog
4. **product_images** - Product image URLs
5. **product_variants** - Product variants (size, color, inventory)
6. **orders** - Customer orders
7. **order_items** - Order line items

### Indexes

The database includes optimized indexes for:
- User authentication and search
- Product search and filtering
- Order management and analytics
- Category hierarchy navigation
- Performance optimization for common queries

## Performance Optimizations

### Connection Pooling

- **Production**: 30 max connections, 10 minimum idle
- **Development**: 10 max connections, 2 minimum idle
- **Testing**: 5 max connections, 1 minimum idle

### Query Optimizations

- Fetch joins to prevent N+1 problems
- Composite indexes for common query patterns
- Batch processing for bulk operations
- Connection pooling with HikariCP

### JPA/Hibernate Settings

- Batch size: 25-50 (environment dependent)
- Order inserts and updates enabled
- Statistics generation (dev only)
- Open-in-view disabled for performance

## Sample Data

The `V2__Insert_sample_data.sql` migration includes:

- 1 admin user (admin@ecommerce.com / admin123)
- 3 sample customers
- 15 product categories
- 10 sample products with variants
- Sample orders and order items

### Default Admin Account

- **Email**: admin@ecommerce.com
- **Password**: admin123
- **Role**: ADMIN

### Sample Customer Accounts

- **Email**: john.doe@email.com / Password: user123
- **Email**: jane.smith@email.com / Password: user123
- **Email**: mike.wilson@email.com / Password: user123

## Environment Profiles

### Development (`dev`)
- Detailed SQL logging enabled
- Hibernate statistics enabled
- Smaller connection pool
- DDL auto-update enabled

### Production (`prod`)
- SQL logging disabled
- Larger connection pool
- DDL validation only
- Performance optimizations enabled

### Testing (`test`)
- H2 in-memory database
- Flyway disabled
- DDL create-drop
- Minimal connection pool

## Troubleshooting

### Common Issues

1. **Connection refused**: Check MySQL service is running
2. **Access denied**: Verify database credentials
3. **Schema not found**: Ensure database creation script was run
4. **Migration failed**: Check Flyway migration history table

### Useful Commands

```bash
# Check MySQL service status
sudo systemctl status mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use specific database
USE ecommerce_db;

# Show tables
SHOW TABLES;

# Check Flyway migration history
SELECT * FROM flyway_schema_history;
```

## Monitoring

### Connection Pool Monitoring

The application exposes connection pool metrics through Spring Boot Actuator:

- `/actuator/metrics/hikaricp.connections.active`
- `/actuator/metrics/hikaricp.connections.idle`
- `/actuator/metrics/hikaricp.connections.pending`

### Database Health Check

Health check endpoint: `/actuator/health/db`

## Backup and Recovery

### Backup Script Example

```bash
#!/bin/bash
# Backup production database
mysqldump -u root -p ecommerce_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Script Example

```bash
#!/bin/bash
# Restore from backup
mysql -u root -p ecommerce_prod < backup_file.sql
```