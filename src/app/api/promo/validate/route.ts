/**
 * POST /api/promo/validate
 * Validates a promo code and calculates discount
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
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

    // Find promo code (case-insensitive)
    const promoCode = await db.query.promoCodes.findFirst({
      where: eq(promoCodes.code, code.toUpperCase()),
    });

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code' },
        { status: 404 }
      );
    }

    // Check if active
    if (!promoCode.active) {
      return NextResponse.json(
        { success: false, message: 'This promo code is not active' },
        { status: 400 }
      );
    }

    // Check date validity
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

    // Check usage limits
    if (promoCode.maxUses !== null && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json(
        { success: false, message: 'This promo code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order value
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

    // Calculate new total (minimum 0)
    const newTotal = Math.max(0, cartTotal - discountAmount);

    return NextResponse.json({
      success: true,
      discountAmount,
      newTotal,
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
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
