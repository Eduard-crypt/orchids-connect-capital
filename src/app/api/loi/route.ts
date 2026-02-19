import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loiOffers, listings, user } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
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
    
    // Parse and validate pagination parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter. Must be a positive number.',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter. Must be zero or positive.',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    // Parse optional filters
    const statusFilter = searchParams.get('status');
    const roleFilter = searchParams.get('role');

    // Validate status filter
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return NextResponse.json({ 
        error: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS_FILTER' 
      }, { status: 400 });
    }

    // Validate role filter
    const validRoles = ['buyer', 'seller'];
    if (roleFilter && !validRoles.includes(roleFilter)) {
      return NextResponse.json({ 
        error: `Invalid role filter. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE_FILTER' 
      }, { status: 400 });
    }

    // Build WHERE conditions
    let whereConditions;

    if (roleFilter === 'buyer') {
      // Only fetch offers where user is the buyer
      whereConditions = eq(loiOffers.buyerId, currentUser.id);
    } else if (roleFilter === 'seller') {
      // Only fetch offers where user is the seller
      whereConditions = eq(loiOffers.sellerId, currentUser.id);
    } else {
      // Fetch offers where user is either buyer OR seller
      whereConditions = or(
        eq(loiOffers.buyerId, currentUser.id),
        eq(loiOffers.sellerId, currentUser.id)
      );
    }

    // Add status filter if provided
    if (statusFilter) {
      whereConditions = and(
        whereConditions,
        eq(loiOffers.status, statusFilter)
      );
    }

    // Execute query with joins to get enriched data
    const offers = await db
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
          businessType: listings.businessType,
          askingPrice: listings.askingPrice,
        },
      })
      .from(loiOffers)
      .leftJoin(listings, eq(loiOffers.listingId, listings.id))
      .where(whereConditions)
      .orderBy(desc(loiOffers.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unique buyer and seller IDs
    const buyerIds = [...new Set(offers.map(o => o.buyerId))];
    const sellerIds = [...new Set(offers.map(o => o.sellerId))];
    const allUserIds = [...new Set([...buyerIds, ...sellerIds])];

    // Fetch all user details in one query
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(
        or(...allUserIds.map(id => eq(user.id, id)))
      );

    // Create a map for quick user lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    // Enrich offers with buyer and seller details
    const enrichedOffers = offers.map(offer => ({
      id: offer.id,
      listingId: offer.listingId,
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      status: offer.status,
      offerPrice: offer.offerPrice,
      cashAmount: offer.cashAmount,
      earnoutAmount: offer.earnoutAmount,
      earnoutTerms: offer.earnoutTerms,
      dueDiligenceDays: offer.dueDiligenceDays,
      exclusivityDays: offer.exclusivityDays,
      conditions: offer.conditions,
      expirationDate: offer.expirationDate,
      pdfUrl: offer.pdfUrl,
      sentAt: offer.sentAt,
      respondedAt: offer.respondedAt,
      responseNotes: offer.responseNotes,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      listing: offer.listing,
      buyer: userMap.get(offer.buyerId) || null,
      seller: userMap.get(offer.sellerId) || null,
    }));

    return NextResponse.json(enrichedOffers, { status: 200 });

  } catch (error) {
    console.error('GET /api/loi-offers error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}