/*
  Warnings:

  - You are about to drop the column `districtId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `District` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PreferenceDistricts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_districtId_fkey";

-- DropForeignKey
ALTER TABLE "_PreferenceDistricts" DROP CONSTRAINT "_PreferenceDistricts_A_fkey";

-- DropForeignKey
ALTER TABLE "_PreferenceDistricts" DROP CONSTRAINT "_PreferenceDistricts_B_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "districtId",
ADD COLUMN     "areaId" TEXT;

-- DropTable
DROP TABLE "District";

-- DropTable
DROP TABLE "_PreferenceDistricts";

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PreferenceAreas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PreferenceAreas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_countryId_key" ON "City"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_cityId_key" ON "Area"("name", "cityId");

-- CreateIndex
CREATE INDEX "_PreferenceAreas_B_index" ON "_PreferenceAreas"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferenceAreas" ADD CONSTRAINT "_PreferenceAreas_A_fkey" FOREIGN KEY ("A") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferenceAreas" ADD CONSTRAINT "_PreferenceAreas_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
