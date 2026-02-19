-- Manual migration for promo code tables
CREATE TABLE IF NOT EXISTS `promo_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`value` integer NOT NULL,
	`description` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`max_uses` integer,
	`used_count` integer DEFAULT 0 NOT NULL,
	`min_order_value` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `promo_codes_code_unique` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `promo_codes_code_idx` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `promo_codes_active_idx` ON `promo_codes` (`active`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `promo_codes_type_idx` ON `promo_codes` (`type`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cart_promo_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`promo_code_id` integer NOT NULL,
	`cart_total` integer NOT NULL,
	`discount_amount` integer NOT NULL,
	`final_total` integer NOT NULL,
	`applied_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `cart_promo_codes_user_id_unique` ON `cart_promo_codes` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cart_promo_codes_user_id_idx` ON `cart_promo_codes` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cart_promo_codes_promo_code_id_idx` ON `cart_promo_codes` (`promo_code_id`);
