/**
 * Admin Payments API
 * GET /api/admin/payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';

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

    // Fetch all payments
    const allPayments = await db
      .select()
      .from(payments)
      .orderBy(payments.createdAt);

    return NextResponse.json({ payments: allPayments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
