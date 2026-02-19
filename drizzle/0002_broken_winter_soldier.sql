CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`role_buyer` integer DEFAULT false NOT NULL,
	`role_seller` integer DEFAULT false NOT NULL,
	`kyc_status` text DEFAULT 'not_verified' NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`messages_limit` integer DEFAULT 50 NOT NULL,
	`saved_searches_limit` integer DEFAULT 10 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);