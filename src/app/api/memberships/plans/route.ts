import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { membershipPlans } from '@/db/schema';

export async function GET(req: NextRequest) {
  try {
    const plans = await db.select().from(membershipPlans).all();
    
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership plans' },
      { status: 500 }
    );
  }
}
