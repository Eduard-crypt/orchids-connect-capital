import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgents, aiAgentDemoRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const VALID_PREFERRED_TIMES = ['morning', 'afternoon', 'evening'];
const VALID_COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Extract and validate agent ID from route params
    const agentId = params.id;
    if (!agentId || isNaN(parseInt(agentId))) {
      return NextResponse.json(
        { error: 'Valid agent ID is required', code: 'INVALID_AGENT_ID' },
        { status: 400 }
      );
    }

    const agentIdInt = parseInt(agentId);

    // Check if agent exists
    const agent = await db
      .select()
      .from(aiAgents)
      .where(eq(aiAgents.id, agentIdInt))
      .limit(1);

    if (agent.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found', code: 'AGENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { preferredDate, preferredTime, companySize, useCase } = body;

    // Validate required fields
    if (!preferredDate || typeof preferredDate !== 'string' || preferredDate.trim() === '') {
      return NextResponse.json(
        {
          error: 'preferredDate is required and must be a non-empty string',
          code: 'MISSING_PREFERRED_DATE',
        },
        { status: 400 }
      );
    }

    if (!preferredTime || typeof preferredTime !== 'string' || preferredTime.trim() === '') {
      return NextResponse.json(
        {
          error: 'preferredTime is required and must be a non-empty string',
          code: 'MISSING_PREFERRED_TIME',
        },
        { status: 400 }
      );
    }

    if (!companySize || typeof companySize !== 'string' || companySize.trim() === '') {
      return NextResponse.json(
        {
          error: 'companySize is required and must be a non-empty string',
          code: 'MISSING_COMPANY_SIZE',
        },
        { status: 400 }
      );
    }

    if (!useCase || typeof useCase !== 'string' || useCase.trim() === '') {
      return NextResponse.json(
        {
          error: 'useCase is required and must be a non-empty string',
          code: 'MISSING_USE_CASE',
        },
        { status: 400 }
      );
    }

    // Validate preferredTime value
    const trimmedPreferredTime = preferredTime.trim();
    if (!VALID_PREFERRED_TIMES.includes(trimmedPreferredTime)) {
      return NextResponse.json(
        {
          error: `preferredTime must be one of: ${VALID_PREFERRED_TIMES.join(', ')}`,
          code: 'INVALID_PREFERRED_TIME',
        },
        { status: 400 }
      );
    }

    // Validate companySize value
    const trimmedCompanySize = companySize.trim();
    if (!VALID_COMPANY_SIZES.includes(trimmedCompanySize)) {
      return NextResponse.json(
        {
          error: `companySize must be one of: ${VALID_COMPANY_SIZES.join(', ')}`,
          code: 'INVALID_COMPANY_SIZE',
        },
        { status: 400 }
      );
    }

    // Create demo request
    const newDemoRequest = await db
      .insert(aiAgentDemoRequests)
      .values({
        userId: session.user.id,
        agentId: agentIdInt,
        preferredDate: preferredDate.trim(),
        preferredTime: trimmedPreferredTime,
        companySize: trimmedCompanySize,
        useCase: useCase.trim(),
        status: 'pending',
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newDemoRequest[0], { status: 201 });
  } catch (error) {
    console.error('POST demo request error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}