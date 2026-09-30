-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER', 'CORPORATE');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('hy', 'ru', 'en');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'IN_TRANSIT', 'SOLD');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'CVT', 'ROBOTIC');

-- CreateEnum
CREATE TYPE "Drive" AS ENUM ('FWD', 'RWD', 'AWD', 'FOUR_WD');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SEDAN', 'SUV', 'CROSSOVER', 'HATCHBACK', 'COUPE', 'WAGON', 'PICKUP', 'MINIVAN', 'CONVERTIBLE');

-- CreateEnum
CREATE TYPE "MileageUnit" AS ENUM ('MI', 'KM');

-- CreateEnum
CREATE TYPE "ImportStage" AS ENUM ('AUCTION', 'PURCHASED', 'PICKED_UP', 'AT_PORT', 'SHIPPING', 'ARRIVED', 'CUSTOMS', 'REGISTRATION', 'READY');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('DONE', 'CURRENT', 'PENDING');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CAR_REQUEST', 'IMPORT', 'CAR_SEARCH', 'CORPORATE', 'CONTACT', 'FINANCING');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FeeCategory" AS ENUM ('DOCUMENTATION', 'REGISTRATION', 'SERVICE');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "FeeBasis" AS ENUM ('CAR_PRICE', 'SUBTOTAL');

-- CreateEnum
CREATE TYPE "BlogCategory" AS ENUM ('CAR_IMPORT', 'AUCTIONS', 'CUSTOMS', 'CAR_BUYING', 'MAINTENANCE', 'NEWS', 'GUIDES');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'BILL_OF_SALE', 'TITLE', 'BILL_OF_LADING', 'CUSTOMS', 'REGISTRATION', 'INSPECTION', 'VEHICLE_HISTORY', 'AUCTION_SHEET', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "locale" "Locale" NOT NULL DEFAULT 'hy',
    "companyName" TEXT,
    "companyTaxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "mileageUnit" "MileageUnit" NOT NULL DEFAULT 'MI',
    "engineVolume" DOUBLE PRECISION,
    "horsepower" INTEGER,
    "fuel" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "drive" "Drive" NOT NULL,
    "bodyType" "BodyType" NOT NULL,
    "color" TEXT,
    "interior" TEXT,
    "vin" TEXT,
    "price" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "source" TEXT,
    "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[],
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarTranslation" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "CarTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarImage" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarDocument" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',

    CONSTRAINT "CarDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Import" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "carId" TEXT,
    "vehicleTitle" TEXT NOT NULL,
    "vehicleYear" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "vin" TEXT,
    "lotNumber" TEXT,
    "auctionId" TEXT,
    "purchasePrice" INTEGER NOT NULL,
    "estimatedTotal" INTEGER NOT NULL,
    "finalTotal" INTEGER,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "currentStage" "ImportStage" NOT NULL DEFAULT 'AUCTION',
    "breakdown" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Import_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportEvent" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "stage" "ImportStage" NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(3),
    "location" TEXT,
    "note" TEXT,

    CONSTRAINT "ImportEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "importId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "message" TEXT,
    "payload" JSONB,
    "locale" "Locale" NOT NULL DEFAULT 'hy',
    "carId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionFeeTier" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER,
    "fixedFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentFee" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "AuctionFeeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OriginCountry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OriginCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL,
    "originId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "inlandTransport" INTEGER NOT NULL,
    "oceanShipping" INTEGER NOT NULL,
    "landDelivery" INTEGER NOT NULL,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomsRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fuelTypes" "FuelType"[],
    "minAge" INTEGER NOT NULL DEFAULT 0,
    "maxAge" INTEGER,
    "minEngineCc" INTEGER NOT NULL DEFAULT 0,
    "maxEngineCc" INTEGER,
    "dutyPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dutyPerCcEur" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exciseFixed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "processingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "CustomsRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeRule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "category" "FeeCategory" NOT NULL,
    "type" "FeeType" NOT NULL DEFAULT 'FIXED',
    "basis" "FeeBasis" NOT NULL DEFAULT 'CAR_PRICE',
    "amount" DOUBLE PRECISION NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeeRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "code" TEXT NOT NULL,
    "perUsd" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "userId" TEXT,
    "label" TEXT,
    "input" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "category" "BlogCategory" NOT NULL,
    "authorName" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "BlogPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoEntry" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "canonical" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");

-- CreateIndex
CREATE INDEX "Car_status_published_idx" ON "Car"("status", "published");

-- CreateIndex
CREATE INDEX "Car_brand_model_idx" ON "Car"("brand", "model");

-- CreateIndex
CREATE INDEX "Car_price_idx" ON "Car"("price");

-- CreateIndex
CREATE UNIQUE INDEX "CarTranslation_carId_locale_key" ON "CarTranslation"("carId", "locale");

-- CreateIndex
CREATE INDEX "CarImage_carId_sortOrder_idx" ON "CarImage"("carId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Import_code_key" ON "Import"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ImportEvent_importId_stage_key" ON "ImportEvent"("importId", "stage");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Request_type_status_idx" ON "Request"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_code_key" ON "Auction"("code");

-- CreateIndex
CREATE INDEX "AuctionFeeTier_auctionId_minPrice_idx" ON "AuctionFeeTier"("auctionId", "minPrice");

-- CreateIndex
CREATE UNIQUE INDEX "OriginCountry_code_key" ON "OriginCountry"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_code_key" ON "Destination"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_code_key" ON "VehicleType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRate_originId_destinationId_vehicleTypeId_key" ON "ShippingRate"("originId", "destinationId", "vehicleTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeRule_key_key" ON "FeeRule"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Calculation_shareId_key" ON "Calculation"("shareId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTranslation_postId_locale_key" ON "BlogPostTranslation"("postId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTranslation_locale_slug_key" ON "BlogPostTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_locale_key" ON "SiteContent"("key", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "SeoEntry_path_locale_key" ON "SeoEntry"("path", "locale");

-- AddForeignKey
ALTER TABLE "CarTranslation" ADD CONSTRAINT "CarTranslation_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarImage" ADD CONSTRAINT "CarImage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDocument" ADD CONSTRAINT "CarDocument_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportEvent" ADD CONSTRAINT "ImportEvent_importId_fkey" FOREIGN KEY ("importId") REFERENCES "Import"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_importId_fkey" FOREIGN KEY ("importId") REFERENCES "Import"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionFeeTier" ADD CONSTRAINT "AuctionFeeTier_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_originId_fkey" FOREIGN KEY ("originId") REFERENCES "OriginCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTranslation" ADD CONSTRAINT "BlogPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
