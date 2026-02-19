import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_STATUSES = ['initiated', 'funded', 'in_migration', 'complete', 'released'] as const;
type EscrowStatus = typeof VALID_STATUSES[number];

const STATUS_TRANSITIONS: Record<EscrowStatus, number> = {
  'initiated': 0,
  'funded': 1,
  'in_migration': 2,
  'complete': 3,
  'released': 4
};

export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get escrow ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid escrow transaction ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const escrowId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { status, notes } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required', code: 'MISSING_STATUS' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Fetch existing escrow transaction
    const existingEscrow = await db.select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, escrowId))
      .limit(1);

    if (existingEscrow.length === 0) {
      return NextResponse.json(
        { error: 'Escrow transaction not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const escrow = existingEscrow[0];

    // Verify user is either buyer or seller
    if (escrow.buyerId !== user.id && escrow.sellerId !== user.id) {
      return NextResponse.json(
        { 
          error: 'You do not have permission to update this escrow transaction',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Validate status transition (optional logical order enforcement)
    const currentStatusOrder = STATUS_TRANSITIONS[escrow.status as EscrowStatus] ?? -1;
    const newStatusOrder = STATUS_TRANSITIONS[status as EscrowStatus];

    if (currentStatusOrder >= 0 && newStatusOrder < currentStatusOrder) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${escrow.status} to ${status}. Status can only move forward.`,
          code: 'INVALID_STATUS_TRANSITION'
        },
        { status: 400 }
      );
    }

    // Build update object with timestamp fields based on status
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Set timestamp fields based on status
    switch (status) {
      case 'funded':
        updateData.fundedAt = new Date();
        break;
      case 'in_migration':
        updateData.migrationStartedAt = new Date();
        break;
      case 'complete':
        updateData.completedAt = new Date();
        break;
      case 'released':
        updateData.releasedAt = new Date();
        break;
    }

    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the escrow transaction
    const updated = await db.update(escrowTransactions)
      .set(updateData)
      .where(eq(escrowTransactions.id, escrowId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update escrow transaction', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PATCH escrow status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}