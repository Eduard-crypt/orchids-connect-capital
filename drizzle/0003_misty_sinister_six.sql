CREATE TABLE `buyer_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`verification_status` text DEFAULT 'pending' NOT NULL,
	`identity_verified` integer DEFAULT false NOT NULL,
	`proof_of_funds_verified` integer DEFAULT false NOT NULL,
	`verified_at` integer,
	`verified_by` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`verified_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buyer_verifications_user_id_unique` ON `buyer_verifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `listing_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listing_id` integer NOT NULL,
	`document_name` text NOT NULL,
	`document_url` text NOT NULL,
	`document_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`uploaded_by` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listing_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listing_id` integer NOT NULL,
	`buyer_id` text NOT NULL,
	`message` text NOT NULL,
	`responded` integer DEFAULT false NOT NULL,
	`responded_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buyer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listing_moderation_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listing_id` integer NOT NULL,
	`moderator_id` text NOT NULL,
	`action` text NOT NULL,
	`old_status` text,
	`new_status` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`moderator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seller_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`title` text NOT NULL,
	`business_model` text,
	`niche` text,
	`geography` text,
	`ttm_revenue` integer,
	`ttm_profit` integer,
	`profit_margin` integer,
	`organic_traffic` text,
	`paid_traffic` text,
	`marketplaces` text,
	`team_size` integer,
	`hours_per_week` integer,
	`asking_price` integer,
	`business_type` text,
	`business_url` text,
	`brand_name` text,
	`full_description` text,
	`rejection_reason` text,
	`approved_at` integer,
	`submitted_at` integer,
	`age_months` integer,
	`revenue_multiple` integer,
	`is_verified` integer DEFAULT false NOT NULL,
	`under_loi` integer DEFAULT false NOT NULL,
	`seller_response_time_hours` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `nda_agreements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` integer NOT NULL,
	`agreed_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
