import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listings, listingModerationLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Admin check
    const userEmail = session.user.email;
    const isAdmin = userEmail.endsWith('@admin.com') || userEmail === 'admin@example.com';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate and parse ID
    const id = params?.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const listingId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { rejectionReason } = body;

    // Validate rejection reason
    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim() === '') {
      return NextResponse.json(
        { error: 'Rejection reason is required', code: 'MISSING_REJECTION_REASON' },
        { status: 400 }
      );
    }

    // Check if listing exists
    const existingListing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (existingListing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const listing = existingListing[0];

    // Verify listing is in submitted status
    if (listing.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Only submitted listings can be rejected', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Update listing to rejected status
    const updatedListing = await db
      .update(listings)
      .set({
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        approvedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning();

    // Create moderation log entry
    await db.insert(listingModerationLogs).values({
      listingId: listingId,
      moderatorId: session.user.id,
      action: 'rejected',
      oldStatus: 'submitted',
      newStatus: 'rejected',
      notes: rejectionReason.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json(updatedListing[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}