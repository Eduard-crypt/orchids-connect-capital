/**
 * GET /api/admin/promo
 * Lists all promo codes with usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoCodes } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allPromoCodes = await db
      .select()
      .from(promoCodes)
      .orderBy(desc(promoCodes.createdAt));

    return NextResponse.json({
      success: true,
      promoCodes: allPromoCodes,
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}
