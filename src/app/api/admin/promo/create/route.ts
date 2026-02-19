/**
 * POST /api/admin/promo/create
 * Creates a new promo code
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      type,
      value,
      description,
      active = true,
      startDate,
      endDate,
      maxUses,
      minOrderValue,
    } = body;

    // Validation
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Code is required' },
        { status: 400 }
      );
    }

    if (!type || !['percentage', 'fixed'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Type must be "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    if (typeof value !== 'number' || value <= 0) {
      return NextResponse.json(
        { success: false, message: 'Value must be a positive number' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Description is required' },
        { status: 400 }
      );
    }

    // Create promo code
    const newPromoCode = await db
      .insert(promoCodes)
      .values({
        code: code.toUpperCase(),
        type,
        value,
        description,
        active,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxUses: maxUses || null,
        minOrderValue: minOrderValue || null,
        usedCount: 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Promo code created successfully',
      promoCode: newPromoCode[0],
    });
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    
    // Handle unique constraint violation
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { success: false, message: 'A promo code with this code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
