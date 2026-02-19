import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user roles
    const roles = await db.select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (roles.length === 0) {
      return NextResponse.json({ 
        error: 'User roles not found',
        code: 'ROLES_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(roles[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate input - only allow isBuyer and isSeller
    const updates: Partial<typeof userRoles.$inferInsert> = {};

    if ('isBuyer' in body) {
      if (typeof body.isBuyer !== 'boolean') {
        return NextResponse.json({ 
          error: 'isBuyer must be a boolean value',
          code: 'INVALID_IS_BUYER' 
        }, { status: 400 });
      }
      updates.isBuyer = body.isBuyer;
    }

    if ('isSeller' in body) {
      if (typeof body.isSeller !== 'boolean') {
        return NextResponse.json({ 
          error: 'isSeller must be a boolean value',
          code: 'INVALID_IS_SELLER' 
        }, { status: 400 });
      }
      updates.isSeller = body.isSeller;
    }

    // Check if there are any valid updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update. Provide isBuyer or isSeller',
        code: 'NO_VALID_FIELDS' 
      }, { status: 400 });
    }

    // Check if roles record exists for user
    const existingRoles = await db.select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (existingRoles.length === 0) {
      return NextResponse.json({ 
        error: 'User roles not found',
        code: 'ROLES_NOT_FOUND' 
      }, { status: 404 });
    }

    // Update roles
    const updated = await db.update(userRoles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userRoles.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update user roles',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}