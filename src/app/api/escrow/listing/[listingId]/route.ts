import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions, listings, user, loiOffers } from '@/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json({ 
        error: 'Valid listingId is required',
        code: 'INVALID_LISTING_ID' 
      }, { status: 400 });
    }

    const listingIdInt = parseInt(listingId);

    // Verify listing exists
    const listing = await db.select()
      .from(listings)
      .where(eq(listings.id, listingIdInt))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json({ 
        error: 'Listing not found',
        code: 'LISTING_NOT_FOUND' 
      }, { status: 404 });
    }

    const listingData = listing[0];

    // Check if user is the listing seller
    const isListingSeller = listingData.sellerId === currentUser.id;

    // Fetch escrow transactions with enriched data
    const escrows = await db.select({
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
      buyerName: user.name,
      buyerEmail: user.email,
      sellerName: db.select({ name: user.name })
        .from(user)
        .where(eq(user.id, escrowTransactions.sellerId))
        .limit(1)
        .as('sellerName'),
      sellerEmail: db.select({ email: user.email })
        .from(user)
        .where(eq(user.id, escrowTransactions.sellerId))
        .limit(1)
        .as('sellerEmail'),
      loiOfferPrice: loiOffers.offerPrice,
      loiStatus: loiOffers.status,
    })
      .from(escrowTransactions)
      .leftJoin(user, eq(escrowTransactions.buyerId, user.id))
      .leftJoin(loiOffers, eq(escrowTransactions.loiId, loiOffers.id))
      .where(eq(escrowTransactions.listingId, listingIdInt))
      .orderBy(desc(escrowTransactions.createdAt));

    // For each escrow, fetch seller details separately and apply access control
    const enrichedEscrows = await Promise.all(
      escrows.map(async (escrow) => {
        // Access control: seller sees all, buyers see only their own
        if (!isListingSeller && escrow.buyerId !== currentUser.id) {
          return null;
        }

        // Fetch seller details
        const sellerDetails = await db.select({
          name: user.name,
          email: user.email,
        })
          .from(user)
          .where(eq(user.id, escrow.sellerId))
          .limit(1);

        const seller = sellerDetails.length > 0 ? sellerDetails[0] : null;

        return {
          id: escrow.id,
          listingId: escrow.listingId,
          loiId: escrow.loiId,
          buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
          status: escrow.status,
          escrowAmount: escrow.escrowAmount,
          escrowProvider: escrow.escrowProvider,
          escrowReferenceId: escrow.escrowReferenceId,
          initiatedAt: escrow.initiatedAt,
          fundedAt: escrow.fundedAt,
          migrationStartedAt: escrow.migrationStartedAt,
          completedAt: escrow.completedAt,
          releasedAt: escrow.releasedAt,
          webhookSecret: escrow.webhookSecret,
          notes: escrow.notes,
          createdAt: escrow.createdAt,
          updatedAt: escrow.updatedAt,
          buyer: {
            id: escrow.buyerId,
            name: escrow.buyerName,
            email: escrow.buyerEmail,
          },
          seller: seller ? {
            id: escrow.sellerId,
            name: seller.name,
            email: seller.email,
          } : null,
          loi: escrow.loiId ? {
            id: escrow.loiId,
            offerPrice: escrow.loiOfferPrice,
            status: escrow.loiStatus,
          } : null,
        };
      })
    );

    // Filter out null entries (access denied) and check if user has access to any escrows
    const filteredEscrows = enrichedEscrows.filter(escrow => escrow !== null);

    // If not listing seller and no escrows found for this buyer, it's a 403
    if (!isListingSeller && filteredEscrows.length === 0 && escrows.length > 0) {
      return NextResponse.json({ 
        error: 'Access denied: You do not have permission to view these escrow transactions',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    return NextResponse.json(filteredEscrows, { status: 200 });

  } catch (error) {
    console.error('GET escrow transactions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}