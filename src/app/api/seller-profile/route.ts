import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellerProfiles } from '@/db/schema';
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

    const profile = await db.select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, session.user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'Seller profile not found',
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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingProfile = await db.select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json({ 
        error: 'Seller profile already exists for this user',
        code: 'PROFILE_EXISTS' 
      }, { status: 409 });
    }

    const { businessType, keyMetrics, targetPrice, onboardingCompleted } = body;

    const newProfile = await db.insert(sellerProfiles)
      .values({
        userId: session.user.id,
        businessType: businessType || null,
        keyMetrics: keyMetrics ? (typeof keyMetrics === 'string' ? keyMetrics : JSON.stringify(keyMetrics)) : null,
        targetPrice: targetPrice || null,
        onboardingCompleted: onboardingCompleted !== undefined ? (onboardingCompleted ? 1 : 0) : 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existingProfile = await db.select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'Seller profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    const { businessType, keyMetrics, targetPrice, onboardingCompleted } = body;

    const updates: any = {
      updatedAt: new Date()
    };

    if (businessType !== undefined) {
      updates.businessType = businessType;
    }

    if (keyMetrics !== undefined) {
      updates.keyMetrics = keyMetrics ? (typeof keyMetrics === 'string' ? keyMetrics : JSON.stringify(keyMetrics)) : null;
    }

    if (targetPrice !== undefined) {
      updates.targetPrice = targetPrice;
    }

    if (onboardingCompleted !== undefined) {
      updates.onboardingCompleted = onboardingCompleted ? 1 : 0;
    }

    const updatedProfile = await db.update(sellerProfiles)
      .set(updates)
      .where(eq(sellerProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json(updatedProfile[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}