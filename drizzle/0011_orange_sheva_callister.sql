CREATE TABLE `forum_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forum_categories_name_unique` ON `forum_categories` (`name`);--> statement-breakpoint
CREATE TABLE `forum_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `forum_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `forum_comments_post_id_idx` ON `forum_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `forum_comments_user_id_idx` ON `forum_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `forum_comments_created_at_idx` ON `forum_comments` (`created_at`);--> statement-breakpoint
CREATE TABLE `forum_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer,
	`comment_id` integer,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `forum_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comment_id`) REFERENCES `forum_comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forum_likes_post_user_idx` ON `forum_likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `forum_likes_comment_user_idx` ON `forum_likes` (`comment_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `forum_likes_user_id_idx` ON `forum_likes` (`user_id`);--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category_id` integer,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`comments_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `forum_posts_user_id_idx` ON `forum_posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `forum_posts_category_id_idx` ON `forum_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `forum_posts_created_at_idx` ON `forum_posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `forum_posts_likes_count_idx` ON `forum_posts` (`likes_count`);