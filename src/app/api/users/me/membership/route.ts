import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userMemberships, membershipPlans } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
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

    const membership = await db
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
      .where(eq(userMemberships.userId, session.user.id))
      .get();

    if (!membership) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(membership, { status: 200 });
  } catch (error) {
    console.error('Error fetching user membership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership' },
      { status: 500 }
    );
  }
}
