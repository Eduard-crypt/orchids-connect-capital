import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userMemberships, userProfiles, membershipPlans } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export type ProfileType = 'Business Seller' | 'Business Teacher' | 'Viewer';

export interface ProfileTypeResponse {
  profileType: ProfileType;
  hasActiveMembership: boolean;
  isTeacherVerified: boolean;
  canCreateListings: boolean;
  membershipDetails?: {
    planName: string;
    status: string;
    renewsAt: Date;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user profile
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();

    // Fetch user membership with plan details
    const membership = await db
      .select({
        id: userMemberships.id,
        userId: userMemberships.userId,
        planId: userMemberships.planId,
        status: userMemberships.status,
        renewsAt: userMemberships.renewsAt,
        plan: membershipPlans,
      })
      .from(userMemberships)
      .leftJoin(membershipPlans, eq(userMemberships.planId, membershipPlans.id))
      .where(eq(userMemberships.userId, userId))
      .get();

    // Determine profile type
    const hasActiveMembership = membership?.status === 'active';
    const isTeacherVerified = profile?.isTeacherVerified || false;

    let profileType: ProfileType = 'Viewer';
    let canCreateListings = false;

    if (hasActiveMembership && isTeacherVerified) {
      // Teacher with active membership
      profileType = 'Business Teacher';
      canCreateListings = false; // Teachers cannot create sale listings
    } else if (hasActiveMembership) {
      // Active membership but not a teacher = Business Seller
      profileType = 'Business Seller';
      canCreateListings = true;
    } else {
      // No active membership
      profileType = 'Viewer';
      canCreateListings = false;
    }

    const response: ProfileTypeResponse = {
      profileType,
      hasActiveMembership,
      isTeacherVerified,
      canCreateListings,
    };

    // Add membership details if exists
    if (membership && membership.plan) {
      response.membershipDetails = {
        planName: membership.plan.name,
        status: membership.status,
        renewsAt: new Date(membership.renewsAt),
      };
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/me/profile-type error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
