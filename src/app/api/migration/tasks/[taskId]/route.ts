import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationChecklistTasks, migrationChecklists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'in_progress', 'complete'] as const;
const VALID_CATEGORIES = ['domain', 'hosting', 'code', 'payments', 'ads', 'inventory', 'other'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const taskId = params.taskId;
    if (!taskId || isNaN(parseInt(taskId))) {
      return NextResponse.json(
        { error: 'Valid task ID is required', code: 'INVALID_TASK_ID' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();

    // Security check: prevent user ID manipulation
    if ('userId' in requestBody || 'user_id' in requestBody || 'buyerId' in requestBody || 'sellerId' in requestBody) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    // Fetch the task with its parent checklist
    const existingTask = await db
      .select({
        task: migrationChecklistTasks,
        checklist: migrationChecklists,
      })
      .from(migrationChecklistTasks)
      .innerJoin(
        migrationChecklists,
        eq(migrationChecklistTasks.checklistId, migrationChecklists.id)
      )
      .where(eq(migrationChecklistTasks.id, parseInt(taskId)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    const task = existingTask[0].task;
    const checklist = existingTask[0].checklist;

    // Verify user is buyer or seller
    if (user.id !== checklist.buyerId && user.id !== checklist.sellerId) {
      return NextResponse.json(
        { error: 'Not authorized to update this task', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Extract and validate updatable fields
    const { taskName, taskCategory, taskDescription, status, notes } = requestBody;

    // Validate if fields are being updated
    const updates: Record<string, any> = {};

    if (taskName !== undefined) {
      if (typeof taskName !== 'string' || taskName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Task name must be a non-empty string', code: 'INVALID_TASK_NAME' },
          { status: 400 }
        );
      }
      updates.taskName = taskName.trim();
    }

    if (taskCategory !== undefined) {
      if (!VALID_CATEGORIES.includes(taskCategory)) {
        return NextResponse.json(
          {
            error: `Invalid task category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
            code: 'INVALID_TASK_CATEGORY',
          },
          { status: 400 }
        );
      }
      updates.taskCategory = taskCategory;
    }

    if (taskDescription !== undefined) {
      updates.taskDescription = taskDescription ? taskDescription.trim() : null;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;

      // If status is updated to 'complete' and both confirmations are true, set completedAt
      if (status === 'complete' && task.buyerConfirmed && task.sellerConfirmed) {
        updates.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.trim() : null;
    }

    // Reject if trying to update confirmation fields
    if ('buyerConfirmed' in requestBody || 'sellerConfirmed' in requestBody) {
      return NextResponse.json(
        {
          error: 'Cannot update confirmation fields directly. Use dedicated confirm endpoint',
          code: 'CONFIRMATION_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Always update timestamp
    updates.updatedAt = new Date();

    // Perform update
    const updatedTask = await db
      .update(migrationChecklistTasks)
      .set(updates)
      .where(eq(migrationChecklistTasks.id, parseInt(taskId)))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update task', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTask[0], { status: 200 });
  } catch (error) {
    console.error('PATCH task error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const taskId = params.taskId;
    if (!taskId || isNaN(parseInt(taskId))) {
      return NextResponse.json(
        { error: 'Valid task ID is required', code: 'INVALID_TASK_ID' },
        { status: 400 }
      );
    }

    // Fetch the task with its parent checklist
    const existingTask = await db
      .select({
        task: migrationChecklistTasks,
        checklist: migrationChecklists,
      })
      .from(migrationChecklistTasks)
      .innerJoin(
        migrationChecklists,
        eq(migrationChecklistTasks.checklistId, migrationChecklists.id)
      )
      .where(eq(migrationChecklistTasks.id, parseInt(taskId)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    const task = existingTask[0].task;
    const checklist = existingTask[0].checklist;

    // Verify user is buyer or seller
    if (user.id !== checklist.buyerId && user.id !== checklist.sellerId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this task', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Prevent deletion of completed tasks
    if (task.status === 'complete' && task.completedAt) {
      return NextResponse.json(
        {
          error: 'Cannot delete completed tasks',
          code: 'TASK_COMPLETED',
        },
        { status: 400 }
      );
    }

    // Delete the task
    const deletedTask = await db
      .delete(migrationChecklistTasks)
      .where(eq(migrationChecklistTasks.id, parseInt(taskId)))
      .returning();

    if (deletedTask.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete task', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Task deleted successfully',
        task: deletedTask[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE task error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}