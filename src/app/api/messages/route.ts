import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, user } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const messageId = parseInt(id);
      if (isNaN(messageId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const message = await db.select()
        .from(messages)
        .where(
          and(
            eq(messages.id, messageId),
            or(
              eq(messages.senderId, session.user.id),
              eq(messages.recipientId, session.user.id)
            )
          )
        )
        .limit(1);

      if (message.length === 0) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      return NextResponse.json(message[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const type = searchParams.get('type');

    let whereCondition;
    
    if (type === 'inbox') {
      whereCondition = eq(messages.recipientId, session.user.id);
    } else if (type === 'sent') {
      whereCondition = eq(messages.senderId, session.user.id);
    } else {
      whereCondition = or(
        eq(messages.senderId, session.user.id),
        eq(messages.recipientId, session.user.id)
      );
    }

    const results = await db.select()
      .from(messages)
      .where(whereCondition)
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, subject, bodyText } = body;

    if ('senderId' in body || 'sender_id' in body) {
      return NextResponse.json({ 
        error: "Sender ID cannot be provided in request body",
        code: "SENDER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    if (!recipientId) {
      return NextResponse.json({ 
        error: "Recipient ID is required",
        code: "MISSING_RECIPIENT_ID" 
      }, { status: 400 });
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json({ 
        error: "Subject is required",
        code: "MISSING_SUBJECT" 
      }, { status: 400 });
    }

    if (!bodyText || !bodyText.trim()) {
      return NextResponse.json({ 
        error: "Message body is required",
        code: "MISSING_BODY" 
      }, { status: 400 });
    }

    const recipientExists = await db.select()
      .from(user)
      .where(eq(user.id, recipientId))
      .limit(1);

    if (recipientExists.length === 0) {
      return NextResponse.json({ 
        error: "Recipient user not found",
        code: "RECIPIENT_NOT_FOUND" 
      }, { status: 400 });
    }

    const newMessage = await db.insert(messages)
      .values({
        senderId: session.user.id,
        recipientId: recipientId.trim(),
        subject: subject.trim(),
        body: bodyText.trim(),
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const messageId = parseInt(id);

    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (existingMessage[0].recipientId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Only the recipient can mark a message as read',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();

    if ('read' in body && typeof body.read !== 'boolean') {
      return NextResponse.json({ 
        error: "Read status must be a boolean",
        code: "INVALID_READ_STATUS" 
      }, { status: 400 });
    }

    const updated = await db.update(messages)
      .set({
        read: body.read ?? true,
        updatedAt: new Date()
      })
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}