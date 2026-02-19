import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listings, user } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    const authenticatedUser = session.user;

    // Admin check - placeholder implementation
    const isAdmin = authenticatedUser.email === 'admin@example.com' || 
                    authenticatedUser.email?.endsWith('@admin.com');

    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const statusFilter = searchParams.get('status') ?? 'submitted';

    // Validate status filter
    const validStatuses = ['submitted', 'approved', 'rejected', 'draft'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return NextResponse.json({ 
        error: 'Invalid status filter. Must be one of: submitted, approved, rejected, draft',
        code: 'INVALID_STATUS_FILTER'
      }, { status: 400 });
    }

    // Query listings with seller information
    const moderationQueue = await db
      .select({
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
        seller: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      })
      .from(listings)
      .innerJoin(user, eq(listings.sellerId, user.id))
      .where(eq(listings.status, statusFilter))
      .orderBy(desc(listings.submittedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(moderationQueue, { status: 200 });

  } catch (error) {
    console.error('GET moderation queue error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}