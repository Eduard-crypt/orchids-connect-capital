import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch 2FA settings for the authenticated user
    const settings = await db.all(sql`
      SELECT * FROM two_factor_auth WHERE user_id = ${userId} LIMIT 1
    `);

    // If no settings found, return default disabled state
    if (settings.length === 0) {
      return NextResponse.json({
        enabled: false,
        enabledAt: null,
        backupCodesRemaining: 0
      });
    }

    const userSettings = settings[0];

    // Parse backup codes to count remaining codes
    let backupCodesRemaining = 0;
    if (userSettings.backup_codes) {
      try {
        const codes = JSON.parse(userSettings.backup_codes);
        if (Array.isArray(codes)) {
          backupCodesRemaining = codes.length;
        }
      } catch (error) {
        console.error('Error parsing backup codes:', error);
        // Continue with 0 remaining codes if parsing fails
      }
    }

    // Return 2FA status without sensitive information
    return NextResponse.json({
      enabled: userSettings.enabled === 1,
      enabledAt: userSettings.enabled_at,
      backupCodesRemaining
    });

  } catch (error) {
    console.error('GET 2FA status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}