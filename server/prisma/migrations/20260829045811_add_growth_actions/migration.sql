-- CreateTable
CREATE TABLE "GrowthAction" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetProduct" TEXT,
    "suggestedProduct" TEXT,
    "status" TEXT NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthAction_pkey" PRIMARY KEY ("id")
);
