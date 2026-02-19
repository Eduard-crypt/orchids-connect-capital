import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { desc } from 'drizzle-orm';

// POST /api/contact - Create new contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, interestType, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !interestType || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate interest type
    const validInterestTypes = [
      'buying-online',
      'selling-online',
      'ai-agent',
      'trustbridge',
      'education',
      'general'
    ];
    if (!validInterestTypes.includes(interestType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid interest type' },
        { status: 400 }
      );
    }

    // Save to database (don't include id, createdAt, updatedAt - let DB handle them)
    const [contactMessage] = await db.insert(contactMessages).values({
      firstName,
      lastName,
      email,
      phone: phone || null,
      interestType,
      message,
      status: 'new',
    }).returning();

    console.log('📝 Contact message saved to database:', contactMessage.id);

    // Send email notifications (to support team and customer auto-reply)
    let emailSuccess = true;
    let emailErrors: string[] = [];

    try {
      // Send to support team
      console.log('📤 Sending notification to support team...');
      const supportResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/contact-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'support@connectcapitals.com',
          contactData: {
            firstName,
            lastName,
            email,
            phone,
            interestType,
            message,
            id: contactMessage.id
          }
        })
      });

      const supportData = await supportResponse.json();
      if (!supportData.success) {
        emailErrors.push('Support notification failed');
        emailSuccess = false;
        console.error('❌ Support notification failed:', supportData);
      } else {
        console.log('✅ Support notification sent successfully');
      }

    } catch (emailError) {
      console.error('❌ Failed to send support notification:', emailError);
      emailErrors.push('Support notification error');
      emailSuccess = false;
    }

    try {
      // Send auto-reply to customer
      console.log('📤 Sending auto-reply to customer...');
      const autoReplyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/contact-auto-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          firstName,
          interestType
        })
      });

      const autoReplyData = await autoReplyResponse.json();
      if (!autoReplyData.success) {
        emailErrors.push('Auto-reply failed');
        emailSuccess = false;
        console.error('❌ Auto-reply failed:', autoReplyData);
      } else {
        console.log('✅ Auto-reply sent successfully');
      }

    } catch (emailError) {
      console.error('❌ Failed to send auto-reply:', emailError);
      emailErrors.push('Auto-reply error');
      emailSuccess = false;
    }

    // Return response
    if (emailSuccess) {
      return NextResponse.json({ 
        success: true,
        message: 'Message sent successfully',
        data: contactMessage 
      }, { status: 201 });
    } else {
      // Saved to DB but email failed
      return NextResponse.json({ 
        success: false,
        error: 'Message saved but email delivery failed',
        details: emailErrors.join(', '),
        data: contactMessage 
      }, { status: 207 }); // 207 Multi-Status
    }

  } catch (error) {
    console.error('❌ Error creating contact message:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create contact message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/contact - Get all contact messages (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    let query = db.select().from(contactMessages);

    // Filter by status if provided
    if (status) {
      query = query.where(({ status: statusCol }) => statusCol === status) as any;
    }

    const messages = await query
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}