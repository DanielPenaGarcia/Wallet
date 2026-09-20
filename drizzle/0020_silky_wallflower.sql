CREATE TABLE `recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`amount_kind` text NOT NULL,
	`frequency` text NOT NULL,
	`custom_interval_count` integer,
	`custom_interval_unit` text,
	`payment_schedule` text NOT NULL,
	`statement_day` integer,
	`last_paid_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
