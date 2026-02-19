import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedListings, marketplaceListings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Validate listing ID
    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const listingIdInt = parseInt(listingId);

    // Check if listing exists
    const listing = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, listingIdInt))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.userId, session.user.id),
          eq(savedListings.listingId, listingIdInt)
        )
      )
      .limit(1);

    if (existingSave.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'Already saved',
          savedListing: existingSave[0],
        },
        { status: 200 }
      );
    }

    // Save listing to watchlist
    const newSavedListing = await db
      .insert(savedListings)
      .values({
        userId: session.user.id,
        listingId: listingIdInt,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Listing saved to watchlist',
        savedListing: newSavedListing[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Validate listing ID
    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const listingIdInt = parseInt(listingId);

    // Delete from watchlist (idempotent operation)
    const deleted = await db
      .delete(savedListings)
      .where(
        and(
          eq(savedListings.userId, session.user.id),
          eq(savedListings.listingId, listingIdInt)
        )
      )
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Listing removed from watchlist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}