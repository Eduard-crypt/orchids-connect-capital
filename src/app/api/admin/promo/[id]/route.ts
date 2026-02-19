/**
 * PATCH /api/admin/promo/[id]
 * Updates a promo code
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promoCodeId = parseInt(params.id);

    if (isNaN(promoCodeId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData: any = { updatedAt: new Date() };

    // Only update provided fields
    if (body.active !== undefined) updateData.active = body.active;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses;
    if (body.minOrderValue !== undefined) updateData.minOrderValue = body.minOrderValue;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    const updatedPromoCode = await db
      .update(promoCodes)
      .set(updateData)
      .where(eq(promoCodes.id, promoCodeId))
      .returning();

    if (updatedPromoCode.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code updated successfully',
      promoCode: updatedPromoCode[0],
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}
