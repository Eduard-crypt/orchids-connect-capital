import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { documentType, fileName, fileUrl, fileSize } = body;

    if (!documentType) {
      return NextResponse.json(
        {
          error: 'documentType is required',
          code: 'MISSING_DOCUMENT_TYPE',
        },
        { status: 400 }
      );
    }

    if (documentType !== 'id_document' && documentType !== 'proof_of_funds') {
      return NextResponse.json(
        {
          error: 'documentType must be either "id_document" or "proof_of_funds"',
          code: 'INVALID_DOCUMENT_TYPE',
        },
        { status: 400 }
      );
    }

    if (!fileName || typeof fileName !== 'string' || fileName.trim() === '') {
      return NextResponse.json(
        {
          error: 'fileName is required and must be a non-empty string',
          code: 'INVALID_FILE_NAME',
        },
        { status: 400 }
      );
    }

    if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.trim() === '') {
      return NextResponse.json(
        {
          error: 'fileUrl is required and must be a non-empty string',
          code: 'INVALID_FILE_URL',
        },
        { status: 400 }
      );
    }

    if (!fileSize || typeof fileSize !== 'number' || fileSize <= 0) {
      return NextResponse.json(
        {
          error: 'fileSize is required and must be a positive integer',
          code: 'INVALID_FILE_SIZE',
        },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Insert using raw SQL since table doesn't exist in schema
    await db.run(sql`
      INSERT INTO buyer_verification (user_id, status, 
        ${documentType === 'id_document' ? sql.raw('id_document_url') : sql.raw('proof_of_funds_url')}, 
        created_at, updated_at)
      VALUES (${session.user.id}, 'pending', ${fileUrl.trim()}, ${now}, ${now})
      ON CONFLICT(user_id) DO UPDATE SET 
        ${documentType === 'id_document' ? sql.raw('id_document_url = excluded.id_document_url') : sql.raw('proof_of_funds_url = excluded.proof_of_funds_url')},
        updated_at = excluded.updated_at
    `);

    const result = await db.all(sql`
      SELECT * FROM buyer_verification WHERE user_id = ${session.user.id} LIMIT 1
    `);

    return NextResponse.json({
      id: result[0].id,
      userId: result[0].user_id,
      documentType,
      fileName: fileName.trim(),
      fileUrl: fileUrl.trim(),
      fileSize: Math.floor(fileSize),
      uploadedAt: now,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const documents = await db.all(sql`
      SELECT * FROM buyer_verification 
      WHERE user_id = ${session.user.id}
      LIMIT ${limit} OFFSET ${offset}
    `);

    return NextResponse.json(documents);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}