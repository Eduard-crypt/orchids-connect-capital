import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { code } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    // Validate code format (must be 6-digit string)
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be a 6-digit string', code: 'INVALID_CODE_FORMAT' },
        { status: 400 }
      );
    }

    // Fetch user's 2FA settings
    const settings = await db.all(sql`
      SELECT * FROM two_factor_auth WHERE user_id = ${userId} LIMIT 1
    `);

    if (settings.length === 0 || !settings[0].secret) {
      return NextResponse.json(
        { error: '2FA setup not initiated. Please generate a secret first.', code: 'SETUP_NOT_INITIATED' },
        { status: 404 }
      );
    }

    const userSettings = settings[0];

    // Verify the TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: userSettings.secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code', code: 'INVALID_CODE' },
        { status: 403 }
      );
    }

    // Enable 2FA and set enabledAt timestamp
    const now = Date.now();
    await db.run(sql`
      UPDATE two_factor_auth 
      SET enabled = 1, enabled_at = ${now}
      WHERE user_id = ${userId}
    `);

    return NextResponse.json(
      {
        message: '2FA enabled successfully',
        enabled: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}