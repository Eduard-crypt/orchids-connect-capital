import { sqliteTable, integer, text, index, uniqueIndex, real } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  emailIdx: index("user_email_idx").on(table.email),
  createdAtIdx: index("user_created_at_idx").on(table.createdAt),
}));

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (table) => ({
  userIdIdx: index("session_user_id_idx").on(table.userId),
  expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
}));

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("account_user_id_idx").on(table.userId),
}));

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// User profile and settings tables
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  plan: text('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  kycStatus: text('kyc_status').notNull().default('pending'),
  kycVerifiedAt: integer('kyc_verified_at', { mode: 'timestamp' }),
  phone: text('phone'),
  companyName: text('company_name'),
  ownsBusiness: integer('owns_business', { mode: 'boolean' }).default(false).notNull(),
  primaryBusinessInterest: text('primary_business_interest'),
  businessLocation: text('business_location'),
  purchaseTimeframe: text('purchase_timeframe'),
  isTeacherVerified: integer('is_teacher_verified', { mode: 'boolean' }).default(false).notNull(),
  teacherVerifiedAt: integer('teacher_verified_at', { mode: 'timestamp' }),
  teacherVerifiedBy: text('teacher_verified_by').references(() => user.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("user_profiles_user_id_idx").on(table.userId),
  kycStatusIdx: index("user_profiles_kyc_status_idx").on(table.kycStatus),
  planIdx: index("user_profiles_plan_idx").on(table.plan),
}));

export const userRoles = sqliteTable('user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  isBuyer: integer('is_buyer', { mode: 'boolean' }).default(false).notNull(),
  isSeller: integer('is_seller', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("user_roles_user_id_idx").on(table.userId),
  isBuyerIdx: index("user_roles_is_buyer_idx").on(table.isBuyer),
  isSellerIdx: index("user_roles_is_seller_idx").on(table.isSeller),
}));

export const buyerProfiles = sqliteTable('buyer_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  industries: text('industries'),
  regions: text('regions'),
  proofOfFundsDocument: text('proof_of_funds_document'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("buyer_profiles_user_id_idx").on(table.userId),
}));

export const sellerProfiles = sqliteTable('seller_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  businessType: text('business_type'),
  keyMetrics: text('key_metrics'),
  targetPrice: integer('target_price'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("seller_profiles_user_id_idx").on(table.userId),
}));

export const savedSearches = sqliteTable('saved_searches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  searchCriteria: text('search_criteria', { mode: 'json' }).notNull(),
  emailAlertsEnabled: integer('email_alerts_enabled', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("saved_searches_user_id_idx").on(table.userId),
  createdAtIdx: index("saved_searches_created_at_idx").on(table.createdAt),
}));

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  recipientId: text('recipient_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  recipientIdIdx: index("messages_recipient_id_idx").on(table.recipientId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
}));

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  category: text('category').notNull().default('other'),
  esignatureStatus: text('esignature_status').notNull().default('none'),
  esignatureSentAt: integer('esignature_sent_at', { mode: 'timestamp' }),
  esignatureSignedAt: integer('esignature_signed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("documents_user_id_idx").on(table.userId),
  categoryIdx: index("documents_category_idx").on(table.category),
  esignatureStatusIdx: index("documents_esignature_status_idx").on(table.esignatureStatus),
}));

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true).notNull(),
  smsNotifications: integer('sms_notifications', { mode: 'boolean' }).default(false).notNull(),
  marketingEmails: integer('marketing_emails', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("user_settings_user_id_idx").on(table.userId),
}));

export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  roleBuyer: integer('role_buyer', { mode: 'boolean' }).default(false).notNull(),
  roleSeller: integer('role_seller', { mode: 'boolean' }).default(false).notNull(),
  kycStatus: text('kyc_status').notNull().default('not_verified'),
  plan: text('plan').notNull().default('free'),
  messagesLimit: integer('messages_limit').notNull().default(50),
  savedSearchesLimit: integer('saved_searches_limit').notNull().default(10),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("profiles_user_id_idx").on(table.userId),
}));

// Forum tables for better-auth
export const forumCategories = sqliteTable('forum_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const forumPosts = sqliteTable('forum_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  categoryId: integer('category_id').references(() => forumCategories.id, { onDelete: 'set null' }),
  likesCount: integer('likes_count').notNull().default(0),
  commentsCount: integer('comments_count').notNull().default(0),
  handshakesCount: integer('handshakes_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index("forum_posts_user_id_idx").on(table.userId),
  categoryIdIdx: index("forum_posts_category_id_idx").on(table.categoryId),
  createdAtIdx: index("forum_posts_created_at_idx").on(table.createdAt),
  likesCountIdx: index("forum_posts_likes_count_idx").on(table.likesCount),
}));

export const forumComments = sqliteTable('forum_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  likesCount: integer('likes_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  postIdIdx: index("forum_comments_post_id_idx").on(table.postId),
  userIdIdx: index("forum_comments_user_id_idx").on(table.userId),
  createdAtIdx: index("forum_comments_created_at_idx").on(table.createdAt),
}));

export const forumLikes = sqliteTable('forum_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => forumPosts.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => forumComments.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  postUserIdx: uniqueIndex("forum_likes_post_user_idx").on(table.postId, table.userId),
  commentUserIdx: uniqueIndex("forum_likes_comment_user_idx").on(table.commentId, table.userId),
  userIdIdx: index("forum_likes_user_id_idx").on(table.userId),
}));

export const forumHandshakes = sqliteTable('forum_handshakes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  postUserIdx: uniqueIndex("forum_handshakes_post_user_idx").on(table.postId, table.userId),
  userIdIdx: index("forum_handshakes_user_id_idx").on(table.userId),
  postIdIdx: index("forum_handshakes_post_id_idx").on(table.postId),
}));

// Listings tables
export const listings = sqliteTable('listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sellerId: text('seller_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'),
  title: text('title').notNull(),
  businessModel: text('business_model'),
  niche: text('niche'),
  geography: text('geography'),
  ttmRevenue: integer('ttm_revenue'),
  ttmProfit: integer('ttm_profit'),
  profitMargin: integer('profit_margin'),
  organicTraffic: text('organic_traffic'),
  paidTraffic: text('paid_traffic'),
  marketplaces: text('marketplaces'),
  teamSize: integer('team_size'),
  hoursPerWeek: integer('hours_per_week'),
  askingPrice: integer('asking_price'),
  businessType: text('business_type'),
  businessUrl: text('business_url'),
  brandName: text('brand_name'),
  fullDescription: text('full_description'),
  rejectionReason: text('rejection_reason'),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }),
  ageMonths: integer('age_months'),
  revenueMultiple: integer('revenue_multiple', { mode: 'number' }),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  underLoi: integer('under_loi', { mode: 'boolean' }).default(false).notNull(),
  sellerResponseTimeHours: integer('seller_response_time_hours'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  sellerIdIdx: index("listings_seller_id_idx").on(table.sellerId),
  statusIdx: index("listings_status_idx").on(table.status),
  businessTypeIdx: index("listings_business_type_idx").on(table.businessType),
  askingPriceIdx: index("listings_asking_price_idx").on(table.askingPrice),
  isVerifiedIdx: index("listings_is_verified_idx").on(table.isVerified),
  createdAtIdx: index("listings_created_at_idx").on(table.createdAt),
  approvedAtIdx: index("listings_approved_at_idx").on(table.approvedAt),
}));

export const listingDocuments = sqliteTable('listing_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  documentName: text('document_name').notNull(),
  documentUrl: text('document_url').notNull(),
  documentType: text('document_type').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  listingIdIdx: index("listing_documents_listing_id_idx").on(table.listingId),
  uploadedByIdx: index("listing_documents_uploaded_by_idx").on(table.uploadedBy),
  isPublicIdx: index("listing_documents_is_public_idx").on(table.isPublic),
}));

export const listingModerationLogs = sqliteTable('listing_moderation_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  moderatorId: text('moderator_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  oldStatus: text('old_status'),
  newStatus: text('new_status'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  listingIdIdx: index("listing_moderation_logs_listing_id_idx").on(table.listingId),
  moderatorIdIdx: index("listing_moderation_logs_moderator_id_idx").on(table.moderatorId),
  createdAtIdx: index("listing_moderation_logs_created_at_idx").on(table.createdAt),
}));

export const ndaAgreements = sqliteTable('nda_agreements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  agreedAt: integer('agreed_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("nda_agreements_user_id_idx").on(table.userId),
  listingIdIdx: index("nda_agreements_listing_id_idx").on(table.listingId),
  userListingIdx: uniqueIndex("nda_agreements_user_listing_idx").on(table.userId, table.listingId),
}));

export const buyerVerifications = sqliteTable('buyer_verifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  verificationStatus: text('verification_status').notNull().default('pending'),
  identityVerified: integer('identity_verified', { mode: 'boolean' }).default(false).notNull(),
  proofOfFundsVerified: integer('proof_of_funds_verified', { mode: 'boolean' }).default(false).notNull(),
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  verifiedBy: text('verified_by').references(() => user.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("buyer_verifications_user_id_idx").on(table.userId),
  verificationStatusIdx: index("buyer_verifications_status_idx").on(table.verificationStatus),
}));

export const listingInquiries = sqliteTable('listing_inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  buyerId: text('buyer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  responded: integer('responded', { mode: 'boolean' }).default(false).notNull(),
  respondedAt: integer('responded_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  listingIdIdx: index("listing_inquiries_listing_id_idx").on(table.listingId),
  buyerIdIdx: index("listing_inquiries_buyer_id_idx").on(table.buyerId),
  respondedIdx: index("listing_inquiries_responded_idx").on(table.responded),
}));

// Messaging system tables
export const messageThreads = sqliteTable('message_threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  buyerId: text('buyer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sellerId: text('seller_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
  buyerUnreadCount: integer('buyer_unread_count').notNull().default(0),
  sellerUnreadCount: integer('seller_unread_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  listingIdIdx: index("message_threads_listing_id_idx").on(table.listingId),
  buyerIdIdx: index("message_threads_buyer_id_idx").on(table.buyerId),
  sellerIdIdx: index("message_threads_seller_id_idx").on(table.sellerId),
  lastMessageAtIdx: index("message_threads_last_message_at_idx").on(table.lastMessageAt),
}));

export const threadMessages = sqliteTable('thread_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id').notNull().references(() => messageThreads.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  messageBody: text('message_body').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  threadIdIdx: index("thread_messages_thread_id_idx").on(table.threadId),
  senderIdIdx: index("thread_messages_sender_id_idx").on(table.senderId),
  createdAtIdx: index("thread_messages_created_at_idx").on(table.createdAt),
}));

export const messageAttachments = sqliteTable('message_attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: integer('message_id').notNull().references(() => threadMessages.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  messageIdIdx: index("message_attachments_message_id_idx").on(table.messageId),
}));

// LOI Offers table
export const loiOffers = sqliteTable('loi_offers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  buyerId: text('buyer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sellerId: text('seller_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'),
  offerPrice: integer('offer_price').notNull(),
  cashAmount: integer('cash_amount').notNull(),
  earnoutAmount: integer('earnout_amount').notNull(),
  earnoutTerms: text('earnout_terms'),
  dueDiligenceDays: integer('due_diligence_days').notNull(),
  exclusivityDays: integer('exclusivity_days').notNull(),
  conditions: text('conditions', { mode: 'json' }),
  expirationDate: integer('expiration_date', { mode: 'timestamp' }).notNull(),
  pdfUrl: text('pdf_url'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  respondedAt: integer('responded_at', { mode: 'timestamp' }),
  responseNotes: text('response_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  listingIdIdx: index("loi_offers_listing_id_idx").on(table.listingId),
  buyerIdIdx: index("loi_offers_buyer_id_idx").on(table.buyerId),
  sellerIdIdx: index("loi_offers_seller_id_idx").on(table.sellerId),
  statusIdx: index("loi_offers_status_idx").on(table.status),
  expirationDateIdx: index("loi_offers_expiration_date_idx").on(table.expirationDate),
}));

// Escrow Transactions table
export const escrowTransactions = sqliteTable('escrow_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  loiId: integer('loi_id').references(() => loiOffers.id, { onDelete: 'set null' }),
  buyerId: text('buyer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sellerId: text('seller_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('initiated'),
  escrowAmount: integer('escrow_amount').notNull(),
  escrowProvider: text('escrow_provider'),
  escrowReferenceId: text('escrow_reference_id'),
  initiatedAt: integer('initiated_at', { mode: 'timestamp' }),
  fundedAt: integer('funded_at', { mode: 'timestamp' }),
  migrationStartedAt: integer('migration_started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  releasedAt: integer('released_at', { mode: 'timestamp' }),
  webhookSecret: text('webhook_secret'),
  notes: text('notes'),
  platformFeePercent: integer('platform_fee_percent').notNull().default(5),
  platformFeeAmount: integer('platform_fee_amount'),
  buyerTotalAmount: integer('buyer_total_amount'),
  sellerNetAmount: integer('seller_net_amount'),
  feeInvoiceUrl: text('fee_invoice_url'),
  feeTransferredAt: integer('fee_transferred_at', { mode: 'timestamp' }),
  platformAccountId: text('platform_account_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  listingIdIdx: index("escrow_transactions_listing_id_idx").on(table.listingId),
  buyerIdIdx: index("escrow_transactions_buyer_id_idx").on(table.buyerId),
  sellerIdIdx: index("escrow_transactions_seller_id_idx").on(table.sellerId),
  statusIdx: index("escrow_transactions_status_idx").on(table.status),
  escrowReferenceIdIdx: index("escrow_transactions_reference_id_idx").on(table.escrowReferenceId),
}));

// Migration Checklists table
export const migrationChecklists = sqliteTable('migration_checklists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  escrowId: integer('escrow_id').notNull().references(() => escrowTransactions.id, { onDelete: 'cascade' }),
  listingId: integer('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  buyerId: text('buyer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sellerId: text('seller_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('in_progress'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  escrowIdIdx: index("migration_checklists_escrow_id_idx").on(table.escrowId),
  listingIdIdx: index("migration_checklists_listing_id_idx").on(table.listingId),
  buyerIdIdx: index("migration_checklists_buyer_id_idx").on(table.buyerId),
  sellerIdIdx: index("migration_checklists_seller_id_idx").on(table.sellerId),
  statusIdx: index("migration_checklists_status_idx").on(table.status),
}));

// Migration Checklist Tasks table
export const migrationChecklistTasks = sqliteTable('migration_checklist_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  checklistId: integer('checklist_id').notNull().references(() => migrationChecklists.id, { onDelete: 'cascade' }),
  taskName: text('task_name').notNull(),
  taskCategory: text('task_category').notNull(),
  taskDescription: text('task_description'),
  status: text('status').notNull().default('pending'),
  buyerConfirmed: integer('buyer_confirmed', { mode: 'boolean' }).default(false).notNull(),
  sellerConfirmed: integer('seller_confirmed', { mode: 'boolean' }).default(false).notNull(),
  buyerConfirmedAt: integer('buyer_confirmed_at', { mode: 'timestamp' }),
  sellerConfirmedAt: integer('seller_confirmed_at', { mode: 'timestamp' }),
  notes: text('notes'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  checklistIdIdx: index("migration_checklist_tasks_checklist_id_idx").on(table.checklistId),
  statusIdx: index("migration_checklist_tasks_status_idx").on(table.status),
  taskCategoryIdx: index("migration_checklist_tasks_category_idx").on(table.taskCategory),
}));

// Verification documents table
export const verificationDocuments = sqliteTable('verification_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("verification_documents_user_id_idx").on(table.userId),
  documentTypeIdx: index("verification_documents_type_idx").on(table.documentType),
}));

// Two-factor authentication settings table
export const twoFactorSettings = sqliteTable('two_factor_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  secret: text('secret'),
  backupCodes: text('backup_codes'),
  enabledAt: integer('enabled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("two_factor_settings_user_id_idx").on(table.userId),
}));

// Rate limit log table
export const rateLimitLog = sqliteTable('rate_limit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  identifier: text('identifier').notNull(),
  endpoint: text('endpoint').notNull(),
  requestCount: integer('request_count').notNull().default(1),
  windowStart: integer('window_start', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  identifierIdx: index("rate_limit_log_identifier_idx").on(table.identifier),
  endpointIdx: index("rate_limit_log_endpoint_idx").on(table.endpoint),
  windowStartIdx: index("rate_limit_log_window_start_idx").on(table.windowStart),
}));

// Audit log table
export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("audit_log_user_id_idx").on(table.userId),
  actionIdx: index("audit_log_action_idx").on(table.action),
  createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
}));

// NEW: Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'message', 'loi', 'listing_update', 'escrow', 'verification', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedEntityType: text('related_entity_type'), // 'listing', 'message', 'loi', 'escrow', 'verification', etc.
  relatedEntityId: integer('related_entity_id'), // ID of related entity
  actionUrl: text('action_url'), // URL to navigate to when clicked
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  readAt: integer('read_at', { mode: 'timestamp' }),
  priority: text('priority').notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'
  deliveryMethod: text('delivery_method').notNull().default('in_app'), // 'in_app', 'email', 'sms', 'push'
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  metadata: text('metadata', { mode: 'json' }), // Additional data as JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  typeIdx: index("notifications_type_idx").on(table.type),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  priorityIdx: index("notifications_priority_idx").on(table.priority),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  userIdIsReadIdx: index("notifications_user_id_is_read_idx").on(table.userId, table.isRead),
}));

// Marketplace listings table
export const marketplaceListings = sqliteTable('marketplace_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  location: text('location').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  annualRevenue: integer('annual_revenue').notNull(),
  annualCashFlow: integer('annual_cash_flow').notNull(),
  description: text('description').notNull(),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  employees: integer('employees').notNull(),
  yearEstablished: integer('year_established').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  categoryIdx: index("marketplace_listings_category_idx").on(table.category),
  priceIdx: index("marketplace_listings_price_idx").on(table.price),
  isFeaturedIdx: index("marketplace_listings_is_featured_idx").on(table.isFeatured),
  isVerifiedIdx: index("marketplace_listings_is_verified_idx").on(table.isVerified),
  createdAtIdx: index("marketplace_listings_created_at_idx").on(table.createdAt),
}));

// Saved listings (watchlist) table
export const savedListings = sqliteTable('saved_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  listingId: integer('listing_id').notNull().references(() => marketplaceListings.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("saved_listings_user_id_idx").on(table.userId),
  listingIdIdx: index("saved_listings_listing_id_idx").on(table.listingId),
  userListingUnique: uniqueIndex("saved_listings_user_listing_unique").on(table.userId, table.listingId),
}));

// Sell Requests table
export const sellRequests = sqliteTable('sell_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull(),
  businessName: text('business_name').notNull(),
  businessUrl: text('business_url').notNull(),
  businessModel: text('business_model').notNull(),
  annualRevenue: integer('annual_revenue').notNull(),
  annualProfit: integer('annual_profit').notNull(),
  employeesCount: integer('employees_count').notNull(),
  description: text('description').notNull(),
  formData: text('form_data', { mode: 'json' }),
  status: text('status').notNull().default('pending_review'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("sell_requests_user_id_idx").on(table.userId),
  statusIdx: index("sell_requests_status_idx").on(table.status),
  createdAtIdx: index("sell_requests_created_at_idx").on(table.createdAt),
}));

// AI Agent Rental Marketplace tables
export const aiAgents = sqliteTable('ai_agents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  startingPrice: text('starting_price').notNull(),
  features: text('features').notNull(),
  category: text('category'),
  badge: text('badge'),
  iconName: text('icon_name'),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  categoryIdx: index("ai_agents_category_idx").on(table.category),
}));

export const aiAgentTrials = sqliteTable('ai_agent_trials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("ai_agent_trials_user_id_idx").on(table.userId),
  agentIdIdx: index("ai_agent_trials_agent_id_idx").on(table.agentId),
  statusIdx: index("ai_agent_trials_status_idx").on(table.status),
}));

export const aiAgentDemoRequests = sqliteTable('ai_agent_demo_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  companySize: text('company_size').notNull(),
  useCase: text('use_case').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("ai_agent_demo_requests_user_id_idx").on(table.userId),
  agentIdIdx: index("ai_agent_demo_requests_agent_id_idx").on(table.agentId),
  statusIdx: index("ai_agent_demo_requests_status_idx").on(table.status),
}));

// TrustBridge Membership System tables
export const membershipPlans = sqliteTable('membership_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  stripeProductId: text('stripe_product_id'),
  stripePriceIdMonthly: text('stripe_price_id_monthly'),
  stripePriceIdAnnual: text('stripe_price_id_annual'),
  pricePerMonth: integer('price_per_month').notNull(),
  pricePerYear: integer('price_per_year'),
  maxListings: integer('max_listings').notNull(),
  escrowFeePercentage: real('escrow_fee_percentage').notNull(),
  verificationSpeed: text('verification_speed').notNull(),
  supportResponseHours: integer('support_response_hours').notNull(),
  documentStorageGb: integer('document_storage_gb').notNull(),
  featuredPlacement: integer('featured_placement', { mode: 'boolean' }).default(false).notNull(),
  analyticsAccess: integer('analytics_access', { mode: 'boolean' }).default(false).notNull(),
  whiteLabelOptions: integer('white_label_options', { mode: 'boolean' }).default(false).notNull(),
  dedicatedManager: integer('dedicated_manager', { mode: 'boolean' }).default(false).notNull(),
  features: text('features', { mode: 'json' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  slugIdx: index("membership_plans_slug_idx").on(table.slug),
  stripeProductIdIdx: index("membership_plans_stripe_product_id_idx").on(table.stripeProductId),
  isActiveIdx: index("membership_plans_is_active_idx").on(table.isActive),
}));

export const userMemberships = sqliteTable('user_memberships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  planId: integer('plan_id').notNull().references(() => membershipPlans.id),
  status: text('status').notNull().default('active'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  billingInterval: text('billing_interval').default('month'),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  renewsAt: integer('renews_at', { mode: 'timestamp' }).notNull(),
  canceledAt: integer('canceled_at', { mode: 'timestamp' }),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp' }),
  paymentMethod: text('payment_method'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("user_memberships_user_id_idx").on(table.userId),
  planIdIdx: index("user_memberships_plan_id_idx").on(table.planId),
  statusIdx: index("user_memberships_status_idx").on(table.status),
  stripeCustomerIdIdx: index("user_memberships_stripe_customer_id_idx").on(table.stripeCustomerId),
  stripeSubscriptionIdIdx: index("user_memberships_stripe_subscription_id_idx").on(table.stripeSubscriptionId),
}));

export const subscriptionPayments = sqliteTable('subscription_payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  membershipId: integer('membership_id').references(() => userMemberships.id, { onDelete: 'set null' }),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull(),
  billingReason: text('billing_reason'),
  invoiceUrl: text('invoice_url'),
  invoicePdf: text('invoice_pdf'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  periodStart: integer('period_start', { mode: 'timestamp' }),
  periodEnd: integer('period_end', { mode: 'timestamp' }),
  failureMessage: text('failure_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("subscription_payments_user_id_idx").on(table.userId),
  membershipIdIdx: index("subscription_payments_membership_id_idx").on(table.membershipId),
  stripeInvoiceIdIdx: index("subscription_payments_stripe_invoice_id_idx").on(table.stripeInvoiceId),
  stripeSubscriptionIdIdx: index("subscription_payments_stripe_subscription_id_idx").on(table.stripeSubscriptionId),
  statusIdx: index("subscription_payments_status_idx").on(table.status),
  createdAtIdx: index("subscription_payments_created_at_idx").on(table.createdAt),
}));

// Payment and Membership System tables
export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  priceAmount: integer('price_amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  billingInterval: text('billing_interval').notNull().default('month'),
  stripePriceId: text('stripe_price_id'),
  maxListings: integer('max_listings').notNull(),
  escrowFeePercentage: real('escrow_fee_percentage').notNull(),
  features: text('features', { mode: 'json' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  slugIdx: index("plans_slug_idx").on(table.slug),
  isActiveIdx: index("plans_is_active_idx").on(table.isActive),
}));

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => plans.id, { onDelete: 'restrict' }),
  status: text('status').notNull().default('pending'),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  paymentProvider: text('payment_provider').notNull().default('stripe'),
  stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
  stripeCheckoutSessionIdIdx: index("orders_stripe_checkout_session_id_idx").on(table.stripeCheckoutSessionId),
}));

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull().default('stripe'),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  status: text('status').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  paymentMethodType: text('payment_method_type'),
  rawResponse: text('raw_response', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  orderIdIdx: index("payments_order_id_idx").on(table.orderId),
  stripePaymentIntentIdIdx: index("payments_stripe_payment_intent_id_idx").on(table.stripePaymentIntentId),
  statusIdx: index("payments_status_idx").on(table.status),
}));

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  planId: integer('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("cart_items_user_id_idx").on(table.userId),
  sessionIdIdx: index("cart_items_session_id_idx").on(table.sessionId),
  planIdIdx: index("cart_items_plan_id_idx").on(table.planId),
  userPlanUnique: uniqueIndex("cart_items_user_plan_unique").on(table.userId, table.planId),
}));

// Contact messages table
export const contactMessages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  interestType: text('interest_type').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  statusIdx: index("contact_messages_status_idx").on(table.status),
  createdAtIdx: index("contact_messages_created_at_idx").on(table.createdAt),
  interestTypeIdx: index("contact_messages_interest_type_idx").on(table.interestType),
}));

// Promo codes table
export const promoCodes = sqliteTable('promo_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'percentage' or 'fixed'
  value: integer('value').notNull(), // percentage (e.g., 10 for 10%) or amount in cents
  description: text('description').notNull(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0).notNull(),
  minOrderValue: integer('min_order_value'), // in cents
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  codeIdx: index("promo_codes_code_idx").on(table.code),
  activeIdx: index("promo_codes_active_idx").on(table.active),
  typeIdx: index("promo_codes_type_idx").on(table.type),
}));

// Cart promo codes table
export const cartPromoCodes = sqliteTable('cart_promo_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  promoCodeId: integer('promo_code_id').notNull().references(() => promoCodes.id, { onDelete: 'cascade' }),
  cartTotal: integer('cart_total').notNull(),
  discountAmount: integer('discount_amount').notNull(),
  finalTotal: integer('final_total').notNull(),
  appliedAt: integer('applied_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("cart_promo_codes_user_id_idx").on(table.userId),
  promoCodeIdIdx: index("cart_promo_codes_promo_code_id_idx").on(table.promoCodeId),
}));

// Revolut payment orders table
export const revolutOrders = sqliteTable('revolut_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  planSlug: text('plan_slug'),
  revolutOrderId: text('revolut_order_id').unique(),
  merchantOrderExtRef: text('merchant_order_ext_ref').notNull().unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('PENDING'), // PENDING, AUTHORISED, COMPLETED, DECLINED, FAILED, CANCELLED
  promoCodeId: integer('promo_code_id').references(() => promoCodes.id),
  paymentMethod: text('payment_method'), // card, revolut_pay, promo_code
  metadata: text('metadata'), // JSON string for additional data
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("revolut_orders_user_id_idx").on(table.userId),
  revolutOrderIdIdx: index("revolut_orders_revolut_order_id_idx").on(table.revolutOrderId),
  merchantOrderExtRefIdx: index("revolut_orders_merchant_order_ext_ref_idx").on(table.merchantOrderExtRef),
  statusIdx: index("revolut_orders_status_idx").on(table.status),
}));

// Products table for product-to-price_id mapping
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  stripePriceId: text('stripe_price_id'),
  priceAmount: integer('price_amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  imageUrl: text('image_url'),
  category: text('category'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  stripePriceIdIdx: index("products_stripe_price_id_idx").on(table.stripePriceId),
  categoryIdx: index("products_category_idx").on(table.category),
  isActiveIdx: index("products_is_active_idx").on(table.isActive),
}));

// Cart orders table for dynamic cart purchases
export const cartOrders = sqliteTable('cart_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  email: text('email'),
  status: text('status').notNull().default('pending'),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeCustomerId: text('stripe_customer_id'),
  cartData: text('cart_data', { mode: 'json' }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("cart_orders_user_id_idx").on(table.userId),
  statusIdx: index("cart_orders_status_idx").on(table.status),
  stripeCheckoutSessionIdIdx: index("cart_orders_stripe_checkout_session_id_idx").on(table.stripeCheckoutSessionId),
  createdAtIdx: index("cart_orders_created_at_idx").on(table.createdAt),
}));

// Cart order items table for individual items in an order
export const cartOrderItems = sqliteTable('cart_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => cartOrders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(),
  accessGranted: integer('access_granted', { mode: 'boolean' }).default(false).notNull(),
  accessGrantedAt: integer('access_granted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  orderIdIdx: index("cart_order_items_order_id_idx").on(table.orderId),
  productIdIdx: index("cart_order_items_product_id_idx").on(table.productId),
  accessGrantedIdx: index("cart_order_items_access_granted_idx").on(table.accessGranted),
}));

// User purchased products (for access tracking)
export const userProductAccess = sqliteTable('user_product_access', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  orderId: integer('order_id').notNull().references(() => cartOrders.id, { onDelete: 'cascade' }),
  grantedAt: integer('granted_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("user_product_access_user_id_idx").on(table.userId),
  productIdIdx: index("user_product_access_product_id_idx").on(table.productId),
  orderIdIdx: index("user_product_access_order_id_idx").on(table.orderId),
  userProductUnique: uniqueIndex("user_product_access_user_product_unique").on(table.userId, table.productId),
}));