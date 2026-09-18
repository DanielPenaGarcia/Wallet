DROP TABLE `cards`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
DROP TABLE `credit_card_installment_payments`;--> statement-breakpoint
DROP TABLE `credit_cards`;--> statement-breakpoint
DROP TABLE `debit_cards`;--> statement-breakpoint
DROP TABLE `expense_amount_changes`;--> statement-breakpoint
DROP TABLE `expense_payments`;--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
DROP TABLE `financial_goals`;--> statement-breakpoint
DROP TABLE `job_incomes`;--> statement-breakpoint
DROP TABLE `movements`;--> statement-breakpoint
DROP TABLE `reserve_movements`;--> statement-breakpoint
ALTER TABLE `banks` ADD `alias` text NOT NULL;--> statement-breakpoint
ALTER TABLE `banks` ADD `color` text NOT NULL;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `short_name`;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `country_code`;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `active`;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `registered_at`;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `time_zone`;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `weekend_days`;--> statement-breakpoint
ALTER TABLE `banks` DROP COLUMN `holidays`;