import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const user = session.user;

    // Parse and validate request body
    const body = await request.json();
    const { escrowId } = body;

    // Validate escrowId
    if (!escrowId) {
      return NextResponse.json({ 
        error: 'Escrow ID is required',
        code: 'MISSING_ESCROW_ID' 
      }, { status: 400 });
    }

    const parsedEscrowId = parseInt(escrowId);
    if (isNaN(parsedEscrowId)) {
      return NextResponse.json({ 
        error: 'Valid escrow ID is required',
        code: 'INVALID_ESCROW_ID' 
      }, { status: 400 });
    }

    // Fetch escrow transaction
    const escrowRecords = await db.select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, parsedEscrowId))
      .limit(1);

    if (escrowRecords.length === 0) {
      return NextResponse.json({ 
        error: 'Escrow transaction not found',
        code: 'ESCROW_NOT_FOUND' 
      }, { status: 404 });
    }

    const escrow = escrowRecords[0];

    // Authorization check - user must be buyer OR seller
    if (escrow.buyerId !== user.id && escrow.sellerId !== user.id) {
      return NextResponse.json({ 
        error: 'You are not authorized to generate an invoice for this transaction',
        code: 'UNAUTHORIZED_ACCESS' 
      }, { status: 403 });
    }

    // Calculate platformFeeAmount if null (assuming platformFeePercent of 2.5%)
    const platformFeePercent = 2.5;
    let platformFeeAmount = escrow.platformFeeAmount;
    
    if (platformFeeAmount === null || platformFeeAmount === undefined) {
      platformFeeAmount = Math.round(escrow.escrowAmount * (platformFeePercent / 100));
    }

    // Calculate buyerTotalAmount and sellerNetAmount
    const buyerTotalAmount = escrow.escrowAmount + platformFeeAmount;
    const sellerNetAmount = escrow.escrowAmount;

    // Generate invoice URL with timestamp
    const timestamp = Date.now();
    const invoiceUrl = `https://invoices.optifirm.com/fee-invoice-${parsedEscrowId}-${timestamp}.pdf`;

    // Prepare update data
    const updateData: any = {
      feeInvoiceUrl: invoiceUrl,
      updatedAt: new Date()
    };

    // Only update if they were null
    if (escrow.platformFeeAmount === null || escrow.platformFeeAmount === undefined) {
      updateData.platformFeeAmount = platformFeeAmount;
    }
    if (escrow.buyerTotalAmount === null || escrow.buyerTotalAmount === undefined) {
      updateData.buyerTotalAmount = buyerTotalAmount;
    }
    if (escrow.sellerNetAmount === null || escrow.sellerNetAmount === undefined) {
      updateData.sellerNetAmount = sellerNetAmount;
    }

    // Update escrow transaction
    const updatedEscrow = await db.update(escrowTransactions)
      .set(updateData)
      .where(eq(escrowTransactions.id, parsedEscrowId))
      .returning();

    if (updatedEscrow.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update escrow transaction',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      invoiceUrl,
      escrowId: parsedEscrowId,
      platformFeeAmount,
      generatedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}