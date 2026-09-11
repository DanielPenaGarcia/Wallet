CREATE TABLE `financial_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_amount` integer NOT NULL,
	`allocation_percentage` integer NOT NULL,
	`currency_code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`registered_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
