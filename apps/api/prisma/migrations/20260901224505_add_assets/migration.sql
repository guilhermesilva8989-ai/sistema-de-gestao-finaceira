-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'FII', 'ETF', 'FIXED_INCOME', 'CRYPTO', 'FUND', 'OTHER');

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "portfolioId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "type" "AssetType" NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "averagePrice" DECIMAL(18,2) NOT NULL,
    "currentPrice" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assets_portfolioId_idx" ON "assets"("portfolioId");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
