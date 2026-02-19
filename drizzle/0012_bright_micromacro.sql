ALTER TABLE `user_profiles` ADD `owns_business` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `primary_business_interest` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `business_location` text;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `purchase_timeframe` text;