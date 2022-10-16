/*
  Warnings:

  - You are about to drop the column `trackId` on the `Artist` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Artist` DROP FOREIGN KEY `Artist_trackId_fkey`;

-- AlterTable
ALTER TABLE `Artist` DROP COLUMN `trackId`;

-- CreateTable
CREATE TABLE `_ArtistToTrack` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArtistToTrack_AB_unique`(`A`, `B`),
    INDEX `_ArtistToTrack_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArtistToTrack` ADD CONSTRAINT `_ArtistToTrack_A_fkey` FOREIGN KEY (`A`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArtistToTrack` ADD CONSTRAINT `_ArtistToTrack_B_fkey` FOREIGN KEY (`B`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
