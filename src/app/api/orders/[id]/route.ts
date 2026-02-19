import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, plans, user, userMemberships } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/orders/[id] - Get single order details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = parseInt(id);

    // Get order with related data
    const [order] = await db
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
        planDescription: plans.description,
        planFeatures: plans.features,
      })
      .from(orders)
      .leftJoin(user, eq(orders.userId, user.id))
      .leftJoin(plans, eq(orders.planId, plans.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check permission: admin or order owner
    const isAdmin = session.user.email?.includes('admin');
    if (!isAdmin && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If order is completed, get membership info
    let membership = null;
    if (order.status === 'completed') {
      const [mem] = await db
        .select()
        .from(userMemberships)
        .where(
          and(
            eq(userMemberships.userId, order.userId),
            eq(userMemberships.planId, order.planId)
          )
        )
        .limit(1);
      
      membership = mem || null;
    }

    return NextResponse.json({
      order,
      membership,
    });
  } catch (error) {
    console.error('❌ GET ORDER ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id] - Update order status (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const orderId = parseInt(id);
    const body = await req.json();
    const { status: newStatus, notes } = body;

    if (!newStatus) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Validate status transitions
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current order
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: newStatus,
        metadata: {
          ...((existingOrder.metadata as any) || {}),
          statusHistory: [
            ...((existingOrder.metadata as any)?.statusHistory || []),
            {
              from: existingOrder.status,
              to: newStatus,
              changedBy: session.user.id,
              changedAt: new Date().toISOString(),
              notes: notes || null,
            },
          ],
        },
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // If status changed to 'completed', create membership
    if (newStatus === 'completed' && existingOrder.status !== 'completed') {
      const now = new Date();
      const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

      // Check if membership already exists
      const [existingMembership] = await db
        .select()
        .from(userMemberships)
        .where(eq(userMemberships.userId, existingOrder.userId))
        .limit(1);

      if (existingMembership) {
        // Update existing membership
        await db
          .update(userMemberships)
          .set({
            planId: existingOrder.planId,
            status: 'active',
            startedAt: now,
            renewsAt,
            updatedAt: now,
          })
          .where(eq(userMemberships.userId, existingOrder.userId));
      } else {
        // Create new membership
        await db.insert(userMemberships).values({
          userId: existingOrder.userId,
          planId: existingOrder.planId,
          status: 'active',
          startedAt: now,
          renewsAt,
          createdAt: now,
          updatedAt: now,
        });
      }

      console.log('✅ MEMBERSHIP ACTIVATED');
      console.log('User ID:', existingOrder.userId);
      console.log('Plan ID:', existingOrder.planId);
      console.log('Started:', now.toISOString());
      console.log('Renews:', renewsAt.toISOString());
    }

    console.log('═══════════════════════════════════════');
    console.log('📝 ORDER STATUS UPDATED');
    console.log('═══════════════════════════════════════');
    console.log('Order ID:', orderId);
    console.log('Old Status:', existingOrder.status);
    console.log('New Status:', newStatus);
    console.log('Updated By:', session.user.email);
    console.log('Timestamp:', new Date().toISOString());
    console.log('═══════════════════════════════════════');

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      membershipActivated: newStatus === 'completed',
    });
  } catch (error) {
    console.error('❌ UPDATE ORDER ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
