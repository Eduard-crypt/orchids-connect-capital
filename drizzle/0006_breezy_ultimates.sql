ALTER TABLE `documents` ADD `category` text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `esignature_status` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `esignature_sent_at` integer;--> statement-breakpoint
ALTER TABLE `documents` ADD `esignature_signed_at` integer;