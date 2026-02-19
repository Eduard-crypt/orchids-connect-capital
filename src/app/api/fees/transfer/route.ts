import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const user = session.user;

    // Admin authorization check
    const isAdmin = user.email?.endsWith('@admin.com') || user.email === 'admin@example.com';
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { escrowId } = body;

    // Validate escrowId
    if (!escrowId) {
      return NextResponse.json({ 
        error: 'Escrow ID is required',
        code: 'MISSING_ESCROW_ID' 
      }, { status: 400 });
    }

    if (isNaN(parseInt(escrowId))) {
      return NextResponse.json({ 
        error: 'Valid escrow ID is required',
        code: 'INVALID_ESCROW_ID' 
      }, { status: 400 });
    }

    const parsedEscrowId = parseInt(escrowId);

    // Fetch escrow transaction
    const existingEscrow = await db.select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, parsedEscrowId))
      .limit(1);

    if (existingEscrow.length === 0) {
      return NextResponse.json({ 
        error: 'Escrow transaction not found',
        code: 'ESCROW_NOT_FOUND' 
      }, { status: 404 });
    }

    const escrow = existingEscrow[0];

    // Validate that platform fee has been calculated
    if (escrow.platformFeeAmount === null || escrow.platformFeeAmount === undefined) {
      return NextResponse.json({ 
        error: 'Platform fee must be calculated before marking as transferred',
        code: 'FEE_NOT_CALCULATED' 
      }, { status: 400 });
    }

    // Check if fee already transferred
    if (escrow.feeTransferredAt !== null && escrow.feeTransferredAt !== undefined) {
      return NextResponse.json({ 
        error: 'Platform fee has already been transferred',
        code: 'FEE_ALREADY_TRANSFERRED' 
      }, { status: 400 });
    }

    // Update escrow transaction with fee transfer details
    const updated = await db.update(escrowTransactions)
      .set({
        feeTransferredAt: new Date(),
        platformAccountId: 'platform_account_default',
        updatedAt: new Date()
      })
      .where(eq(escrowTransactions.id, parsedEscrowId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update escrow transaction',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('POST /api/escrow/mark-fee-transferred error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}