import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loiOffers, listings, user } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate listingId
    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json({ 
        error: 'Valid listingId is required',
        code: 'INVALID_LISTING_ID' 
      }, { status: 400 });
    }

    const parsedListingId = parseInt(listingId);

    // Verify listing exists
    const listing = await db.select()
      .from(listings)
      .where(eq(listings.id, parsedListingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json({ 
        error: 'Listing not found',
        code: 'LISTING_NOT_FOUND' 
      }, { status: 404 });
    }

    const listingData = listing[0];

    // Check if user is the seller
    const isSeller = listingData.sellerId === currentUser.id;

    // Check if user is a buyer who has created an LOI for this listing
    const buyerLOI = await db.select()
      .from(loiOffers)
      .where(
        and(
          eq(loiOffers.listingId, parsedListingId),
          eq(loiOffers.buyerId, currentUser.id)
        )
      )
      .limit(1);

    const isBuyerWithLOI = buyerLOI.length > 0;

    // Access control: user must be seller OR buyer with LOI
    if (!isSeller && !isBuyerWithLOI) {
      return NextResponse.json({ 
        error: 'Access denied. You must be the listing seller or have created an LOI for this listing.',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Build query based on user role
    let loiQuery;

    if (isSeller) {
      // Seller can see all LOIs for their listing
      loiQuery = db.select({
        id: loiOffers.id,
        listingId: loiOffers.listingId,
        buyerId: loiOffers.buyerId,
        sellerId: loiOffers.sellerId,
        status: loiOffers.status,
        offerPrice: loiOffers.offerPrice,
        cashAmount: loiOffers.cashAmount,
        earnoutAmount: loiOffers.earnoutAmount,
        earnoutTerms: loiOffers.earnoutTerms,
        dueDiligenceDays: loiOffers.dueDiligenceDays,
        exclusivityDays: loiOffers.exclusivityDays,
        conditions: loiOffers.conditions,
        expirationDate: loiOffers.expirationDate,
        pdfUrl: loiOffers.pdfUrl,
        sentAt: loiOffers.sentAt,
        respondedAt: loiOffers.respondedAt,
        responseNotes: loiOffers.responseNotes,
        createdAt: loiOffers.createdAt,
        updatedAt: loiOffers.updatedAt,
        buyerName: user.name,
        buyerEmail: user.email,
        buyerImage: user.image,
      })
        .from(loiOffers)
        .leftJoin(user, eq(loiOffers.buyerId, user.id))
        .where(eq(loiOffers.listingId, parsedListingId))
        .orderBy(desc(loiOffers.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      // Buyer can only see their own LOIs
      loiQuery = db.select({
        id: loiOffers.id,
        listingId: loiOffers.listingId,
        buyerId: loiOffers.buyerId,
        sellerId: loiOffers.sellerId,
        status: loiOffers.status,
        offerPrice: loiOffers.offerPrice,
        cashAmount: loiOffers.cashAmount,
        earnoutAmount: loiOffers.earnoutAmount,
        earnoutTerms: loiOffers.earnoutTerms,
        dueDiligenceDays: loiOffers.dueDiligenceDays,
        exclusivityDays: loiOffers.exclusivityDays,
        conditions: loiOffers.conditions,
        expirationDate: loiOffers.expirationDate,
        pdfUrl: loiOffers.pdfUrl,
        sentAt: loiOffers.sentAt,
        respondedAt: loiOffers.respondedAt,
        responseNotes: loiOffers.responseNotes,
        createdAt: loiOffers.createdAt,
        updatedAt: loiOffers.updatedAt,
        buyerName: user.name,
        buyerEmail: user.email,
        buyerImage: user.image,
      })
        .from(loiOffers)
        .leftJoin(user, eq(loiOffers.buyerId, user.id))
        .where(
          and(
            eq(loiOffers.listingId, parsedListingId),
            eq(loiOffers.buyerId, currentUser.id)
          )
        )
        .orderBy(desc(loiOffers.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const results = await loiQuery;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET LOI offers error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}