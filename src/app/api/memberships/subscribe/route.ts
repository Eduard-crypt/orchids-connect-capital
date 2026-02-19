import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userMemberships, membershipPlans } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planSlug } = body;

    if (!planSlug) {
      return NextResponse.json(
        { error: 'planSlug is required' },
        { status: 400 }
      );
    }

    // Find plan by slug
    const plan = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.slug, planSlug))
      .get();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if user already has a membership
    const existingMembership = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, session.user.id))
      .get();

    const now = new Date();
    const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    let membership;

    if (existingMembership) {
      // Update existing membership
      membership = await db
        .update(userMemberships)
        .set({
          planId: plan.id,
          status: 'active',
          startedAt: now,
          renewsAt,
          canceledAt: null,
          paymentMethod: 'promo_code',
          updatedAt: now,
        })
        .where(eq(userMemberships.userId, session.user.id))
        .returning()
        .get();
    } else {
      // Create new membership
      membership = await db
        .insert(userMemberships)
        .values({
          userId: session.user.id,
          planId: plan.id,
          status: 'active',
          startedAt: now,
          renewsAt,
          paymentMethod: 'promo_code',
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
    }

    // Fetch full membership with plan details
    const fullMembership = await db
      .select({
        id: userMemberships.id,
        userId: userMemberships.userId,
        planId: userMemberships.planId,
        status: userMemberships.status,
        startedAt: userMemberships.startedAt,
        renewsAt: userMemberships.renewsAt,
        canceledAt: userMemberships.canceledAt,
        paymentMethod: userMemberships.paymentMethod,
        stripeSubscriptionId: userMemberships.stripeSubscriptionId,
        createdAt: userMemberships.createdAt,
        updatedAt: userMemberships.updatedAt,
        plan: membershipPlans,
      })
      .from(userMemberships)
      .leftJoin(membershipPlans, eq(userMemberships.planId, membershipPlans.id))
      .where(eq(userMemberships.id, membership.id))
      .get();

    return NextResponse.json(fullMembership, { status: 201 });
  } catch (error) {
    console.error('Error subscribing to membership:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to membership' },
      { status: 500 }
    );
  }
}