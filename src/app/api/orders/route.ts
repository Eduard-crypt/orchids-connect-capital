import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, plans, user } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/orders - Get all orders (admin only)
 * Filters: status, userId, dateFrom, dateTo
 * Pagination: page, limit
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin (you can adjust this based on your admin logic)
    // For now, we'll allow all authenticated users to see their own orders
    const isAdmin = session.user.email?.includes('admin'); // Adjust this logic

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    
    if (!isAdmin) {
      // Non-admin users can only see their own orders
      conditions.push(eq(orders.userId, session.user.id));
    } else if (userId) {
      // Admin can filter by userId
      conditions.push(eq(orders.userId, userId));
    }

    if (status) {
      conditions.push(eq(orders.status, status));
    }
    if (dateFrom) {
      conditions.push(gte(orders.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(orders.createdAt, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get orders with user and plan details
    const ordersData = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        planId: orders.planId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        paymentProvider: orders.paymentProvider,
        metadata: orders.metadata,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: user.name,
        userEmail: user.email,
        planName: plans.name,
        planSlug: plans.slug,
      })
      .from(orders)
      .leftJoin(user, eq(orders.userId, user.id))
      .leftJoin(plans, eq(orders.planId, plans.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause);

    return NextResponse.json({
      orders: ordersData,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('❌ GET ORDERS ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
