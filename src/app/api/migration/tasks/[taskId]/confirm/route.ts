import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationChecklistTasks, migrationChecklists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { taskId } = await request.json();

    // Validate taskId
    if (!taskId || isNaN(parseInt(taskId))) {
      return NextResponse.json(
        { error: 'Valid task ID is required', code: 'INVALID_TASK_ID' },
        { status: 400 }
      );
    }

    const parsedTaskId = parseInt(taskId);

    // Fetch task with parent checklist
    const taskWithChecklist = await db
      .select({
        task: migrationChecklistTasks,
        checklist: migrationChecklists,
      })
      .from(migrationChecklistTasks)
      .innerJoin(
        migrationChecklists,
        eq(migrationChecklistTasks.checklistId, migrationChecklists.id)
      )
      .where(eq(migrationChecklistTasks.id, parsedTaskId))
      .limit(1);

    if (taskWithChecklist.length === 0) {
      return NextResponse.json(
        { error: 'Task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { task, checklist } = taskWithChecklist[0];

    // Verify user is buyer or seller
    const isBuyer = user.id === checklist.buyerId;
    const isSeller = user.id === checklist.sellerId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { 
          error: 'You must be the buyer or seller to confirm this task',
          code: 'FORBIDDEN_NOT_BUYER_OR_SELLER'
        },
        { status: 403 }
      );
    }

    // Prepare update data
    const currentTimestamp = new Date();
    const updateData: Record<string, any> = {
      updatedAt: currentTimestamp,
    };

    // Determine confirmation fields based on user role
    let newBuyerConfirmed = task.buyerConfirmed;
    let newSellerConfirmed = task.sellerConfirmed;

    if (isBuyer) {
      updateData.buyerConfirmed = true;
      updateData.buyerConfirmedAt = currentTimestamp;
      newBuyerConfirmed = true;
    }

    if (isSeller) {
      updateData.sellerConfirmed = true;
      updateData.sellerConfirmedAt = currentTimestamp;
      newSellerConfirmed = true;
    }

    // Check if both parties have now confirmed
    if (newBuyerConfirmed && newSellerConfirmed) {
      updateData.status = 'complete';
      updateData.completedAt = currentTimestamp;
    }

    // Update the task
    const updatedTask = await db
      .update(migrationChecklistTasks)
      .set(updateData)
      .where(eq(migrationChecklistTasks.id, parsedTaskId))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update task', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTask[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}