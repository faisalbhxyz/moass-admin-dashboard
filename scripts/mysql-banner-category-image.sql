-- Banner ও Category – শুধু ইমেজ কলাম
--
-- কীভাবে রান করবেন:
-- ১. phpMyAdmin: লগইন করে ডাটাবেইস সিলেক্ট করুন → SQL ট্যাব → এই ফাইলের ALTER স্টেটমেন্ট কপি-পেস্ট করে Run/Go চাপুন।
-- ২. MySQL কমান্ড লাইন:   mysql -u USER -p DATABASE_NAME < scripts/mysql-banner-category-image.sql
-- ৩. Hostinger/অন্য প্যানেল: MySQL বা phpMyAdmin ওপেন করুন → SQL ট্যাবে ফাইলের কনটেন্ট পেস্ট করে এক্সিকিউট করুন。
--
-- নোট: যে কলাম আগে থেকেই আছে, সেই ALTER দিলে Duplicate column এরর আসতে পারে — উপেক্ষা করলেই হয়।

-- ========== অপশন A: টেবিল আছে, শুধু ইমেজ কলাম যোগ করবেন ==========
-- কোন কলাম নেই শুধু সেই ALTER টা রান করুন। কলাম থাকলে "Duplicate column" এরর আসবে — সেটা উপেক্ষা করুন।

-- Category তে image
ALTER TABLE `Category` ADD COLUMN `image` VARCHAR(191) NULL;

-- Banner তে image, imageData, imageMime (একটা একটা করে রান করুন; থাকলে এরর আসবে)
ALTER TABLE `Banner` ADD COLUMN `image` VARCHAR(191) NULL;
ALTER TABLE `Banner` ADD COLUMN `imageData` LONGBLOB NULL;
ALTER TABLE `Banner` ADD COLUMN `imageMime` VARCHAR(191) NULL;


-- ========== অপশন B: MySQL 8.0.12+ এ একসঙ্গে (IF NOT EXISTS) ==========
-- ALTER TABLE `Category` ADD COLUMN IF NOT EXISTS `image` VARCHAR(191) NULL;
-- ALTER TABLE `Banner` ADD COLUMN IF NOT EXISTS `image` VARCHAR(191) NULL;
-- ALTER TABLE `Banner` ADD COLUMN IF NOT EXISTS `imageData` LONGBLOB NULL;
-- ALTER TABLE `Banner` ADD COLUMN IF NOT EXISTS `imageMime` VARCHAR(191) NULL;
