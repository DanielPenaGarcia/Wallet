CREATE TABLE `movements` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`amount_cents` integer NOT NULL,
	`currency_code` text DEFAULT 'MXN' NOT NULL,
	`occurred_at` text NOT NULL,
	`source_account_id` text,
	`destination_account_id` text,
	`category_id` text,
	`recurring_expense_id` text,
	`recurring_income_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`source_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recurring_expense_id`) REFERENCES `recurring_expenses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recurring_income_id`) REFERENCES `recurring_incomes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `movements_occurred_at_idx` ON `movements` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `movements_source_account_idx` ON `movements` (`source_account_id`);--> statement-breakpoint
CREATE INDEX `movements_destination_account_idx` ON `movements` (`destination_account_id`);--> statement-breakpoint
CREATE INDEX `movements_category_idx` ON `movements` (`category_id`);--> statement-breakpoint
CREATE INDEX `movements_recurring_expense_idx` ON `movements` (`recurring_expense_id`);--> statement-breakpoint
CREATE INDEX `movements_recurring_income_idx` ON `movements` (`recurring_income_id`);