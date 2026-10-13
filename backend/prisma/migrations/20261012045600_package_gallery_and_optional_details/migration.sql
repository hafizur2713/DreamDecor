-- AlterTable
ALTER TABLE `decorationpackage` ADD COLUMN `details` TEXT NULL,
    MODIFY `description` TEXT NULL;

-- CreateTable
CREATE TABLE `PackageImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(2048) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decorationPackageId` INTEGER NOT NULL,

    INDEX `PackageImage_decorationPackageId_sortOrder_idx`(`decorationPackageId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PackageImage` ADD CONSTRAINT `PackageImage_decorationPackageId_fkey` FOREIGN KEY (`decorationPackageId`) REFERENCES `DecorationPackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
