CREATE TABLE `sell_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`plan` text NOT NULL,
	`business_name` text NOT NULL,
	`business_url` text NOT NULL,
	`business_model` text NOT NULL,
	`annual_revenue` integer NOT NULL,
	`annual_profit` integer NOT NULL,
	`employees_count` integer NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sell_requests_user_id_idx` ON `sell_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `sell_requests_status_idx` ON `sell_requests` (`status`);--> statement-breakpoint
CREATE INDEX `sell_requests_created_at_idx` ON `sell_requests` (`created_at`);