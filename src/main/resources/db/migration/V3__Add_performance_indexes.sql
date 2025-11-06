-- Performance Optimization Indexes
-- Version 3.0 - Additional indexes for query optimization

-- Composite indexes for common query patterns
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_active_created ON products(is_active, created_at);
CREATE INDEX idx_products_price_active ON products(price, is_active);

-- Order-related composite indexes
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_created_total ON orders(created_at, total);

-- Order items optimization
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- Product variants optimization
CREATE INDEX idx_variants_product_quantity ON product_variants(product_id, quantity);
CREATE INDEX idx_variants_product_size_color ON product_variants(product_id, size, color);

-- User activity indexes
CREATE INDEX idx_users_active_role ON users(is_active, role);
CREATE INDEX idx_users_created_role ON users(created_at, role);

-- Category hierarchy optimization
CREATE INDEX idx_categories_parent_name ON categories(parent_id, name);

-- Product images optimization (for faster image loading)
CREATE INDEX idx_product_images_product_url ON product_images(product_id, image_url(100));

-- Full-text search optimization (if not already exists)
-- Note: This is already created in V1, but adding here for completeness
-- ALTER TABLE products ADD FULLTEXT(name, description);

-- Statistics update for MySQL optimizer
ANALYZE TABLE users;
ANALYZE TABLE products;
ANALYZE TABLE categories;
ANALYZE TABLE product_variants;
ANALYZE TABLE orders;
ANALYZE TABLE order_items;
ANALYZE TABLE product_images;