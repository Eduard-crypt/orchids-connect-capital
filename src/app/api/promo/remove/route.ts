/**
 * POST /api/promo/remove
 * Removes applied promo code from user's cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartPromoCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Remove promo code from cart
    await db.delete(cartPromoCodes).where(eq(cartPromoCodes.userId, userId));

    return NextResponse.json({
      success: true,
      message: 'Promo code removed successfully',
    });
  } catch (error) {
    console.error('Error removing promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove promo code' },
      { status: 500 }
    );
  }
}
