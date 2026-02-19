import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const user = session.user;
    const { id } = params;

    // Validate document ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid document ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const documentId = parseInt(id);

    // Check if document exists and belongs to authenticated user
    const existingDocument = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
      .limit(1);

    if (existingDocument.length === 0) {
      return NextResponse.json(
        { error: 'Document not found', code: 'DOCUMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update document with e-signature status
    const currentTimestamp = new Date();
    const updatedDocument = await db
      .update(documents)
      .set({
        esignatureStatus: 'pending',
        esignatureSentAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
      .where(and(eq(documents.id, documentId), eq(documents.userId, user.id)))
      .returning();

    if (updatedDocument.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update document', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedDocument[0], { status: 200 });
  } catch (error) {
    console.error('PATCH /api/documents/[id]/send-esignature error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}