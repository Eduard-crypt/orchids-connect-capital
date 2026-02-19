import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationChecklists, migrationChecklistTasks, escrowTransactions, listings, user } from '@/db/schema';
import { eq, and, or, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Get escrowId from query params
    const { searchParams } = new URL(request.url);
    const escrowIdParam = searchParams.get('escrowId');

    if (!escrowIdParam) {
      return NextResponse.json({ 
        error: 'Escrow ID is required',
        code: 'MISSING_ESCROW_ID' 
      }, { status: 400 });
    }

    const escrowId = parseInt(escrowIdParam);
    if (isNaN(escrowId)) {
      return NextResponse.json({ 
        error: 'Valid escrow ID is required',
        code: 'INVALID_ESCROW_ID' 
      }, { status: 400 });
    }

    // First, fetch the escrow to verify it exists and check user access
    const escrow = await db.select()
      .from(escrowTransactions)
      .where(eq(escrowTransactions.id, escrowId))
      .limit(1);

    if (escrow.length === 0) {
      return NextResponse.json({ 
        error: 'Escrow not found',
        code: 'ESCROW_NOT_FOUND' 
      }, { status: 404 });
    }

    // Verify user has access (must be buyer or seller)
    const escrowData = escrow[0];
    const hasAccess = escrowData.buyerId === currentUser.id || escrowData.sellerId === currentUser.id;

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Access denied. You must be the buyer or seller of this escrow.',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Fetch the migration checklist for this escrow
    const checklist = await db.select({
      id: migrationChecklists.id,
      escrowId: migrationChecklists.escrowId,
      listingId: migrationChecklists.listingId,
      buyerId: migrationChecklists.buyerId,
      sellerId: migrationChecklists.sellerId,
      status: migrationChecklists.status,
      completedAt: migrationChecklists.completedAt,
      createdAt: migrationChecklists.createdAt,
      updatedAt: migrationChecklists.updatedAt,
      listingTitle: listings.title,
      listingBusinessModel: listings.businessModel,
      listingNiche: listings.niche,
      buyerName: user.name,
      buyerEmail: user.email,
    })
      .from(migrationChecklists)
      .leftJoin(listings, eq(migrationChecklists.listingId, listings.id))
      .leftJoin(user, eq(migrationChecklists.buyerId, user.id))
      .where(eq(migrationChecklists.escrowId, escrowId))
      .limit(1);

    if (checklist.length === 0) {
      return NextResponse.json({ 
        error: 'No migration checklist found for this escrow',
        code: 'CHECKLIST_NOT_FOUND' 
      }, { status: 404 });
    }

    const checklistData = checklist[0];

    // Fetch seller details separately
    const seller = await db.select({
      name: user.name,
      email: user.email,
    })
      .from(user)
      .where(eq(user.id, checklistData.sellerId))
      .limit(1);

    // Fetch all tasks for this checklist, ordered by category then creation date
    const tasks = await db.select()
      .from(migrationChecklistTasks)
      .where(eq(migrationChecklistTasks.checklistId, checklistData.id))
      .orderBy(asc(migrationChecklistTasks.taskCategory), asc(migrationChecklistTasks.createdAt));

    // Build the response object
    const response = {
      id: checklistData.id,
      escrowId: checklistData.escrowId,
      listingId: checklistData.listingId,
      buyerId: checklistData.buyerId,
      sellerId: checklistData.sellerId,
      status: checklistData.status,
      completedAt: checklistData.completedAt,
      createdAt: checklistData.createdAt,
      updatedAt: checklistData.updatedAt,
      listing: checklistData.listingTitle ? {
        title: checklistData.listingTitle,
        businessModel: checklistData.listingBusinessModel,
        niche: checklistData.listingNiche,
      } : null,
      buyer: checklistData.buyerName ? {
        name: checklistData.buyerName,
        email: checklistData.buyerEmail,
      } : null,
      seller: seller.length > 0 ? {
        name: seller[0].name,
        email: seller[0].email,
      } : null,
      tasks: tasks,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET migration checklist error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}