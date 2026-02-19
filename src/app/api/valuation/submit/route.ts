import { NextRequest, NextResponse } from 'next/server';
import { sendValuationToTeam, sendValuationConfirmationToCustomer } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    console.log('📋 Received valuation form submission');
    
    // Parse request body
    const formData = await req.json();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.businessName || !formData.industry || !formData.revenueRange) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get submission metadata
    const submissionTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Get IP address for team notification
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'Unknown';

    console.log('📧 Sending emails...');
    console.log('📧 Customer:', formData.email);
    console.log('📧 Business:', formData.businessName);

    // Send both emails in parallel
    const [teamEmailSuccess, customerEmailSuccess] = await Promise.all([
      sendValuationToTeam(formData, submissionTime, ipAddress),
      sendValuationConfirmationToCustomer(formData.email, formData.name)
    ]);

    // Check if emails were sent successfully
    if (!teamEmailSuccess) {
      console.error('❌ Failed to send team notification email');
      return NextResponse.json(
        { 
          success: false, 
          message: 'We couldn\'t process your submission at the moment. Please try again shortly.',
          error: 'team_email_failed'
        },
        { status: 500 }
      );
    }

    if (!customerEmailSuccess) {
      console.error('❌ Failed to send customer confirmation email');
      return NextResponse.json(
        { 
          success: false, 
          message: 'We couldn\'t process your submission at the moment. Please try again shortly.',
          error: 'customer_email_failed'
        },
        { status: 500 }
      );
    }

    console.log('✅ Both emails sent successfully!');
    console.log('✅ Team notification sent to: deals@connectcapitals.com');
    console.log('✅ Customer confirmation sent to:', formData.email);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Your valuation request has been submitted successfully. Check your email for confirmation.',
      data: {
        submissionTime,
        customerEmail: formData.email,
        businessName: formData.businessName
      }
    });

  } catch (error) {
    console.error('❌ Valuation submission API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'We couldn\'t process your submission at the moment. Please try again shortly.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
