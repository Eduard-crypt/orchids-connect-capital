import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    codes.push(code);
  }
  
  return codes;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const existingSettings = await db.all(sql`
      SELECT * FROM two_factor_auth WHERE user_id = ${userId} LIMIT 1
    `);

    if (existingSettings.length > 0 && existingSettings[0].enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account', code: 'TWO_FACTOR_ALREADY_ENABLED' },
        { status: 409 }
      );
    }

    const secret = authenticator.generateSecret();
    const backupCodes = generateBackupCodes(10);

    const otpauthUrl = authenticator.keyuri(userEmail, 'Connect Capitals', secret);

    let qrCode: string;
    try {
      qrCode = await QRCode.toDataURL(otpauthUrl);
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      return NextResponse.json(
        { error: 'Failed to generate QR code', code: 'QR_GENERATION_FAILED' },
        { status: 500 }
      );
    }

    const now = Date.now();

    if (existingSettings.length > 0) {
      await db.run(sql`
        UPDATE two_factor_auth 
        SET secret = ${secret}, 
            backup_codes = ${JSON.stringify(backupCodes)}, 
            enabled = 0, 
            enabled_at = NULL
        WHERE user_id = ${userId}
      `);
    } else {
      await db.run(sql`
        INSERT INTO two_factor_auth (user_id, secret, backup_codes, enabled, enabled_at, created_at)
        VALUES (${userId}, ${secret}, ${JSON.stringify(backupCodes)}, 0, NULL, ${now})
      `);
    }

    return NextResponse.json(
      {
        secret,
        qrCode,
        backupCodes
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