import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumComments, forumPosts, user } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
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

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const comments = await db
      .select({
        id: forumComments.id,
        postId: forumComments.postId,
        userId: forumComments.userId,
        content: forumComments.content,
        likesCount: forumComments.likesCount,
        createdAt: forumComments.createdAt,
        updatedAt: forumComments.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(forumComments)
      .innerJoin(user, eq(forumComments.userId, user.id))
      .where(eq(forumComments.postId, parseInt(postId)))
      .orderBy(desc(forumComments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
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

    const requestBody = await request.json();

    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { content } = requestBody;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be non-empty', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    const post = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, parseInt(postId)))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const now = new Date();

    const newComment = await db
      .insert(forumComments)
      .values({
        postId: parseInt(postId),
        userId: session.user.id,
        content: content.trim(),
        likesCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db
      .update(forumPosts)
      .set({
        commentsCount: post[0].commentsCount + 1,
        updatedAt: now,
      })
      .where(eq(forumPosts.id, parseInt(postId)));

    const commentWithAuthor = await db
      .select({
        id: forumComments.id,
        postId: forumComments.postId,
        userId: forumComments.userId,
        content: forumComments.content,
        likesCount: forumComments.likesCount,
        createdAt: forumComments.createdAt,
        updatedAt: forumComments.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(forumComments)
      .innerJoin(user, eq(forumComments.userId, user.id))
      .where(eq(forumComments.id, newComment[0].id))
      .limit(1);

    return NextResponse.json(commentWithAuthor[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
