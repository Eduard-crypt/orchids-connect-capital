import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyerVerifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const verification = await db
      .select()
      .from(buyerVerifications)
      .where(eq(buyerVerifications.userId, session.user.id))
      .limit(1);

    if (verification.length === 0) {
      return NextResponse.json(
        { error: 'No verification record found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(verification[0], { status: 200 });
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
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED" 
        },
        { status: 400 }
      );
    }

    const existingVerification = await db
      .select()
      .from(buyerVerifications)
      .where(eq(buyerVerifications.userId, session.user.id))
      .limit(1);

    if (existingVerification.length > 0) {
      return NextResponse.json(
        { 
          error: 'Verification record already exists. Use PUT to update.',
          code: 'RECORD_EXISTS' 
        },
        { status: 409 }
      );
    }

    const { notes } = body;

    const newVerification = await db
      .insert(buyerVerifications)
      .values({
        userId: session.user.id,
        verificationStatus: 'pending',
        identityVerified: false,
        proofOfFundsVerified: false,
        verifiedAt: null,
        verifiedBy: null,
        notes: notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newVerification[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}