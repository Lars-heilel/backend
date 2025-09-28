/*
  Warnings:

  - A unique constraint covering the columns `[createAt,id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Message_createAt_key";

-- DropIndex
DROP INDEX "public"."Message_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Message_createAt_id_key" ON "public"."Message"("createAt", "id");
