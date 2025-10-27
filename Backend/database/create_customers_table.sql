-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS `Customers` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NULL,
  `address` TEXT NULL,
  `birth_date` DATE NULL,
  `customer_type` ENUM('Individual', 'Company', 'Group') NULL DEFAULT 'Individual',
  `notes` TEXT NULL,
  `avatar` VARCHAR(500) NULL,
  `personal_photo_url` VARCHAR(500) NULL,
  `national_id_number` VARCHAR(100) NULL,
  `national_id_image_url` VARCHAR(500) NULL,
  `join_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit` DATETIME NULL,
  `total_visits` INT NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_customer_type` (`customer_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول السيارات
CREATE TABLE IF NOT EXISTS `Cars` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` VARCHAR(36) NOT NULL,
  `plate` VARCHAR(20) NULL,
  `make` VARCHAR(100) NULL,
  `model` VARCHAR(100) NULL,
  `year` VARCHAR(10) NULL,
  `color` VARCHAR(50) NULL,
  `fuel_type` VARCHAR(50) NULL,
  `transmission` VARCHAR(50) NULL,
  `engine_size` VARCHAR(50) NULL,
  `vehicle_type` VARCHAR(50) NULL,
  `chassis_number` VARCHAR(50) NULL,
  `odometer_reading` INT NULL DEFAULT 0,
  `recommended_oil_quantity` DECIMAL(5,2) NULL DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`id`) ON DELETE CASCADE,
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_plate` (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول جهات الاتصال
CREATE TABLE IF NOT EXISTS `Contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `value` VARCHAR(200) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`id`) ON DELETE CASCADE,
  INDEX `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول الأقارب
CREATE TABLE IF NOT EXISTS `RelatedPersons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `relation` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`id`) ON DELETE CASCADE,
  INDEX `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
