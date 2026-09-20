CREATE TABLE `financial_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_amount_cents` integer NOT NULL,
	`current_amount_cents` integer DEFAULT 0 NOT NULL,
	`distribution_percentage` integer DEFAULT 0 NOT NULL,
	`currency_code` text DEFAULT 'MXN' NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
