-- CreateIndex
CREATE INDEX `Product_published_sortOrder_createdAt_idx` ON `Product`(`published`, `sortOrder`, `createdAt`);

-- CreateIndex
CREATE INDEX `Product_published_stock_idx` ON `Product`(`published`, `stock`);

-- CreateIndex
CREATE INDEX `Order_createdAt_idx` ON `Order`(`createdAt`);

-- CreateIndex
CREATE INDEX `Order_status_createdAt_idx` ON `Order`(`status`, `createdAt`);
