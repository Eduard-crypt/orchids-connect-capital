ALTER TABLE `escrow_transactions` ADD `platform_fee_percent` integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE `escrow_transactions` ADD `platform_fee_amount` integer;--> statement-breakpoint
ALTER TABLE `escrow_transactions` ADD `buyer_total_amount` integer;--> statement-breakpoint
ALTER TABLE `escrow_transactions` ADD `seller_net_amount` integer;--> statement-breakpoint
ALTER TABLE `escrow_transactions` ADD `fee_invoice_url` text;--> statement-breakpoint
ALTER TABLE `escrow_transactions` ADD `fee_transferred_at` integer;--> statement-breakpoint
ALTER TABLE `escrow_transactions` ADD `platform_account_id` text;