-- ==========================================
-- ملف إضافة بيانات تجريبية لنظام الموردين
-- Seed Data for Supplier Management System
-- ==========================================

-- تأكد من وجود بعض الموردين أولاً
-- إضافة موردين تجريبيين
INSERT INTO suppliers (name_ar, name_en, email, phone, address_ar, address_en, category, is_active, created_at, updated_at) VALUES
('شركة النور للمواد الطبية', 'Al Nour Medical Supplies Co.', 'info@alnour.com', '0123456789', 'القاهرة، مصر الجديدة', 'Cairo, Heliopolis', 'طبي', true, NOW(), NOW()),
('شركة الأمل للأدوية', 'Al Amal Pharmaceuticals', 'contact@alamal.com', '0123456788', 'الجيزة، المهندسين', 'Giza, Mohandessin', 'أدوية', true, NOW(), NOW()),
('مؤسسة الشفاء للمستلزمات', 'Al Shifa Medical Equipment', 'sales@alshifa.com', '0123456787', 'الإسكندرية، المنتزه', 'Alexandria, Montazah', 'معدات', true, NOW(), NOW()),
('شركة الصحة المتقدمة', 'Advanced Health Co.', 'info@advancedhealth.com', '0123456786', 'القاهرة، مدينة نصر', 'Cairo, Nasr City', 'طبي', true, NOW(), NOW()),
('مورد المستلزمات الطبية', 'Medical Supplies Provider', 'support@medsupp.com', '0123456785', 'الجيزة، الدقي', 'Giza, Dokki', 'مستلزمات', true, NOW(), NOW());

-- إضافة فواتير تجريبية
-- تأكد من استبدال supplier_id بالمعرفات الحقيقية من جدول الموردين
INSERT INTO supplier_invoices (
    invoiceNumber, supplier_id, invoiceDate, dueDate, deliveryDate,
    subtotal, taxAmount, discountAmount, shippingAmount, totalAmount,
    paidAmount, remainingAmount, status, approvalStatus, createdAt, updatedAt
) VALUES
-- فواتير تم دفعها
('INV-2024-001', 1, '2024-01-15', '2024-02-15', '2024-01-20', 50000, 7500, 2000, 500, 56000, 56000, 0, 'مدفوع', 'موافق', '2024-01-15', NOW()),
('INV-2024-002', 2, '2024-02-10', '2024-03-10', '2024-02-12', 75000, 11250, 3000, 750, 84000, 84000, 0, 'مدفوع', 'موافق', '2024-02-10', NOW()),
('INV-2024-003', 3, '2024-03-05', '2024-04-05', '2024-03-08', 120000, 18000, 5000, 1000, 134000, 134000, 0, 'مدفوع', 'موافق', '2024-03-05', NOW()),

-- فواتير جزئية الدفع
('INV-2024-004', 1, '2024-10-01', '2024-11-01', '2024-10-05', 100000, 15000, 4000, 1000, 112000, 60000, 52000, 'جزئي', 'موافق', '2024-10-01', NOW()),
('INV-2024-005', 4, '2024-10-15', '2024-11-15', '2024-10-18', 85000, 12750, 3500, 750, 95000, 45000, 50000, 'جزئي', 'موافق', '2024-10-15', NOW()),

-- فواتير معلقة للموافقة
('INV-2024-006', 2, '2024-11-20', '2024-12-20', NULL, 65000, 9750, 2500, 500, 72750, 0, 72750, 'مرسل', 'في_انتظار', '2024-11-20', NOW()),
('INV-2024-007', 5, '2024-11-25', '2024-12-25', NULL, 45000, 6750, 1500, 500, 50750, 0, 50750, 'مرسل', 'في_انتظار', '2024-11-25', NOW()),

-- فواتير متأخرة
('INV-2024-008', 3, '2024-09-01', '2024-10-01', '2024-09-05', 95000, 14250, 3000, 800, 107050, 30000, 77050, 'متأخر', 'موافق', '2024-09-01', NOW()),
('INV-2024-009', 4, '2024-09-15', '2024-10-15', '2024-09-18', 110000, 16500, 4500, 1000, 123000, 40000, 83000, 'متأخر', 'موافق', '2024-09-15', NOW()),

-- فواتير قريبة من الاستحقاق
('INV-2024-010', 1, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 5 DAY, NULL, 78000, 11700, 2800, 600, 87500, 0, 87500, 'مؤكد', 'موافق', NOW() - INTERVAL 10 DAY, NOW()),
('INV-2024-011', 2, NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 3 DAY, NULL, 92000, 13800, 3200, 700, 103300, 0, 103300, 'مؤكد', 'موافق', NOW() - INTERVAL 15 DAY, NOW());

-- إضافة تقييمات للموردين
INSERT INTO SupplierRatings (supplier_id, rating, category, comment, createdBy, createdAt, updatedAt) VALUES
-- تقييمات ممتازة
(1, 4.8, 'quality', 'جودة ممتازة للمنتجات الطبية', 1, '2024-01-20', NOW()),
(1, 4.5, 'delivery', 'تسليم في الوقت المحدد دائماً', 1, '2024-02-15', NOW()),
(2, 4.7, 'quality', 'أدوية أصلية وموثوقة', 1, '2024-02-12', NOW()),
(2, 4.9, 'service', 'خدمة عملاء ممتازة', 1, '2024-03-10', NOW()),
(3, 4.6, 'quality', 'معدات عالية الجودة', 1, '2024-03-08', NOW()),

-- تقييمات جيدة
(4, 4.0, 'quality', 'جودة جيدة بشكل عام', 1, '2024-04-15', NOW()),
(4, 4.2, 'delivery', 'التسليم في الموعد معظم الأوقات', 1, '2024-05-20', NOW()),
(5, 3.8, 'quality', 'جودة مقبولة مع بعض التحسينات المطلوبة', 1, '2024-06-10', NOW()),

-- تقييمات منخفضة (للتنبيهات)
(5, 2.5, 'delivery', 'تأخير في التسليم', 1, NOW() - INTERVAL 5 DAY, NOW()),
(3, 2.8, 'communication', 'تواصل ضعيف', 1, NOW() - INTERVAL 3 DAY, NOW());

-- إضافة مدفوعات
INSERT INTO SupplierPayments (supplier_id, invoiceId, amount, paymentMethod, paymentDate, status, referenceNumber, createdBy, createdAt, updatedAt) VALUES
-- مدفوعات مكتملة
(1, 1, 56000, 'bank_transfer', '2024-02-10', 'completed', 'PAY-001', 1, '2024-02-10', NOW()),
(2, 2, 84000, 'bank_transfer', '2024-03-08', 'completed', 'PAY-002', 1, '2024-03-08', NOW()),
(3, 3, 134000, 'check', '2024-04-03', 'completed', 'PAY-003', 1, '2024-04-03', NOW()),

-- مدفوعات جزئية
(1, 4, 60000, 'bank_transfer', '2024-10-10', 'completed', 'PAY-004', 1, '2024-10-10', NOW()),
(4, 5, 45000, 'cash', '2024-10-25', 'completed', 'PAY-005', 1, '2024-10-25', NOW()),
(3, 8, 30000, 'bank_transfer', '2024-09-20', 'completed', 'PAY-006', 1, '2024-09-20', NOW()),
(4, 9, 40000, 'check', '2024-10-05', 'completed', 'PAY-007', 1, '2024-10-05', NOW()),

-- مدفوعات معلقة
(2, 6, 72750, 'bank_transfer', NOW() + INTERVAL 5 DAY, 'pending', 'PAY-008', 1, NOW(), NOW()),
(5, 7, 50750, 'bank_transfer', NOW() + INTERVAL 7 DAY, 'pending', 'PAY-009', 1, NOW(), NOW());

-- إضافة عقود
INSERT INTO SupplierContracts (
    contract_number, supplier_id, supplier_name, start_date, end_date,
    contract_type, contract_value, payment_terms, status,
    description, created_at, updated_at
) VALUES
-- عقود نشطة
('CNT-2024-001', 1, 'شركة النور للمواد الطبية', '2024-01-01', '2024-12-31', 'سنوي', 500000, 'دفع شهري', 'ساري', 'توريد مستلزمات طبية شهرياً', NOW(), NOW()),
('CNT-2024-002', 2, 'شركة الأمل للأدوية', '2024-03-01', '2025-02-28', 'سنوي', 750000, 'دفع ربع سنوي', 'ساري', 'توريد أدوية متنوعة', NOW(), NOW()),
('CNT-2024-003', 3, 'مؤسسة الشفاء للمستلزمات', '2024-06-01', '2025-05-31', 'سنوي', 600000, 'دفع شهري', 'ساري', 'توريد معدات طبية', NOW(), NOW()),

-- عقود قريبة من الانتهاء (30 يوم)
('CNT-2024-004', 4, 'شركة الصحة المتقدمة', '2024-01-01', NOW() + INTERVAL 25 DAY, 'سنوي', 400000, 'دفع شهري', 'ساري', 'خدمات صيانة المعدات', NOW(), NOW()),
('CNT-2024-005', 5, 'مورد المستلزمات الطبية', '2023-12-01', NOW() + INTERVAL 20 DAY, 'سنوي', 350000, 'دفع شهري', 'ساري', 'توريد مستلزمات متنوعة', NOW(), NOW());

-- ==========================================
-- ملاحظات:
-- 1. تأكد من تحديث supplier_id بالقيم الصحيحة من جدول suppliers
-- 2. تأكد من تحديث invoiceId في جدول SupplierPayments
-- 3. تأكد من تحديث createdBy بمعرف مستخدم صالح
-- 4. قد تحتاج لتعديل التواريخ حسب التاريخ الحالي
-- ==========================================

-- للتحقق من البيانات المدخلة:
-- SELECT COUNT(*) FROM suppliers;
-- SELECT COUNT(*) FROM supplier_invoices;
-- SELECT COUNT(*) FROM SupplierRatings;
-- SELECT COUNT(*) FROM SupplierPayments;
-- SELECT COUNT(*) FROM SupplierContracts;
