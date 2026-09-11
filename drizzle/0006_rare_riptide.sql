CREATE TABLE `expense_amount_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`expense_id` text NOT NULL,
	`previous_amount` integer,
	`new_amount` integer NOT NULL,
	`direction` text NOT NULL,
	`changed_at` text NOT NULL,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `expense_amount_changes` (`id`, `expense_id`, `previous_amount`, `new_amount`, `direction`, `changed_at`)
SELECT 'initial-' || `id`, `id`, NULL, `amount`, 'initial', `registered_at` FROM `expenses`;
--> statement-breakpoint
ALTER TABLE `expenses` ADD `statement_date` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_due_date` text;
