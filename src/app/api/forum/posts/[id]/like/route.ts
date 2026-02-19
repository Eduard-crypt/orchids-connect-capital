import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumLikes, forumPosts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Validate post ID
    if (!postId || isNaN(parseInt(postId))) {
      return NextResponse.json(
        { 
          error: 'Valid post ID is required',
          code: 'INVALID_POST_ID'
        },
        { status: 400 }
      );
    }

    const postIdInt = parseInt(postId);

    // Check if post exists
    const post = await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.id, postIdInt))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { 
          error: 'Post not found',
          code: 'POST_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if user has already liked this post
    const existingLike = await db.select()
      .from(forumLikes)
      .where(
        and(
          eq(forumLikes.postId, postIdInt),
          eq(forumLikes.userId, session.user.id)
        )
      )
      .limit(1);

    let liked: boolean;
    let updatedPost;

    if (existingLike.length > 0) {
      // Unlike: Remove the like
      await db.delete(forumLikes)
        .where(
          and(
            eq(forumLikes.postId, postIdInt),
            eq(forumLikes.userId, session.user.id)
          )
        );

      // Decrement likes count
      updatedPost = await db.update(forumPosts)
        .set({
          likesCount: Math.max(0, post[0].likesCount - 1),
          updatedAt: new Date()
        })
        .where(eq(forumPosts.id, postIdInt))
        .returning();

      liked = false;
    } else {
      // Like: Add new like
      await db.insert(forumLikes)
        .values({
          postId: postIdInt,
          userId: session.user.id,
          commentId: null,
          createdAt: new Date()
        });

      // Increment likes count
      updatedPost = await db.update(forumPosts)
        .set({
          likesCount: post[0].likesCount + 1,
          updatedAt: new Date()
        })
        .where(eq(forumPosts.id, postIdInt))
        .returning();

      liked = true;
    }

    return NextResponse.json(
      {
        liked,
        likesCount: updatedPost[0].likesCount
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/forum/posts/[id]/like error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}