/**
 * Admin Users Memberships API
 * GET /api/admin/users/memberships
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get bearer token and verify user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Get user from session token
    const sessionResult = await db.query.session.findFirst({
      where: (session, { eq }) => eq(session.token, token),
    });

    if (!sessionResult) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch all users with membership info
    const users = await db
      .select({
        id: userProfiles.id,
        userName: user.name,
        userEmail: user.email,
        plan: userProfiles.plan,
        stripeCustomerId: userProfiles.stripeCustomerId,
        createdAt: userProfiles.createdAt,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .orderBy(userProfiles.createdAt);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
