CREATE TABLE `installment_purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`description` text NOT NULL,
	`purchase_date` text NOT NULL,
	`original_amount_cents` integer NOT NULL,
	`installment_amount_cents` integer NOT NULL,
	`total_installments` integer NOT NULL,
	`billed_installments` integer DEFAULT 0 NOT NULL,
	`paid_installments` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
