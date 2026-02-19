import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions, listings, loiOffers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // SECURITY: Reject if buyerId provided in request body
    if ('buyerId' in body || 'buyer_id' in body) {
      return NextResponse.json(
        {
          error: 'Buyer ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { listingId, sellerId, escrowAmount, loiId, escrowProvider, escrowReferenceId, notes } = body;

    // Validate required fields
    if (!listingId || typeof listingId !== 'number') {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    if (!sellerId || typeof sellerId !== 'string') {
      return NextResponse.json(
        { error: 'Valid seller ID is required', code: 'INVALID_SELLER_ID' },
        { status: 400 }
      );
    }

    if (!escrowAmount || typeof escrowAmount !== 'number') {
      return NextResponse.json(
        { error: 'Valid escrow amount is required', code: 'INVALID_ESCROW_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate escrowAmount is positive
    if (escrowAmount <= 0) {
      return NextResponse.json(
        { error: 'Escrow amount must be positive', code: 'INVALID_ESCROW_AMOUNT' },
        { status: 400 }
      );
    }

    // Verify listing exists
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

    // Validate sellerId matches the listing's seller
    if (listing[0].sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Seller ID does not match listing seller', code: 'SELLER_MISMATCH' },
        { status: 400 }
      );
    }

    // If loiId provided, verify it exists and is valid
    if (loiId !== undefined && loiId !== null) {
      if (typeof loiId !== 'number') {
        return NextResponse.json(
          { error: 'Valid LOI ID is required', code: 'INVALID_LOI_ID' },
          { status: 400 }
        );
      }

      const loi = await db
        .select()
        .from(loiOffers)
        .where(eq(loiOffers.id, loiId))
        .limit(1);

      if (loi.length === 0) {
        return NextResponse.json(
          { error: 'LOI offer not found', code: 'LOI_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Verify LOI is accepted
      if (loi[0].status !== 'accepted') {
        return NextResponse.json(
          { error: 'LOI offer must be accepted', code: 'LOI_NOT_ACCEPTED' },
          { status: 400 }
        );
      }

      // Verify LOI belongs to this buyer/seller/listing
      if (
        loi[0].buyerId !== user.id ||
        loi[0].sellerId !== sellerId ||
        loi[0].listingId !== listingId
      ) {
        return NextResponse.json(
          {
            error: 'LOI offer does not match buyer, seller, or listing',
            code: 'LOI_MISMATCH',
          },
          { status: 400 }
        );
      }
    }

    // Generate webhook secret
    const webhookSecret = randomBytes(32).toString('hex');

    // Calculate platform fees (5%)
    const platformFeePercent = 5;
    const platformFeeAmount = Math.round(escrowAmount * (platformFeePercent / 100));
    const buyerTotalAmount = escrowAmount + platformFeeAmount;
    const sellerNetAmount = escrowAmount;

    // Prepare insert data
    const now = new Date();
    const insertData: {
      listingId: number;
      loiId?: number | null;
      buyerId: string;
      sellerId: string;
      status: string;
      escrowAmount: number;
      escrowProvider?: string;
      escrowReferenceId?: string;
      initiatedAt: Date;
      webhookSecret: string;
      notes?: string;
      platformFeePercent: number;
      platformFeeAmount: number;
      buyerTotalAmount: number;
      sellerNetAmount: number;
      createdAt: Date;
      updatedAt: Date;
      fundedAt?: null;
      migrationStartedAt?: null;
      completedAt?: null;
      releasedAt?: null;
    } = {
      listingId,
      buyerId: user.id,
      sellerId,
      status: 'initiated',
      escrowAmount,
      initiatedAt: now,
      webhookSecret,
      platformFeePercent,
      platformFeeAmount,
      buyerTotalAmount,
      sellerNetAmount,
      createdAt: now,
      updatedAt: now,
      fundedAt: null,
      migrationStartedAt: null,
      completedAt: null,
      releasedAt: null,
    };

    // Add optional fields if provided
    if (loiId !== undefined && loiId !== null) {
      insertData.loiId = loiId;
    }

    if (escrowProvider) {
      insertData.escrowProvider = escrowProvider.trim();
    }

    if (escrowReferenceId) {
      insertData.escrowReferenceId = escrowReferenceId.trim();
    }

    if (notes) {
      insertData.notes = notes.trim();
    }

    // Create escrow transaction
    const newEscrowTransaction = await db
      .insert(escrowTransactions)
      .values(insertData)
      .returning();

    return NextResponse.json(newEscrowTransaction[0], { status: 201 });
  } catch (error) {
    console.error('POST escrow transaction error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}