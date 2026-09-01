-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "movements" (
    "id" UUID NOT NULL,
    "portfolioId" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "operationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movements_portfolioId_idx" ON "movements"("portfolioId");

-- CreateIndex
CREATE INDEX "movements_assetId_idx" ON "movements"("assetId");

-- CreateIndex
CREATE INDEX "movements_operationDate_idx" ON "movements"("operationDate");

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
