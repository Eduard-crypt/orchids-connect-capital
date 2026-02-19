import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { forumCategories } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        },
        { status: 401 }
      );
    }

    // Fetch all forum categories ordered by name
    const categories = await db
      .select()
      .from(forumCategories)
      .orderBy(asc(forumCategories.name));

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}