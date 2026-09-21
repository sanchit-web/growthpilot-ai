-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "growthActionId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentLinkId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Payment_growthActionId_idx" ON "Payment"("growthActionId");

-- CreateIndex
CREATE INDEX "Payment_razorpayPaymentLinkId_idx" ON "Payment"("razorpayPaymentLinkId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_growthActionId_fkey" FOREIGN KEY ("growthActionId") REFERENCES "GrowthAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
