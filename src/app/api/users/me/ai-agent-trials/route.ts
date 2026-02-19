import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgentTrials, aiAgents } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const statusParam = searchParams.get('status');

    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter. Must be a positive integer.',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter. Must be a non-negative integer.',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    const validStatuses = ['active', 'expired', 'cancelled'];
    if (statusParam && !validStatuses.includes(statusParam)) {
      return NextResponse.json({ 
        error: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    let conditions = [eq(aiAgentTrials.userId, session.user.id)];
    
    if (statusParam) {
      conditions.push(eq(aiAgentTrials.status, statusParam));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    const trials = await db
      .select({
        trial: aiAgentTrials,
        agent: aiAgents,
      })
      .from(aiAgentTrials)
      .leftJoin(aiAgents, eq(aiAgentTrials.agentId, aiAgents.id))
      .where(whereCondition)
      .orderBy(desc(aiAgentTrials.createdAt))
      .limit(limit)
      .offset(offset);

    const enrichedTrials = trials.map(({ trial, agent }) => ({
      id: trial.id,
      userId: trial.userId,
      agentId: trial.agentId,
      status: trial.status,
      startedAt: trial.startedAt,
      expiresAt: trial.expiresAt,
      createdAt: trial.createdAt,
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        tagline: agent.tagline,
        imageUrl: agent.imageUrl,
        category: agent.category,
      } : null,
    }));

    return NextResponse.json(enrichedTrials, { status: 200 });

  } catch (error) {
    console.error('GET /api/users/me/ai-agent-trials error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}