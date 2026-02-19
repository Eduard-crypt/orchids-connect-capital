import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyerProfiles, listings, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface ListingWithSeller {
  listing: typeof listings.$inferSelect;
  seller: {
    name: string;
    email: string;
  };
}

interface MatchedListing extends ListingWithSeller {
  matchScore: number;
  matchReasons: string[];
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get buyer profile
    const buyerProfileResult = await db.select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, session.user.id))
      .limit(1);

    if (buyerProfileResult.length === 0) {
      return NextResponse.json({ 
        error: 'Buyer profile not found',
        code: 'BUYER_PROFILE_NOT_FOUND'
      }, { status: 404 });
    }

    const buyerProfile = buyerProfileResult[0];

    // Check if onboarding is completed
    if (!buyerProfile.onboardingCompleted) {
      return NextResponse.json({ 
        error: 'Complete onboarding first',
        code: 'ONBOARDING_NOT_COMPLETED'
      }, { status: 400 });
    }

    // Parse buyer preferences
    const industries: string[] = buyerProfile.industries ? JSON.parse(buyerProfile.industries) : [];
    const regions: string[] = buyerProfile.regions ? JSON.parse(buyerProfile.regions) : [];
    const budgetMin = buyerProfile.budgetMin || 0;
    const budgetMax = buyerProfile.budgetMax || Number.MAX_SAFE_INTEGER;

    // Fetch all approved listings with seller info
    const approvedListings = await db.select({
      id: listings.id,
      sellerId: listings.sellerId,
      status: listings.status,
      title: listings.title,
      businessModel: listings.businessModel,
      niche: listings.niche,
      geography: listings.geography,
      ttmRevenue: listings.ttmRevenue,
      ttmProfit: listings.ttmProfit,
      profitMargin: listings.profitMargin,
      organicTraffic: listings.organicTraffic,
      paidTraffic: listings.paidTraffic,
      marketplaces: listings.marketplaces,
      teamSize: listings.teamSize,
      hoursPerWeek: listings.hoursPerWeek,
      askingPrice: listings.askingPrice,
      businessType: listings.businessType,
      businessUrl: listings.businessUrl,
      brandName: listings.brandName,
      fullDescription: listings.fullDescription,
      rejectionReason: listings.rejectionReason,
      approvedAt: listings.approvedAt,
      submittedAt: listings.submittedAt,
      ageMonths: listings.ageMonths,
      revenueMultiple: listings.revenueMultiple,
      isVerified: listings.isVerified,
      underLoi: listings.underLoi,
      sellerResponseTimeHours: listings.sellerResponseTimeHours,
      createdAt: listings.createdAt,
      updatedAt: listings.updatedAt,
      sellerName: user.name,
      sellerEmail: user.email,
    })
      .from(listings)
      .leftJoin(user, eq(listings.sellerId, user.id))
      .where(eq(listings.status, 'approved'));

    // Calculate match scores
    const matchedListings: MatchedListing[] = approvedListings.map((listing) => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      const askingPrice = listing.askingPrice || 0;

      // Budget Match (0-40 points)
      if (askingPrice >= budgetMin && askingPrice <= budgetMax) {
        matchScore += 40;
        matchReasons.push('Perfect budget match');
      } else {
        const lowerBound20 = budgetMin * 0.8;
        const upperBound20 = budgetMax * 1.2;
        const lowerBound50 = budgetMin * 0.5;
        const upperBound50 = budgetMax * 1.5;
        const lowerBound100 = budgetMin * 0;
        const upperBound100 = budgetMax * 2;

        if (askingPrice >= lowerBound20 && askingPrice <= upperBound20) {
          matchScore += 30;
          matchReasons.push('Close budget match (within 20%)');
        } else if (askingPrice >= lowerBound50 && askingPrice <= upperBound50) {
          matchScore += 20;
          matchReasons.push('Moderate budget match (within 50%)');
        } else if (askingPrice >= lowerBound100 && askingPrice <= upperBound100) {
          matchScore += 10;
          matchReasons.push('Partial budget match (within 100%)');
        }
      }

      // Industry Match (0-40 points)
      if (listing.businessType && industries.length > 0) {
        const businessType = listing.businessType.toLowerCase();
        const matchingIndustry = industries.find(industry => 
          businessType.includes(industry.toLowerCase()) || 
          industry.toLowerCase().includes(businessType)
        );
        
        if (matchingIndustry) {
          matchScore += 40;
          matchReasons.push(`Industry match: ${listing.businessType}`);
        }
      }

      // Location Match (0-20 points)
      if (listing.geography && regions.length > 0) {
        const geography = listing.geography.toLowerCase();
        const matchingRegion = regions.find(region => 
          geography.includes(region.toLowerCase()) || 
          region.toLowerCase().includes(geography)
        );
        
        if (matchingRegion) {
          matchScore += 20;
          matchReasons.push(`Location match: ${listing.geography}`);
        }
      }

      return {
        listing: {
          id: listing.id,
          sellerId: listing.sellerId,
          status: listing.status,
          title: listing.title,
          businessModel: listing.businessModel,
          niche: listing.niche,
          geography: listing.geography,
          ttmRevenue: listing.ttmRevenue,
          ttmProfit: listing.ttmProfit,
          profitMargin: listing.profitMargin,
          organicTraffic: listing.organicTraffic,
          paidTraffic: listing.paidTraffic,
          marketplaces: listing.marketplaces,
          teamSize: listing.teamSize,
          hoursPerWeek: listing.hoursPerWeek,
          askingPrice: listing.askingPrice,
          businessType: listing.businessType,
          businessUrl: listing.businessUrl,
          brandName: listing.brandName,
          fullDescription: listing.fullDescription,
          rejectionReason: listing.rejectionReason,
          approvedAt: listing.approvedAt,
          submittedAt: listing.submittedAt,
          ageMonths: listing.ageMonths,
          revenueMultiple: listing.revenueMultiple,
          isVerified: listing.isVerified,
          underLoi: listing.underLoi,
          sellerResponseTimeHours: listing.sellerResponseTimeHours,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
        },
        seller: {
          name: listing.sellerName || '',
          email: listing.sellerEmail || '',
        },
        matchScore,
        matchReasons,
      };
    });

    // Sort by match score descending and return top 10
    const topMatches = matchedListings
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json(topMatches, { status: 200 });

  } catch (error) {
    console.error('GET recommendations error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}