import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionAmount } = body;

    // Validate transactionAmount is present
    if (transactionAmount === undefined || transactionAmount === null) {
      return NextResponse.json({
        error: "Transaction amount is required",
        code: "MISSING_TRANSACTION_AMOUNT"
      }, { status: 400 });
    }

    // Validate transactionAmount is a positive integer
    if (!Number.isInteger(transactionAmount) || transactionAmount <= 0) {
      return NextResponse.json({
        error: "Transaction amount must be a positive integer (amount in cents)",
        code: "INVALID_TRANSACTION_AMOUNT"
      }, { status: 400 });
    }

    // Calculate platform fees
    const platformFeePercent = 5;
    const platformFeeAmount = Math.round(transactionAmount * (platformFeePercent / 100));
    const buyerTotalAmount = transactionAmount + platformFeeAmount;
    const sellerNetAmount = transactionAmount;

    // Format currency helper function
    const formatCurrency = (cents: number): string => {
      return `$${(cents / 100).toFixed(2)}`;
    };

    // Build response
    const response = {
      transactionAmount,
      platformFeePercent,
      platformFeeAmount,
      buyerTotalAmount,
      sellerNetAmount,
      breakdown: {
        buyerPays: formatCurrency(buyerTotalAmount),
        sellerReceives: formatCurrency(sellerNetAmount),
        platformFee: formatCurrency(platformFeeAmount)
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}