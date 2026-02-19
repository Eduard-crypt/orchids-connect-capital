import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ndaAgreements, listings } from '@/db/schema';
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

    // Fetch all NDA agreements for this user with listing details
    const userNDAs = await db
      .select({
        id: ndaAgreements.id,
        listingId: ndaAgreements.listingId,
        agreedAt: ndaAgreements.agreedAt,
        ipAddress: ndaAgreements.ipAddress,
        userAgent: ndaAgreements.userAgent,
        createdAt: ndaAgreements.createdAt,
        listingTitle: listings.title,
        listingStatus: listings.status,
      })
      .from(ndaAgreements)
      .leftJoin(listings, eq(ndaAgreements.listingId, listings.id))
      .where(eq(ndaAgreements.userId, session.user.id))
      .orderBy(ndaAgreements.agreedAt);

    return NextResponse.json(userNDAs, { status: 200 });
  } catch (error) {
    console.error('GET NDA agreements error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
