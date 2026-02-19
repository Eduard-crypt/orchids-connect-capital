import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions, listings, loiOffers, user } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const statusFilter = searchParams.get('status');

    const limit = Math.min(parseInt(limitParam ?? '20'), 100);
    const offset = parseInt(offsetParam ?? '0');

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    const validStatuses = ['initiated', 'funded', 'in_migration', 'complete', 'released'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return NextResponse.json({ 
        error: 'Invalid status filter. Must be one of: initiated, funded, in_migration, complete, released',
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    let whereCondition = or(
      eq(escrowTransactions.buyerId, currentUser.id),
      eq(escrowTransactions.sellerId, currentUser.id)
    );

    if (statusFilter) {
      whereCondition = and(
        or(
          eq(escrowTransactions.buyerId, currentUser.id),
          eq(escrowTransactions.sellerId, currentUser.id)
        ),
        eq(escrowTransactions.status, statusFilter)
      );
    }

    const results = await db
      .select({
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
        listing: {
          title: listings.title,
          businessType: listings.businessType,
          askingPrice: listings.askingPrice,
        },
        loi: {
          offerPrice: loiOffers.offerPrice,
          status: loiOffers.status,
        },
        buyer: {
          name: user.name,
          email: user.email,
        },
        seller: {
          name: user.name,
          email: user.email,
        },
      })
      .from(escrowTransactions)
      .leftJoin(listings, eq(escrowTransactions.listingId, listings.id))
      .leftJoin(loiOffers, eq(escrowTransactions.loiId, loiOffers.id))
      .leftJoin(user, eq(escrowTransactions.buyerId, user.id))
      .where(whereCondition)
      .orderBy(desc(escrowTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    const enrichedResults = await Promise.all(
      results.map(async (transaction) => {
        const buyerData = await db
          .select({
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(eq(user.id, transaction.buyerId))
          .limit(1);

        const sellerData = await db
          .select({
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(eq(user.id, transaction.sellerId))
          .limit(1);

        return {
          id: transaction.id,
          listingId: transaction.listingId,
          loiId: transaction.loiId,
          buyerId: transaction.buyerId,
          sellerId: transaction.sellerId,
          status: transaction.status,
          escrowAmount: transaction.escrowAmount,
          escrowProvider: transaction.escrowProvider,
          escrowReferenceId: transaction.escrowReferenceId,
          initiatedAt: transaction.initiatedAt,
          fundedAt: transaction.fundedAt,
          migrationStartedAt: transaction.migrationStartedAt,
          completedAt: transaction.completedAt,
          releasedAt: transaction.releasedAt,
          webhookSecret: transaction.webhookSecret,
          notes: transaction.notes,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          listing: transaction.listing,
          loi: transaction.loi,
          buyer: buyerData[0] || null,
          seller: sellerData[0] || null,
        };
      })
    );

    return NextResponse.json(enrichedResults, { status: 200 });
  } catch (error) {
    console.error('GET escrow transactions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}