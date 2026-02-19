import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgents, aiAgentTrials } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
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

    // Parse request body
    const body = await request.json();

    // Security check: Reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agent = await db
      .select()
      .from(aiAgents)
      .where(eq(aiAgents.id, agentIdInt))
      .limit(1);

    if (agent.length === 0) {
      return NextResponse.json(
        { error: 'AI agent not found', code: 'AGENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user already has an active trial for this agent
    const existingTrial = await db
      .select()
      .from(aiAgentTrials)
      .where(
        and(
          eq(aiAgentTrials.userId, session.user.id),
          eq(aiAgentTrials.agentId, agentIdInt),
          eq(aiAgentTrials.status, 'active')
        )
      )
      .limit(1);

    if (existingTrial.length > 0) {
      return NextResponse.json(
        {
          error: 'Active trial already exists for this agent',
          code: 'DUPLICATE_TRIAL',
        },
        { status: 409 }
      );
    }

    // Calculate trial dates
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create trial record
    const newTrial = await db
      .insert(aiAgentTrials)
      .values({
        userId: session.user.id,
        agentId: agentIdInt,
        status: 'active',
        startedAt: startedAt,
        expiresAt: expiresAt,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newTrial[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/ai-agents/[id]/trial error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}