ALTER TABLE `expenses` ADD `custom_interval_count` integer;--> statement-breakpoint
ALTER TABLE `expenses` ADD `custom_interval_unit` text;--> statement-breakpoint
UPDATE `expenses`
SET `frequency` = 'custom', `custom_interval_count` = 2, `custom_interval_unit` = 'months'
WHERE `frequency` = 'bimonthly';
