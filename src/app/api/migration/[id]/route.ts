import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationChecklists, migrationChecklistTasks, listings, escrowTransactions, user } from '@/db/schema';
import { eq, and, or, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get checklist ID from query parameters
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('id');

    if (!checklistId || isNaN(parseInt(checklistId))) {
      return NextResponse.json({ 
        error: 'Valid checklist ID is required',
        code: 'INVALID_CHECKLIST_ID' 
      }, { status: 400 });
    }

    const id = parseInt(checklistId);

    // Fetch migration checklist with all related data using LEFT JOINs
    const checklistResult = await db
      .select({
        // Migration checklist fields
        id: migrationChecklists.id,
        escrowId: migrationChecklists.escrowId,
        listingId: migrationChecklists.listingId,
        buyerId: migrationChecklists.buyerId,
        sellerId: migrationChecklists.sellerId,
        status: migrationChecklists.status,
        completedAt: migrationChecklists.completedAt,
        createdAt: migrationChecklists.createdAt,
        updatedAt: migrationChecklists.updatedAt,
        
        // Listing details
        listingTitle: listings.title,
        listingBusinessModel: listings.businessModel,
        listingNiche: listings.niche,
        listingAskingPrice: listings.askingPrice,
        listingStatus: listings.status,
        
        // Escrow details
        escrowStatus: escrowTransactions.status,
        escrowAmount: escrowTransactions.escrowAmount,
        escrowProvider: escrowTransactions.escrowProvider,
        escrowReferenceId: escrowTransactions.escrowReferenceId,
        escrowFundedAt: escrowTransactions.fundedAt,
        escrowMigrationStartedAt: escrowTransactions.migrationStartedAt,
        
        // Buyer details
        buyerName: user.name,
        buyerEmail: user.email,
        buyerImage: user.image,
        
        // Seller details (aliased to avoid conflicts)
        sellerName: user.name,
        sellerEmail: user.email,
        sellerImage: user.image,
      })
      .from(migrationChecklists)
      .leftJoin(listings, eq(migrationChecklists.listingId, listings.id))
      .leftJoin(escrowTransactions, eq(migrationChecklists.escrowId, escrowTransactions.id))
      .leftJoin(user, eq(migrationChecklists.buyerId, user.id))
      .where(eq(migrationChecklists.id, id))
      .limit(1);

    if (checklistResult.length === 0) {
      return NextResponse.json({ 
        error: 'Migration checklist not found',
        code: 'CHECKLIST_NOT_FOUND' 
      }, { status: 404 });
    }

    const checklist = checklistResult[0];

    // Authorization check: verify user is either buyer or seller
    const isBuyer = checklist.buyerId === currentUser.id;
    const isSeller = checklist.sellerId === currentUser.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ 
        error: 'Access denied. You must be the buyer or seller to view this checklist.',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Fetch seller details separately (since we can't alias joins properly in the above query)
    const sellerResult = await db
      .select({
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, checklist.sellerId))
      .limit(1);

    const sellerDetails = sellerResult.length > 0 ? sellerResult[0] : null;

    // Fetch all tasks for this checklist, ordered by category then createdAt
    const tasks = await db
      .select()
      .from(migrationChecklistTasks)
      .where(eq(migrationChecklistTasks.checklistId, id))
      .orderBy(asc(migrationChecklistTasks.taskCategory), asc(migrationChecklistTasks.createdAt));

    // Group tasks by category for easier consumption
    const tasksByCategory = tasks.reduce((acc, task) => {
      const category = task.taskCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: task.id,
        checklistId: task.checklistId,
        taskName: task.taskName,
        taskCategory: task.taskCategory,
        taskDescription: task.taskDescription,
        status: task.status,
        buyerConfirmed: task.buyerConfirmed,
        sellerConfirmed: task.sellerConfirmed,
        buyerConfirmedAt: task.buyerConfirmedAt,
        sellerConfirmedAt: task.sellerConfirmedAt,
        notes: task.notes,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
      return acc;
    }, {} as Record<string, typeof tasks>);

    // Build complete response object
    const response = {
      id: checklist.id,
      escrowId: checklist.escrowId,
      listingId: checklist.listingId,
      buyerId: checklist.buyerId,
      sellerId: checklist.sellerId,
      status: checklist.status,
      completedAt: checklist.completedAt,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
      
      // Listing details
      listing: checklist.listingTitle ? {
        title: checklist.listingTitle,
        businessModel: checklist.listingBusinessModel,
        niche: checklist.listingNiche,
        askingPrice: checklist.listingAskingPrice,
        status: checklist.listingStatus,
      } : null,
      
      // Escrow details
      escrow: checklist.escrowStatus ? {
        status: checklist.escrowStatus,
        amount: checklist.escrowAmount,
        provider: checklist.escrowProvider,
        referenceId: checklist.escrowReferenceId,
        fundedAt: checklist.escrowFundedAt,
        migrationStartedAt: checklist.escrowMigrationStartedAt,
      } : null,
      
      // Buyer details
      buyer: {
        id: checklist.buyerId,
        name: checklist.buyerName,
        email: checklist.buyerEmail,
        image: checklist.buyerImage,
      },
      
      // Seller details
      seller: sellerDetails ? {
        id: checklist.sellerId,
        name: sellerDetails.name,
        email: sellerDetails.email,
        image: sellerDetails.image,
      } : null,
      
      // All tasks
      tasks: tasks,
      
      // Tasks grouped by category
      tasksByCategory: tasksByCategory,
      
      // User context
      userRole: isBuyer ? 'buyer' : 'seller',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET migration checklist error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
}