import { db } from '@/db';
import { userMemberships, membershipPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

export interface UserSubscription {
  userId: string;
  planId: number;
  planSlug: string | null;
  planName: string;
  status: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt: Date | null;
  maxListings: number;
  escrowFeePercentage: number;
  featuredPlacement: boolean;
  analyticsAccess: boolean;
  whiteLabelOptions: boolean;
  dedicatedManager: boolean;
  features: Record<string, boolean>;
}

export const getUserSubscription = cache(async (userId: string): Promise<UserSubscription | null> => {
  const membership = await db
    .select({
      membership: userMemberships,
      plan: membershipPlans,
    })
    .from(userMemberships)
    .leftJoin(membershipPlans, eq(userMemberships.planId, membershipPlans.id))
    .where(eq(userMemberships.userId, userId))
    .limit(1);

  if (!membership.length || !membership[0].plan) {
    return null;
  }

  const { membership: m, plan: p } = membership[0];
  const now = new Date();

  const isActive = 
    m.status === 'active' || 
    m.status === 'trialing' || 
    (m.status === 'past_due' && m.currentPeriodEnd && m.currentPeriodEnd > now);

  const isTrial = m.status === 'trialing' && m.trialEndsAt && m.trialEndsAt > now;

  return {
    userId: m.userId,
    planId: m.planId,
    planSlug: p.slug,
    planName: p.name,
    status: m.status,
    stripeSubscriptionId: m.stripeSubscriptionId,
    currentPeriodEnd: m.currentPeriodEnd,
    cancelAtPeriodEnd: m.cancelAtPeriodEnd,
    isActive,
    isTrial: isTrial || false,
    trialEndsAt: m.trialEndsAt,
    maxListings: p.maxListings,
    escrowFeePercentage: p.escrowFeePercentage,
    featuredPlacement: p.featuredPlacement,
    analyticsAccess: p.analyticsAccess,
    whiteLabelOptions: p.whiteLabelOptions,
    dedicatedManager: p.dedicatedManager,
    features: (p.features as Record<string, boolean>) || {},
  };
});

export async function requireActiveSubscription(userId: string): Promise<UserSubscription> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    throw new Error('No subscription found. Please subscribe to a plan.');
  }

  if (!subscription.isActive) {
    throw new Error('Your subscription is not active. Please update your payment method or renew your subscription.');
  }

  return subscription;
}

export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.isActive) {
    return false;
  }

  return subscription.features[feature] === true;
}

export async function canCreateListing(userId: string): Promise<{ allowed: boolean; reason?: string; currentCount?: number; maxListings?: number }> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return { allowed: false, reason: 'No active subscription' };
  }

  if (!subscription.isActive) {
    return { allowed: false, reason: 'Subscription is not active' };
  }

  const [result] = await db.execute<{ count: number }>(
    `SELECT COUNT(*) as count FROM listings WHERE seller_id = ? AND status != 'rejected'`,
    [userId]
  );

  const currentCount = result?.count || 0;

  if (currentCount >= subscription.maxListings) {
    return {
      allowed: false,
      reason: 'Listing limit reached',
      currentCount,
      maxListings: subscription.maxListings,
    };
  }

  return {
    allowed: true,
    currentCount,
    maxListings: subscription.maxListings,
  };
}

export async function getEscrowFeePercentage(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);
  return subscription?.escrowFeePercentage || 5.0;
}

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

export function getPlanTier(planSlug: string | null): SubscriptionTier {
  if (!planSlug) return 'free';
  
  const slug = planSlug.toLowerCase();
  if (slug.includes('enterprise')) return 'enterprise';
  if (slug.includes('professional') || slug.includes('pro')) return 'professional';
  if (slug.includes('starter') || slug.includes('basic')) return 'starter';
  
  return 'free';
}

export async function requireMinimumTier(userId: string, minimumTier: SubscriptionTier): Promise<void> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.isActive) {
    throw new Error('Active subscription required');
  }

  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
  };

  const userTier = getPlanTier(subscription.planSlug);
  const userTierLevel = tierHierarchy[userTier];
  const requiredTierLevel = tierHierarchy[minimumTier];

  if (userTierLevel < requiredTierLevel) {
    throw new Error(`This feature requires ${minimumTier} tier or higher. Your current tier: ${userTier}`);
  }
}

export interface FeatureLimit {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
}

export async function getFeatureLimits(userId: string): Promise<{
  listings: FeatureLimit;
  documents: FeatureLimit;
  messages: FeatureLimit;
}> {
  const subscription = await getUserSubscription(userId);
  const maxListings = subscription?.maxListings || 0;

  const [listingsResult] = await db.execute<{ count: number }>(
    `SELECT COUNT(*) as count FROM listings WHERE seller_id = ? AND status != 'rejected'`,
    [userId]
  );
  const listingsUsed = listingsResult?.count || 0;

  const [documentsResult] = await db.execute<{ count: number }>(
    `SELECT COUNT(*) as count FROM documents WHERE user_id = ?`,
    [userId]
  );
  const documentsUsed = documentsResult?.count || 0;
  const documentsLimit = 100;

  const [messagesResult] = await db.execute<{ count: number }>(
    `SELECT COUNT(*) as count FROM thread_messages WHERE sender_id = ? AND created_at > datetime('now', '-30 days')`,
    [userId]
  );
  const messagesUsed = messagesResult?.count || 0;
  const messagesLimit = 500;

  return {
    listings: {
      used: listingsUsed,
      limit: maxListings,
      remaining: Math.max(0, maxListings - listingsUsed),
      percentage: maxListings > 0 ? (listingsUsed / maxListings) * 100 : 100,
      exceeded: listingsUsed >= maxListings,
    },
    documents: {
      used: documentsUsed,
      limit: documentsLimit,
      remaining: Math.max(0, documentsLimit - documentsUsed),
      percentage: (documentsUsed / documentsLimit) * 100,
      exceeded: documentsUsed >= documentsLimit,
    },
    messages: {
      used: messagesUsed,
      limit: messagesLimit,
      remaining: Math.max(0, messagesLimit - messagesUsed),
      percentage: (messagesUsed / messagesLimit) * 100,
      exceeded: messagesUsed >= messagesLimit,
    },
  };
}

export class InsufficientSubscriptionError extends Error {
  constructor(
    message: string,
    public requiredTier?: SubscriptionTier,
    public currentTier?: SubscriptionTier
  ) {
    super(message);
    this.name = 'InsufficientSubscriptionError';
  }
}

export class FeatureLimitExceededError extends Error {
  constructor(
    message: string,
    public feature: string,
    public used: number,
    public limit: number
  ) {
    super(message);
    this.name = 'FeatureLimitExceededError';
  }
}
