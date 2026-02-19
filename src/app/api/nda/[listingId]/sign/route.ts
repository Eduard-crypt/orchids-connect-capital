import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ndaAgreements, listings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const listingId = params?.listingId;
    
    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const parsedListingId = parseInt(listingId);

    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, parsedListingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (listing[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Can only sign NDA for approved listings', code: 'LISTING_NOT_APPROVED' },
        { status: 400 }
      );
    }

    const existingAgreement = await db
      .select()
      .from(ndaAgreements)
      .where(
        and(
          eq(ndaAgreements.userId, session.user.id),
          eq(ndaAgreements.listingId, parsedListingId)
        )
      )
      .limit(1);

    if (existingAgreement.length > 0) {
      return NextResponse.json(existingAgreement[0], { status: 200 });
    }

    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    const newAgreement = await db
      .insert(ndaAgreements)
      .values({
        userId: session.user.id,
        listingId: parsedListingId,
        agreedAt: new Date(),
        ipAddress: ipAddress,
        userAgent: userAgent,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newAgreement[0], { status: 201 });
  } catch (error) {
    console.error('POST NDA agreement error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}