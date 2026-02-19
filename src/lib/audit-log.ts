import { NextRequest } from 'next/server';

interface AuditLogData {
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/audit-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Failed to create audit log:', await response.text());
    }
  } catch (error) {
    console.error('Audit log error:', error);
    // Fail silently - don't block user actions if audit logging fails
  }
}

export async function logLoginAttempt(
  request: NextRequest,
  userId: string | null,
  success: boolean,
  metadata?: Record<string, any>
): Promise<void> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await createAuditLog({
    userId: userId || undefined,
    action: success ? 'login_success' : 'login_failed',
    ipAddress: ip,
    userAgent,
    metadata,
  });
}

export async function log2FAEvent(
  userId: string,
  action: '2fa_enabled' | '2fa_disabled' | '2fa_verified' | '2fa_failed',
  request?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const ip = request?.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request?.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request?.headers.get('user-agent') || 'unknown';

  await createAuditLog({
    userId,
    action,
    ipAddress: ip,
    userAgent,
    metadata,
  });
}

export async function logVerificationEvent(
  userId: string,
  action: 'verification_submitted' | 'verification_approved' | 'verification_rejected',
  request?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const ip = request?.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request?.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request?.headers.get('user-agent') || 'unknown';

  await createAuditLog({
    userId,
    action,
    ipAddress: ip,
    userAgent,
    metadata,
  });
}
