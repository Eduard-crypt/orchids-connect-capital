CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`related_entity_type` text,
	`related_entity_id` integer,
	`action_url` text,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` integer,
	`priority` text DEFAULT 'normal' NOT NULL,
	`delivery_method` text DEFAULT 'in_app' NOT NULL,
	`sent_at` integer,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `notifications_is_read_idx` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `notifications_priority_idx` ON `notifications` (`priority`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_is_read_idx` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_log_user_id_idx` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_log_action_idx` ON `audit_log` (`action`);--> statement-breakpoint
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `buyer_profiles_user_id_idx` ON `buyer_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `buyer_verifications_user_id_idx` ON `buyer_verifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `buyer_verifications_status_idx` ON `buyer_verifications` (`verification_status`);--> statement-breakpoint
CREATE INDEX `documents_user_id_idx` ON `documents` (`user_id`);--> statement-breakpoint
CREATE INDEX `documents_category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `documents_esignature_status_idx` ON `documents` (`esignature_status`);--> statement-breakpoint
CREATE INDEX `escrow_transactions_listing_id_idx` ON `escrow_transactions` (`listing_id`);--> statement-breakpoint
CREATE INDEX `escrow_transactions_buyer_id_idx` ON `escrow_transactions` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `escrow_transactions_seller_id_idx` ON `escrow_transactions` (`seller_id`);--> statement-breakpoint
CREATE INDEX `escrow_transactions_status_idx` ON `escrow_transactions` (`status`);--> statement-breakpoint
CREATE INDEX `escrow_transactions_reference_id_idx` ON `escrow_transactions` (`escrow_reference_id`);--> statement-breakpoint
CREATE INDEX `listing_documents_listing_id_idx` ON `listing_documents` (`listing_id`);--> statement-breakpoint
CREATE INDEX `listing_documents_uploaded_by_idx` ON `listing_documents` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `listing_documents_is_public_idx` ON `listing_documents` (`is_public`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_listing_id_idx` ON `listing_inquiries` (`listing_id`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_buyer_id_idx` ON `listing_inquiries` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_responded_idx` ON `listing_inquiries` (`responded`);--> statement-breakpoint
CREATE INDEX `listing_moderation_logs_listing_id_idx` ON `listing_moderation_logs` (`listing_id`);--> statement-breakpoint
CREATE INDEX `listing_moderation_logs_moderator_id_idx` ON `listing_moderation_logs` (`moderator_id`);--> statement-breakpoint
CREATE INDEX `listing_moderation_logs_created_at_idx` ON `listing_moderation_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `listings_seller_id_idx` ON `listings` (`seller_id`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`);--> statement-breakpoint
CREATE INDEX `listings_business_type_idx` ON `listings` (`business_type`);--> statement-breakpoint
CREATE INDEX `listings_asking_price_idx` ON `listings` (`asking_price`);--> statement-breakpoint
CREATE INDEX `listings_is_verified_idx` ON `listings` (`is_verified`);--> statement-breakpoint
CREATE INDEX `listings_created_at_idx` ON `listings` (`created_at`);--> statement-breakpoint
CREATE INDEX `listings_approved_at_idx` ON `listings` (`approved_at`);--> statement-breakpoint
CREATE INDEX `loi_offers_listing_id_idx` ON `loi_offers` (`listing_id`);--> statement-breakpoint
CREATE INDEX `loi_offers_buyer_id_idx` ON `loi_offers` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `loi_offers_seller_id_idx` ON `loi_offers` (`seller_id`);--> statement-breakpoint
CREATE INDEX `loi_offers_status_idx` ON `loi_offers` (`status`);--> statement-breakpoint
CREATE INDEX `loi_offers_expiration_date_idx` ON `loi_offers` (`expiration_date`);--> statement-breakpoint
CREATE INDEX `message_attachments_message_id_idx` ON `message_attachments` (`message_id`);--> statement-breakpoint
CREATE INDEX `message_threads_listing_id_idx` ON `message_threads` (`listing_id`);--> statement-breakpoint
CREATE INDEX `message_threads_buyer_id_idx` ON `message_threads` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `message_threads_seller_id_idx` ON `message_threads` (`seller_id`);--> statement-breakpoint
CREATE INDEX `message_threads_last_message_at_idx` ON `message_threads` (`last_message_at`);--> statement-breakpoint
CREATE INDEX `messages_sender_id_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `messages_recipient_id_idx` ON `messages` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `migration_checklist_tasks_checklist_id_idx` ON `migration_checklist_tasks` (`checklist_id`);--> statement-breakpoint
CREATE INDEX `migration_checklist_tasks_status_idx` ON `migration_checklist_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `migration_checklist_tasks_category_idx` ON `migration_checklist_tasks` (`task_category`);--> statement-breakpoint
CREATE INDEX `migration_checklists_escrow_id_idx` ON `migration_checklists` (`escrow_id`);--> statement-breakpoint
CREATE INDEX `migration_checklists_listing_id_idx` ON `migration_checklists` (`listing_id`);--> statement-breakpoint
CREATE INDEX `migration_checklists_buyer_id_idx` ON `migration_checklists` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `migration_checklists_seller_id_idx` ON `migration_checklists` (`seller_id`);--> statement-breakpoint
CREATE INDEX `migration_checklists_status_idx` ON `migration_checklists` (`status`);--> statement-breakpoint
CREATE INDEX `nda_agreements_user_id_idx` ON `nda_agreements` (`user_id`);--> statement-breakpoint
CREATE INDEX `nda_agreements_listing_id_idx` ON `nda_agreements` (`listing_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nda_agreements_user_listing_idx` ON `nda_agreements` (`user_id`,`listing_id`);--> statement-breakpoint
CREATE INDEX `profiles_user_id_idx` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `rate_limit_log_identifier_idx` ON `rate_limit_log` (`identifier`);--> statement-breakpoint
CREATE INDEX `rate_limit_log_endpoint_idx` ON `rate_limit_log` (`endpoint`);--> statement-breakpoint
CREATE INDEX `rate_limit_log_window_start_idx` ON `rate_limit_log` (`window_start`);--> statement-breakpoint
CREATE INDEX `saved_searches_user_id_idx` ON `saved_searches` (`user_id`);--> statement-breakpoint
CREATE INDEX `saved_searches_created_at_idx` ON `saved_searches` (`created_at`);--> statement-breakpoint
CREATE INDEX `seller_profiles_user_id_idx` ON `seller_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_expires_at_idx` ON `session` (`expires_at`);--> statement-breakpoint
CREATE INDEX `thread_messages_thread_id_idx` ON `thread_messages` (`thread_id`);--> statement-breakpoint
CREATE INDEX `thread_messages_sender_id_idx` ON `thread_messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `thread_messages_created_at_idx` ON `thread_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `two_factor_settings_user_id_idx` ON `two_factor_settings` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_created_at_idx` ON `user` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_profiles_user_id_idx` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_profiles_kyc_status_idx` ON `user_profiles` (`kyc_status`);--> statement-breakpoint
CREATE INDEX `user_profiles_plan_idx` ON `user_profiles` (`plan`);--> statement-breakpoint
CREATE INDEX `user_roles_user_id_idx` ON `user_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_roles_is_buyer_idx` ON `user_roles` (`is_buyer`);--> statement-breakpoint
CREATE INDEX `user_roles_is_seller_idx` ON `user_roles` (`is_seller`);--> statement-breakpoint
CREATE INDEX `user_settings_user_id_idx` ON `user_settings` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_documents_user_id_idx` ON `verification_documents` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_documents_type_idx` ON `verification_documents` (`document_type`);