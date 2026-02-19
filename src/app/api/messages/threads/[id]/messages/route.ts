import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageThreads, threadMessages, messageAttachments, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Validate thread ID
    const threadId = params.id;
    if (!threadId || isNaN(parseInt(threadId))) {
      return NextResponse.json(
        { error: 'Valid thread ID is required', code: 'INVALID_THREAD_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, attachments } = body;

    // Validate required field: message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate attachments if provided
    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) {
        return NextResponse.json(
          { error: 'Attachments must be an array', code: 'INVALID_ATTACHMENTS_FORMAT' },
          { status: 400 }
        );
      }

      for (const attachment of attachments) {
        if (!attachment.fileName || typeof attachment.fileName !== 'string') {
          return NextResponse.json(
            { error: 'Each attachment must have a valid fileName', code: 'INVALID_ATTACHMENT_FILENAME' },
            { status: 400 }
          );
        }
        if (!attachment.fileUrl || typeof attachment.fileUrl !== 'string') {
          return NextResponse.json(
            { error: 'Each attachment must have a valid fileUrl', code: 'INVALID_ATTACHMENT_FILEURL' },
            { status: 400 }
          );
        }
        if (!attachment.fileType || typeof attachment.fileType !== 'string') {
          return NextResponse.json(
            { error: 'Each attachment must have a valid fileType', code: 'INVALID_ATTACHMENT_FILETYPE' },
            { status: 400 }
          );
        }
        if (!attachment.fileSize || typeof attachment.fileSize !== 'number' || attachment.fileSize <= 0) {
          return NextResponse.json(
            { error: 'Each attachment must have a valid positive fileSize', code: 'INVALID_ATTACHMENT_FILESIZE' },
            { status: 400 }
          );
        }
      }
    }

    // Fetch thread to verify it exists
    const thread = await db.select()
      .from(messageThreads)
      .where(eq(messageThreads.id, parseInt(threadId)))
      .limit(1);

    if (thread.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found', code: 'THREAD_NOT_FOUND' },
        { status: 404 }
      );
    }

    const threadData = thread[0];

    // Verify user has access (must be buyer or seller)
    const userId = session.user.id;
    const isBuyer = userId === threadData.buyerId;
    const isSeller = userId === threadData.sellerId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You are not a participant in this thread', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Determine recipient
    const isRecipientSeller = isBuyer;
    
    // Insert new message
    const now = new Date();
    const newMessage = await db.insert(threadMessages)
      .values({
        threadId: parseInt(threadId),
        senderId: userId,
        messageBody: message.trim(),
        isRead: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const createdMessage = newMessage[0];

    // Insert attachments if provided
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map((attachment: any) => ({
        messageId: createdMessage.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        createdAt: now,
      }));

      await db.insert(messageAttachments)
        .values(attachmentValues);
    }

    // Update thread
    const updateData: any = {
      lastMessageAt: now,
      updatedAt: now,
    };

    if (isRecipientSeller) {
      // Sender is buyer, increment seller unread count
      updateData.sellerUnreadCount = threadData.sellerUnreadCount + 1;
    } else {
      // Sender is seller, increment buyer unread count
      updateData.buyerUnreadCount = threadData.buyerUnreadCount + 1;
    }

    await db.update(messageThreads)
      .set(updateData)
      .where(eq(messageThreads.id, parseInt(threadId)));

    // Fetch created message with sender and attachments
    const messageWithDetails = await db.select({
      id: threadMessages.id,
      threadId: threadMessages.threadId,
      senderId: threadMessages.senderId,
      messageBody: threadMessages.messageBody,
      isRead: threadMessages.isRead,
      createdAt: threadMessages.createdAt,
      updatedAt: threadMessages.updatedAt,
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
      .from(threadMessages)
      .leftJoin(user, eq(threadMessages.senderId, user.id))
      .where(eq(threadMessages.id, createdMessage.id))
      .limit(1);

    const attachmentsList = await db.select()
      .from(messageAttachments)
      .where(eq(messageAttachments.messageId, createdMessage.id));

    const response = {
      ...messageWithDetails[0],
      attachments: attachmentsList,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}