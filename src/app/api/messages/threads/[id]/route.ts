import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageThreads, threadMessages, messageAttachments, listings, user } from '@/db/schema';
import { eq, and, ne, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Parse thread ID from dynamic route parameter
    const { id: threadIdParam } = await params;
    const threadId = parseInt(threadIdParam);

    // Validate thread ID
    if (!threadIdParam || isNaN(threadId)) {
      return NextResponse.json({ 
        error: 'Valid thread ID is required',
        code: 'INVALID_THREAD_ID' 
      }, { status: 400 });
    }

    // Fetch thread
    const thread = await db.select()
      .from(messageThreads)
      .where(eq(messageThreads.id, threadId))
      .limit(1);

    if (thread.length === 0) {
      return NextResponse.json({ 
        error: 'Thread not found',
        code: 'THREAD_NOT_FOUND' 
      }, { status: 404 });
    }

    const threadData = thread[0];

    // Verify user has access (must be buyer OR seller)
    if (threadData.buyerId !== session.user.id && threadData.sellerId !== session.user.id) {
      return NextResponse.json({ 
        error: 'You do not have access to this thread',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Determine if current user is buyer or seller
    const isBuyer = threadData.buyerId === session.user.id;

    // Fetch listing details
    const listingData = await db.select()
      .from(listings)
      .where(eq(listings.id, threadData.listingId))
      .limit(1);

    // Fetch buyer info
    const buyerData = await db.select()
      .from(user)
      .where(eq(user.id, threadData.buyerId))
      .limit(1);

    // Fetch seller info
    const sellerData = await db.select()
      .from(user)
      .where(eq(user.id, threadData.sellerId))
      .limit(1);

    // Fetch all messages for this thread with sender info
    const messagesData = await db.select({
      id: threadMessages.id,
      threadId: threadMessages.threadId,
      senderId: threadMessages.senderId,
      messageBody: threadMessages.messageBody,
      isRead: threadMessages.isRead,
      createdAt: threadMessages.createdAt,
      updatedAt: threadMessages.updatedAt,
      senderId_user: user.id,
      senderName: user.name,
      senderEmail: user.email,
      senderImage: user.image,
    })
      .from(threadMessages)
      .leftJoin(user, eq(threadMessages.senderId, user.id))
      .where(eq(threadMessages.threadId, threadId))
      .orderBy(threadMessages.createdAt);

    // Fetch attachments for all messages
    const messageIds = messagesData.map(m => m.id);
    let attachmentsData: any[] = [];
    
    if (messageIds.length > 0) {
      attachmentsData = await db.select()
        .from(messageAttachments)
        .where(
          or(...messageIds.map(id => eq(messageAttachments.messageId, id)))
        );
    }

    // Group attachments by message ID
    const attachmentsByMessage = attachmentsData.reduce((acc, attachment) => {
      if (!acc[attachment.messageId]) {
        acc[attachment.messageId] = [];
      }
      acc[attachment.messageId].push({
        id: attachment.id,
        messageId: attachment.messageId,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        createdAt: attachment.createdAt,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Format messages with sender info and attachments
    const messages = messagesData.map(msg => ({
      id: msg.id,
      threadId: msg.threadId,
      senderId: msg.senderId,
      messageBody: msg.messageBody,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: {
        id: msg.senderId_user,
        name: msg.senderName,
        email: msg.senderEmail,
        image: msg.senderImage,
      },
      attachments: attachmentsByMessage[msg.id] || [],
    }));

    // Mark messages as read for current user
    if (isBuyer) {
      // Mark seller's messages as read (messages where sender is NOT the buyer)
      await db.update(threadMessages)
        .set({ 
          isRead: true,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(threadMessages.threadId, threadId),
            ne(threadMessages.senderId, threadData.buyerId)
          )
        );
    } else {
      // Mark buyer's messages as read (messages where sender is NOT the seller)
      await db.update(threadMessages)
        .set({ 
          isRead: true,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(threadMessages.threadId, threadId),
            ne(threadMessages.senderId, threadData.sellerId)
          )
        );
    }

    // Reset unread count for current user
    if (isBuyer) {
      await db.update(messageThreads)
        .set({ 
          buyerUnreadCount: 0,
          updatedAt: new Date()
        })
        .where(eq(messageThreads.id, threadId));
    } else {
      await db.update(messageThreads)
        .set({ 
          sellerUnreadCount: 0,
          updatedAt: new Date()
        })
        .where(eq(messageThreads.id, threadId));
    }

    // Prepare response
    const response = {
      id: threadData.id,
      listingId: threadData.listingId,
      buyerId: threadData.buyerId,
      sellerId: threadData.sellerId,
      subject: threadData.subject,
      lastMessageAt: threadData.lastMessageAt,
      buyerUnreadCount: isBuyer ? 0 : threadData.buyerUnreadCount,
      sellerUnreadCount: isBuyer ? threadData.sellerUnreadCount : 0,
      createdAt: threadData.createdAt,
      updatedAt: threadData.updatedAt,
      listing: listingData.length > 0 ? {
        id: listingData[0].id,
        title: listingData[0].title,
        status: listingData[0].status,
        askingPrice: listingData[0].askingPrice,
        businessType: listingData[0].businessType,
        sellerId: listingData[0].sellerId,
      } : null,
      buyer: buyerData.length > 0 ? {
        id: buyerData[0].id,
        name: buyerData[0].name,
        email: buyerData[0].email,
        image: buyerData[0].image,
      } : null,
      seller: sellerData.length > 0 ? {
        id: sellerData[0].id,
        name: sellerData[0].name,
        email: sellerData[0].email,
        image: sellerData[0].image,
      } : null,
      messages,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET thread error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}