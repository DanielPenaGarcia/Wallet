CREATE TABLE `loans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`direction` text NOT NULL,
	`counterparty_name` text NOT NULL,
	`principal_amount_cents` integer NOT NULL,
	`total_repayment_cents` integer NOT NULL,
	`installment_count` integer NOT NULL,
	`first_payment_date` text NOT NULL,
	`currency_code` text DEFAULT 'MXN' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`cancelled_at` text
);
--> statement-breakpoint
ALTER TABLE `movements` ADD `loan_id` text;
