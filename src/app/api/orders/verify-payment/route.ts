import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, userMemberships, plans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * POST /api/orders/verify-payment - Manually verify Revolut payment (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const isAdmin = session.user.email?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, paymentReference, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Order already completed' },
        { status: 400 }
      );
    }

    // Get plan details
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, order.planId))
      .limit(1);

    // Update order to completed
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: 'completed',
        metadata: {
          ...((order.metadata as any) || {}),
          paymentReference: paymentReference || null,
          verifiedBy: session.user.id,
          verifiedAt: new Date().toISOString(),
          verificationNotes: notes || null,
          statusHistory: [
            ...((order.metadata as any)?.statusHistory || []),
            {
              from: order.status,
              to: 'completed',
              changedBy: session.user.id,
              changedAt: new Date().toISOString(),
              notes: `Payment verified. Ref: ${paymentReference || 'N/A'}`,
            },
          ],
        },
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))
      .returning();

    // Create or update membership
    const now = new Date();
    const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    const [existingMembership] = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, order.userId))
      .limit(1);

    let membership;
    if (existingMembership) {
      [membership] = await db
        .update(userMemberships)
        .set({
          planId: order.planId,
          status: 'active',
          startedAt: now,
          renewsAt,
          updatedAt: now,
        })
        .where(eq(userMemberships.userId, order.userId))
        .returning();
    } else {
      [membership] = await db
        .insert(userMemberships)
        .values({
          userId: order.userId,
          planId: order.planId,
          status: 'active',
          startedAt: now,
          renewsAt,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ PAYMENT VERIFIED & MEMBERSHIP ACTIVATED');
    console.log('═══════════════════════════════════════');
    console.log('Order ID:', order.id);
    console.log('User ID:', order.userId);
    console.log('Plan:', plan?.name);
    console.log('Amount:', order.totalAmount / 100, order.currency);
    console.log('Payment Ref:', paymentReference || 'N/A');
    console.log('Verified By:', session.user.email);
    console.log('Membership Started:', now.toISOString());
    console.log('Membership Renews:', renewsAt.toISOString());
    console.log('═══════════════════════════════════════');

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      membership,
      message: 'Payment verified and membership activated successfully',
    });
  } catch (error) {
    console.error('❌ VERIFY PAYMENT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
