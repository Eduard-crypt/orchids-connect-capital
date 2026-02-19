import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumHandshakes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ handshaked: false }, { status: 200 });
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

    // Check if user has handshaked this post
    const handshake = await db.select()
      .from(forumHandshakes)
      .where(
        and(
          eq(forumHandshakes.postId, postIdInt),
          eq(forumHandshakes.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json(
      { handshaked: handshake.length > 0 },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/forum/posts/[id]/handshaked error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
