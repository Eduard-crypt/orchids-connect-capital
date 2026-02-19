import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumHandshakes, forumPosts } from '@/db/schema';
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

    // Check if user has already handshaked this post
    const existingHandshake = await db.select()
      .from(forumHandshakes)
      .where(
        and(
          eq(forumHandshakes.postId, postIdInt),
          eq(forumHandshakes.userId, session.user.id)
        )
      )
      .limit(1);

    let handshaked: boolean;
    let updatedPost;

    if (existingHandshake.length > 0) {
      // Remove handshake
      await db.delete(forumHandshakes)
        .where(
          and(
            eq(forumHandshakes.postId, postIdInt),
            eq(forumHandshakes.userId, session.user.id)
          )
        );

      // Decrement handshakes count
      updatedPost = await db.update(forumPosts)
        .set({
          handshakesCount: Math.max(0, (post[0].handshakesCount || 0) - 1),
          updatedAt: new Date()
        })
        .where(eq(forumPosts.id, postIdInt))
        .returning();

      handshaked = false;
    } else {
      // Add new handshake
      await db.insert(forumHandshakes)
        .values({
          postId: postIdInt,
          userId: session.user.id,
          createdAt: new Date()
        });

      // Increment handshakes count
      updatedPost = await db.update(forumPosts)
        .set({
          handshakesCount: (post[0].handshakesCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(forumPosts.id, postIdInt))
        .returning();

      handshaked = true;
    }

    return NextResponse.json(
      {
        handshaked,
        handshakesCount: updatedPost[0].handshakesCount || 0
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/forum/posts/[id]/handshake error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
