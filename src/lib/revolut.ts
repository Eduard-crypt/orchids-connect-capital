import crypto from 'crypto';

export const REVOLUT_API_VERSION = '2025-10-16';
export const REVOLUT_API_URL = process.env.REVOLUT_ENV === 'sandbox' 
  ? 'https://sandbox-merchant.revolut.com/api'
  : 'https://merchant.revolut.com/api';

export interface RevolutConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret: string;
  mode: 'sandbox' | 'production';
  merchantIban: string;
}

export const getRevolutConfig = (): RevolutConfig => {
  const mode = process.env.REVOLUT_ENV === 'sandbox' ? 'sandbox' : 'production';
  
  return {
    secretKey: process.env.REVOLUT_SECRET_KEY || '',
    publicKey: process.env.NEXT_PUBLIC_REVOLUT_PUBLIC_KEY || '',
    webhookSecret: process.env.REVOLUT_WEBHOOK_SECRET || '',
    merchantIban: process.env.MERCHANT_IBAN || '',
    mode,
  };
};

// Webhook signature verification (HMAC SHA-256)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string,
): boolean {
  try {
    // Parse signature header: "v1=<hex_signature>" or multiple: "v1=sig1,v1=sig2"
    const signatures = signature.split(',').map(s => s.trim());
    
    // Construct payload to sign: v1.{timestamp}.{raw_payload}
    const payloadToSign = `v1.${timestamp}.${payload}`;
    
    // HMAC SHA-256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadToSign)
      .digest('hex');
    
    // Check if any signature matches (for secret rotation)
    return signatures.some(sig => {
      const [version, hash] = sig.split('=');
      if (version !== 'v1' || !hash) return false;
      
      try {
        return crypto.timingSafeEqual(
          Buffer.from(hash),
          Buffer.from(expectedSignature)
        );
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Timestamp validation (5-minute tolerance to prevent replay attacks)
export function validateWebhookTimestamp(timestamp: string): boolean {
  const webhookTime = parseInt(timestamp, 10);
  if (isNaN(webhookTime)) return false;
  
  const currentTime = Date.now();
  const timeDiffMs = Math.abs(currentTime - webhookTime);
  return timeDiffMs <= 5 * 60 * 1000; // 5 minutes
}

// Rate limiting helper (prevent abuse)
export function checkRateLimit(userId: string, action: string): boolean {
  // Implement rate limiting logic here
  // Example: Use Redis or in-memory cache to track request counts
  return true;
}

// Fraud detection helpers
export function detectFraudulentActivity(
  userId: string,
  amount: number,
  ipAddress: string | null
): { isFraudulent: boolean; reason?: string } {
  // Basic fraud checks
  
  // Check for suspiciously high amounts
  if (amount > 1000000) { // $10,000
    return { isFraudulent: true, reason: 'Amount exceeds safety threshold' };
  }
  
  // Add more fraud detection rules as needed
  return { isFraudulent: false };
}

// Sanitize order reference (prevent injection)
export function sanitizeOrderReference(ref: string): string {
  return ref.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 100);
}
