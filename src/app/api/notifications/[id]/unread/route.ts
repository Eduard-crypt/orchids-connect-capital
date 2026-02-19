import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    // Verify ownership
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db
      .update(notifications)
      .set({ 
        isRead: false, 
        readAt: null,
        updatedAt: new Date() 
      })
      .where(eq(notifications.id, notificationId));

    const updated = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error('Error marking as unread:', error);
    return NextResponse.json(
      { error: 'Failed to mark as unread' },
      { status: 500 }
    );
  }
}
