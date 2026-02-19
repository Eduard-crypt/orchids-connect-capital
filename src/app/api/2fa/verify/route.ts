import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { authenticator } from 'otplib';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const user = session.user;

    // Parse request body
    const body = await request.json();
    const { code } = body;

    // Validate required field
    if (!code) {
      return NextResponse.json({ 
        error: 'Code is required',
        code: 'CODE_REQUIRED' 
      }, { status: 400 });
    }

    // Validate code format
    if (typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Invalid code format',
        code: 'INVALID_CODE_FORMAT' 
      }, { status: 400 });
    }

    // Fetch 2FA settings for user
    const settings = await db.all(sql`
      SELECT * FROM two_factor_auth WHERE user_id = ${user.id} LIMIT 1
    `);

    // Check if 2FA is enabled
    if (settings.length === 0 || !settings[0].enabled) {
      return NextResponse.json({ 
        error: '2FA is not enabled for this account',
        code: '2FA_NOT_ENABLED' 
      }, { status: 404 });
    }

    const userSettings = settings[0];

    // Determine if code is TOTP (6 digits) or backup code (8 characters)
    const trimmedCode = code.trim();
    const isTOTP = /^\d{6}$/.test(trimmedCode);
    const isBackupCode = /^[A-Z0-9]{8}$/.test(trimmedCode.toUpperCase());

    if (!isTOTP && !isBackupCode) {
      return NextResponse.json({ 
        error: 'Invalid code format. Code must be 6-digit TOTP or 8-character backup code',
        code: 'INVALID_CODE_FORMAT' 
      }, { status: 400 });
    }

    // Handle TOTP verification
    if (isTOTP) {
      if (!userSettings.secret) {
        return NextResponse.json({ 
          error: '2FA secret not found',
          code: '2FA_SECRET_MISSING' 
        }, { status: 500 });
      }

      const isValid = authenticator.verify({
        token: trimmedCode,
        secret: userSettings.secret
      });

      if (!isValid) {
        return NextResponse.json({ 
          error: 'Invalid 2FA code',
          code: 'INVALID_2FA_CODE' 
        }, { status: 403 });
      }

      return NextResponse.json({
        verified: true,
        message: '2FA code verified'
      }, { status: 200 });
    }

    // Handle backup code verification
    if (isBackupCode) {
      const normalizedCode = trimmedCode.toUpperCase();
      
      if (!userSettings.backup_codes) {
        return NextResponse.json({ 
          error: 'No backup codes available',
          code: 'NO_BACKUP_CODES' 
        }, { status: 403 });
      }

      let backupCodes: string[];
      try {
        backupCodes = JSON.parse(userSettings.backup_codes);
      } catch (error) {
        console.error('Failed to parse backup codes:', error);
        return NextResponse.json({ 
          error: 'Failed to verify backup code',
          code: 'BACKUP_CODE_PARSE_ERROR' 
        }, { status: 500 });
      }

      const codeIndex = backupCodes.indexOf(normalizedCode);

      if (codeIndex === -1) {
        return NextResponse.json({ 
          error: 'Invalid backup code',
          code: 'INVALID_BACKUP_CODE' 
        }, { status: 403 });
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);

      // Update settings with remaining backup codes
      await db.run(sql`
        UPDATE two_factor_auth 
        SET backup_codes = ${JSON.stringify(backupCodes)}
        WHERE user_id = ${user.id}
      `);

      return NextResponse.json({
        verified: true,
        message: 'Backup code used',
        backupCodesRemaining: backupCodes.length
      }, { status: 200 });
    }

    // Fallback error (should not reach here)
    return NextResponse.json({ 
      error: 'Invalid verification attempt',
      code: 'INVALID_VERIFICATION' 
    }, { status: 400 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}