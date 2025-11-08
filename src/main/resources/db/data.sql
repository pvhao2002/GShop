INSERT INTO users (id, city, country, state, street, zip_code, created_at, email, first_name, is_active, last_name,
                       password, phone, role, updated_at)
VALUES (1, '', '', '', '', '', '2025-11-06 14:50:31.368018', 'admin@gmail.com', '(ADMIN)', true, 'Quản trị viên',
        '$2a$12$c5sR8NaMlfY3OQB6rfy4Ne8gaELAqOQFG07JQFm9Sdpc6HtpE4TPu', '', 'ADMIN', '2025-11-06 14:50:31.368046');
INSERT INTO categories (id, description, name) VALUES (1, '', 'Quần');
INSERT INTO categories (id, description, name) VALUES (2, '', 'Áo');
INSERT INTO categories (id, description, name) VALUES (3, '', 'Giày dép');
INSERT INTO categories (id, description, name) VALUES (4, '', 'Áo khoác');
INSERT INTO categories (id, description, name) VALUES (5, '', 'Mũ');

-- =============================
-- 📦 PRODUCTS
-- =============================
INSERT INTO products (id, name, description, price, is_active, category_id, created_at, updated_at)
VALUES
    (1, 'Quần jeans nam xanh', 'Chất liệu denim bền đẹp, phong cách cổ điển.', 350000, 1, 1, NOW(), NOW()),
    (2, 'Quần kaki nữ be', 'Thoáng mát, dễ phối đồ cho mùa hè.', 420000, 1, 1, NOW(), NOW()),
    (3, 'Quần short nam thể thao', 'Dáng ngắn, co giãn thoải mái cho vận động.', 250000, 1, 1, NOW(), NOW()),
    (4, 'Quần jogger unisex', 'Phong cách streetwear hiện đại.', 390000, 1, 1, NOW(), NOW()),

    (5, 'Áo thun nam basic trắng', 'Áo cotton 100%, phù hợp mặc hằng ngày.', 180000, 1, 2, NOW(), NOW()),
    (6, 'Áo sơ mi nữ caro', 'Chất liệu mịn, dễ ủi, phù hợp công sở.', 290000, 1, 2, NOW(), NOW()),
    (7, 'Áo polo nam cổ bẻ', 'Thời trang và lịch lãm.', 320000, 1, 2, NOW(), NOW()),
    (8, 'Áo croptop nữ', 'Thiết kế trẻ trung, tôn dáng.', 250000, 1, 2, NOW(), NOW()),

    (9, 'Giày sneaker trắng', 'Mẫu giày quốc dân dễ phối với mọi outfit.', 550000, 1, 3, NOW(), NOW()),
    (10, 'Giày boot da nữ', 'Phong cách sang trọng, hợp mùa đông.', 850000, 1, 3, NOW(), NOW()),
    (11, 'Dép sandal nam', 'Thoáng mát, đế êm ái.', 220000, 1, 3, NOW(), NOW()),
    (12, 'Giày thể thao chạy bộ', 'Trọng lượng nhẹ, hỗ trợ vận động.', 690000, 1, 3, NOW(), NOW()),

    (13, 'Áo khoác jean xanh', 'Phong cách trẻ trung, cá tính.', 600000, 1, 4, NOW(), NOW()),
    (14, 'Áo khoác hoodie nỉ', 'Giữ ấm tốt, phù hợp mùa lạnh.', 480000, 1, 4, NOW(), NOW()),
    (15, 'Áo khoác bomber đen', 'Dáng ôm, cá tính và hiện đại.', 520000, 1, 4, NOW(), NOW()),
    (16, 'Áo khoác da nam', 'Sang trọng, lịch lãm.', 950000, 1, 4, NOW(), NOW()),

    (17, 'Mũ lưỡi trai basic', 'Thiết kế đơn giản, dễ phối đồ.', 150000, 1, 5, NOW(), NOW()),
    (18, 'Mũ bucket thời trang', 'Phong cách Hàn Quốc, trẻ trung.', 210000, 1, 5, NOW(), NOW()),
    (19, 'Mũ len mùa đông', 'Giữ ấm, mềm mại, co giãn tốt.', 180000, 1, 5, NOW(), NOW()),
    (20, 'Mũ beanie unisex', 'Màu trung tính, dễ phối đồ.', 200000, 1, 5, NOW(), NOW());

-- =============================
-- 🧩 PRODUCT VARIANTS
-- =============================
-- Quần jeans nam xanh
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (1, 'M', 'Xanh đậm', '#1E3A8A', 30, 0),
    (1, 'L', 'Xanh nhạt', '#3B82F6', 20, 10000),
    (1, 'XL', 'Đen', '#111827', 10, 15000);

-- Quần kaki nữ be
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (2, 'S', 'Be sáng', '#F5F5DC', 15, 0),
    (2, 'M', 'Be đậm', '#E4D5A7', 10, 5000);

-- Áo thun nam basic trắng
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (5, 'S', 'Trắng', '#FFFFFF', 40, 0),
    (5, 'M', 'Đen', '#000000', 25, 0),
    (5, 'L', 'Xám', '#9CA3AF', 20, 5000);

-- Giày sneaker trắng
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (9, '40', 'Trắng', '#FFFFFF', 12, 0),
    (9, '41', 'Xanh navy', '#1E3A8A', 8, 20000),
    (9, '42', 'Đen', '#111827', 10, 20000);

-- Áo khoác jean xanh
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (13, 'M', 'Xanh jean', '#3B82F6', 10, 0),
    (13, 'L', 'Xanh đậm', '#1E40AF', 8, 10000);

-- Áo khoác da nam
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (16, 'L', 'Đen', '#000000', 6, 0),
    (16, 'XL', 'Nâu', '#78350F', 5, 20000);

-- Mũ bucket
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (18, 'Free', 'Be', '#E4D5A7', 15, 0),
    (18, 'Free', 'Đen', '#000000', 15, 0);

-- Giày thể thao chạy bộ
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (12, '40', 'Xám', '#9CA3AF', 8, 0),
    (12, '41', 'Xanh dương', '#2563EB', 5, 20000),
    (12, '42', 'Đen', '#111827', 6, 20000);

-- Áo khoác hoodie nỉ
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (14, 'S', 'Xám nhạt', '#D1D5DB', 12, 0),
    (14, 'M', 'Đen', '#111827', 10, 5000),
    (14, 'L', 'Be', '#E5E7EB', 8, 5000);

-- Mũ len mùa đông
INSERT INTO product_variants (product_id, size, color, color_hex, quantity, additional_price)
VALUES
    (19, 'Free', 'Nâu', '#92400E', 12, 0),
    (19, 'Free', 'Xám', '#6B7280', 10, 0);