-- Make Customer.email optional for guest checkout (phone required, email optional)
ALTER TABLE `Customer` MODIFY COLUMN `email` VARCHAR(191) NULL;
