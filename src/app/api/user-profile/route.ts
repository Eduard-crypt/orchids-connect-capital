import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
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
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if profile already exists
    const existingProfile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json({ 
        error: 'Profile already exists for this user',
        code: 'PROFILE_EXISTS' 
      }, { status: 409 });
    }

    // Extract fields from request body
    const { 
      phone, 
      ownsBusiness, 
      primaryBusinessInterest, 
      businessLocation, 
      purchaseTimeframe 
    } = body;

    // Validate ownsBusiness if provided
    if (ownsBusiness !== undefined && typeof ownsBusiness !== 'boolean') {
      return NextResponse.json({ 
        error: 'ownsBusiness must be a boolean',
        code: 'INVALID_OWNS_BUSINESS' 
      }, { status: 400 });
    }

    // Prepare insert data
    const now = new Date();
    const insertData: any = {
      userId,
      plan: 'free',
      kycStatus: 'pending',
      ownsBusiness: ownsBusiness ?? false,
      createdAt: now,
      updatedAt: now
    };

    // Add optional fields if provided
    if (phone !== undefined && phone !== null) {
      if (typeof phone !== 'string') {
        return NextResponse.json({ 
          error: 'phone must be a string',
          code: 'INVALID_PHONE' 
        }, { status: 400 });
      }
      insertData.phone = phone.trim();
    }

    if (primaryBusinessInterest !== undefined && primaryBusinessInterest !== null) {
      if (typeof primaryBusinessInterest !== 'string') {
        return NextResponse.json({ 
          error: 'primaryBusinessInterest must be a string',
          code: 'INVALID_PRIMARY_BUSINESS_INTEREST' 
        }, { status: 400 });
      }
      insertData.primaryBusinessInterest = primaryBusinessInterest.trim();
    }

    if (businessLocation !== undefined && businessLocation !== null) {
      if (typeof businessLocation !== 'string') {
        return NextResponse.json({ 
          error: 'businessLocation must be a string',
          code: 'INVALID_BUSINESS_LOCATION' 
        }, { status: 400 });
      }
      insertData.businessLocation = businessLocation.trim();
    }

    if (purchaseTimeframe !== undefined && purchaseTimeframe !== null) {
      if (typeof purchaseTimeframe !== 'string') {
        return NextResponse.json({ 
          error: 'purchaseTimeframe must be a string',
          code: 'INVALID_PURCHASE_TIMEFRAME' 
        }, { status: 400 });
      }
      insertData.purchaseTimeframe = purchaseTimeframe.trim();
    }

    // Create user profile
    const newProfile = await db.insert(userProfiles)
      .values(insertData)
      .returning();

    if (newProfile.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create profile',
        code: 'CREATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
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
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
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

    // Extract only allowed fields for update
    const allowedFields = [
      'phone', 
      'companyName', 
      'plan', 
      'kycStatus', 
      'kycVerifiedAt', 
      'stripeCustomerId',
      'ownsBusiness',
      'primaryBusinessInterest',
      'businessLocation',
      'purchaseTimeframe'
    ];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        // Validate field types
        if (field === 'ownsBusiness' && body[field] !== null && typeof body[field] !== 'boolean') {
          return NextResponse.json({ 
            error: 'ownsBusiness must be a boolean',
            code: 'INVALID_OWNS_BUSINESS' 
          }, { status: 400 });
        }

        if (['phone', 'companyName', 'plan', 'kycStatus', 'stripeCustomerId', 'primaryBusinessInterest', 'businessLocation', 'purchaseTimeframe'].includes(field)) {
          if (body[field] !== null && typeof body[field] !== 'string') {
            return NextResponse.json({ 
              error: `${field} must be a string`,
              code: `INVALID_${field.toUpperCase()}` 
            }, { status: 400 });
          }
          updates[field] = body[field] ? body[field].trim() : body[field];
        } else {
          updates[field] = body[field];
        }
      }
    }

    // Validate kycVerifiedAt if provided
    if ('kycVerifiedAt' in updates && updates.kycVerifiedAt !== null) {
      const kycDate = new Date(updates.kycVerifiedAt);
      if (isNaN(kycDate.getTime())) {
        return NextResponse.json({ 
          error: 'Invalid kycVerifiedAt date format',
          code: 'INVALID_DATE' 
        }, { status: 400 });
      }
      updates.kycVerifiedAt = kycDate;
    }

    // Always update updatedAt
    updates.updatedAt = new Date();

    // Perform update
    const updated = await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update profile',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}