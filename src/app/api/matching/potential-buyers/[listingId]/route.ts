import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyerProfiles, listings, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { listingId } = params;

    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const listingIdInt = parseInt(listingId);

    const listingResult = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingIdInt))
      .limit(1);

    if (listingResult.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const listing = listingResult[0];

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the listing owner can view potential buyers', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const buyerProfilesResult = await db
      .select({
        id: buyerProfiles.id,
        userId: buyerProfiles.userId,
        budgetMin: buyerProfiles.budgetMin,
        budgetMax: buyerProfiles.budgetMax,
        industries: buyerProfiles.industries,
        regions: buyerProfiles.regions,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(buyerProfiles)
      .innerJoin(user, eq(buyerProfiles.userId, user.id))
      .where(eq(buyerProfiles.onboardingCompleted, true));

    const matchedBuyers = buyerProfilesResult
      .map((buyer) => {
        let matchScore = 0;
        const matchReasons: string[] = [];

        const budgetMin = buyer.budgetMin || 0;
        const budgetMax = buyer.budgetMax || 0;
        const askingPrice = listing.askingPrice || 0;

        if (askingPrice >= budgetMin && askingPrice <= budgetMax) {
          matchScore += 40;
          matchReasons.push('Perfect budget match');
        } else if (budgetMin > 0 && budgetMax > 0) {
          const lowerBound = budgetMin * 0.8;
          const upperBound = budgetMax * 1.2;
          
          if (askingPrice >= lowerBound && askingPrice <= upperBound) {
            matchScore += 30;
            matchReasons.push('Budget match within 20%');
          } else {
            const lowerBound50 = budgetMin * 0.5;
            const upperBound50 = budgetMax * 1.5;
            
            if (askingPrice >= lowerBound50 && askingPrice <= upperBound50) {
              matchScore += 20;
              matchReasons.push('Budget match within 50%');
            } else {
              const lowerBound100 = budgetMin * 0;
              const upperBound100 = budgetMax * 2;
              
              if (askingPrice >= lowerBound100 && askingPrice <= upperBound100) {
                matchScore += 10;
                matchReasons.push('Budget match within 100%');
              }
            }
          }
        }

        let buyerIndustries: string[] = [];
        if (buyer.industries) {
          try {
            buyerIndustries = JSON.parse(buyer.industries);
          } catch (e) {
            console.error('Error parsing buyer industries:', e);
          }
        }

        if (
          listing.businessType &&
          Array.isArray(buyerIndustries) &&
          buyerIndustries.includes(listing.businessType)
        ) {
          matchScore += 40;
          matchReasons.push(`Industry match: ${listing.businessType}`);
        }

        let buyerRegions: string[] = [];
        if (buyer.regions) {
          try {
            buyerRegions = JSON.parse(buyer.regions);
          } catch (e) {
            console.error('Error parsing buyer regions:', e);
          }
        }

        if (
          listing.geography &&
          Array.isArray(buyerRegions) &&
          buyerRegions.includes(listing.geography)
        ) {
          matchScore += 20;
          matchReasons.push(`Location match: ${listing.geography}`);
        }

        return {
          buyer: {
            userId: buyer.userId,
            name: buyer.name,
            email: buyer.email,
            image: buyer.image,
          },
          matchScore,
          matchReasons,
          budgetRange: {
            min: budgetMin,
            max: budgetMax,
          },
        };
      })
      .filter((match) => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json(matchedBuyers, { status: 200 });
  } catch (error) {
    console.error('GET potential buyers error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}