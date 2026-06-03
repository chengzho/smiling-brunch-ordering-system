-- Use target database
USE restaurant_ordering_db;

-- Clear existing demo data
-- Use DELETE instead of TRUNCATE because foreign key constraints may block TRUNCATE
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM menu_items;
DELETE FROM categories;
DELETE FROM users;

-- Reset auto increment values
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE cart_items AUTO_INCREMENT = 1;
ALTER TABLE carts AUTO_INCREMENT = 1;
ALTER TABLE menu_items AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Demo users
-- Passwords:
-- admin@example.com / admin123
-- customer@example.com / user123
INSERT INTO users (user_id, name, email, password_hash, phone, role, status)
VALUES
(1, '系統管理員', 'admin@example.com', '$2y$12$DQck8q0FifWUg8s3CGJdBe52fyCtJQhcrh2aQeZfNGv2fp3Kz/p4u', '0900000000', 'admin', 'active'),
(2, '測試顧客', 'customer@example.com', '$2y$12$vPeS2vpnltbEzlK3l8e45.xMWED1bQ7wbu25G/gzxfRelHufMLOfi', '0912345678', 'customer', 'active');

-- Menu categories
INSERT INTO categories (category_id, category_name, description)
VALUES
(1, '吐司系列', '經典早餐吐司'),
(2, '蛋餅系列', '台式蛋餅餐點'),
(3, '點心', '小份點心與炸物'),
(4, '飲料', '早餐飲品'),
(5, '套餐', '套餐含飲料沙拉等');

-- Menu items
INSERT INTO menu_items (item_id, category_id, item_name, description, price, image_url, is_available)
VALUES
(1, 1, '總匯吐司', '吐司夾起司火腿跟肉片', 70.00, '/images/toast-club.jpg', 1),
(2, 1, '里肌蛋吐司', '吐司夾蛋夾里肌肉', 50.00, '/images/toast-pork-egg.jpg', 1),
(3, 1, '燻雞蛋吐司', '吐司夾蛋夾燻雞肉', 50.00, '/images/toast-chicken-egg.jpg', 1),

(4, 2, '總匯蛋餅', '蛋餅夾起司火腿跟肉片', 70.00, '/images/egg-pancake-club.jpg', 1),
(5, 2, '里肌蛋餅', '蛋餅夾里肌肉', 50.00, '/images/egg-pancake-pork.jpg', 1),
(6, 2, '燻雞蛋餅', '蛋餅夾燻雞肉', 50.00, '/images/egg-pancake-chicken.jpg', 1),

(7, 3, '蘿蔔糕', '外酥內嫩香煎蘿蔔糕', 35.00, '/images/radish-cake.jpg', 1),
(8, 3, '黃金脆薯', '酥脆薯條點心', 40.00, '/images/fries.jpg', 1),
(9, 3, '麥克雞塊', '外酥內嫩雞塊', 35.00, '/images/chicken-nuggets.jpg', 1),

(10, 4, '奶茶', '經典早餐奶茶', 25.00, '/images/milk-tea.jpg', 1),
(11, 4, '紅茶', '清爽紅茶', 20.00, '/images/black-tea.jpg', 1),
(12, 4, '豆漿', '傳統早餐豆漿', 20.00, '/images/soy-milk.jpg', 1),

(13, 5, '香草雞腿排餐', '香草雞腿排配可頌、沙拉和紅茶', 180.00, '/images/chicken-set.jpg', 1),
(14, 5, '里肌蛋吐司套餐', '里肌蛋吐司配脆薯和紅茶', 150.00, '/images/fish-burger-set.jpg', 1),
(15, 5, '法式吐司香腸套餐', '法式吐司配香腸、沙拉和紅茶', 150.00, '/images/ham-set.jpg', 1);

-- Create an empty cart for the demo customer
INSERT INTO carts (cart_id, user_id)
VALUES
(1, 2);

-- Demo orders for admin dashboard and order history
INSERT INTO orders (order_id, user_id, total_amount, order_status, order_time)
VALUES
(1, 2, 120.00, 'pending', '2026-05-01 09:15:00'),
(2, 2, 205.00, 'preparing', '2026-05-01 10:30:00'),
(3, 2, 120.00, 'completed', '2026-05-02 08:45:00'),
(4, 2, 70.00, 'cancelled', '2026-05-02 11:20:00');

-- Demo order details
INSERT INTO order_items (order_item_id, order_id, item_id, quantity, unit_price, subtotal)
VALUES
(1, 1, 1, 1, 70.00, 70.00),
(2, 1, 10, 2, 25.00, 50.00),

(3, 2, 13, 1, 180.00, 180.00),
(4, 2, 10, 1, 25.00, 25.00),

(5, 3, 2, 1, 50.00, 50.00),
(6, 3, 9, 1, 35.00, 35.00),
(7, 3, 7, 1, 35.00, 35.00),

(8, 4, 4, 1, 70.00, 70.00);