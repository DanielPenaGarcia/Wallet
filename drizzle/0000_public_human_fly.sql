CREATE TABLE `banks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`country_code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`registered_at` text NOT NULL,
	`time_zone` text NOT NULL,
	`weekend_days` text DEFAULT '[0,6]' NOT NULL,
	`holidays` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`registered_at` text NOT NULL,
	`alias` text NOT NULL,
	`bank_id` text NOT NULL,
	`color` text NOT NULL,
	`last_four_digits` text NOT NULL,
	`currency_code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `credit_cards` (
	`card_id` text PRIMARY KEY NOT NULL,
	`maximum_offered_credit` integer NOT NULL,
	`initial_balance` integer NOT NULL,
	`current_balance` integer NOT NULL,
	`statement_day` integer NOT NULL,
	`payment_due_day` integer NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `debit_cards` (
	`card_id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`initial_ledger_balance` integer NOT NULL,
	`ledger_balance` integer NOT NULL,
	`available_balance` integer NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
