/**
 * POST /api/promo/apply
 * Applies a promo code to user's cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes, cartPromoCodes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get bearer token and verify user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Get user from session token
    const sessionResult = await db.query.session.findFirst({
      where: (session, { eq }) => eq(session.token, token),
    });

    if (!sessionResult) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessionResult.userId;

    const body = await request.json();
    const { code, cartTotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Promo code is required' },
        { status: 400 }
      );
    }

    if (!cartTotal || typeof cartTotal !== 'number' || cartTotal <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid cart total is required' },
        { status: 400 }
      );
    }

    // Find promo code
    const promoCode = await db.query.promoCodes.findFirst({
      where: eq(promoCodes.code, code.toUpperCase()),
    });

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code' },
        { status: 404 }
      );
    }

    // Validate promo code (same validation as validate endpoint)
    if (!promoCode.active) {
      return NextResponse.json(
        { success: false, message: 'This promo code is not active' },
        { status: 400 }
      );
    }

    const now = new Date();
    
    if (promoCode.startDate && new Date(promoCode.startDate) > now) {
      return NextResponse.json(
        { success: false, message: 'This promo code is not yet valid' },
        { status: 400 }
      );
    }

    if (promoCode.endDate && new Date(promoCode.endDate) < now) {
      return NextResponse.json(
        { success: false, message: 'This promo code is expired' },
        { status: 400 }
      );
    }

    if (promoCode.maxUses !== null && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json(
        { success: false, message: 'This promo code has reached its usage limit' },
        { status: 400 }
      );
    }

    if (promoCode.minOrderValue !== null && cartTotal < promoCode.minOrderValue) {
      const minAmount = (promoCode.minOrderValue / 100).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          message: `Your order does not meet the minimum amount of $${minAmount} for this promo code`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (promoCode.type === 'percentage') {
      discountAmount = Math.round(cartTotal * (promoCode.value / 100));
    } else if (promoCode.type === 'fixed') {
      discountAmount = promoCode.value;
    }

    const finalTotal = Math.max(0, cartTotal - discountAmount);

    // Start transaction: remove existing promo, add new one, increment usage
    // Delete any existing promo for this user
    await db.delete(cartPromoCodes).where(eq(cartPromoCodes.userId, userId));

    // Insert new cart promo code
    await db.insert(cartPromoCodes).values({
      userId,
      promoCodeId: promoCode.id,
      cartTotal,
      discountAmount,
      finalTotal,
    });

    // Increment used count
    await db
      .update(promoCodes)
      .set({
        usedCount: promoCode.usedCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(promoCodes.id, promoCode.id));

    return NextResponse.json({
      success: true,
      discountAmount,
      finalTotal,
      message: 'Promo code applied successfully',
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        description: promoCode.description,
      },
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
}
