ALTER TABLE `accounts` ADD `credit_limit_cents` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `statement_day` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `payment_due_day` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `is_active` integer DEFAULT true NOT NULL;