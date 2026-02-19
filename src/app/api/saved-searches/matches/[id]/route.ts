import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedSearches, listings } from '@/db/schema';
import { eq, and, gte, lte, like, desc, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
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

    // Extract and validate ID
    const { id } = params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid saved search ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const searchId = parseInt(id);

    // Fetch saved search with user ownership check
    const savedSearch = await db
      .select()
      .from(savedSearches)
      .where(
        and(
          eq(savedSearches.id, searchId),
          eq(savedSearches.userId, session.user.id)
        )
      )
      .limit(1);

    if (savedSearch.length === 0) {
      return NextResponse.json(
        { 
          error: 'Saved search not found or you do not have access to it',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Extract search criteria
    const searchCriteria = savedSearch[0].searchCriteria as Record<string, any>;

    // Build dynamic query conditions
    const conditions: any[] = [eq(listings.status, 'approved')];

    // Business type filter
    if (searchCriteria.type) {
      conditions.push(eq(listings.businessType, searchCriteria.type));
    }

    // Price range filters
    if (searchCriteria.minPrice) {
      conditions.push(gte(listings.askingPrice, searchCriteria.minPrice));
    }
    if (searchCriteria.maxPrice) {
      conditions.push(lte(listings.askingPrice, searchCriteria.maxPrice));
    }

    // Revenue range filters
    if (searchCriteria.minRevenue) {
      conditions.push(gte(listings.ttmRevenue, searchCriteria.minRevenue));
    }
    if (searchCriteria.maxRevenue) {
      conditions.push(lte(listings.ttmRevenue, searchCriteria.maxRevenue));
    }

    // Profit range filters
    if (searchCriteria.minProfit) {
      conditions.push(gte(listings.ttmProfit, searchCriteria.minProfit));
    }
    if (searchCriteria.maxProfit) {
      conditions.push(lte(listings.ttmProfit, searchCriteria.maxProfit));
    }

    // Geography filter (partial match)
    if (searchCriteria.geography) {
      conditions.push(like(listings.geography, `%${searchCriteria.geography}%`));
    }

    // Niche filter (partial match)
    if (searchCriteria.niche) {
      conditions.push(like(listings.niche, `%${searchCriteria.niche}%`));
    }

    // Verified only filter
    if (searchCriteria.verifiedOnly === true) {
      conditions.push(eq(listings.isVerified, true));
    }

    // General search across multiple fields
    if (searchCriteria.search) {
      const searchTerm = searchCriteria.search;
      conditions.push(
        or(
          like(listings.title, `%${searchTerm}%`),
          like(listings.niche, `%${searchTerm}%`),
          like(listings.businessModel, `%${searchTerm}%`)
        )
      );
    }

    // Query matching listings with all conditions
    const matchingListings = await db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt))
      .limit(5);

    return NextResponse.json(matchingListings, { status: 200 });

  } catch (error) {
    console.error('GET saved search matches error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}