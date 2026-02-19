import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user settings
    const settings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ 
        error: 'Settings not found',
        code: 'SETTINGS_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(settings[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Extract and validate settings fields
    const { emailNotifications, smsNotifications, marketingEmails } = body;

    // Validate boolean fields if provided
    if (emailNotifications !== undefined && typeof emailNotifications !== 'boolean') {
      return NextResponse.json({ 
        error: 'emailNotifications must be a boolean value',
        code: 'INVALID_EMAIL_NOTIFICATIONS' 
      }, { status: 400 });
    }

    if (smsNotifications !== undefined && typeof smsNotifications !== 'boolean') {
      return NextResponse.json({ 
        error: 'smsNotifications must be a boolean value',
        code: 'INVALID_SMS_NOTIFICATIONS' 
      }, { status: 400 });
    }

    if (marketingEmails !== undefined && typeof marketingEmails !== 'boolean') {
      return NextResponse.json({ 
        error: 'marketingEmails must be a boolean value',
        code: 'INVALID_MARKETING_EMAILS' 
      }, { status: 400 });
    }

    // Check if settings exist for this user
    const existingSettings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (existingSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Settings not found',
        code: 'SETTINGS_NOT_FOUND' 
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      marketingEmails?: boolean;
      updatedAt: Date;
    } = {
      updatedAt: new Date()
    };

    if (emailNotifications !== undefined) {
      updateData.emailNotifications = emailNotifications;
    }
    if (smsNotifications !== undefined) {
      updateData.smsNotifications = smsNotifications;
    }
    if (marketingEmails !== undefined) {
      updateData.marketingEmails = marketingEmails;
    }

    // Update settings
    const updated = await db.update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update settings',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}