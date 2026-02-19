/**
 * Admin Orders API
 * GET /api/admin/orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, plans, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get bearer token and verify user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Get user from session token
    const sessionResult = await db.query.session.findFirst({
      where: (session, { eq }) => eq(session.token, token),
    });

    if (!sessionResult) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch all orders with user and plan details
    const allOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        userName: user.name,
        userEmail: user.email,
        planName: plans.name,
        status: orders.status,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        stripeCheckoutSessionId: orders.stripeCheckoutSessionId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .innerJoin(plans, eq(orders.planId, plans.id))
      .orderBy(orders.createdAt);

    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
