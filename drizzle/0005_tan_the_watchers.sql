CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`classification` text NOT NULL,
	`frequency` text NOT NULL,
	`amount` integer NOT NULL,
	`currency_code` text NOT NULL,
	`category_id` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`registered_at` text NOT NULL,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
