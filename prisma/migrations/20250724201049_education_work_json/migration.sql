/*
  Warnings:

  - The `education` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workExperience` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "education",
ADD COLUMN     "education" JSONB,
DROP COLUMN "workExperience",
ADD COLUMN     "workExperience" JSONB;
