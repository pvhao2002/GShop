-- Sample Data for E-commerce Database
-- Version 2.0 - Initial Sample Data

-- Insert sample categories
INSERT INTO categories (name, description, parent_id) VALUES
('Clothing', 'All clothing items', NULL),
('Men', 'Men''s clothing', 1),
('Women', 'Women''s clothing', 1),
('Accessories', 'Fashion accessories', NULL),
('Shoes', 'Footwear collection', NULL);

INSERT INTO categories (name, description, parent_id) VALUES
('T-Shirts', 'Casual t-shirts', 2),
('Shirts', 'Formal and casual shirts', 2),
('Pants', 'Trousers and jeans', 2),
('Dresses', 'Women''s dresses', 3),
('Tops', 'Women''s tops and blouses', 3),
('Skirts', 'Women''s skirts', 3),
('Bags', 'Handbags and backpacks', 4),
('Jewelry', 'Fashion jewelry', 4),
('Sneakers', 'Casual sneakers', 5),
('Formal Shoes', 'Dress shoes', 5);

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, phone, street, city, state, zip_code, country, role, is_active) VALUES
('admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin', 'User', '+84123456789', '123 Admin Street', 'Ho Chi Minh City', 'Ho Chi Minh', '70000', 'Vietnam', 'ADMIN', TRUE);

-- Insert sample users (password: user123)
INSERT INTO users (email, password, first_name, last_name, phone, street, city, state, zip_code, country, role, is_active) VALUES
('john.doe@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John', 'Doe', '+84987654321', '456 User Street', 'Hanoi', 'Hanoi', '10000', 'Vietnam', 'USER', TRUE),
('jane.smith@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Jane', 'Smith', '+84555123456', '789 Customer Ave', 'Da Nang', 'Da Nang', '50000', 'Vietnam', 'USER', TRUE),
('mike.wilson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Mike', 'Wilson', '+84333777888', '321 Buyer Blvd', 'Can Tho', 'Can Tho', '90000', 'Vietnam', 'USER', TRUE);

-- Insert sample products
INSERT INTO products (name, description, price, category_id, is_active) VALUES
('Classic White T-Shirt', 'Comfortable cotton t-shirt perfect for everyday wear', 25.99, 6, TRUE),
('Blue Denim Jeans', 'Premium quality denim jeans with modern fit', 79.99, 8, TRUE),
('Formal Business Shirt', 'Professional white dress shirt for business occasions', 45.99, 7, TRUE),
('Summer Floral Dress', 'Light and breezy dress perfect for summer days', 65.99, 9, TRUE),
('Casual Sneakers', 'Comfortable walking sneakers for daily activities', 89.99, 14, TRUE),
('Leather Handbag', 'Elegant leather handbag with multiple compartments', 129.99, 12, TRUE),
('Cotton Polo Shirt', 'Classic polo shirt in various colors', 35.99, 6, TRUE),
('Women''s Blazer', 'Professional blazer for office wear', 95.99, 10, TRUE),
('Running Shoes', 'High-performance running shoes with cushioning', 119.99, 14, TRUE),
('Silk Scarf', 'Luxurious silk scarf with elegant patterns', 39.99, 4, TRUE);

-- Insert product images
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://example.com/images/white-tshirt-1.jpg'),
(1, 'https://example.com/images/white-tshirt-2.jpg'),
(2, 'https://example.com/images/blue-jeans-1.jpg'),
(2, 'https://example.com/images/blue-jeans-2.jpg'),
(3, 'https://example.com/images/business-shirt-1.jpg'),
(4, 'https://example.com/images/floral-dress-1.jpg'),
(4, 'https://example.com/images/floral-dress-2.jpg'),
(5, 'https://example.com/images/sneakers-1.jpg'),
(6, 'https://example.com/images/handbag-1.jpg'),
(7, 'https://example.com/images/polo-shirt-1.jpg'),
(8, 'https://example.com/images/blazer-1.jpg'),
(9, 'https://example.com/images/running-shoes-1.jpg'),
(10, 'https://example.com/images/silk-scarf-1.jpg');

-- Insert product variants
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price) VALUES
-- White T-Shirt variants
(1, 'S', 'White', '#FFFFFF', 50, 0.00),
(1, 'M', 'White', '#FFFFFF', 75, 0.00),
(1, 'L', 'White', '#FFFFFF', 60, 0.00),
(1, 'XL', 'White', '#FFFFFF', 40, 2.00),
(1, 'S', 'Black', '#000000', 45, 0.00),
(1, 'M', 'Black', '#000000', 70, 0.00),
(1, 'L', 'Black', '#000000', 55, 0.00),

-- Blue Jeans variants
(2, '28', 'Blue', '#4169E1', 30, 0.00),
(2, '30', 'Blue', '#4169E1', 45, 0.00),
(2, '32', 'Blue', '#4169E1', 50, 0.00),
(2, '34', 'Blue', '#4169E1', 40, 0.00),
(2, '36', 'Blue', '#4169E1', 25, 0.00),

-- Business Shirt variants
(3, 'S', 'White', '#FFFFFF', 35, 0.00),
(3, 'M', 'White', '#FFFFFF', 50, 0.00),
(3, 'L', 'White', '#FFFFFF', 45, 0.00),
(3, 'XL', 'White', '#FFFFFF', 30, 3.00),
(3, 'S', 'Light Blue', '#ADD8E6', 25, 5.00),
(3, 'M', 'Light Blue', '#ADD8E6', 40, 5.00),

-- Summer Dress variants
(4, 'XS', 'Floral', '#FF69B4', 20, 0.00),
(4, 'S', 'Floral', '#FF69B4', 35, 0.00),
(4, 'M', 'Floral', '#FF69B4', 40, 0.00),
(4, 'L', 'Floral', '#FF69B4', 30, 0.00),

-- Sneakers variants
(5, '7', 'White', '#FFFFFF', 25, 0.00),
(5, '8', 'White', '#FFFFFF', 30, 0.00),
(5, '9', 'White', '#FFFFFF', 35, 0.00),
(5, '10', 'White', '#FFFFFF', 30, 0.00),
(5, '11', 'White', '#FFFFFF', 20, 0.00),
(5, '8', 'Black', '#000000', 25, 0.00),
(5, '9', 'Black', '#000000', 30, 0.00),
(5, '10', 'Black', '#000000', 25, 0.00),

-- Handbag variants
(6, 'One Size', 'Brown', '#8B4513', 15, 0.00),
(6, 'One Size', 'Black', '#000000', 20, 0.00),
(6, 'One Size', 'Tan', '#D2B48C', 12, 10.00),

-- Polo Shirt variants
(7, 'S', 'Navy', '#000080', 40, 0.00),
(7, 'M', 'Navy', '#000080', 55, 0.00),
(7, 'L', 'Navy', '#000080', 50, 0.00),
(7, 'S', 'Red', '#FF0000', 35, 0.00),
(7, 'M', 'Red', '#FF0000', 45, 0.00),

-- Women's Blazer variants
(8, 'XS', 'Black', '#000000', 15, 0.00),
(8, 'S', 'Black', '#000000', 25, 0.00),
(8, 'M', 'Black', '#000000', 30, 0.00),
(8, 'L', 'Black', '#000000', 20, 0.00),
(8, 'S', 'Navy', '#000080', 20, 5.00),
(8, 'M', 'Navy', '#000080', 25, 5.00),

-- Running Shoes variants
(9, '7', 'Blue', '#0000FF', 20, 0.00),
(9, '8', 'Blue', '#0000FF', 25, 0.00),
(9, '9', 'Blue', '#0000FF', 30, 0.00),
(9, '10', 'Blue', '#0000FF', 25, 0.00),
(9, '11', 'Blue', '#0000FF', 15, 0.00),

-- Silk Scarf variants
(10, 'One Size', 'Multicolor', '#FF69B4', 25, 0.00),
(10, 'One Size', 'Blue Pattern', '#4169E1', 20, 0.00),
(10, 'One Size', 'Red Pattern', '#FF0000', 18, 5.00);

-- Insert sample orders
INSERT INTO orders (user_id, shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country, payment_method, status, subtotal, tax, shipping, total) VALUES
(2, '456 User Street', 'Hanoi', 'Hanoi', '10000', 'Vietnam', 'VNPAY', 'DELIVERED', 105.98, 10.60, 15.00, 131.58),
(3, '789 Customer Ave', 'Da Nang', 'Da Nang', '50000', 'Vietnam', 'MOMO', 'SHIPPED', 65.99, 6.60, 12.00, 84.59),
(4, '321 Buyer Blvd', 'Can Tho', 'Can Tho', '90000', 'Vietnam', 'COD', 'PROCESSING', 209.97, 21.00, 20.00, 250.97);

-- Insert order items
INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price) VALUES
-- Order 1 items
(1, 1, 2, 2, 25.99, 51.98),
(1, 5, 22, 1, 89.99, 89.99),

-- Order 2 items
(2, 4, 17, 1, 65.99, 65.99),

-- Order 3 items
(3, 2, 10, 1, 79.99, 79.99),
(3, 6, 26, 1, 129.99, 129.99);