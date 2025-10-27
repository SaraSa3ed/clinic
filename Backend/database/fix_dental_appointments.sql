-- حذف جدول DentalAppointments القديم وإعادة إنشائه بدون foreign key constraints

-- الخيار 1: حذف الجدول بالكامل وإعادة إنشائه (استخدم هذا إذا لم يكن لديك بيانات مهمة)
DROP TABLE IF EXISTS `DentalAppointments`;

-- الجدول سيُعاد إنشاؤه تلقائياً عند إعادة تشغيل Backend

-- ================================
-- OR الخيار 2: إزالة الـ constraint فقط (إذا أردت الحفاظ على البيانات)
-- ================================

-- أولاً: اكتشف اسم الـ constraint
-- SELECT CONSTRAINT_NAME 
-- FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = 'mmm' 
-- AND TABLE_NAME = 'DentalAppointments' 
-- AND COLUMN_NAME = 'treatment_id';

-- ثم احذف الـ constraint (استبدل CONSTRAINT_NAME_HERE باسم الـ constraint الحقيقي)
-- ALTER TABLE `DentalAppointments` DROP FOREIGN KEY `dentalappointments_ibfk_1`;