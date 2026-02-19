import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loiOffers, listings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const user = session.user;

    // Parse request body
    const body = await request.json();

    // Security check: reject if buyerId provided in body
    if ('buyerId' in body || 'buyer_id' in body) {
      return NextResponse.json(
        {
          error: 'Buyer ID cannot be provided in request body',
          code: 'BUYER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    // Extract and validate required fields
    const {
      listingId,
      sellerId,
      offerPrice,
      cashAmount,
      earnoutAmount,
      dueDiligenceDays,
      exclusivityDays,
      expirationDate,
      earnoutTerms,
      conditions,
      pdfUrl
    } = body;

    // Validate required fields
    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId is required', code: 'MISSING_LISTING_ID' },
        { status: 400 }
      );
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: 'sellerId is required', code: 'MISSING_SELLER_ID' },
        { status: 400 }
      );
    }

    if (offerPrice === undefined || offerPrice === null) {
      return NextResponse.json(
        { error: 'offerPrice is required', code: 'MISSING_OFFER_PRICE' },
        { status: 400 }
      );
    }

    if (cashAmount === undefined || cashAmount === null) {
      return NextResponse.json(
        { error: 'cashAmount is required', code: 'MISSING_CASH_AMOUNT' },
        { status: 400 }
      );
    }

    if (earnoutAmount === undefined || earnoutAmount === null) {
      return NextResponse.json(
        { error: 'earnoutAmount is required', code: 'MISSING_EARNOUT_AMOUNT' },
        { status: 400 }
      );
    }

    if (!dueDiligenceDays) {
      return NextResponse.json(
        { error: 'dueDiligenceDays is required', code: 'MISSING_DUE_DILIGENCE_DAYS' },
        { status: 400 }
      );
    }

    if (!exclusivityDays) {
      return NextResponse.json(
        { error: 'exclusivityDays is required', code: 'MISSING_EXCLUSIVITY_DAYS' },
        { status: 400 }
      );
    }

    if (!expirationDate) {
      return NextResponse.json(
        { error: 'expirationDate is required', code: 'MISSING_EXPIRATION_DATE' },
        { status: 400 }
      );
    }

    // Validate field types and values
    if (typeof listingId !== 'number' || !Number.isInteger(listingId)) {
      return NextResponse.json(
        { error: 'listingId must be a valid integer', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    if (typeof sellerId !== 'string' || sellerId.trim() === '') {
      return NextResponse.json(
        { error: 'sellerId must be a valid string', code: 'INVALID_SELLER_ID' },
        { status: 400 }
      );
    }

    if (typeof offerPrice !== 'number' || !Number.isInteger(offerPrice) || offerPrice <= 0) {
      return NextResponse.json(
        { error: 'offerPrice must be a positive integer', code: 'INVALID_OFFER_PRICE' },
        { status: 400 }
      );
    }

    if (typeof cashAmount !== 'number' || !Number.isInteger(cashAmount) || cashAmount < 0) {
      return NextResponse.json(
        { error: 'cashAmount must be a non-negative integer', code: 'INVALID_CASH_AMOUNT' },
        { status: 400 }
      );
    }

    if (typeof earnoutAmount !== 'number' || !Number.isInteger(earnoutAmount) || earnoutAmount < 0) {
      return NextResponse.json(
        { error: 'earnoutAmount must be a non-negative integer', code: 'INVALID_EARNOUT_AMOUNT' },
        { status: 400 }
      );
    }

    if (typeof dueDiligenceDays !== 'number' || !Number.isInteger(dueDiligenceDays) || dueDiligenceDays <= 0) {
      return NextResponse.json(
        { error: 'dueDiligenceDays must be a positive integer', code: 'INVALID_DUE_DILIGENCE_DAYS' },
        { status: 400 }
      );
    }

    if (typeof exclusivityDays !== 'number' || !Number.isInteger(exclusivityDays) || exclusivityDays <= 0) {
      return NextResponse.json(
        { error: 'exclusivityDays must be a positive integer', code: 'INVALID_EXCLUSIVITY_DAYS' },
        { status: 400 }
      );
    }

    // Validate offerPrice equals cashAmount + earnoutAmount
    if (offerPrice !== cashAmount + earnoutAmount) {
      return NextResponse.json(
        {
          error: 'offerPrice must equal cashAmount + earnoutAmount',
          code: 'OFFER_PRICE_MISMATCH'
        },
        { status: 400 }
      );
    }

    // Validate and convert expirationDate
    let expirationTimestamp: Date;
    try {
      expirationTimestamp = new Date(expirationDate);
      if (isNaN(expirationTimestamp.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'expirationDate must be a valid date string', code: 'INVALID_EXPIRATION_DATE' },
        { status: 400 }
      );
    }

    // Validate expirationDate is in the future
    if (expirationTimestamp <= new Date()) {
      return NextResponse.json(
        { error: 'expirationDate must be in the future', code: 'EXPIRATION_DATE_NOT_FUTURE' },
        { status: 400 }
      );
    }

    // Verify listing exists and is approved
    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const listingData = listing[0];

    if (listingData.status !== 'approved') {
      return NextResponse.json(
        { error: 'Listing must be approved', code: 'LISTING_NOT_APPROVED' },
        { status: 400 }
      );
    }

    // Verify sellerId matches the listing's seller
    if (listingData.sellerId !== sellerId.trim()) {
      return NextResponse.json(
        { error: 'sellerId does not match listing seller', code: 'SELLER_ID_MISMATCH' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date();
    const insertData: any = {
      listingId,
      buyerId: user.id,
      sellerId: sellerId.trim(),
      status: 'draft',
      offerPrice,
      cashAmount,
      earnoutAmount,
      dueDiligenceDays,
      exclusivityDays,
      expirationDate: expirationTimestamp,
      sentAt: null,
      respondedAt: null,
      responseNotes: null,
      createdAt: now,
      updatedAt: now
    };

    // Add optional fields if provided
    if (earnoutTerms !== undefined && earnoutTerms !== null) {
      insertData.earnoutTerms = typeof earnoutTerms === 'string' ? earnoutTerms.trim() : earnoutTerms;
    }

    if (conditions !== undefined && conditions !== null) {
      insertData.conditions = JSON.stringify(conditions);
    }

    if (pdfUrl !== undefined && pdfUrl !== null) {
      insertData.pdfUrl = typeof pdfUrl === 'string' ? pdfUrl.trim() : pdfUrl;
    }

    // Create LOI offer
    const newOffer = await db
      .insert(loiOffers)
      .values(insertData)
      .returning();

    return NextResponse.json(newOffer[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}