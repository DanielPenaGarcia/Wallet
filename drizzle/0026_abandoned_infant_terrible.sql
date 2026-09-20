CREATE TABLE `credit_card_statements` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`period_start_date` text NOT NULL,
	`period_end_date` text NOT NULL,
	`statement_date` text NOT NULL,
	`payment_due_date` text NOT NULL,
	`statement_balance_cents` integer NOT NULL,
	`paid_amount_cents` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credit_card_statements_account_statement_date_unique` ON `credit_card_statements` (`account_id`,`statement_date`);