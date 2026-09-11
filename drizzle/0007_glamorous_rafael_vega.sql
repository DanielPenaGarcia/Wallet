PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`classification` text NOT NULL,
	`frequency` text NOT NULL,
	`amount` integer NOT NULL,
	`currency_code` text NOT NULL,
	`statement_day` integer,
	`payment_due_day` integer,
	`category_id` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`registered_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_expenses`("id", "name", "classification", "frequency", "amount", "currency_code", "statement_day", "payment_due_day", "category_id", "active", "registered_at", "updated_at", "deleted_at")
SELECT "id", "name", "classification", "frequency", "amount", "currency_code",
	CASE WHEN "statement_date" IS NULL THEN NULL ELSE CAST(SUBSTR("statement_date", 9, 2) AS INTEGER) END,
	CASE WHEN "payment_due_date" IS NULL THEN NULL ELSE CAST(SUBSTR("payment_due_date", 9, 2) AS INTEGER) END,
	"category_id", "active", "registered_at", "updated_at", "deleted_at" FROM `expenses`;--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
ALTER TABLE `__new_expenses` RENAME TO `expenses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
