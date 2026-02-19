CREATE TABLE `cart_promo_codes` (
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
CREATE UNIQUE INDEX `cart_promo_codes_user_id_unique` ON `cart_promo_codes` (`user_id`);--> statement-breakpoint
CREATE INDEX `cart_promo_codes_user_id_idx` ON `cart_promo_codes` (`user_id`);--> statement-breakpoint
CREATE INDEX `cart_promo_codes_promo_code_id_idx` ON `cart_promo_codes` (`promo_code_id`);--> statement-breakpoint
CREATE TABLE `forum_handshakes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `forum_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forum_handshakes_post_user_idx` ON `forum_handshakes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `forum_handshakes_user_id_idx` ON `forum_handshakes` (`user_id`);--> statement-breakpoint
CREATE INDEX `forum_handshakes_post_id_idx` ON `forum_handshakes` (`post_id`);--> statement-breakpoint
CREATE TABLE `promo_codes` (
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
CREATE UNIQUE INDEX `promo_codes_code_unique` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE INDEX `promo_codes_code_idx` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE INDEX `promo_codes_active_idx` ON `promo_codes` (`active`);--> statement-breakpoint
CREATE INDEX `promo_codes_type_idx` ON `promo_codes` (`type`);--> statement-breakpoint
ALTER TABLE `forum_posts` ADD `handshakes_count` integer DEFAULT 0 NOT NULL;