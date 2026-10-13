/*
  Warnings:

  - Added the required column `priceAtBooking` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `priceAtBooking` DECIMAL(10, 2) NOT NULL;
