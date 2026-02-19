import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles, userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if profile exists
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    // Check if roles exist
    const existingRoles = await db.select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    let profile = existingProfile[0];
    let roles = existingRoles[0];

    // Auto-create profile if it doesn't exist
    if (!profile) {
      const newProfile = await db.insert(userProfiles)
        .values({
          userId,
          plan: 'free',
          kycStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      profile = newProfile[0];
    }

    // Auto-create roles if they don't exist
    if (!roles) {
      const newRoles = await db.insert(userRoles)
        .values({
          userId,
          isBuyer: false,
          isSeller: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      roles = newRoles[0];
    }

    // Combine profile and roles into single response
    const combinedProfile = {
      id: profile.id,
      userId: profile.userId,
      roleBuyer: roles.isBuyer,
      roleSeller: roles.isSeller,
      kycStatus: profile.kycStatus,
      plan: profile.plan,
      messagesLimit: 50,
      savedSearchesLimit: 10,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    return NextResponse.json(combinedProfile, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { roleBuyer, roleSeller } = body;

    // Validate roleBuyer if provided
    if (roleBuyer !== undefined && typeof roleBuyer !== 'boolean') {
      return NextResponse.json({ 
        error: 'roleBuyer must be a boolean',
        code: 'INVALID_ROLE_BUYER' 
      }, { status: 400 });
    }

    // Validate roleSeller if provided
    if (roleSeller !== undefined && typeof roleSeller !== 'boolean') {
      return NextResponse.json({ 
        error: 'roleSeller must be a boolean',
        code: 'INVALID_ROLE_SELLER' 
      }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if roles exist
    const existingRoles = await db.select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (existingRoles.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Update roles if provided
    let updatedRoles = existingRoles[0];
    if (roleBuyer !== undefined || roleSeller !== undefined) {
      const roleUpdates: any = {
        updatedAt: new Date()
      };

      if (roleBuyer !== undefined) {
        roleUpdates.isBuyer = roleBuyer;
      }

      if (roleSeller !== undefined) {
        roleUpdates.isSeller = roleSeller;
      }

      const result = await db.update(userRoles)
        .set(roleUpdates)
        .where(eq(userRoles.userId, userId))
        .returning();

      updatedRoles = result[0];
    }

    // Update profile timestamp
    const updatedProfile = await db.update(userProfiles)
      .set({
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    // Combine profile and roles into single response
    const combinedProfile = {
      id: updatedProfile[0].id,
      userId: updatedProfile[0].userId,
      roleBuyer: updatedRoles.isBuyer,
      roleSeller: updatedRoles.isSeller,
      kycStatus: updatedProfile[0].kycStatus,
      plan: updatedProfile[0].plan,
      messagesLimit: 50,
      savedSearchesLimit: 10,
      createdAt: updatedProfile[0].createdAt,
      updatedAt: updatedProfile[0].updatedAt
    };

    return NextResponse.json(combinedProfile, { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}