import { NextRequest } from 'next/server';

interface RateLimitConfig {
  endpoint: string;
  maxRequests?: number;
  windowMs?: number;
}

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: string | null }> {
  try {
    // Get identifier (IP address or user ID from auth header)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const identifier = ip;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rate-limit/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: config.endpoint,
        identifier,
      }),
    });

    if (!response.ok) {
      console.error('Rate limit check failed:', await response.text());
      // Allow request if rate limit check fails (fail open)
      return { allowed: true, remaining: 999, resetAt: null };
    }

    const data = await response.json();
    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetAt: data.resetAt,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request if rate limit check fails (fail open)
    return { allowed: true, remaining: 999, resetAt: null };
  }
}

export async function withRateLimit<T>(
  request: NextRequest,
  config: RateLimitConfig,
  handler: () => Promise<T>
): Promise<T> {
  const rateLimitResult = await checkRateLimit(request, config);

  if (!rateLimitResult.allowed) {
    throw new Error(`Rate limit exceeded. Try again at ${rateLimitResult.resetAt}`);
  }

  return handler();
}
