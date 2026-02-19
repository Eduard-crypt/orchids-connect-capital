import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationChecklists, migrationChecklistTasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_TASK_CATEGORIES = ['domain', 'hosting', 'code', 'payments', 'ads', 'inventory', 'other'];

export async function POST(
  request: NextRequest,
  { params }: { params: { checklistId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const checklistId = params.checklistId;
    if (!checklistId || isNaN(parseInt(checklistId))) {
      return NextResponse.json(
        { error: 'Valid checklist ID is required', code: 'INVALID_CHECKLIST_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { taskName, taskCategory, taskDescription } = body;

    if (!taskName || typeof taskName !== 'string' || taskName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task name is required and must be a non-empty string', code: 'INVALID_TASK_NAME' },
        { status: 400 }
      );
    }

    if (!taskCategory || typeof taskCategory !== 'string') {
      return NextResponse.json(
        { error: 'Task category is required', code: 'INVALID_TASK_CATEGORY' },
        { status: 400 }
      );
    }

    if (!VALID_TASK_CATEGORIES.includes(taskCategory)) {
      return NextResponse.json(
        { 
          error: `Task category must be one of: ${VALID_TASK_CATEGORIES.join(', ')}`, 
          code: 'INVALID_TASK_CATEGORY_VALUE' 
        },
        { status: 400 }
      );
    }

    if (taskDescription !== undefined && typeof taskDescription !== 'string') {
      return NextResponse.json(
        { error: 'Task description must be a string', code: 'INVALID_TASK_DESCRIPTION' },
        { status: 400 }
      );
    }

    const checklist = await db
      .select()
      .from(migrationChecklists)
      .where(eq(migrationChecklists.id, parseInt(checklistId)))
      .limit(1);

    if (checklist.length === 0) {
      return NextResponse.json(
        { error: 'Migration checklist not found', code: 'CHECKLIST_NOT_FOUND' },
        { status: 404 }
      );
    }

    const checklistData = checklist[0];
    const isBuyer = checklistData.buyerId === user.id;
    const isSeller = checklistData.sellerId === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { 
          error: 'You must be the buyer or seller of this checklist to add tasks', 
          code: 'FORBIDDEN' 
        },
        { status: 403 }
      );
    }

    const newTask = await db
      .insert(migrationChecklistTasks)
      .values({
        checklistId: parseInt(checklistId),
        taskName: taskName.trim(),
        taskCategory: taskCategory,
        taskDescription: taskDescription ? taskDescription.trim() : null,
        status: 'pending',
        buyerConfirmed: false,
        sellerConfirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/migration-checklist-tasks error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}