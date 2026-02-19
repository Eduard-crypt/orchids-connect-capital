import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { loiOffers, listings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get LOI ID from request body
    const body = await request.json();
    const { loiId } = body;

    // Validate LOI ID
    if (!loiId || isNaN(parseInt(loiId))) {
      return NextResponse.json(
        { error: 'Valid LOI ID is required', code: 'INVALID_LOI_ID' },
        { status: 400 }
      );
    }

    const loiIdNum = parseInt(loiId);

    // Fetch the LOI offer
    const loiResult = await db
      .select()
      .from(loiOffers)
      .where(eq(loiOffers.id, loiIdNum))
      .limit(1);

    if (loiResult.length === 0) {
      return NextResponse.json(
        { error: 'LOI offer not found', code: 'LOI_NOT_FOUND' },
        { status: 404 }
      );
    }

    const loi = loiResult[0];

    // Verify user is the buyer
    if (loi.buyerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the buyer can send this LOI offer', code: 'NOT_BUYER' },
        { status: 403 }
      );
    }

    // Verify status is 'draft'
    if (loi.status !== 'draft') {
      return NextResponse.json(
        { 
          error: 'LOI can only be sent when status is draft', 
          code: 'INVALID_STATUS',
          currentStatus: loi.status 
        },
        { status: 400 }
      );
    }

    // Validate all required fields are filled
    const requiredFields = [
      { field: 'offerPrice', value: loi.offerPrice, name: 'Offer Price' },
      { field: 'cashAmount', value: loi.cashAmount, name: 'Cash Amount' },
      { field: 'earnoutAmount', value: loi.earnoutAmount, name: 'Earnout Amount' },
      { field: 'dueDiligenceDays', value: loi.dueDiligenceDays, name: 'Due Diligence Days' },
      { field: 'exclusivityDays', value: loi.exclusivityDays, name: 'Exclusivity Days' },
      { field: 'expirationDate', value: loi.expirationDate, name: 'Expiration Date' }
    ];

    const missingFields = requiredFields.filter(({ value }) => {
      return value === null || value === undefined || value === '';
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.name).join(', ');
      return NextResponse.json(
        { 
          error: `Required fields are missing: ${fieldNames}`, 
          code: 'MISSING_REQUIRED_FIELDS',
          missingFields: missingFields.map(f => f.field)
        },
        { status: 400 }
      );
    }

    // Additional validation for numeric fields
    if (loi.offerPrice <= 0) {
      return NextResponse.json(
        { error: 'Offer price must be greater than 0', code: 'INVALID_OFFER_PRICE' },
        { status: 400 }
      );
    }

    if (loi.cashAmount < 0) {
      return NextResponse.json(
        { error: 'Cash amount cannot be negative', code: 'INVALID_CASH_AMOUNT' },
        { status: 400 }
      );
    }

    if (loi.earnoutAmount < 0) {
      return NextResponse.json(
        { error: 'Earnout amount cannot be negative', code: 'INVALID_EARNOUT_AMOUNT' },
        { status: 400 }
      );
    }

    if (loi.dueDiligenceDays <= 0) {
      return NextResponse.json(
        { error: 'Due diligence days must be greater than 0', code: 'INVALID_DUE_DILIGENCE_DAYS' },
        { status: 400 }
      );
    }

    if (loi.exclusivityDays <= 0) {
      return NextResponse.json(
        { error: 'Exclusivity days must be greater than 0', code: 'INVALID_EXCLUSIVITY_DAYS' },
        { status: 400 }
      );
    }

    // Validate expiration date is in the future
    const expirationDate = new Date(loi.expirationDate);
    if (expirationDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiration date must be in the future', code: 'INVALID_EXPIRATION_DATE' },
        { status: 400 }
      );
    }

    // Update LOI status to 'sent'
    const currentTimestamp = new Date();
    const updatedLoi = await db
      .update(loiOffers)
      .set({
        status: 'sent',
        sentAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .where(
        and(
          eq(loiOffers.id, loiIdNum),
          eq(loiOffers.buyerId, user.id)
        )
      )
      .returning();

    if (updatedLoi.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update LOI offer', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Update listing underLoi status to true
    await db
      .update(listings)
      .set({
        underLoi: true,
        updatedAt: currentTimestamp
      })
      .where(eq(listings.id, loi.listingId));

    return NextResponse.json(updatedLoi[0], { status: 200 });

  } catch (error) {
    console.error('POST /api/loi/send error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}