import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgentTrials, aiAgents, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get user from session token
    const sessionResult = await db
      .select({ userId: user.id })
      .from(user)
      .innerJoin(
        { session: db.select().from(db.select().from(db.query.session).as('session')).as('s') } as any,
        eq(user.id, (db.select().from(db.query.session).as('session') as any).userId)
      )
      .where(eq((db.select().from(db.query.session).as('session') as any).token, token))
      .limit(1);

    // Simpler approach - get session first
    const sessions = await db.query.session.findMany({
      where: (session, { eq }) => eq(session.token, token),
      limit: 1
    });

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const userId = sessions[0].userId;

    // Fetch user's AI agent trials/purchases
    const userAgents = await db
      .select({
        trial: aiAgentTrials,
        agent: aiAgents
      })
      .from(aiAgentTrials)
      .innerJoin(aiAgents, eq(aiAgentTrials.agentId, aiAgents.id))
      .where(eq(aiAgentTrials.userId, userId))
      .orderBy(desc(aiAgentTrials.createdAt));

    // Transform the data
    const agentsData = userAgents.map(({ trial, agent }) => ({
      ...agent,
      features: JSON.parse(agent.features),
      trial: {
        id: trial.id,
        status: trial.status,
        startedAt: trial.startedAt,
        expiresAt: trial.expiresAt,
        createdAt: trial.createdAt
      }
    }));

    return NextResponse.json(agentsData, { status: 200 });

  } catch (error) {
    console.error('GET /api/users/me/ai-agents error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
