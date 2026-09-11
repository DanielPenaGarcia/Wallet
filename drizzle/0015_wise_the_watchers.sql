CREATE TABLE `reserve_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`reserve_kind` text NOT NULL,
	`target_id` text NOT NULL,
	`movement_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency_code` text NOT NULL,
	`cycle_due_on` text NOT NULL,
	`reserved_at` text NOT NULL,
	`registered_at` text NOT NULL,
	FOREIGN KEY (`movement_id`) REFERENCES `movements`(`id`) ON UPDATE no action ON DELETE cascade
);
