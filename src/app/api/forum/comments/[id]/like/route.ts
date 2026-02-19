import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumLikes, forumComments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const commentId = params.id;

    // Validate comment ID
    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json(
        { error: 'Valid comment ID is required', code: 'INVALID_COMMENT_ID' },
        { status: 400 }
      );
    }

    const commentIdInt = parseInt(commentId);

    // Check if comment exists
    const comment = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, commentIdInt))
      .limit(1);

    if (comment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user has already liked this comment
    const existingLike = await db
      .select()
      .from(forumLikes)
      .where(
        and(
          eq(forumLikes.commentId, commentIdInt),
          eq(forumLikes.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike: Remove the like
      await db
        .delete(forumLikes)
        .where(
          and(
            eq(forumLikes.commentId, commentIdInt),
            eq(forumLikes.userId, session.user.id)
          )
        );

      // Decrement likes count
      const updatedComment = await db
        .update(forumComments)
        .set({
          likesCount: Math.max(0, comment[0].likesCount - 1),
          updatedAt: new Date()
        })
        .where(eq(forumComments.id, commentIdInt))
        .returning();

      return NextResponse.json(
        {
          liked: false,
          likesCount: updatedComment[0].likesCount
        },
        { status: 200 }
      );
    } else {
      // Like: Create new like
      await db.insert(forumLikes).values({
        commentId: commentIdInt,
        userId: session.user.id,
        createdAt: new Date()
      });

      // Increment likes count
      const updatedComment = await db
        .update(forumComments)
        .set({
          likesCount: comment[0].likesCount + 1,
          updatedAt: new Date()
        })
        .where(eq(forumComments.id, commentIdInt))
        .returning();

      return NextResponse.json(
        {
          liked: true,
          likesCount: updatedComment[0].likesCount
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('POST /api/forum/comments/[id]/like error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}