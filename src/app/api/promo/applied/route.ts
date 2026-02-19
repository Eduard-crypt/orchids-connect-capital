/**
 * GET /api/promo/applied
 * Gets currently applied promo code for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartPromoCodes, promoCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    // Get applied promo with promo code details
    const appliedPromo = await db
      .select({
        id: cartPromoCodes.id,
        userId: cartPromoCodes.userId,
        cartTotal: cartPromoCodes.cartTotal,
        discountAmount: cartPromoCodes.discountAmount,
        finalTotal: cartPromoCodes.finalTotal,
        appliedAt: cartPromoCodes.appliedAt,
        promoCode: {
          id: promoCodes.id,
          code: promoCodes.code,
          type: promoCodes.type,
          value: promoCodes.value,
          description: promoCodes.description,
        },
      })
      .from(cartPromoCodes)
      .innerJoin(promoCodes, eq(cartPromoCodes.promoCodeId, promoCodes.id))
      .where(eq(cartPromoCodes.userId, userId))
      .limit(1);

    if (appliedPromo.length === 0) {
      return NextResponse.json({
        success: true,
        appliedPromo: null,
      });
    }

    return NextResponse.json({
      success: true,
      appliedPromo: appliedPromo[0],
    });
  } catch (error) {
    console.error('Error fetching applied promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applied promo code' },
      { status: 500 }
    );
  }
}
