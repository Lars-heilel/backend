/*
  Warnings:

  - Made the column `chatRoomId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Message" ALTER COLUMN "chatRoomId" SET NOT NULL;
