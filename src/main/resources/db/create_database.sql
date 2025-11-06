-- Database Creation Script
-- Creates the ecommerce databases if they don't exist

-- Create main database
CREATE DATABASE IF NOT EXISTS ecommerce_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create development database
CREATE DATABASE IF NOT EXISTS ecommerce_db_dev 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create production database
CREATE DATABASE IF NOT EXISTS ecommerce_prod 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Grant privileges (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'root'@'localhost';
-- GRANT ALL PRIVILEGES ON ecommerce_db_dev.* TO 'root'@'localhost';
-- GRANT ALL PRIVILEGES ON ecommerce_prod.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;