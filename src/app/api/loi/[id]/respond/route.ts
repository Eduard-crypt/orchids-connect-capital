import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loiOffers, listings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { action, responseNotes } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body || 'sellerId' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Get LOI ID from query params
    const searchParams = request.nextUrl.searchParams;
    const loiIdParam = searchParams.get('id');

    if (!loiIdParam || isNaN(parseInt(loiIdParam))) {
      return NextResponse.json(
        { error: 'Valid LOI ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const loiId = parseInt(loiIdParam);

    // Validate action is required and valid
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required', code: 'MISSING_ACTION' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        {
          error: "Action must be either 'accept' or 'reject'",
          code: 'INVALID_ACTION',
        },
        { status: 400 }
      );
    }

    // Fetch the LOI offer with seller verification
    const loiResult = await db
      .select()
      .from(loiOffers)
      .where(eq(loiOffers.id, loiId))
      .limit(1);

    if (loiResult.length === 0) {
      return NextResponse.json(
        { error: 'LOI offer not found', code: 'LOI_NOT_FOUND' },
        { status: 404 }
      );
    }

    const loi = loiResult[0];

    // Verify user is the seller
    if (loi.sellerId !== user.id) {
      return NextResponse.json(
        {
          error: 'Only the seller can respond to this LOI offer',
          code: 'NOT_SELLER',
        },
        { status: 403 }
      );
    }

    // Verify status is 'sent'
    if (loi.status !== 'sent') {
      return NextResponse.json(
        {
          error: 'LOI offer must have status "sent" to respond',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Determine new status based on action
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update the LOI offer
    const currentTimestamp = new Date();
    const updated = await db
      .update(loiOffers)
      .set({
        status: newStatus,
        respondedAt: currentTimestamp,
        responseNotes: responseNotes || null,
        updatedAt: currentTimestamp,
      })
      .where(eq(loiOffers.id, loiId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update LOI offer', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // If accepted, update listing to mark as under LOI
    if (action === 'accept') {
      await db
        .update(listings)
        .set({
          underLoi: true,
          updatedAt: currentTimestamp,
        })
        .where(eq(listings.id, loi.listingId));
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}