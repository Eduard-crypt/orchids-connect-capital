import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const profile = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, session.user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Buyer profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingProfile = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json(
        {
          error: 'Buyer profile already exists for this user',
          code: 'PROFILE_ALREADY_EXISTS',
        },
        { status: 409 }
      );
    }

    const {
      budgetMin,
      budgetMax,
      industries,
      regions,
      proofOfFundsDocument,
      onboardingCompleted,
    } = body;

    const now = new Date();

    const newProfile = await db
      .insert(buyerProfiles)
      .values({
        userId: session.user.id,
        budgetMin: budgetMin ?? null,
        budgetMax: budgetMax ?? null,
        industries: industries ?? null,
        regions: regions ?? null,
        proofOfFundsDocument: proofOfFundsDocument ?? null,
        onboardingCompleted: onboardingCompleted ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const existingProfile = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: 'Buyer profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const {
      budgetMin,
      budgetMax,
      industries,
      regions,
      proofOfFundsDocument,
      onboardingCompleted,
    } = body;

    const updates: Partial<typeof buyerProfiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (budgetMin !== undefined) updates.budgetMin = budgetMin;
    if (budgetMax !== undefined) updates.budgetMax = budgetMax;
    if (industries !== undefined) updates.industries = industries;
    if (regions !== undefined) updates.regions = regions;
    if (proofOfFundsDocument !== undefined)
      updates.proofOfFundsDocument = proofOfFundsDocument;
    if (onboardingCompleted !== undefined)
      updates.onboardingCompleted = onboardingCompleted;

    const updatedProfile = await db
      .update(buyerProfiles)
      .set(updates)
      .where(eq(buyerProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json(updatedProfile[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}