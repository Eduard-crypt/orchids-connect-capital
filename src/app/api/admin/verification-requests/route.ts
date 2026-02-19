import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyerVerifications, user } from '@/db/schema';
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

    // Simple admin check - in production use proper role management
    const userEmail = session.user.email?.toLowerCase() || '';
    const isAdmin = userEmail.includes('admin') || userEmail.endsWith('@admin.com');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Fetch all verification requests with user information
    const verifications = await db
      .select({
        id: buyerVerifications.id,
        userId: buyerVerifications.userId,
        verificationStatus: buyerVerifications.verificationStatus,
        identityVerified: buyerVerifications.identityVerified,
        proofOfFundsVerified: buyerVerifications.proofOfFundsVerified,
        verifiedAt: buyerVerifications.verifiedAt,
        verifiedBy: buyerVerifications.verifiedBy,
        notes: buyerVerifications.notes,
        createdAt: buyerVerifications.createdAt,
        updatedAt: buyerVerifications.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(buyerVerifications)
      .leftJoin(user, eq(buyerVerifications.userId, user.id))
      .orderBy(buyerVerifications.createdAt);

    // Transform data to include user object
    const formattedVerifications = verifications.map((v) => ({
      id: v.id,
      userId: v.userId,
      verificationStatus: v.verificationStatus,
      identityVerified: v.identityVerified,
      proofOfFundsVerified: v.proofOfFundsVerified,
      verifiedAt: v.verifiedAt,
      verifiedBy: v.verifiedBy,
      notes: v.notes,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      user: {
        name: v.userName || 'Unknown',
        email: v.userEmail || 'Unknown',
      },
    }));

    return NextResponse.json(formattedVerifications, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
