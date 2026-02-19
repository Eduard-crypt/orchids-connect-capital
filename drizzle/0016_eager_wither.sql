DROP INDEX `ai_agents_is_popular_idx`;--> statement-breakpoint
ALTER TABLE `ai_agents` DROP COLUMN `tagline`;--> statement-breakpoint
ALTER TABLE `ai_agents` DROP COLUMN `is_popular`;