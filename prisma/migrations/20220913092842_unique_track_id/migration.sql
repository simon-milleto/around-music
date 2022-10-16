/*
  Warnings:

  - A unique constraint covering the columns `[trackId]` on the table `CurrentTrack` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CurrentTrack_trackId_key` ON `CurrentTrack`(`trackId`);
