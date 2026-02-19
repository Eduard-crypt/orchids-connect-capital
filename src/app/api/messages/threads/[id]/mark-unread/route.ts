import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageThreads } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const threadId = params.id;

    // Validate thread ID is valid integer
    if (!threadId || isNaN(parseInt(threadId))) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_THREAD_ID' },
        { status: 400 }
      );
    }

    const parsedThreadId = parseInt(threadId);

    // Fetch thread to verify it exists
    const thread = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.id, parsedThreadId))
      .limit(1);

    if (thread.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'THREAD_NOT_FOUND' },
        { status: 404 }
      );
    }

    const existingThread = thread[0];

    // Verify user has access (user must be either buyer OR seller)
    const isBuyer = session.user.id === existingThread.buyerId;
    const isSeller = session.user.id === existingThread.sellerId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        {
          error: 'User is not a participant in this thread',
          code: 'ACCESS_DENIED',
        },
        { status: 403 }
      );
    }

    // Determine user role and prepare update data
    const updateData: {
      buyerUnreadCount?: number;
      sellerUnreadCount?: number;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (isBuyer) {
      updateData.buyerUnreadCount = existingThread.buyerUnreadCount + 1;
    } else if (isSeller) {
      updateData.sellerUnreadCount = existingThread.sellerUnreadCount + 1;
    }

    // Update thread with incremented unread count
    const updatedThread = await db
      .update(messageThreads)
      .set(updateData)
      .where(eq(messageThreads.id, parsedThreadId))
      .returning();

    if (updatedThread.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update thread', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedThread[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}