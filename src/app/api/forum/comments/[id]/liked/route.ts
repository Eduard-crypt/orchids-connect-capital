import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumLikes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const commentId = params.id;

    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json(
        { error: 'Valid comment ID is required', code: 'INVALID_COMMENT_ID' },
        { status: 400 }
      );
    }

    const existingLike = await db
      .select()
      .from(forumLikes)
      .where(
        and(
          eq(forumLikes.commentId, parseInt(commentId)),
          eq(forumLikes.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json(
      { liked: existingLike.length > 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}