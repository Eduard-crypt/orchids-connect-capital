import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loiOffers, listings, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const loiId = params.id;
    if (!loiId || isNaN(parseInt(loiId))) {
      return NextResponse.json(
        { error: 'Valid LOI ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const result = await db
      .select({
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
        listing: {
          id: listings.id,
          title: listings.title,
          status: listings.status,
          askingPrice: listings.askingPrice,
          businessModel: listings.businessModel,
          niche: listings.niche,
          sellerId: listings.sellerId,
        },
        buyer: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(loiOffers)
      .leftJoin(listings, eq(loiOffers.listingId, listings.id))
      .leftJoin(user, eq(loiOffers.buyerId, user.id))
      .where(eq(loiOffers.id, parseInt(loiId)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'LOI offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const loiOffer = result[0];

    if (
      loiOffer.buyerId !== currentUser.id &&
      loiOffer.sellerId !== currentUser.id
    ) {
      return NextResponse.json(
        {
          error: 'You do not have access to this LOI offer',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const sellerResult = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, loiOffer.sellerId))
      .limit(1);

    const seller = sellerResult.length > 0 ? sellerResult[0] : null;

    return NextResponse.json(
      {
        ...loiOffer,
        seller,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET LOI error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const loiId = params.id;
    if (!loiId || isNaN(parseInt(loiId))) {
      return NextResponse.json(
        { error: 'Valid LOI ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (
      'buyerId' in body ||
      'sellerId' in body ||
      'listingId' in body ||
      'status' in body
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot update buyerId, sellerId, listingId, or status through this endpoint',
          code: 'FORBIDDEN_FIELD',
        },
        { status: 400 }
      );
    }

    const existingLoi = await db
      .select()
      .from(loiOffers)
      .where(eq(loiOffers.id, parseInt(loiId)))
      .limit(1);

    if (existingLoi.length === 0) {
      return NextResponse.json(
        { error: 'LOI offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const loi = existingLoi[0];

    if (loi.buyerId !== currentUser.id) {
      return NextResponse.json(
        {
          error: 'Only the buyer can update this LOI offer',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    if (loi.status !== 'draft') {
      return NextResponse.json(
        {
          error: 'Only draft LOI offers can be updated',
          code: 'INVALID_STATUS',
        },
        { status: 403 }
      );
    }

    const allowedFields = [
      'offerPrice',
      'cashAmount',
      'earnoutAmount',
      'earnoutTerms',
      'dueDiligenceDays',
      'exclusivityDays',
      'conditions',
      'expirationDate',
      'pdfUrl',
    ];

    const updates: Partial<typeof loiOffers.$inferInsert> = {};
    let hasUpdates = false;

    for (const field of allowedFields) {
      if (field in body) {
        hasUpdates = true;
        if (field === 'expirationDate' && body[field]) {
          updates[field] = new Date(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (!hasUpdates) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const finalOfferPrice =
      updates.offerPrice !== undefined ? updates.offerPrice : loi.offerPrice;
    const finalCashAmount =
      updates.cashAmount !== undefined ? updates.cashAmount : loi.cashAmount;
    const finalEarnoutAmount =
      updates.earnoutAmount !== undefined
        ? updates.earnoutAmount
        : loi.earnoutAmount;

    if (
      'offerPrice' in updates ||
      'cashAmount' in updates ||
      'earnoutAmount' in updates
    ) {
      if (finalOfferPrice !== finalCashAmount + finalEarnoutAmount) {
        return NextResponse.json(
          {
            error:
              'Offer price must equal cash amount plus earnout amount',
            code: 'INVALID_PRICE_CALCULATION',
          },
          { status: 400 }
        );
      }
    }

    updates.updatedAt = new Date();

    const updated = await db
      .update(loiOffers)
      .set(updates)
      .where(eq(loiOffers.id, parseInt(loiId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update LOI offer', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH LOI error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
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
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const loiId = params.id;
    if (!loiId || isNaN(parseInt(loiId))) {
      return NextResponse.json(
        { error: 'Valid LOI ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingLoi = await db
      .select()
      .from(loiOffers)
      .where(eq(loiOffers.id, parseInt(loiId)))
      .limit(1);

    if (existingLoi.length === 0) {
      return NextResponse.json(
        { error: 'LOI offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const loi = existingLoi[0];

    if (loi.buyerId !== currentUser.id) {
      return NextResponse.json(
        {
          error: 'Only the buyer can delete this LOI offer',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    if (loi.status !== 'draft') {
      return NextResponse.json(
        {
          error: 'Only draft LOI offers can be deleted',
          code: 'INVALID_STATUS',
        },
        { status: 403 }
      );
    }

    const deleted = await db
      .delete(loiOffers)
      .where(eq(loiOffers.id, parseInt(loiId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete LOI offer', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'LOI offer deleted successfully',
        deletedRecord: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE LOI error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}