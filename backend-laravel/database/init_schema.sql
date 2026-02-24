-- RTO Shield Database Schema (MySQL / PostgreSQL compatible)

-- 1. Users / Admins Table
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(20) DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `role` VARCHAR(50) DEFAULT 'Admin',
    `location` VARCHAR(255) DEFAULT NULL,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Customers Table (For Fraud & Risk)
CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `customer_uid` VARCHAR(100) NOT NULL UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `risk_level` ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    `is_blocked` BOOLEAN DEFAULT FALSE,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Couriers Table
CREATE TABLE `couriers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `north_share` DECIMAL(5,2) DEFAULT 0,
    `south_share` DECIMAL(5,2) DEFAULT 0,
    `east_share` DECIMAL(5,2) DEFAULT 0,
    `west_share` DECIMAL(5,2) DEFAULT 0,
    `overall_performance` DECIMAL(5,2) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Pincode Risks Table
CREATE TABLE `pincodes` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `pincode` VARCHAR(20) NOT NULL UNIQUE,
    `zone` VARCHAR(50) DEFAULT NULL,
    `rto_percentage` DECIMAL(5,2) DEFAULT 0,
    `risk_level` ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_id` VARCHAR(100) NOT NULL UNIQUE,
    `customer_id` BIGINT UNSIGNED DEFAULT NULL,
    `courier_id` BIGINT UNSIGNED DEFAULT NULL,
    `pincode_id` BIGINT UNSIGNED DEFAULT NULL,
    `payment_method` ENUM('COD', 'Prepaid') NOT NULL DEFAULT 'COD',
    `order_amount` DECIMAL(10,2) NOT NULL,
    `status` ENUM('Pending', 'In Transit', 'Delivered', 'RTO', 'Returned') DEFAULT 'Pending',
    `rto_loss_amount` DECIMAL(10,2) DEFAULT 0,
    `order_date` DATETIME NOT NULL,
    `delivery_date` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`courier_id`) REFERENCES `couriers`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`pincode_id`) REFERENCES `pincodes`(`id`) ON DELETE SET NULL
);

-- 6. Notifications Table
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `action_link` VARCHAR(255) DEFAULT '#',
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Insert Dummy Admin
INSERT INTO `users` (`first_name`, `last_name`, `email`, `role`, `location`, `password`) 
VALUES ('Sahil', 'Admin', 'admin@rtoshield.com', 'Team Manager', 'New Delhi, India', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert Dummy Customers
INSERT INTO `customers` (`customer_uid`, `name`, `phone`, `risk_level`, `is_blocked`) VALUES 
('21333-22322', 'Ajay Sharma', '9878542210', 'High', TRUE),
('47943-37221', 'Priya Malhotra', '8766432109', 'Medium', FALSE),
('65087-77908', 'Rahul Verma', '9988770655', 'High', FALSE);
