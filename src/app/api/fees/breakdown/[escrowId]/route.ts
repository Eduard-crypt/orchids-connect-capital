import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ escrowId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { escrowId } = await params;

    if (!escrowId || isNaN(parseInt(escrowId))) {
      return NextResponse.json(
        { error: 'Valid escrow ID is required', code: 'INVALID_ESCROW_ID' },
        { status: 400 }
      );
    }

    const escrowIdInt = parseInt(escrowId);

    const escrow = await db
      .select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, escrowIdInt))
      .limit(1);

    if (escrow.length === 0) {
      return NextResponse.json(
        { error: 'Escrow transaction not found', code: 'ESCROW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const escrowRecord = escrow[0];

    if (escrowRecord.buyerId !== session.user.id && escrowRecord.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to access this escrow transaction', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    let platformFeeAmount: number;
    let buyerTotalAmount: number;
    let sellerNetAmount: number;
    const platformFeePercent = 2.5;

    if (escrowRecord.platformFeeAmount === null) {
      platformFeeAmount = Math.round(escrowRecord.escrowAmount * (platformFeePercent / 100));
      buyerTotalAmount = escrowRecord.escrowAmount + platformFeeAmount;
      sellerNetAmount = escrowRecord.escrowAmount;
    } else {
      platformFeeAmount = escrowRecord.platformFeeAmount;
      buyerTotalAmount = escrowRecord.buyerTotalAmount ?? escrowRecord.escrowAmount + platformFeeAmount;
      sellerNetAmount = escrowRecord.sellerNetAmount ?? escrowRecord.escrowAmount;
    }

    const response = {
      escrowId: escrowRecord.id,
      escrowAmount: escrowRecord.escrowAmount,
      platformFeePercent,
      platformFeeAmount,
      buyerTotalAmount,
      sellerNetAmount,
      feeInvoiceUrl: escrowRecord.feeInvoiceUrl,
      feeTransferredAt: escrowRecord.feeTransferredAt,
      platformAccountId: escrowRecord.platformAccountId,
      formatted: {
        escrowAmount: formatCurrency(escrowRecord.escrowAmount),
        platformFee: formatCurrency(platformFeeAmount),
        buyerTotal: formatCurrency(buyerTotalAmount),
        sellerNet: formatCurrency(sellerNetAmount),
      },
      status: {
        calculated: escrowRecord.platformFeeAmount !== null,
        invoiceGenerated: escrowRecord.feeInvoiceUrl !== null,
        transferred: escrowRecord.feeTransferredAt !== null,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET fee breakdown error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}