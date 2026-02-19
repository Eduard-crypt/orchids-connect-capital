import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumComments, forumPosts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid comment ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const commentId = parseInt(id);

    const existingComment = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingComment[0].userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'You are not authorized to update this comment',
          code: 'NOT_AUTHORIZED' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'Content must be a non-empty string',
            code: 'INVALID_CONTENT' 
          },
          { status: 400 }
        );
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (content !== undefined) {
      updates.content = content.trim();
    }

    const updatedComment = await db
      .update(forumComments)
      .set(updates)
      .where(
        and(
          eq(forumComments.id, commentId),
          eq(forumComments.userId, session.user.id)
        )
      )
      .returning();

    if (updatedComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedComment[0], { status: 200 });

  } catch (error: any) {
    console.error('PUT /api/forum/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid comment ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const commentId = parseInt(id);

    const existingComment = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingComment[0].userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'You are not authorized to delete this comment',
          code: 'NOT_AUTHORIZED' 
        },
        { status: 403 }
      );
    }

    const postId = existingComment[0].postId;

    const deletedComment = await db
      .delete(forumComments)
      .where(
        and(
          eq(forumComments.id, commentId),
          eq(forumComments.userId, session.user.id)
        )
      )
      .returning();

    if (deletedComment.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found', code: 'COMMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db
      .update(forumPosts)
      .set({
        commentsCount: Math.max(0, (existingComment[0].postId ? await db
          .select()
          .from(forumPosts)
          .where(eq(forumPosts.id, postId))
          .limit(1)
          .then(posts => posts[0]?.commentsCount || 0) : 0) - 1),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(forumPosts.id, postId));

    return NextResponse.json(
      {
        message: 'Comment deleted successfully',
        comment: deletedComment[0],
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('DELETE /api/forum/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}