import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listings, userMemberships, userProfiles } from '@/db/schema';
import { eq, and, or, like, gte, lte, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Filter parameters
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRevenue = searchParams.get('minRevenue');
    const maxRevenue = searchParams.get('maxRevenue');
    const minProfit = searchParams.get('minProfit');
    const maxProfit = searchParams.get('maxProfit');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const minMultiple = searchParams.get('minMultiple');
    const maxMultiple = searchParams.get('maxMultiple');
    const geography = searchParams.get('geography');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const underLoiParam = searchParams.get('underLoi');
    const search = searchParams.get('search');

    // Build query with conditions
    const conditions = [eq(listings.status, 'approved')];

    // Business type filter
    if (type) {
      conditions.push(eq(listings.businessType, type));
    }

    // Price range filters
    if (minPrice) {
      conditions.push(gte(listings.askingPrice, parseInt(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(listings.askingPrice, parseInt(maxPrice)));
    }

    // Revenue range filters
    if (minRevenue) {
      conditions.push(gte(listings.ttmRevenue, parseInt(minRevenue)));
    }
    if (maxRevenue) {
      conditions.push(lte(listings.ttmRevenue, parseInt(maxRevenue)));
    }

    // Profit range filters
    if (minProfit) {
      conditions.push(gte(listings.ttmProfit, parseInt(minProfit)));
    }
    if (maxProfit) {
      conditions.push(lte(listings.ttmProfit, parseInt(maxProfit)));
    }

    // Age range filters
    if (minAge) {
      conditions.push(gte(listings.ageMonths, parseInt(minAge)));
    }
    if (maxAge) {
      conditions.push(lte(listings.ageMonths, parseInt(maxAge)));
    }

    // Revenue multiple range filters
    if (minMultiple) {
      conditions.push(gte(listings.revenueMultiple, parseFloat(minMultiple)));
    }
    if (maxMultiple) {
      conditions.push(lte(listings.revenueMultiple, parseFloat(maxMultiple)));
    }

    // Geography filter (partial match)
    if (geography) {
      conditions.push(like(listings.geography, `%${geography}%`));
    }

    // Verified filter
    if (verifiedOnly) {
      conditions.push(eq(listings.isVerified, true));
    }

    // Under LOI filter
    if (underLoiParam !== null) {
      conditions.push(eq(listings.underLoi, underLoiParam === 'true'));
    }

    // Search filter (title, niche, businessModel)
    if (search) {
      const searchCondition = or(
        like(listings.title, `%${search}%`),
        like(listings.niche, `%${search}%`),
        like(listings.businessModel, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Execute query
    const results = await db
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
        fullDescription: listings.fullDescription,
        approvedAt: listings.approvedAt,
        submittedAt: listings.submittedAt,
        ageMonths: listings.ageMonths,
        revenueMultiple: listings.revenueMultiple,
        isVerified: listings.isVerified,
        underLoi: listings.underLoi,
        sellerResponseTimeHours: listings.sellerResponseTimeHours,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
      })
      .from(listings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user has Business Seller permissions
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();

    const membership = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, userId))
      .get();

    const hasActiveMembership = membership?.status === 'active';
    const isTeacherVerified = profile?.isTeacherVerified || false;

    // Determine if user can create listings
    // Only Business Sellers (active membership + NOT teacher) can create listings
    const canCreateListings = hasActiveMembership && !isTeacherVerified;

    if (!canCreateListings) {
      if (isTeacherVerified) {
        return NextResponse.json(
          {
            error: 'Business Teachers cannot create sale listings. This feature is only available for Business Sellers.',
            code: 'INSUFFICIENT_PERMISSIONS',
            profileType: 'Business Teacher'
          },
          { status: 403 }
        );
      } else if (!hasActiveMembership) {
        return NextResponse.json(
          {
            error: 'You must have an active Business Seller membership to create listings.',
            code: 'INSUFFICIENT_PERMISSIONS',
            profileType: 'Viewer'
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    // Security: Reject if sellerId provided in request body
    if ('sellerId' in body || 'seller_id' in body) {
      return NextResponse.json(
        {
          error: 'Seller ID cannot be provided in request body',
          code: 'SELLER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_REQUIRED_FIELD' },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const sanitizedData: any = {
      title: body.title.trim(),
      sellerId: session.user.id,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optional fields
    if (body.businessModel) sanitizedData.businessModel = body.businessModel.trim();
    if (body.niche) sanitizedData.niche = body.niche.trim();
    if (body.geography) sanitizedData.geography = body.geography.trim();
    if (body.ttmRevenue !== undefined) sanitizedData.ttmRevenue = parseInt(body.ttmRevenue);
    if (body.ttmProfit !== undefined) sanitizedData.ttmProfit = parseInt(body.ttmProfit);
    if (body.profitMargin !== undefined) sanitizedData.profitMargin = parseInt(body.profitMargin);
    if (body.organicTraffic) sanitizedData.organicTraffic = body.organicTraffic.trim();
    if (body.paidTraffic) sanitizedData.paidTraffic = body.paidTraffic.trim();
    if (body.marketplaces) sanitizedData.marketplaces = body.marketplaces.trim();
    if (body.teamSize !== undefined) sanitizedData.teamSize = parseInt(body.teamSize);
    if (body.hoursPerWeek !== undefined) sanitizedData.hoursPerWeek = parseInt(body.hoursPerWeek);
    if (body.askingPrice !== undefined) sanitizedData.askingPrice = parseInt(body.askingPrice);
    if (body.businessType) sanitizedData.businessType = body.businessType.trim();
    if (body.businessUrl) sanitizedData.businessUrl = body.businessUrl.trim();
    if (body.brandName) sanitizedData.brandName = body.brandName.trim();
    if (body.fullDescription) sanitizedData.fullDescription = body.fullDescription.trim();
    if (body.ageMonths !== undefined) sanitizedData.ageMonths = parseInt(body.ageMonths);
    if (body.isVerified !== undefined) sanitizedData.isVerified = Boolean(body.isVerified);
    if (body.underLoi !== undefined) sanitizedData.underLoi = Boolean(body.underLoi);
    if (body.sellerResponseTimeHours !== undefined) {
      sanitizedData.sellerResponseTimeHours = parseInt(body.sellerResponseTimeHours);
    }

    // Calculate revenueMultiple automatically if askingPrice and ttmRevenue are provided
    if (sanitizedData.askingPrice && sanitizedData.ttmRevenue && sanitizedData.ttmRevenue > 0) {
      sanitizedData.revenueMultiple = sanitizedData.askingPrice / sanitizedData.ttmRevenue;
    }

    // Insert listing
    const newListing = await db
      .insert(listings)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newListing[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}