import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listingDocuments, listings, ndaAgreements } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params?.id;

    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const parsedListingId = parseInt(listingId);

    // Check if listing exists
    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, parsedListingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get session to check authentication
    const session = await auth.api.getSession({ headers: request.headers });

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let hasNdaSigned = false;

    // If user is authenticated, check if they have signed NDA
    if (session?.user) {
      const ndaCheck = await db
        .select()
        .from(ndaAgreements)
        .where(
          and(
            eq(ndaAgreements.userId, session.user.id),
            eq(ndaAgreements.listingId, parsedListingId)
          )
        )
        .limit(1);

      hasNdaSigned = ndaCheck.length > 0;
    }

    // Build query based on authentication and NDA status
    let query = db
      .select()
      .from(listingDocuments)
      .where(eq(listingDocuments.listingId, parsedListingId));

    // If user is not authenticated OR authenticated but no NDA signed
    // Only return public documents
    if (!session?.user || !hasNdaSigned) {
      query = query.where(
        and(
          eq(listingDocuments.listingId, parsedListingId),
          eq(listingDocuments.isPublic, true)
        )
      );
    }

    const documents = await query
      .orderBy(desc(listingDocuments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const listingId = params?.id;

    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json(
        { error: 'Valid listing ID is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    const parsedListingId = parseInt(listingId);

    // Check if listing exists and verify user is the owner
    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, parsedListingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify user is the listing owner
    if (listing[0].sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the listing owner can upload documents', code: 'NOT_LISTING_OWNER' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Security check: reject if uploadedBy provided in body
    if ('uploadedBy' in body) {
      return NextResponse.json(
        {
          error: 'uploadedBy cannot be provided in request body',
          code: 'UPLOADED_BY_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { documentName, documentUrl, documentType, fileSize, isPublic } = body;

    // Validate required fields
    if (!documentName || !documentName.trim()) {
      return NextResponse.json(
        { error: 'Document name is required', code: 'MISSING_DOCUMENT_NAME' },
        { status: 400 }
      );
    }

    if (!documentUrl || !documentUrl.trim()) {
      return NextResponse.json(
        { error: 'Document URL is required', code: 'MISSING_DOCUMENT_URL' },
        { status: 400 }
      );
    }

    if (!documentType || !documentType.trim()) {
      return NextResponse.json(
        { error: 'Document type is required', code: 'MISSING_DOCUMENT_TYPE' },
        { status: 400 }
      );
    }

    // Validate documentType is one of allowed values
    const allowedTypes = ['financial', 'legal', 'operational', 'other'];
    if (!allowedTypes.includes(documentType)) {
      return NextResponse.json(
        {
          error: `Document type must be one of: ${allowedTypes.join(', ')}`,
          code: 'INVALID_DOCUMENT_TYPE',
        },
        { status: 400 }
      );
    }

    if (fileSize === undefined || fileSize === null) {
      return NextResponse.json(
        { error: 'File size is required', code: 'MISSING_FILE_SIZE' },
        { status: 400 }
      );
    }

    // Validate fileSize is positive integer
    if (!Number.isInteger(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { error: 'File size must be a positive integer', code: 'INVALID_FILE_SIZE' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      listingId: parsedListingId,
      documentName: documentName.trim(),
      documentUrl: documentUrl.trim(),
      documentType: documentType.trim(),
      fileSize: fileSize,
      uploadedBy: session.user.id,
      isPublic: typeof isPublic === 'boolean' ? isPublic : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newDocument = await db
      .insert(listingDocuments)
      .values(insertData)
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}