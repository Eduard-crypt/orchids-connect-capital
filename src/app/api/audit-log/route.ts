import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLog } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, ipAddress, userAgent, metadata } = body;

    // Validation: action is required
    if (!action || typeof action !== 'string' || action.trim() === '') {
      return NextResponse.json({ 
        error: 'Action is required',
        code: 'MISSING_ACTION' 
      }, { status: 400 });
    }

    // Extract IP address from headers if not provided
    const finalIpAddress = ipAddress || 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
      request.headers.get('x-real-ip') || 
      null;

    // Extract user agent from headers if not provided
    const finalUserAgent = userAgent || 
      request.headers.get('user-agent') || 
      null;

    // Prepare metadata - convert to JSON string if provided
    let finalMetadata = null;
    if (metadata !== undefined && metadata !== null) {
      try {
        finalMetadata = typeof metadata === 'string' 
          ? metadata 
          : JSON.stringify(metadata);
      } catch (error) {
        return NextResponse.json({ 
          error: 'Invalid metadata format',
          code: 'INVALID_METADATA' 
        }, { status: 400 });
      }
    }

    // Create audit log entry
    const newLog = await db.insert(auditLog)
      .values({
        userId: userId || null,
        action: action.trim(),
        ipAddress: finalIpAddress,
        userAgent: finalUserAgent,
        metadata: finalMetadata,
        createdAt: new Date()
      })
      .returning();

    return NextResponse.json(newLog[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication required
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    let limit = 50; // default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json({ 
          error: 'Invalid limit parameter',
          code: 'INVALID_LIMIT' 
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 100); // max 100
    }

    // Parse and validate offset parameter
    const offsetParam = searchParams.get('offset');
    let offset = 0; // default
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json({ 
          error: 'Invalid offset parameter',
          code: 'INVALID_OFFSET' 
        }, { status: 400 });
      }
      offset = parsedOffset;
    }

    // Get optional action filter
    const actionFilter = searchParams.get('action');

    // Build query - filter by authenticated user's ID
    let query = db.select()
      .from(auditLog)
      .where(eq(auditLog.userId, session.user.id));

    // Add action filter if provided
    if (actionFilter && actionFilter.trim() !== '') {
      query = db.select()
        .from(auditLog)
        .where(
          and(
            eq(auditLog.userId, session.user.id),
            eq(auditLog.action, actionFilter.trim())
          )
        );
    }

    // Execute query with ordering, limit, and offset
    const results = await query
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}