-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'RENTAL';

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'SALE',
ADD COLUMN     "rentDeposit" INTEGER,
ADD COLUMN     "rentMinDays" INTEGER;

-- CreateIndex
CREATE INDEX "Car_listingType_published_idx" ON "Car"("listingType", "published");
