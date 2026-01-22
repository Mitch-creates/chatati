-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'X', 'PRIVATE');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'PRIVATE';
