import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumPosts, user, forumCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid post ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    const postResult = await db
      .select({
        id: forumPosts.id,
        userId: forumPosts.userId,
        title: forumPosts.title,
        content: forumPosts.content,
        categoryId: forumPosts.categoryId,
        likesCount: forumPosts.likesCount,
        commentsCount: forumPosts.commentsCount,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        authorId: user.id,
        authorName: user.name,
        authorEmail: user.email,
        authorImage: user.image,
        categoryIdRef: forumCategories.id,
        categoryName: forumCategories.name,
        categoryDescription: forumCategories.description,
      })
      .from(forumPosts)
      .leftJoin(user, eq(forumPosts.userId, user.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .where(eq(forumPosts.id, postId))
      .limit(1);

    if (postResult.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const post = postResult[0];

    const response = {
      id: post.id,
      userId: post.userId,
      title: post.title,
      content: post.content,
      categoryId: post.categoryId,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.authorId,
        name: post.authorName,
        email: post.authorEmail,
        image: post.authorImage,
      },
      category: post.categoryIdRef
        ? {
            id: post.categoryIdRef,
            name: post.categoryName,
            description: post.categoryDescription,
          }
        : null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET post error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}