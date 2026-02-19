import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationChecklists, migrationChecklistTasks, listings, escrowTransactions, user } from '@/db/schema';
import { eq, and, or, desc, count, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const statusFilter = searchParams.get('status');

    const limit = Math.min(parseInt(limitParam ?? '20'), 100);
    const offset = parseInt(offsetParam ?? '0');

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    // Validate status filter if provided
    if (statusFilter && !['in_progress', 'complete'].includes(statusFilter)) {
      return NextResponse.json({ 
        error: 'Invalid status filter. Must be: in_progress or complete',
        code: 'INVALID_STATUS_FILTER' 
      }, { status: 400 });
    }

    // Build WHERE conditions - user must be either buyer OR seller
    let whereConditions = or(
      eq(migrationChecklists.buyerId, currentUser.id),
      eq(migrationChecklists.sellerId, currentUser.id)
    );

    // Apply status filter if provided
    if (statusFilter) {
      whereConditions = and(
        whereConditions,
        eq(migrationChecklists.status, statusFilter)
      );
    }

    // Fetch migration checklists with joins
    const checklists = await db
      .select({
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
        listingBusinessType: listings.businessType,
        // Escrow details
        escrowStatus: escrowTransactions.status,
        escrowAmount: escrowTransactions.escrowAmount,
        // Buyer details
        buyerName: sql<string>`${user.name}`.as('buyer_name'),
        buyerEmail: sql<string>`${user.email}`.as('buyer_email'),
        // Seller details
        sellerName: sql<string>`seller_user.name`.as('seller_name'),
        sellerEmail: sql<string>`seller_user.email`.as('seller_email'),
      })
      .from(migrationChecklists)
      .leftJoin(listings, eq(migrationChecklists.listingId, listings.id))
      .leftJoin(escrowTransactions, eq(migrationChecklists.escrowId, escrowTransactions.id))
      .leftJoin(user, eq(migrationChecklists.buyerId, user.id))
      .leftJoin(sql`${user} AS seller_user`, sql`${migrationChecklists.sellerId} = seller_user.id`)
      .where(whereConditions)
      .orderBy(desc(migrationChecklists.createdAt))
      .limit(limit)
      .offset(offset);

    // For each checklist, calculate task statistics
    const enrichedChecklists = await Promise.all(
      checklists.map(async (checklist) => {
        // Get total tasks count
        const totalTasksResult = await db
          .select({ count: count() })
          .from(migrationChecklistTasks)
          .where(eq(migrationChecklistTasks.checklistId, checklist.id));

        // Get completed tasks count
        const completedTasksResult = await db
          .select({ count: count() })
          .from(migrationChecklistTasks)
          .where(
            and(
              eq(migrationChecklistTasks.checklistId, checklist.id),
              eq(migrationChecklistTasks.status, 'complete')
            )
          );

        // Get pending tasks count
        const pendingTasksResult = await db
          .select({ count: count() })
          .from(migrationChecklistTasks)
          .where(
            and(
              eq(migrationChecklistTasks.checklistId, checklist.id),
              eq(migrationChecklistTasks.status, 'pending')
            )
          );

        // Get in_progress tasks count
        const inProgressTasksResult = await db
          .select({ count: count() })
          .from(migrationChecklistTasks)
          .where(
            and(
              eq(migrationChecklistTasks.checklistId, checklist.id),
              eq(migrationChecklistTasks.status, 'in_progress')
            )
          );

        const totalTasks = totalTasksResult[0]?.count ?? 0;
        const completedTasks = completedTasksResult[0]?.count ?? 0;
        const pendingTasks = pendingTasksResult[0]?.count ?? 0;
        const inProgressTasks = inProgressTasksResult[0]?.count ?? 0;

        return {
          ...checklist,
          listing: checklist.listingTitle ? {
            title: checklist.listingTitle,
            businessType: checklist.listingBusinessType,
          } : null,
          escrow: checklist.escrowStatus ? {
            status: checklist.escrowStatus,
            escrowAmount: checklist.escrowAmount,
          } : null,
          buyer: checklist.buyerName ? {
            name: checklist.buyerName,
            email: checklist.buyerEmail,
          } : null,
          seller: checklist.sellerName ? {
            name: checklist.sellerName,
            email: checklist.sellerEmail,
          } : null,
          taskStatistics: {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
          },
          // Remove the flat fields from the response
          listingTitle: undefined,
          listingBusinessType: undefined,
          escrowStatus: undefined,
          escrowAmount: undefined,
          buyerName: undefined,
          buyerEmail: undefined,
          sellerName: undefined,
          sellerEmail: undefined,
        };
      })
    );

    // Clean up undefined fields
    const cleanedChecklists = enrichedChecklists.map(checklist => {
      const { listingTitle, listingBusinessType, escrowStatus, escrowAmount, buyerName, buyerEmail, sellerName, sellerEmail, ...rest } = checklist;
      return rest;
    });

    return NextResponse.json(cleanedChecklists, { status: 200 });

  } catch (error) {
    console.error('GET migration checklists error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}