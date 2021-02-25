-- CreateTable
CREATE TABLE `techniques` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `udpatedAt` DATETIME(3) NOT NULL,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) DEFAULT '',
    `creatorId` VARCHAR(191) NOT NULL,
UNIQUE INDEX `techniques.uuid_unique`(`uuid`),
UNIQUE INDEX `techniques.slug_unique`(`slug`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `techniques` ADD FOREIGN KEY (`creatorId`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
