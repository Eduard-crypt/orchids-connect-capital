import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions, listings, loiOffers, user } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
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

    // Get ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid escrow transaction ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const escrowId = parseInt(id);

    // Fetch escrow transaction with enriched data using LEFT JOINs
    const result = await db
      .select({
        // Escrow transaction fields
        id: escrowTransactions.id,
        listingId: escrowTransactions.listingId,
        loiId: escrowTransactions.loiId,
        buyerId: escrowTransactions.buyerId,
        sellerId: escrowTransactions.sellerId,
        status: escrowTransactions.status,
        escrowAmount: escrowTransactions.escrowAmount,
        escrowProvider: escrowTransactions.escrowProvider,
        escrowReferenceId: escrowTransactions.escrowReferenceId,
        initiatedAt: escrowTransactions.initiatedAt,
        fundedAt: escrowTransactions.fundedAt,
        migrationStartedAt: escrowTransactions.migrationStartedAt,
        completedAt: escrowTransactions.completedAt,
        releasedAt: escrowTransactions.releasedAt,
        webhookSecret: escrowTransactions.webhookSecret,
        notes: escrowTransactions.notes,
        createdAt: escrowTransactions.createdAt,
        updatedAt: escrowTransactions.updatedAt,
        // Listing details
        listing: {
          id: listings.id,
          title: listings.title,
          businessModel: listings.businessModel,
          niche: listings.niche,
          askingPrice: listings.askingPrice,
          status: listings.status,
          businessType: listings.businessType,
          ttmRevenue: listings.ttmRevenue,
          ttmProfit: listings.ttmProfit,
        },
        // LOI details (if exists)
        loi: {
          id: loiOffers.id,
          status: loiOffers.status,
          offerPrice: loiOffers.offerPrice,
          cashAmount: loiOffers.cashAmount,
          earnoutAmount: loiOffers.earnoutAmount,
          dueDiligenceDays: loiOffers.dueDiligenceDays,
          exclusivityDays: loiOffers.exclusivityDays,
          expirationDate: loiOffers.expirationDate,
          sentAt: loiOffers.sentAt,
          respondedAt: loiOffers.respondedAt,
        },
        // Buyer details
        buyer: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        // Seller details
        seller: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(escrowTransactions)
      .leftJoin(listings, eq(escrowTransactions.listingId, listings.id))
      .leftJoin(loiOffers, eq(escrowTransactions.loiId, loiOffers.id))
      .leftJoin(user, eq(escrowTransactions.buyerId, user.id))
      .leftJoin(user, eq(escrowTransactions.sellerId, user.id))
      .where(eq(escrowTransactions.id, escrowId))
      .limit(1);

    // Check if escrow transaction exists
    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'Escrow transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const escrowTransaction = result[0];

    // Authorization check: user must be buyer OR seller
    const isBuyer = escrowTransaction.buyerId === currentUser.id;
    const isSeller = escrowTransaction.sellerId === currentUser.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ 
        error: 'Access denied. You must be the buyer or seller of this transaction',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Fetch buyer and seller details separately to avoid join conflicts
    const buyerData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, escrowTransaction.buyerId))
      .limit(1);

    const sellerData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, escrowTransaction.sellerId))
      .limit(1);

    // Construct enriched response
    const enrichedEscrowTransaction = {
      id: escrowTransaction.id,
      listingId: escrowTransaction.listingId,
      loiId: escrowTransaction.loiId,
      buyerId: escrowTransaction.buyerId,
      sellerId: escrowTransaction.sellerId,
      status: escrowTransaction.status,
      escrowAmount: escrowTransaction.escrowAmount,
      escrowProvider: escrowTransaction.escrowProvider,
      escrowReferenceId: escrowTransaction.escrowReferenceId,
      initiatedAt: escrowTransaction.initiatedAt,
      fundedAt: escrowTransaction.fundedAt,
      migrationStartedAt: escrowTransaction.migrationStartedAt,
      completedAt: escrowTransaction.completedAt,
      releasedAt: escrowTransaction.releasedAt,
      webhookSecret: escrowTransaction.webhookSecret,
      notes: escrowTransaction.notes,
      createdAt: escrowTransaction.createdAt,
      updatedAt: escrowTransaction.updatedAt,
      listing: escrowTransaction.listing,
      loi: escrowTransaction.loi,
      buyer: buyerData[0] || null,
      seller: sellerData[0] || null,
    };

    return NextResponse.json(enrichedEscrowTransaction, { status: 200 });

  } catch (error) {
    console.error('GET escrow transaction error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}