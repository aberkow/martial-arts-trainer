-- CreateTable
CREATE TABLE `sequences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) DEFAULT '',
    `creatorId` VARCHAR(191) NOT NULL,
    `techniqueOrder` JSON NOT NULL,
UNIQUE INDEX `sequences.uuid_unique`(`uuid`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sequences` ADD FOREIGN KEY (`creatorId`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
