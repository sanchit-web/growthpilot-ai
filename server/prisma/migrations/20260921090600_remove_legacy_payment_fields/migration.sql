/*
  Warnings:

  - You are about to drop the column `paymentLinkId` on the `GrowthAction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `GrowthAction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GrowthAction" DROP COLUMN "paymentLinkId",
DROP COLUMN "paymentStatus";
