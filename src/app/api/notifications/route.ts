import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const sessionResult = await db.query.session.findFirst({
      where: (session, { eq }) => eq(session.token, token),
      with: { user: true },
    });

    if (!sessionResult || new Date(sessionResult.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const userId = sessionResult.userId;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter') || 'all'; // 'all', 'unread', 'read'

    let whereClause = eq(notifications.userId, userId);
    
    if (filter === 'unread') {
      whereClause = and(eq(notifications.userId, userId), eq(notifications.isRead, false)) as any;
    } else if (filter === 'read') {
      whereClause = and(eq(notifications.userId, userId), eq(notifications.isRead, true)) as any;
    }

    const userNotifications = await db.query.notifications.findMany({
      where: whereClause,
      orderBy: [desc(notifications.createdAt)],
      limit,
      offset,
    });

    const totalCount = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .then(rows => rows.length);

    return NextResponse.json({
      notifications: userNotifications,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
