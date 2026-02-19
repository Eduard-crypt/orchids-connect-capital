import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch current 2FA settings for the user
    const current2FASettings = await db.all(sql`
      SELECT * FROM two_factor_auth WHERE user_id = ${userId} LIMIT 1
    `);

    // Check if 2FA is enabled
    if (current2FASettings.length === 0 || !current2FASettings[0].enabled) {
      return NextResponse.json({ 
        error: '2FA is not enabled for this account',
        code: 'TWO_FA_NOT_ENABLED' 
      }, { status: 404 });
    }

    // Disable 2FA by updating the settings
    await db.run(sql`
      UPDATE two_factor_auth 
      SET enabled = 0, secret = NULL, backup_codes = NULL, enabled_at = NULL
      WHERE user_id = ${userId}
    `);

    return NextResponse.json({
      message: '2FA disabled successfully',
      enabled: false
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/2fa/disable error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}