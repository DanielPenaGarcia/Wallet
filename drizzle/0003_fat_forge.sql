CREATE TABLE `job_incomes` (
	`id` text PRIMARY KEY NOT NULL,
	`job_name` text NOT NULL,
	`monthly_amount` integer NOT NULL,
	`amount_type` text NOT NULL,
	`payment_frequency` text NOT NULL,
	`currency_code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`registered_at` text NOT NULL,
	`updated_at` text
);
