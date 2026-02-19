import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgentDemoRequests, aiAgents } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'scheduled', 'completed', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const statusParam = searchParams.get('status');

    // Validate limit
    let limit = 20;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json({ 
          error: 'Limit must be a positive integer',
          code: 'INVALID_LIMIT' 
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 100);
    }

    // Validate offset
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json({ 
          error: 'Offset must be a non-negative integer',
          code: 'INVALID_OFFSET' 
        }, { status: 400 });
      }
      offset = parsedOffset;
    }

    // Validate status
    if (statusParam && !VALID_STATUSES.includes(statusParam)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS' 
      }, { status: 400 });
    }

    // Build query with user filter
    const whereConditions = [eq(aiAgentDemoRequests.userId, session.user.id)];
    
    if (statusParam) {
      whereConditions.push(eq(aiAgentDemoRequests.status, statusParam));
    }

    // Fetch demo requests with LEFT JOIN to ai_agents
    const results = await db
      .select({
        demoRequest: aiAgentDemoRequests,
        agent: aiAgents,
      })
      .from(aiAgentDemoRequests)
      .leftJoin(aiAgents, eq(aiAgentDemoRequests.agentId, aiAgents.id))
      .where(and(...whereConditions))
      .orderBy(desc(aiAgentDemoRequests.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform results to include nested agent object
    const formattedResults = results.map(({ demoRequest, agent }) => ({
      id: demoRequest.id,
      userId: demoRequest.userId,
      agentId: demoRequest.agentId,
      preferredDate: demoRequest.preferredDate,
      preferredTime: demoRequest.preferredTime,
      companySize: demoRequest.companySize,
      useCase: demoRequest.useCase,
      status: demoRequest.status,
      createdAt: demoRequest.createdAt,
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        tagline: agent.tagline,
        imageUrl: agent.imageUrl,
        category: agent.category,
      } : null,
    }));

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/me/demo-requests error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}