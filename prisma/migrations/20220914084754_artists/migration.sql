-- AlterTable
ALTER TABLE `Artist` ADD COLUMN `trackId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Artist` ADD CONSTRAINT `Artist_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
