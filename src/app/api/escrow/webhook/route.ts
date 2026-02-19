import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { escrow_reference_id, status, webhook_secret, event_type, payload } = requestBody;

    // Validate required fields
    if (!escrow_reference_id) {
      return NextResponse.json({ 
        error: "escrow_reference_id is required",
        code: "MISSING_ESCROW_REFERENCE_ID" 
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ 
        error: "status is required",
        code: "MISSING_STATUS" 
      }, { status: 400 });
    }

    if (!webhook_secret) {
      return NextResponse.json({ 
        error: "webhook_secret is required for verification",
        code: "MISSING_WEBHOOK_SECRET" 
      }, { status: 400 });
    }

    // Find escrow transaction by reference ID
    const escrowTransaction = await db.select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.escrowReferenceId, escrow_reference_id.toString()))
      .limit(1);

    if (escrowTransaction.length === 0) {
      console.error(`Webhook received for non-existent escrow transaction: ${escrow_reference_id}`);
      return NextResponse.json({ 
        error: 'Escrow transaction not found',
        code: "ESCROW_NOT_FOUND" 
      }, { status: 404 });
    }

    const escrow = escrowTransaction[0];

    // Verify webhook secret
    if (escrow.webhookSecret !== webhook_secret) {
      console.error(`Invalid webhook secret for escrow transaction ${escrow.id}. Expected: ${escrow.webhookSecret}, Received: ${webhook_secret}`);
      return NextResponse.json({ 
        error: 'Invalid webhook secret',
        code: "INVALID_WEBHOOK_SECRET" 
      }, { status: 401 });
    }

    // Log webhook event to console for debugging
    console.log('=== ESCROW WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Escrow ID:', escrow.id);
    console.log('Escrow Reference ID:', escrow_reference_id);
    console.log('Event Type:', event_type || 'N/A');
    console.log('Status:', status);
    console.log('Current Escrow Status:', escrow.status);
    console.log('Payload:', JSON.stringify(payload || {}, null, 2));
    console.log('================================');

    // Map webhook status to internal status and determine timestamp field to update
    const statusMapping: Record<string, { internalStatus: string; timestampField?: string }> = {
      'initiated': { internalStatus: 'initiated', timestampField: 'initiatedAt' },
      'funded': { internalStatus: 'funded', timestampField: 'fundedAt' },
      'migration_started': { internalStatus: 'migration_in_progress', timestampField: 'migrationStartedAt' },
      'completed': { internalStatus: 'completed', timestampField: 'completedAt' },
      'released': { internalStatus: 'released', timestampField: 'releasedAt' },
      'cancelled': { internalStatus: 'cancelled' },
      'disputed': { internalStatus: 'disputed' },
    };

    const statusInfo = statusMapping[status.toLowerCase()] || { internalStatus: status };
    const updateData: Record<string, any> = {
      status: statusInfo.internalStatus,
      updatedAt: new Date().toISOString(),
    };

    // Update timestamp field if applicable
    if (statusInfo.timestampField) {
      updateData[statusInfo.timestampField] = new Date().toISOString();
    }

    // Add notes about the webhook event
    const existingNotes = escrow.notes || '';
    const webhookNote = `[${new Date().toISOString()}] Webhook received: ${event_type || 'status_update'} - Status changed to ${status}`;
    updateData.notes = existingNotes ? `${existingNotes}\n${webhookNote}` : webhookNote;

    // Update escrow transaction status
    const updated = await db.update(escrowTransactions)
      .set(updateData)
      .where(eq(escrowTransactions.id, escrow.id))
      .returning();

    console.log(`Escrow transaction ${escrow.id} updated from ${escrow.status} to ${statusInfo.internalStatus}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      escrow_id: escrow.id,
      previous_status: escrow.status,
      new_status: statusInfo.internalStatus,
      event_type: event_type || 'status_update',
      processed_at: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: "WEBHOOK_PROCESSING_ERROR"
    }, { status: 500 });
  }
}