import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageThreads, threadMessages, messageAttachments, listings, user } from '@/db/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const threads = await db
      .select()
      .from(messageThreads)
      .where(
        or(
          eq(messageThreads.buyerId, session.user.id),
          eq(messageThreads.sellerId, session.user.id)
        )
      )
      .orderBy(desc(messageThreads.lastMessageAt))
      .limit(limit)
      .offset(offset);

    // Return empty array if no threads
    if (threads.length === 0) {
      return NextResponse.json([]);
    }

    const enrichedThreads = await Promise.all(
      threads.map(async (thread) => {
        // Fetch listing
        const listing = await db
          .select()
          .from(listings)
          .where(eq(listings.id, thread.listingId))
          .limit(1);

        // Fetch buyer
        const buyer = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(user)
          .where(eq(user.id, thread.buyerId))
          .limit(1);

        // Fetch seller
        const seller = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(user)
          .where(eq(user.id, thread.sellerId))
          .limit(1);

        // Fetch last message
        const lastMessage = await db
          .select()
          .from(threadMessages)
          .where(eq(threadMessages.threadId, thread.id))
          .orderBy(desc(threadMessages.createdAt))
          .limit(1);

        const isBuyer = thread.buyerId === session.user.id;
        const unreadCount = isBuyer ? thread.buyerUnreadCount : thread.sellerUnreadCount;

        const otherParticipant = isBuyer ? (seller[0] || null) : (buyer[0] || null);

        const lastMessagePreview = lastMessage.length > 0
          ? {
              id: lastMessage[0].id,
              messageBody: lastMessage[0].messageBody.length > 100
                ? lastMessage[0].messageBody.substring(0, 100) + '...'
                : lastMessage[0].messageBody,
              senderId: lastMessage[0].senderId,
              createdAt: lastMessage[0].createdAt,
            }
          : null;

        return {
          id: thread.id,
          listingId: thread.listingId,
          buyerId: thread.buyerId,
          sellerId: thread.sellerId,
          subject: thread.subject,
          lastMessageAt: thread.lastMessageAt,
          unreadCount,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          listing: listing.length > 0
            ? {
                id: listing[0].id,
                title: listing[0].title,
                status: listing[0].status,
                askingPrice: listing[0].askingPrice,
                businessType: listing[0].businessType,
              }
            : null,
          otherParticipant,
          lastMessage: lastMessagePreview,
        };
      })
    );

    return NextResponse.json(enrichedThreads);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, message, attachments } = body;

    if (!listingId || typeof listingId !== 'number') {
      return NextResponse.json(
        { error: 'Valid listingId is required', code: 'INVALID_LISTING_ID' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }

    if (attachments && !Array.isArray(attachments)) {
      return NextResponse.json(
        { error: 'Attachments must be an array', code: 'INVALID_ATTACHMENTS' },
        { status: 400 }
      );
    }

    if (attachments) {
      for (const attachment of attachments) {
        if (!attachment.fileName || !attachment.fileUrl || !attachment.fileType || typeof attachment.fileSize !== 'number') {
          return NextResponse.json(
            { error: 'Each attachment must have fileName, fileUrl, fileType, and fileSize', code: 'INVALID_ATTACHMENT_FORMAT' },
            { status: 400 }
          );
        }
      }
    }

    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found', code: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const listingData = listing[0];

    if (session.user.id === listingData.sellerId) {
      return NextResponse.json(
        { error: 'Sellers cannot initiate threads with their own listings', code: 'SELLER_CANNOT_MESSAGE_OWN_LISTING' },
        { status: 400 }
      );
    }

    const buyerId = session.user.id;
    const sellerId = listingData.sellerId;
    const subject = listingData.title;

    const existingThread = await db
      .select()
      .from(messageThreads)
      .where(
        and(
          eq(messageThreads.listingId, listingId),
          eq(messageThreads.buyerId, buyerId),
          eq(messageThreads.sellerId, sellerId)
        )
      )
      .limit(1);

    let thread;
    const now = new Date();

    if (existingThread.length > 0) {
      thread = existingThread[0];
      
      await db
        .update(messageThreads)
        .set({
          lastMessageAt: now,
          sellerUnreadCount: thread.sellerUnreadCount + 1,
          updatedAt: now,
        })
        .where(eq(messageThreads.id, thread.id));
    } else {
      const newThread = await db
        .insert(messageThreads)
        .values({
          listingId,
          buyerId,
          sellerId,
          subject,
          lastMessageAt: now,
          buyerUnreadCount: 0,
          sellerUnreadCount: 1,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      thread = newThread[0];
    }

    const newMessage = await db
      .insert(threadMessages)
      .values({
        threadId: thread.id,
        senderId: session.user.id,
        messageBody: message.trim(),
        isRead: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const messageId = newMessage[0].id;

    let attachmentRecords: any[] = [];
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(att => ({
        messageId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        fileSize: att.fileSize,
        createdAt: now,
      }));

      attachmentRecords = await db
        .insert(messageAttachments)
        .values(attachmentValues)
        .returning();
    }

    const sender = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    const updatedThread = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.id, thread.id))
      .limit(1);

    const response = {
      ...updatedThread[0],
      messages: [
        {
          ...newMessage[0],
          sender: sender[0],
          attachments: attachmentRecords,
        },
      ],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}