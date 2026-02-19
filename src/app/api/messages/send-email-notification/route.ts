import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messageThreads, user, listings } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Email Notification API for new messages
 * This endpoint is called internally when a new message is sent
 * to notify the recipient via email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadId, messageBody, senderName } = body;

    if (!threadId || !messageBody || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, messageBody, senderName' },
        { status: 400 }
      );
    }

    // Fetch thread details
    const thread = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.id, threadId))
      .limit(1);

    if (thread.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const threadData = thread[0];

    // Fetch listing details
    const listing = await db
      .select()
      .from(listings)
      .where(eq(listings.id, threadData.listingId))
      .limit(1);

    // Fetch buyer details
    const buyer = await db
      .select()
      .from(user)
      .where(eq(user.id, threadData.buyerId))
      .limit(1);

    // Fetch seller details
    const seller = await db
      .select()
      .from(user)
      .where(eq(user.id, threadData.sellerId))
      .limit(1);

    if (buyer.length === 0 || seller.length === 0) {
      return NextResponse.json(
        { error: 'Buyer or seller not found' },
        { status: 404 }
      );
    }

    // Determine recipient (opposite of sender)
    const isSenderBuyer = senderName === buyer[0].name;
    const recipient = isSenderBuyer ? seller[0] : buyer[0];
    const senderUser = isSenderBuyer ? buyer[0] : seller[0];

    // Email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .message-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #F18F01; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #F18F01; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Connect Capitals</h1>
      <p style="margin: 10px 0 0 0;">New Message Notification</p>
    </div>
    <div class="content">
      <h2>You have a new message!</h2>
      <p><strong>From:</strong> ${senderName}</p>
      ${listing.length > 0 ? `<p><strong>About:</strong> ${listing[0].title}</p>` : ''}
      <div class="message-box">
        <p style="margin: 0; white-space: pre-wrap;">${messageBody}</p>
      </div>
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages/${threadId}" class="button">View Message</a>
      </p>
      <p style="font-size: 14px; color: #666;">
        You can reply to this message by visiting your Connect Capitals inbox.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Connect Capitals. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #1A3E6D; text-decoration: none;">Visit Connect Capitals</a> |
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=settings" style="color: #1A3E6D; text-decoration: none;">Notification Settings</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailText = `
New Message from ${senderName}

Hi ${recipient.name},

You have received a new message from ${senderName} regarding:

${listing.length > 0 ? listing[0].title : 'Listing'}
${listing.length > 0 && listing[0].businessType ? `Type: ${listing[0].businessType}` : ''}
${listing.length > 0 && listing[0].askingPrice ? `Asking Price: $${listing[0].askingPrice.toLocaleString()}` : ''}

Message:
"${messageBody}"

View and reply to this message:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages/${threadId}

View all your messages:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages

---
This is an automated notification from OptiFirm.
To manage your email preferences, visit your Account Settings.

© ${new Date().getFullYear()} OptiFirm. All rights reserved.
    `;

    // In production, integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll log the email
    console.log('=== EMAIL NOTIFICATION ===');
    console.log('To:', recipient.email);
    console.log('From:', 'notifications@optifirm.com');
    console.log('Subject:', `New message from ${senderName} on OptiFirm`);
    console.log('HTML:', emailHtml);
    console.log('Text:', emailText);
    console.log('========================');

    // Example integration with an email service:
    /*
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OptiFirm <notifications@optifirm.com>',
        to: recipient.email,
        subject: `New message from ${senderName} on OptiFirm`,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Email notification prepared (logged to console)',
      recipient: recipient.email,
    }, { status: 200 });

  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}