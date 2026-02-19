ALTER TABLE `user_profiles` ADD `is_teacher_verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `teacher_verified_at` integer;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `teacher_verified_by` text REFERENCES user(id);