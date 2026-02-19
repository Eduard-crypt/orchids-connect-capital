import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listings, ndaAgreements, buyerVerifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const listingId = parseInt(id);

    // Fetch the listing
    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const listingData = listing[0];

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    let hasSignedNda = false;
    let hasGatedAccess = false;

    if (session?.user) {
      // Check if user has signed NDA
      const ndaRecord = await db
        .select()
        .from(ndaAgreements)
        .where(
          and(
            eq(ndaAgreements.userId, session.user.id),
            eq(ndaAgreements.listingId, listingId)
          )
        )
        .limit(1);

      hasSignedNda = ndaRecord.length > 0;

      // Check buyer verification status
      const verificationRecord = await db
        .select()
        .from(buyerVerifications)
        .where(eq(buyerVerifications.userId, session.user.id))
        .limit(1);

      const isVerified = verificationRecord.length > 0 && 
        verificationRecord[0].verificationStatus === 'verified';

      hasGatedAccess = hasSignedNda && isVerified;
    }

    // Return appropriate data based on access level
    if (hasGatedAccess) {
      // Return full listing data including gated fields
      return NextResponse.json({
        ...listingData,
        hasSignedNda,
        hasGatedAccess,
      });
    } else {
      // Return public data only (hide businessUrl and brandName)
      const { businessUrl, brandName, ...publicData } = listingData;
      return NextResponse.json({
        ...publicData,
        businessUrl: null,
        brandName: null,
        hasSignedNda,
        hasGatedAccess,
      });
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params?.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const listingId = parseInt(id);

    // Check if listing exists and user is the owner
    const existingListing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (existingListing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingListing[0].sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this listing', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Prevent updating system-managed fields
    const {
      id: _id,
      sellerId: _sellerId,
      status: _status,
      createdAt: _createdAt,
      ...updateData
    } = body;

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    // Recalculate revenueMultiple if relevant fields changed
    let revenueMultiple = existingListing[0].revenueMultiple;
    const askingPrice = updateData.askingPrice ?? existingListing[0].askingPrice;
    const ttmRevenue = updateData.ttmRevenue ?? existingListing[0].ttmRevenue;

    if (
      (updateData.askingPrice !== undefined || updateData.ttmRevenue !== undefined) &&
      askingPrice &&
      ttmRevenue &&
      ttmRevenue > 0
    ) {
      revenueMultiple = Math.round((askingPrice / ttmRevenue) * 100) / 100;
    }

    // Update the listing
    const updated = await db
      .update(listings)
      .set({
        ...updateData,
        revenueMultiple,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update listing', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params?.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const listingId = parseInt(id);

    // Check if listing exists and user is the owner
    const existingListing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (existingListing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingListing[0].sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this listing', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Delete the listing (cascade will handle related records)
    const deleted = await db
      .delete(listings)
      .where(eq(listings.id, listingId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete listing', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Listing deleted successfully',
      deleted: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}