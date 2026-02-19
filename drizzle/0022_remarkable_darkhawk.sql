CREATE TABLE `revolut_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`plan_slug` text,
	`revolut_order_id` text,
	`merchant_order_ext_ref` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`promo_code_id` integer,
	`payment_method` text,
	`metadata` text,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `revolut_orders_revolut_order_id_unique` ON `revolut_orders` (`revolut_order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `revolut_orders_merchant_order_ext_ref_unique` ON `revolut_orders` (`merchant_order_ext_ref`);--> statement-breakpoint
CREATE INDEX `revolut_orders_user_id_idx` ON `revolut_orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `revolut_orders_revolut_order_id_idx` ON `revolut_orders` (`revolut_order_id`);--> statement-breakpoint
CREATE INDEX `revolut_orders_merchant_order_ext_ref_idx` ON `revolut_orders` (`merchant_order_ext_ref`);--> statement-breakpoint
CREATE INDEX `revolut_orders_status_idx` ON `revolut_orders` (`status`);