import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedListings, marketplaceListings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const results = await db
      .select({
        saveId: savedListings.id,
        savedAt: savedListings.createdAt,
        listing: {
          id: marketplaceListings.id,
          title: marketplaceListings.title,
          location: marketplaceListings.location,
          category: marketplaceListings.category,
          price: marketplaceListings.price,
          annualRevenue: marketplaceListings.annualRevenue,
          annualCashFlow: marketplaceListings.annualCashFlow,
          description: marketplaceListings.description,
          isFeatured: marketplaceListings.isFeatured,
          isVerified: marketplaceListings.isVerified,
          employees: marketplaceListings.employees,
          yearEstablished: marketplaceListings.yearEstablished,
          createdAt: marketplaceListings.createdAt,
          updatedAt: marketplaceListings.updatedAt,
        }
      })
      .from(savedListings)
      .innerJoin(
        marketplaceListings,
        eq(savedListings.listingId, marketplaceListings.id)
      )
      .where(eq(savedListings.userId, session.user.id))
      .orderBy(desc(savedListings.createdAt));

    const formattedResults = results.map(row => ({
      saveId: row.saveId,
      savedAt: row.savedAt instanceof Date ? row.savedAt.toISOString() : row.savedAt,
      listing: {
        ...row.listing,
        createdAt: row.listing.createdAt instanceof Date ? row.listing.createdAt.toISOString() : row.listing.createdAt,
        updatedAt: row.listing.updatedAt instanceof Date ? row.listing.updatedAt.toISOString() : row.listing.updatedAt,
      }
    }));

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET saved listings error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}