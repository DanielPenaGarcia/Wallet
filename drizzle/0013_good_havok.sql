CREATE TABLE `expense_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`expense_id` text NOT NULL,
	`mode` text NOT NULL,
	`amount` integer NOT NULL,
	`currency_code` text NOT NULL,
	`note` text,
	`card_id` text,
	`movement_id` text,
	`paid_at` text NOT NULL,
	`registered_at` text NOT NULL,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`movement_id`) REFERENCES `movements`(`id`) ON UPDATE no action ON DELETE set null
);
