import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    if (id) {
      const documentId = parseInt(id);
      if (isNaN(documentId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const document = await db.select()
        .from(documents)
        .where(and(
          eq(documents.id, documentId),
          eq(documents.userId, session.user.id)
        ))
        .limit(1);

      if (document.length === 0) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      return NextResponse.json(document[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build query with optional category filter
    let query = db.select()
      .from(documents)
      .where(eq(documents.userId, session.user.id));

    if (category) {
      const validCategories = ['finances', 'traffic', 'contracts', 'other'];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ 
          error: 'Invalid category. Must be one of: finances, traffic, contracts, other',
          code: 'INVALID_CATEGORY' 
        }, { status: 400 });
      }
      
      query = db.select()
        .from(documents)
        .where(and(
          eq(documents.userId, session.user.id),
          eq(documents.category, category)
        ));
    }

    const results = await query
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, fileUrl, fileType, fileSize, category, esignatureStatus } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Name is required and must be a non-empty string',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.trim() === '') {
      return NextResponse.json({ 
        error: 'File URL is required and must be a non-empty string',
        code: 'MISSING_FILE_URL' 
      }, { status: 400 });
    }

    if (!fileType || typeof fileType !== 'string' || fileType.trim() === '') {
      return NextResponse.json({ 
        error: 'File type is required and must be a non-empty string',
        code: 'MISSING_FILE_TYPE' 
      }, { status: 400 });
    }

    if (!fileSize || typeof fileSize !== 'number' || fileSize <= 0) {
      return NextResponse.json({ 
        error: 'File size is required and must be a positive number',
        code: 'MISSING_FILE_SIZE' 
      }, { status: 400 });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['finances', 'traffic', 'contracts', 'other'];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ 
          error: 'Category must be one of: finances, traffic, contracts, other',
          code: 'INVALID_CATEGORY' 
        }, { status: 400 });
      }
    }

    // Validate esignatureStatus if provided
    if (esignatureStatus) {
      const validStatuses = ['none', 'pending', 'signed'];
      if (!validStatuses.includes(esignatureStatus)) {
        return NextResponse.json({ 
          error: 'E-signature status must be one of: none, pending, signed',
          code: 'INVALID_ESIGNATURE_STATUS' 
        }, { status: 400 });
      }
    }

    const now = new Date();
    const newDocument = await db.insert(documents)
      .values({
        userId: session.user.id,
        name: name.trim(),
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        fileSize: fileSize,
        category: category || 'other',
        esignatureStatus: esignatureStatus || 'none',
        esignatureSentAt: null,
        esignatureSignedAt: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const documentId = parseInt(id);

    const existingDocument = await db.select()
      .from(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id)
      ))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const deleted = await db.delete(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id)
      ))
      .returning();

    return NextResponse.json({ 
      message: 'Document deleted successfully',
      document: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}