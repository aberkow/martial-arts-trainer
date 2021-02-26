-- CreateTable
CREATE TABLE `techniques_on_sequences` (
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sequenceId` INTEGER NOT NULL,
    `techniqueId` INTEGER NOT NULL,

    PRIMARY KEY (`sequenceId`,`techniqueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `techniques_on_sequences` ADD FOREIGN KEY (`sequenceId`) REFERENCES `sequences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `techniques_on_sequences` ADD FOREIGN KEY (`techniqueId`) REFERENCES `techniques`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
