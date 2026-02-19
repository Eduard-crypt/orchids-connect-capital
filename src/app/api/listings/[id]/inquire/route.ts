import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listingInquiries, listings } from '@/db/schema';
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

    // Extract and validate listing ID
    const listingId = params?.id;
    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const parsedListingId = parseInt(listingId);

    // Verify listing exists and is approved
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
        { error: 'Can only inquire about approved listings', code: 'LISTING_NOT_APPROVED' },
        { status: 400 }
      );
    }

    // Prevent seller from inquiring about their own listing
    if (listing[0].sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot inquire about your own listing', code: 'SELF_INQUIRY_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }

    // Create inquiry record
    const newInquiry = await db
      .insert(listingInquiries)
      .values({
        listingId: parsedListingId,
        buyerId: session.user.id,
        message: message.trim(),
        responded: false,
        respondedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newInquiry[0], { status: 201 });
  } catch (error) {
    console.error('POST inquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}