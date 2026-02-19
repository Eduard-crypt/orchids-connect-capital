import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const WINDOW_SIZE_MS = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 60;
const CLEANUP_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, identifier } = body;

    // Validate required fields
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { 
          error: 'Endpoint is required and must be a string',
          code: 'MISSING_ENDPOINT' 
        },
        { status: 400 }
      );
    }

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { 
          error: 'Identifier is required and must be a string',
          code: 'MISSING_IDENTIFIER' 
        },
        { status: 400 }
      );
    }

    const now = Date.now();
    const currentWindowStart = Math.floor(now / WINDOW_SIZE_MS) * WINDOW_SIZE_MS;
    const cleanupThreshold = now - CLEANUP_THRESHOLD_MS;

    // Clean up old records using raw SQL
    await db.run(sql`DELETE FROM rate_limit WHERE created_at < ${cleanupThreshold}`);

    // Check existing log with raw SQL
    const existingLogs = await db.all(sql`
      SELECT * FROM rate_limit 
      WHERE identifier = ${identifier} 
      AND action = ${endpoint}
      AND window_start >= ${currentWindowStart}
      LIMIT 1
    `);

    if (existingLogs.length > 0) {
      const existingLog = existingLogs[0];

      // Check if request count is below limit
      if (existingLog.count < MAX_REQUESTS_PER_WINDOW) {
        // Increment request count
        await db.run(sql`
          UPDATE rate_limit 
          SET count = count + 1 
          WHERE id = ${existingLog.id}
        `);

        const remaining = MAX_REQUESTS_PER_WINDOW - (existingLog.count + 1);
        const resetAt = new Date(currentWindowStart + WINDOW_SIZE_MS);

        return NextResponse.json({
          allowed: true,
          remaining,
          resetAt: resetAt.toISOString()
        });
      } else {
        // Request count exceeded limit
        const resetAt = new Date(currentWindowStart + WINDOW_SIZE_MS);

        return NextResponse.json({
          allowed: false,
          remaining: 0,
          resetAt: resetAt.toISOString()
        });
      }
    } else {
      // No existing log entry, create a new one
      await db.run(sql`
        INSERT INTO rate_limit (identifier, action, count, window_start, created_at)
        VALUES (${identifier}, ${endpoint}, 1, ${currentWindowStart}, ${now})
      `);

      const remaining = MAX_REQUESTS_PER_WINDOW - 1;
      const resetAt = new Date(currentWindowStart + WINDOW_SIZE_MS);

      return NextResponse.json({
        allowed: true,
        remaining,
        resetAt: resetAt.toISOString()
      });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}