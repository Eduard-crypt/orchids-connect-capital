import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellRequests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        }, 
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const userSellRequests = await db
      .select()
      .from(sellRequests)
      .where(eq(sellRequests.userId, userId))
      .orderBy(desc(sellRequests.createdAt));

    return NextResponse.json(userSellRequests, { status: 200 });

  } catch (error) {
    console.error('GET sell requests error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
}