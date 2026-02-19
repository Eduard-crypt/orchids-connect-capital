import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumPosts, user } from '@/db/schema';
import { eq, desc, and, or, like } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate limit
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20;
    if (limitParam && (isNaN(limit) || limit < 1)) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter. Must be a positive integer',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    // Parse and validate offset
    const offsetParam = searchParams.get('offset');
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    if (offsetParam && (isNaN(offset) || offset < 0)) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter. Must be a non-negative integer',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    // Parse and validate category_id
    const categoryIdParam = searchParams.get('category_id');
    let categoryId: number | null = null;
    if (categoryIdParam) {
      categoryId = parseInt(categoryIdParam);
      if (isNaN(categoryId)) {
        return NextResponse.json({ 
          error: 'Invalid category_id parameter. Must be an integer',
          code: 'INVALID_CATEGORY_ID' 
        }, { status: 400 });
      }
    }

    // Parse user_id filter
    const userIdFilter = searchParams.get('user_id');

    // Parse and validate sort parameter
    const sortParam = searchParams.get('sort') || 'newest';
    if (sortParam !== 'newest' && sortParam !== 'popular') {
      return NextResponse.json({ 
        error: 'Invalid sort parameter. Must be "newest" or "popular"',
        code: 'INVALID_SORT' 
      }, { status: 400 });
    }

    // Build query with joins
    let query = db.select({
      id: forumPosts.id,
      userId: forumPosts.userId,
      title: forumPosts.title,
      content: forumPosts.content,
      categoryId: forumPosts.categoryId,
      likesCount: forumPosts.likesCount,
      commentsCount: forumPosts.commentsCount,
      createdAt: forumPosts.createdAt,
      updatedAt: forumPosts.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    })
    .from(forumPosts)
    .innerJoin(user, eq(forumPosts.userId, user.id));

    // Apply filters
    const conditions = [];
    if (categoryId !== null) {
      conditions.push(eq(forumPosts.categoryId, categoryId));
    }
    if (userIdFilter) {
      conditions.push(eq(forumPosts.userId, userIdFilter));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    // Apply sorting
    if (sortParam === 'popular') {
      query = query.orderBy(desc(forumPosts.likesCount), desc(forumPosts.createdAt));
    } else {
      query = query.orderBy(desc(forumPosts.createdAt));
    }

    // Apply pagination
    const posts = await query.limit(limit).offset(offset);

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { title, content, category_id } = requestBody;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required and must be a non-empty string",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ 
        error: "Content is required and must be a non-empty string",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    // Validate category_id if provided
    let categoryId: number | null = null;
    if (category_id !== undefined && category_id !== null) {
      categoryId = parseInt(category_id);
      if (isNaN(categoryId)) {
        return NextResponse.json({ 
          error: "Category ID must be a valid integer",
          code: "INVALID_CATEGORY_ID" 
        }, { status: 400 });
      }
    }

    // Prepare insert data with sanitized inputs
    // Use Date object for timestamps (Drizzle will convert to integer)
    const now = new Date();
    const insertData = {
      userId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId,
      likesCount: 0,
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    console.log('Creating forum post:', { userId: session.user.id, title: title.trim() });

    // Insert post
    const newPost = await db.insert(forumPosts)
      .values(insertData)
      .returning();

    if (newPost.length === 0) {
      console.error('Failed to create post: No rows returned');
      return NextResponse.json({ 
        error: 'Failed to create post',
        code: 'CREATE_FAILED' 
      }, { status: 500 });
    }

    console.log('Post created successfully:', newPost[0].id);
    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get('id');

    // Validate ID parameter
    if (!idParam) {
      return NextResponse.json({ 
        error: "ID parameter is required",
        code: "MISSING_ID" 
      }, { status: 400 });
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if post exists and belongs to user
    const existingPost = await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    // Authorization check: only post author can update
    if (existingPost[0].userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'You are not authorized to update this post',
        code: 'NOT_AUTHORIZED' 
      }, { status: 403 });
    }

    const { title, content, category_id } = requestBody;

    // Prepare update data - use Date object for timestamp
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Validate and add title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ 
          error: "Title must be a non-empty string",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    // Validate and add content if provided
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim() === '') {
        return NextResponse.json({ 
          error: "Content must be a non-empty string",
          code: "INVALID_CONTENT" 
        }, { status: 400 });
      }
      updateData.content = content.trim();
    }

    // Validate and add category_id if provided
    if (category_id !== undefined) {
      if (category_id === null) {
        updateData.categoryId = null;
      } else {
        const categoryId = parseInt(category_id);
        if (isNaN(categoryId)) {
          return NextResponse.json({ 
            error: "Category ID must be a valid integer",
            code: "INVALID_CATEGORY_ID" 
          }, { status: 400 });
        }
        updateData.categoryId = categoryId;
      }
    }

    // Update post
    const updated = await db.update(forumPosts)
      .set(updateData)
      .where(eq(forumPosts.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update post',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get('id');

    // Validate ID parameter
    if (!idParam) {
      return NextResponse.json({ 
        error: "ID parameter is required",
        code: "MISSING_ID" 
      }, { status: 400 });
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if post exists and belongs to user
    const existingPost = await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ 
        error: 'Post not found',
        code: 'POST_NOT_FOUND' 
      }, { status: 404 });
    }

    // Authorization check: only post author can delete
    if (existingPost[0].userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this post',
        code: 'NOT_AUTHORIZED' 
      }, { status: 403 });
    }

    // Delete post
    const deleted = await db.delete(forumPosts)
      .where(eq(forumPosts.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete post',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Post deleted successfully',
      deletedPost: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}