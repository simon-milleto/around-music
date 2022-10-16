/*
  Warnings:

  - You are about to drop the column `artistId` on the `Genre` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Genre` DROP FOREIGN KEY `Genre_artistId_fkey`;

-- AlterTable
ALTER TABLE `Genre` DROP COLUMN `artistId`;

-- CreateTable
CREATE TABLE `_ArtistToGenre` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArtistToGenre_AB_unique`(`A`, `B`),
    INDEX `_ArtistToGenre_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArtistToGenre` ADD CONSTRAINT `_ArtistToGenre_A_fkey` FOREIGN KEY (`A`) REFERENCES `Artist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArtistToGenre` ADD CONSTRAINT `_ArtistToGenre_B_fkey` FOREIGN KEY (`B`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
