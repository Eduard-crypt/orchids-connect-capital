CREATE TABLE `membership_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price_per_month` integer NOT NULL,
	`max_listings` integer NOT NULL,
	`escrow_fee_percentage` real NOT NULL,
	`verification_speed` text NOT NULL,
	`support_response_hours` integer NOT NULL,
	`document_storage_gb` integer NOT NULL,
	`featured_placement` integer DEFAULT false NOT NULL,
	`analytics_access` integer DEFAULT false NOT NULL,
	`white_label_options` integer DEFAULT false NOT NULL,
	`dedicated_manager` integer DEFAULT false NOT NULL,
	`features` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_memberships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer NOT NULL,
	`renews_at` integer NOT NULL,
	`canceled_at` integer,
	`payment_method` text,
	`stripe_subscription_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `membership_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_memberships_user_id_unique` ON `user_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_memberships_user_id_idx` ON `user_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_memberships_plan_id_idx` ON `user_memberships` (`plan_id`);--> statement-breakpoint
CREATE INDEX `user_memberships_status_idx` ON `user_memberships` (`status`);