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
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const postId = params.id;

    if (!postId || isNaN(parseInt(postId))) {
      return NextResponse.json(
        { error: 'Valid post ID is required', code: 'INVALID_POST_ID' },
        { status: 400 }
      );
    }

    const existingLike = await db
      .select()
      .from(forumLikes)
      .where(
        and(
          eq(forumLikes.postId, parseInt(postId)),
          eq(forumLikes.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json(
      { liked: existingLike.length > 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET liked status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}