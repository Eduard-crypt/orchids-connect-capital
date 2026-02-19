CREATE TABLE `marketplace_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`category` text NOT NULL,
	`price` integer NOT NULL,
	`annual_revenue` integer NOT NULL,
	`annual_cash_flow` integer NOT NULL,
	`description` text NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`employees` integer NOT NULL,
	`year_established` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `marketplace_listings_category_idx` ON `marketplace_listings` (`category`);--> statement-breakpoint
CREATE INDEX `marketplace_listings_price_idx` ON `marketplace_listings` (`price`);--> statement-breakpoint
CREATE INDEX `marketplace_listings_is_featured_idx` ON `marketplace_listings` (`is_featured`);--> statement-breakpoint
CREATE INDEX `marketplace_listings_is_verified_idx` ON `marketplace_listings` (`is_verified`);--> statement-breakpoint
CREATE INDEX `marketplace_listings_created_at_idx` ON `marketplace_listings` (`created_at`);--> statement-breakpoint
CREATE TABLE `saved_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`listing_id`) REFERENCES `marketplace_listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `saved_listings_user_id_idx` ON `saved_listings` (`user_id`);--> statement-breakpoint
CREATE INDEX `saved_listings_listing_id_idx` ON `saved_listings` (`listing_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `saved_listings_user_listing_unique` ON `saved_listings` (`user_id`,`listing_id`);