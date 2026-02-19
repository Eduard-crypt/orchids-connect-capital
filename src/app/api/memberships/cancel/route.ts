import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userMemberships, membershipPlans } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function DELETE(req: NextRequest) {
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

    const existingMembership = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, session.user.id))
      .get();

    if (!existingMembership) {
      return NextResponse.json(
        { error: 'No active membership found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const updatedMembership = await db
      .update(userMemberships)
      .set({
        status: 'canceled',
        canceledAt: now,
        updatedAt: now,
      })
      .where(eq(userMemberships.userId, session.user.id))
      .returning()
      .get();

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
      .where(eq(userMemberships.id, updatedMembership.id))
      .get();

    return NextResponse.json(fullMembership, { status: 200 });
  } catch (error) {
    console.error('Error canceling membership:', error);
    return NextResponse.json(
      { error: 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
