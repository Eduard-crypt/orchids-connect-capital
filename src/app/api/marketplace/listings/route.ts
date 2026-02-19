import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { marketplaceListings } from '@/db/schema';
import { like, and, or, lte, gt, gte, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const priceRange = searchParams.get('priceRange') ?? 'all';
    const revenueRange = searchParams.get('revenueRange') ?? 'all';
    const location = searchParams.get('location');
    const industry = searchParams.get('industry');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const sort = searchParams.get('sort') ?? 'newest';

    // Validate priceRange parameter
    const validPriceRanges = ['0-100k', '100k-250k', '250k-500k', '500k-1m', '1m+', 'all'];
    if (!validPriceRanges.includes(priceRange)) {
      return NextResponse.json({
        error: 'Invalid priceRange parameter. Valid values are: 0-100k, 100k-250k, 250k-500k, 500k-1m, 1m+, all',
        code: 'INVALID_PRICE_RANGE'
      }, { status: 400 });
    }

    // Validate revenueRange parameter
    const validRevenueRanges = ['0-250k', '250k-500k', '500k-1m', '1m+', 'all'];
    if (!validRevenueRanges.includes(revenueRange)) {
      return NextResponse.json({
        error: 'Invalid revenueRange parameter. Valid values are: 0-250k, 250k-500k, 500k-1m, 1m+, all',
        code: 'INVALID_REVENUE_RANGE'
      }, { status: 400 });
    }

    // Validate sort parameter
    const validSortOptions = ['newest', 'price-low', 'price-high', 'revenue-high'];
    if (!validSortOptions.includes(sort)) {
      return NextResponse.json({
        error: 'Invalid sort parameter. Valid values are: newest, price-low, price-high, revenue-high',
        code: 'INVALID_SORT'
      }, { status: 400 });
    }

    // Build conditions array dynamically
    const conditions = [];

    // Apply price range filter (prices in cents)
    if (priceRange !== 'all') {
      switch (priceRange) {
        case '0-100k':
          conditions.push(lte(marketplaceListings.price, 10000000)); // $100k = 10,000,000 cents
          break;
        case '100k-250k':
          conditions.push(gt(marketplaceListings.price, 10000000)); // > $100k
          conditions.push(lte(marketplaceListings.price, 25000000)); // <= $250k = 25,000,000 cents
          break;
        case '250k-500k':
          conditions.push(gt(marketplaceListings.price, 25000000)); // > $250k
          conditions.push(lte(marketplaceListings.price, 50000000)); // <= $500k = 50,000,000 cents
          break;
        case '500k-1m':
          conditions.push(gt(marketplaceListings.price, 50000000)); // > $500k
          conditions.push(lte(marketplaceListings.price, 100000000)); // <= $1M = 100,000,000 cents
          break;
        case '1m+':
          conditions.push(gt(marketplaceListings.price, 100000000)); // > $1M
          break;
      }
    }

    // Apply revenue range filter (values in cents)
    if (revenueRange !== 'all') {
      switch (revenueRange) {
        case '0-250k':
          conditions.push(lte(marketplaceListings.annualRevenue, 25000000)); // €250k = 25,000,000 cents
          break;
        case '250k-500k':
          conditions.push(gt(marketplaceListings.annualRevenue, 25000000)); // > €250k
          conditions.push(lte(marketplaceListings.annualRevenue, 50000000)); // <= €500k = 50,000,000 cents
          break;
        case '500k-1m':
          conditions.push(gt(marketplaceListings.annualRevenue, 50000000)); // > €500k
          conditions.push(lte(marketplaceListings.annualRevenue, 100000000)); // <= €1M = 100,000,000 cents
          break;
        case '1m+':
          conditions.push(gt(marketplaceListings.annualRevenue, 100000000)); // > €1M
          break;
      }
    }

    // Apply location filter (case-insensitive partial match)
    // When a specific location is requested, we also return 'Global' and 'Remote' listings
    // so the frontend can transform them into 'Country / Remote' and filter them correctly.
    if (location && location !== 'all') {
      conditions.push(
        or(
          like(marketplaceListings.location, `%${location}%`),
          like(marketplaceListings.location, 'Global%'),
          like(marketplaceListings.location, 'Remote%')
        )
      );
    }

    // Apply industry/category filter (case-insensitive partial match)
    if (industry) {
      conditions.push(like(marketplaceListings.category, `%${industry}%`));
    }

    // Apply age range filter (translating age to yearEstablished)
    if (minAge || maxAge) {
      const currentYear = new Date().getFullYear();
      if (minAge) {
        const maxYear = currentYear - parseInt(minAge);
        conditions.push(lte(marketplaceListings.yearEstablished, maxYear));
      }
      if (maxAge) {
        const minYear = currentYear - parseInt(maxAge);
        conditions.push(gte(marketplaceListings.yearEstablished, minYear));
      }
    }

    // Build the query
    let baseQuery = db.select().from(marketplaceListings);

    // Apply conditions and sorting
    const results = await (conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery
    ).orderBy(
      sort === 'price-low' ? asc(marketplaceListings.price) :
      sort === 'price-high' ? desc(marketplaceListings.price) :
      sort === 'revenue-high' ? desc(marketplaceListings.annualRevenue) :
      desc(marketplaceListings.createdAt)
    );

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}