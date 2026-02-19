import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageThreads } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all threads where user is buyer
    const buyerThreads = await db.select({
      buyerUnreadCount: messageThreads.buyerUnreadCount
    })
      .from(messageThreads)
      .where(eq(messageThreads.buyerId, userId));

    // Fetch all threads where user is seller
    const sellerThreads = await db.select({
      sellerUnreadCount: messageThreads.sellerUnreadCount
    })
      .from(messageThreads)
      .where(eq(messageThreads.sellerId, userId));

    // Calculate total unread count
    const buyerUnread = buyerThreads.reduce((sum, thread) => sum + (thread.buyerUnreadCount || 0), 0);
    const sellerUnread = sellerThreads.reduce((sum, thread) => sum + (thread.sellerUnreadCount || 0), 0);
    const totalUnreadCount = buyerUnread + sellerUnread;

    return NextResponse.json({ 
      unreadCount: totalUnreadCount 
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}