CREATE TABLE `ai_agent_demo_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` integer NOT NULL,
	`preferred_date` text NOT NULL,
	`preferred_time` text NOT NULL,
	`company_size` text NOT NULL,
	`use_case` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `ai_agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_agent_demo_requests_user_id_idx` ON `ai_agent_demo_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `ai_agent_demo_requests_agent_id_idx` ON `ai_agent_demo_requests` (`agent_id`);--> statement-breakpoint
CREATE INDEX `ai_agent_demo_requests_status_idx` ON `ai_agent_demo_requests` (`status`);--> statement-breakpoint
CREATE TABLE `ai_agent_trials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` integer NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `ai_agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_agent_trials_user_id_idx` ON `ai_agent_trials` (`user_id`);--> statement-breakpoint
CREATE INDEX `ai_agent_trials_agent_id_idx` ON `ai_agent_trials` (`agent_id`);--> statement-breakpoint
CREATE INDEX `ai_agent_trials_status_idx` ON `ai_agent_trials` (`status`);--> statement-breakpoint
CREATE TABLE `ai_agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text NOT NULL,
	`starting_price` text NOT NULL,
	`features` text NOT NULL,
	`category` text,
	`badge` text,
	`icon_name` text,
	`image_url` text,
	`is_popular` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_agents_category_idx` ON `ai_agents` (`category`);--> statement-breakpoint
CREATE INDEX `ai_agents_is_popular_idx` ON `ai_agents` (`is_popular`);