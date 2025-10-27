-- إنشاء جداول المصروفات وفئات المصروفات
-- تم إنشاؤه في: 2024-01-15
-- الوصف: جداول إدارة المصروفات وفئاتها

-- إنشاء جدول فئات المصروفات
CREATE TABLE IF NOT EXISTS `ExpenseCategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `color` varchar(50) NOT NULL DEFAULT 'bg-blue-100 text-blue-800',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `orderIndex` int(11) NOT NULL DEFAULT '0',
  `companyId` int(11) NOT NULL,
  `branchId` int(11) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name_company` (`name`, `companyId`),
  KEY `idx_companyId` (`companyId`),
  KEY `idx_branchId` (`branchId`),
  KEY `idx_isActive` (`isActive`),
  KEY `idx_orderIndex` (`orderIndex`),
  CONSTRAINT `fk_expense_categories_company` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expense_categories_branch` FOREIGN KEY (`branchId`) REFERENCES `Branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_categories_created_by` FOREIGN KEY (`createdBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expense_categories_updated_by` FOREIGN KEY (`updatedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول المصروفات
CREATE TABLE IF NOT EXISTS `Expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text,
  `expenseDate` date NOT NULL DEFAULT (CURDATE()),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `receiptNumber` varchar(100) DEFAULT NULL,
  `receiptPath` varchar(500) DEFAULT NULL,
  `paymentMethod` enum('cash','bank_transfer','credit_card','check','other') DEFAULT NULL,
  `vendorName` varchar(255) DEFAULT NULL,
  `vendorContact` varchar(100) DEFAULT NULL,
  `notes` text,
  `approvedBy` int(11) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `rejectionReason` text,
  `categoryId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `branchId` int(11) DEFAULT NULL,
  `createdBy` int(11) NOT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_receipt_number` (`receiptNumber`),
  KEY `idx_categoryId` (`categoryId`),
  KEY `idx_companyId` (`companyId`),
  KEY `idx_branchId` (`branchId`),
  KEY `idx_createdBy` (`createdBy`),
  KEY `idx_status` (`status`),
  KEY `idx_expenseDate` (`expenseDate`),
  KEY `idx_vendorName` (`vendorName`),
  CONSTRAINT `fk_expenses_category` FOREIGN KEY (`categoryId`) REFERENCES `ExpenseCategories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_expenses_company` FOREIGN KEY (`companyId`) REFERENCES `Companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expenses_branch` FOREIGN KEY (`branchId`) REFERENCES `Branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_created_by` FOREIGN KEY (`createdBy`) REFERENCES `Users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_expenses_updated_by` FOREIGN KEY (`updatedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_approved_by` FOREIGN KEY (`approvedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج فئات مصروفات افتراضية
INSERT INTO `ExpenseCategories` (`name`, `description`, `color`, `orderIndex`, `companyId`, `createdBy`) VALUES
('مكتبية', 'مستلزمات مكتبية وقرطاسية', 'bg-blue-100 text-blue-800', 1, 1, 1),
('صيانة', 'صيانة المعدات والأجهزة', 'bg-orange-100 text-orange-800', 2, 1, 1),
('نقل', 'وقود ومواصلات', 'bg-green-100 text-green-800', 3, 1, 1),
('اتصالات', 'هواتف وإنترنت', 'bg-purple-100 text-purple-800', 4, 1, 1),
('تدريب', 'دورات تدريبية وورش عمل', 'bg-pink-100 text-pink-800', 5, 1, 1),
('أخرى', 'مصروفات أخرى', 'bg-gray-100 text-gray-800', 6, 1, 1);

-- إنشاء فهارس إضافية للأداء
CREATE INDEX `idx_expenses_status_date` ON `Expenses` (`status`, `expenseDate`);
CREATE INDEX `idx_expenses_category_status` ON `Expenses` (`categoryId`, `status`);
CREATE INDEX `idx_expenses_company_status` ON `Expenses` (`companyId`, `status`);

-- إنشاء فهارس للبحث
CREATE INDEX `idx_expenses_title` ON `Expenses` (`title`);
CREATE INDEX `idx_expenses_vendor` ON `Expenses` (`vendorName`);

-- إضافة تعليقات على الجداول
ALTER TABLE `ExpenseCategories` COMMENT = 'جدول فئات المصروفات';
ALTER TABLE `Expenses` COMMENT = 'جدول المصروفات';

-- إضافة تعليقات على الأعمدة المهمة
ALTER TABLE `ExpenseCategories` MODIFY COLUMN `name` varchar(100) NOT NULL COMMENT 'اسم الفئة';
ALTER TABLE `ExpenseCategories` MODIFY COLUMN `color` varchar(50) NOT NULL DEFAULT 'bg-blue-100 text-blue-800' COMMENT 'لون الفئة في الواجهة';
ALTER TABLE `ExpenseCategories` MODIFY COLUMN `orderIndex` int(11) NOT NULL DEFAULT '0' COMMENT 'ترتيب الفئة في القائمة';

ALTER TABLE `Expenses` MODIFY COLUMN `title` varchar(255) NOT NULL COMMENT 'عنوان المصروف';
ALTER TABLE `Expenses` MODIFY COLUMN `amount` decimal(15,2) NOT NULL COMMENT 'مبلغ المصروف';
ALTER TABLE `Expenses` MODIFY COLUMN `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT 'حالة المصروف';
ALTER TABLE `Expenses` MODIFY COLUMN `expenseDate` date NOT NULL DEFAULT (CURDATE()) COMMENT 'تاريخ المصروف';
ALTER TABLE `Expenses` MODIFY COLUMN `paymentMethod` enum('cash','bank_transfer','credit_card','check','other') DEFAULT NULL COMMENT 'طريقة الدفع';
