CREATE TABLE `credit_card_installment_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`movement_id` text NOT NULL,
	`installment_number` integer NOT NULL,
	`paid_at` text NOT NULL,
	`registered_at` text NOT NULL,
	FOREIGN KEY (`movement_id`) REFERENCES `movements`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credit_card_installment_payments_movement_installment_unique` ON `credit_card_installment_payments` (`movement_id`,`installment_number`);