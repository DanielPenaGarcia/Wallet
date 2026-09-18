CREATE TABLE `color_palettes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`primary` text NOT NULL,
	`secondary` text NOT NULL,
	`tertiary` text NOT NULL,
	`background` text NOT NULL,
	`surface` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
