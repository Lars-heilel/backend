/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createAt]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Message_id_key" ON "public"."Message"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_createAt_key" ON "public"."Message"("createAt");
