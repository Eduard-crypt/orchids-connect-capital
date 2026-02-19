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
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Admin check
    const userEmail = session.user.email;
    const isAdmin = userEmail.endsWith('@admin.com') || userEmail === 'admin@example.com';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate ID parameter
    const id = params?.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const listingId = parseInt(id);

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
        { 
          error: 'Only submitted listings can be approved',
          code: 'INVALID_STATUS',
          currentStatus: listing.status
        },
        { status: 400 }
      );
    }

    // Parse request body for optional notes
    const body = await request.json().catch(() => ({}));
    const notes = body.notes || null;

    const now = new Date();

    // Update listing status
    const updatedListing = await db
      .update(listings)
      .set({
        status: 'approved',
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(listings.id, listingId))
      .returning();

    // Create moderation log entry
    await db.insert(listingModerationLogs).values({
      listingId: listingId,
      moderatorId: session.user.id,
      action: 'approved',
      oldStatus: 'submitted',
      newStatus: 'approved',
      notes: notes,
      createdAt: now,
    });

    return NextResponse.json(updatedListing[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}