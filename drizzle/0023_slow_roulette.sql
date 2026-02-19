CREATE TABLE `cart_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`total_price` integer NOT NULL,
	`access_granted` integer DEFAULT false NOT NULL,
	`access_granted_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `cart_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `cart_order_items_order_id_idx` ON `cart_order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `cart_order_items_product_id_idx` ON `cart_order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `cart_order_items_access_granted_idx` ON `cart_order_items` (`access_granted`);--> statement-breakpoint
CREATE TABLE `cart_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`email` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`stripe_checkout_session_id` text,
	`stripe_payment_intent_id` text,
	`stripe_customer_id` text,
	`cart_data` text NOT NULL,
	`metadata` text,
	`paid_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_orders_stripe_checkout_session_id_unique` ON `cart_orders` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE INDEX `cart_orders_user_id_idx` ON `cart_orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `cart_orders_status_idx` ON `cart_orders` (`status`);--> statement-breakpoint
CREATE INDEX `cart_orders_stripe_checkout_session_id_idx` ON `cart_orders` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE INDEX `cart_orders_created_at_idx` ON `cart_orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`stripe_price_id` text,
	`price_amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`image_url` text,
	`category` text,
	`is_active` integer DEFAULT true NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `products_stripe_price_id_idx` ON `products` (`stripe_price_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_is_active_idx` ON `products` (`is_active`);--> statement-breakpoint
CREATE TABLE `user_product_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`order_id` integer NOT NULL,
	`granted_at` integer NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `cart_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_product_access_user_id_idx` ON `user_product_access` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_product_access_product_id_idx` ON `user_product_access` (`product_id`);--> statement-breakpoint
CREATE INDEX `user_product_access_order_id_idx` ON `user_product_access` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_product_access_user_product_unique` ON `user_product_access` (`user_id`,`product_id`);