CREATE TABLE `recurring_incomes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`expected_amount_cents` integer NOT NULL,
	`source` text NOT NULL,
	`frequency` text NOT NULL,
	`payment_schedule` text NOT NULL,
	`work_schedule` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
