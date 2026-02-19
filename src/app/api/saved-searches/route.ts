import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedSearches } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(savedSearches)
        .where(and(
          eq(savedSearches.id, parseInt(id)),
          eq(savedSearches.userId, session.user.id)
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Saved search not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db.select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, session.user.id))
      .orderBy(desc(savedSearches.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { name, searchCriteria, emailAlertsEnabled } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Name is required and must be a non-empty string',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!searchCriteria) {
      return NextResponse.json({ 
        error: 'Search criteria is required',
        code: 'MISSING_SEARCH_CRITERIA' 
      }, { status: 400 });
    }

    let parsedCriteria;
    try {
      if (typeof searchCriteria === 'string') {
        parsedCriteria = JSON.parse(searchCriteria);
      } else if (typeof searchCriteria === 'object') {
        parsedCriteria = searchCriteria;
      } else {
        throw new Error('Invalid search criteria format');
      }
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Search criteria must be a valid JSON object',
        code: 'INVALID_SEARCH_CRITERIA' 
      }, { status: 400 });
    }

    const now = new Date();
    const newSearch = await db.insert(savedSearches)
      .values({
        userId: session.user.id,
        name: name.trim(),
        searchCriteria: parsedCriteria,
        emailAlertsEnabled: emailAlertsEnabled !== undefined ? emailAlertsEnabled : true,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newSearch[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { name, searchCriteria } = body;

    if (!name && !searchCriteria) {
      return NextResponse.json({ 
        error: 'At least one field (name or searchCriteria) must be provided',
        code: 'NO_UPDATE_FIELDS' 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(savedSearches)
      .where(and(
        eq(savedSearches.id, parseInt(id)),
        eq(savedSearches.userId, session.user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Saved search not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date()
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ 
          error: 'Name must be a non-empty string',
          code: 'INVALID_NAME' 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (searchCriteria !== undefined) {
      let parsedCriteria;
      try {
        if (typeof searchCriteria === 'string') {
          parsedCriteria = JSON.parse(searchCriteria);
        } else if (typeof searchCriteria === 'object') {
          parsedCriteria = searchCriteria;
        } else {
          throw new Error('Invalid search criteria format');
        }
      } catch (parseError) {
        return NextResponse.json({ 
          error: 'Search criteria must be a valid JSON object',
          code: 'INVALID_SEARCH_CRITERIA' 
        }, { status: 400 });
      }
      updates.searchCriteria = parsedCriteria;
    }

    const updated = await db.update(savedSearches)
      .set(updates)
      .where(and(
        eq(savedSearches.id, parseInt(id)),
        eq(savedSearches.userId, session.user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Saved search not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { emailAlertsEnabled } = body;

    if (emailAlertsEnabled === undefined) {
      return NextResponse.json({ 
        error: 'emailAlertsEnabled field is required',
        code: 'MISSING_EMAIL_ALERTS_ENABLED' 
      }, { status: 400 });
    }

    if (typeof emailAlertsEnabled !== 'boolean') {
      return NextResponse.json({ 
        error: 'emailAlertsEnabled must be a boolean value',
        code: 'INVALID_EMAIL_ALERTS_ENABLED' 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(savedSearches)
      .where(and(
        eq(savedSearches.id, parseInt(id)),
        eq(savedSearches.userId, session.user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Saved search not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const updated = await db.update(savedSearches)
      .set({
        emailAlertsEnabled: emailAlertsEnabled,
        updatedAt: new Date()
      })
      .where(and(
        eq(savedSearches.id, parseInt(id)),
        eq(savedSearches.userId, session.user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Saved search not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(savedSearches)
      .where(and(
        eq(savedSearches.id, parseInt(id)),
        eq(savedSearches.userId, session.user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Saved search not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(savedSearches)
      .where(and(
        eq(savedSearches.id, parseInt(id)),
        eq(savedSearches.userId, session.user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Saved search not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Saved search deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}