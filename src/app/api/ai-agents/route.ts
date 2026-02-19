import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiAgents } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single agent query
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: "Valid ID is required",
            code: "INVALID_ID" 
          },
          { status: 400 }
        );
      }

      const agent = await db.select()
        .from(aiAgents)
        .where(eq(aiAgents.id, parseInt(id)))
        .limit(1);

      if (agent.length === 0) {
        return NextResponse.json(
          { 
            error: 'AI agent not found',
            code: "AGENT_NOT_FOUND" 
          },
          { status: 404 }
        );
      }

      // Parse features JSON string to array
      const agentData = {
        ...agent[0],
        features: JSON.parse(agent[0].features),
        isPopular: Boolean(agent[0].isPopular)
      };

      return NextResponse.json(agentData, { status: 200 });
    }

    // List query with pagination and filters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const category = searchParams.get('category');
    const isPopularParam = searchParams.get('isPopular');

    // Validate pagination parameters
    let limit = 20; // default
    let offset = 0; // default

    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { 
            error: "Limit must be a positive integer",
            code: "INVALID_LIMIT" 
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100); // max 100
    }

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { 
            error: "Offset must be a non-negative integer",
            code: "INVALID_OFFSET" 
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Build query with filters
    let query = db.select().from(aiAgents);

    const conditions = [];

    if (category) {
      conditions.push(eq(aiAgents.category, category));
    }

    if (isPopularParam !== null) {
      const isPopularValue = isPopularParam === 'true' ? 1 : 0;
      conditions.push(eq(aiAgents.isPopular, isPopularValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const agents = await query
      .orderBy(desc(aiAgents.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse features and convert isPopular for all agents
    const agentsData = agents.map(agent => ({
      ...agent,
      features: JSON.parse(agent.features),
      isPopular: Boolean(agent.isPopular)
    }));

    return NextResponse.json(agentsData, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}