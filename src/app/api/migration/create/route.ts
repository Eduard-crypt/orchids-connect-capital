import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrowTransactions, migrationChecklists, migrationChecklistTasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_MIGRATION_TASKS = [
  {
    taskName: 'Transfer domain ownership',
    taskCategory: 'domain',
    taskDescription: 'Transfer domain ownership from seller to buyer including registrar access and DNS management'
  },
  {
    taskName: 'Update DNS records',
    taskCategory: 'domain',
    taskDescription: 'Update DNS records to point to new hosting infrastructure'
  },
  {
    taskName: 'Migrate hosting account',
    taskCategory: 'hosting',
    taskDescription: 'Migrate hosting account including all files, databases, and configurations'
  },
  {
    taskName: 'Transfer server access credentials',
    taskCategory: 'hosting',
    taskDescription: 'Transfer all server access credentials including SSH keys, FTP accounts, and control panel access'
  },
  {
    taskName: 'Transfer codebase and repositories',
    taskCategory: 'code',
    taskDescription: 'Transfer codebase and repositories including GitHub/GitLab access and deployment configurations'
  },
  {
    taskName: 'Transfer payment processor accounts',
    taskCategory: 'payments',
    taskDescription: 'Transfer payment processor accounts including Stripe, PayPal, and other payment gateways'
  },
  {
    taskName: 'Transfer advertising accounts (Google Ads, Facebook)',
    taskCategory: 'ads',
    taskDescription: 'Transfer advertising accounts including Google Ads, Facebook Ads, and other advertising platforms'
  },
  {
    taskName: 'Transfer inventory and supplier relationships',
    taskCategory: 'inventory',
    taskDescription: 'Transfer inventory management systems and supplier relationships including contact information and agreements'
  }
];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { escrowId } = body;

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

    const escrowIdInt = parseInt(escrowId);

    const escrow = await db.select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, escrowIdInt))
      .limit(1);

    if (escrow.length === 0) {
      return NextResponse.json({ 
        error: 'Escrow transaction not found',
        code: 'ESCROW_NOT_FOUND' 
      }, { status: 404 });
    }

    const escrowRecord = escrow[0];

    if (escrowRecord.buyerId !== user.id && escrowRecord.sellerId !== user.id) {
      return NextResponse.json({ 
        error: 'You do not have access to this escrow transaction',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    if (escrowRecord.status !== 'funded' && escrowRecord.status !== 'in_migration') {
      return NextResponse.json({ 
        error: 'Escrow must be in funded or in_migration status to create migration checklist',
        code: 'INVALID_ESCROW_STATUS' 
      }, { status: 403 });
    }

    const existingChecklist = await db.select()
      .from(migrationChecklists)
      .where(eq(migrationChecklists.escrowId, escrowIdInt))
      .limit(1);

    if (existingChecklist.length > 0) {
      return NextResponse.json({ 
        error: 'Migration checklist already exists for this escrow transaction',
        code: 'CHECKLIST_ALREADY_EXISTS' 
      }, { status: 409 });
    }

    const now = new Date().toISOString();

    const newChecklist = await db.insert(migrationChecklists)
      .values({
        escrowId: escrowIdInt,
        listingId: escrowRecord.listingId,
        buyerId: escrowRecord.buyerId,
        sellerId: escrowRecord.sellerId,
        status: 'in_progress',
        createdAt: now,
        updatedAt: now
      })
      .returning();

    if (newChecklist.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create migration checklist',
        code: 'CREATION_FAILED' 
      }, { status: 500 });
    }

    const checklist = newChecklist[0];

    const tasksToInsert = DEFAULT_MIGRATION_TASKS.map(task => ({
      checklistId: checklist.id,
      taskName: task.taskName,
      taskCategory: task.taskCategory,
      taskDescription: task.taskDescription,
      status: 'pending',
      buyerConfirmed: false,
      sellerConfirmed: false,
      createdAt: now,
      updatedAt: now
    }));

    const createdTasks = await db.insert(migrationChecklistTasks)
      .values(tasksToInsert)
      .returning();

    const checklistWithTasks = {
      ...checklist,
      tasks: createdTasks
    };

    return NextResponse.json(checklistWithTasks, { status: 201 });

  } catch (error) {
    console.error('POST migration checklist error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}