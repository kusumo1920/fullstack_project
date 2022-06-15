-- AlterTable
ALTER TABLE `games` ADD COLUMN `initial_dices` INTEGER NOT NULL DEFAULT 0,
    MODIFY `is_finished` BIT(1) NOT NULL DEFAULT false;
