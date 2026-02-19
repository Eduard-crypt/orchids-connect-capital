import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listings, listingModerationLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params?.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const listingId = parseInt(id);

    const existingListing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (existingListing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const listing = existingListing[0];

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to submit this listing', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    if (listing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft listings can be submitted', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const requiredFields = [
      { field: 'title', value: listing.title },
      { field: 'businessType', value: listing.businessType },
      { field: 'geography', value: listing.geography },
      { field: 'ttmRevenue', value: listing.ttmRevenue },
      { field: 'ttmProfit', value: listing.ttmProfit },
      { field: 'askingPrice', value: listing.askingPrice },
      { field: 'fullDescription', value: listing.fullDescription },
      { field: 'ageMonths', value: listing.ageMonths }
    ];

    const missingFields = requiredFields
      .filter(({ value }) => value === null || value === undefined || value === '')
      .map(({ field }) => field);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Required fields are missing: ${missingFields.join(', ')}`,
          code: 'MISSING_REQUIRED_FIELDS',
          missingFields
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const updatedListing = await db
      .update(listings)
      .set({
        status: 'submitted',
        submittedAt: now,
        updatedAt: now
      })
      .where(eq(listings.id, listingId))
      .returning();

    await db.insert(listingModerationLogs).values({
      listingId: listingId,
      moderatorId: session.user.id,
      action: 'submitted',
      oldStatus: 'draft',
      newStatus: 'submitted',
      notes: 'Listing submitted for moderation review',
      createdAt: now
    });

    return NextResponse.json(updatedListing[0], { status: 200 });
  } catch (error) {
    console.error('POST /api/listings/[id]/submit error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}