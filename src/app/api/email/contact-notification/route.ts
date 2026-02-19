import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// SMTP Configuration for Contact Form - Uses support@connectcapitals.com
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL for port 465
  auth: {
    user: process.env.CONTACT_SMTP_USER || process.env.SMTP_USER || 'support@connectcapitals.com',
    pass: process.env.CONTACT_SMTP_PASSWORD || process.env.SMTP_PASSWORD || '',
  },
};

const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'support@connectcapitals.com';
const FROM_NAME = 'Connect Capitals Support';
const TO_EMAIL = 'support@connectcapitals.com';

console.log('📧 Contact Form Email Configuration:', {
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  user: EMAIL_CONFIG.auth.user,
  from: FROM_EMAIL,
  to: TO_EMAIL
});

// POST /api/email/contact-notification - Send notification to support team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, contactData } = body;

    const { firstName, lastName, email, phone, interestType, message, id } = contactData;

    // Format interest type for display
    const interestTypeMap: Record<string, string> = {
      'buying-online': 'Buying an Online Business',
      'selling-online': 'Selling an Online Business',
      'ai-agent': 'Rent an AI Agent',
      'trustbridge': 'TrustBridge Services',
      'education': 'Educational Programs',
      'general': 'General Inquiry'
    };

    const interestLabel = interestTypeMap[interestType] || interestType;
    const submissionDate = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long'
    });

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F2F4F7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">🔔 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; color: #FFFFFF; opacity: 0.9; font-size: 14px;">Connect Capitals Support</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="background-color: #F2F4F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 12px 0;"><strong style="color: #1A3E6D;">Submission ID:</strong> #${id}</p>
                <p style="margin: 0 0 12px 0;"><strong style="color: #1A3E6D;">Date & Time:</strong> ${submissionDate}</p>
                <p style="margin: 0 0 12px 0;"><strong style="color: #1A3E6D;">Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 0 0 12px 0;"><strong style="color: #1A3E6D;">Email:</strong> <a href="mailto:${email}" style="color: #F18F01; text-decoration: none;">${email}</a></p>
                ${phone ? `<p style="margin: 0 0 12px 0;"><strong style="color: #1A3E6D;">Phone:</strong> ${phone}</p>` : ''}
                <p style="margin: 0;"><strong style="color: #1A3E6D;">Interest:</strong> ${interestLabel}</p>
              </div>

              <div style="margin: 20px 0;">
                <h3 style="color: #1A3E6D; margin: 0 0 12px 0;">Message:</h3>
                <div style="background-color: #F9F9F9; padding: 20px; border-left: 4px solid #F18F01; border-radius: 4px; line-height: 1.6;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>

              <!-- Action Required -->
              <div style="margin-top: 30px; padding: 20px; background-color: #FFF3E0; border-left: 4px solid #F18F01; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #1A3E6D;">⚡ Action Required:</p>
                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
                  Please respond to <strong>${firstName} ${lastName}</strong> at <strong>${email}</strong> within 24 hours regarding their inquiry about "${interestLabel}".
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F2F4F7; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                This message was sent from the Connect Capitals contact form.
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 12px;">
                © ${new Date().getFullYear()} Connect Capitals. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Plain Text Email
    const textContent = `
NEW CONTACT FORM SUBMISSION
Connect Capitals Support

═══════════════════════════════════════════════════════════

SUBMISSION DETAILS
• ID: #${id}
• Date & Time: ${submissionDate}
• Name: ${firstName} ${lastName}
• Email: ${email}
${phone ? `• Phone: ${phone}` : ''}
• Interest: ${interestLabel}

MESSAGE:
${message}

═══════════════════════════════════════════════════════════

⚡ ACTION REQUIRED:
Please respond to ${firstName} ${lastName} at ${email} within 24 hours regarding their inquiry about "${interestLabel}".

---
This message was sent from the Connect Capitals contact form.
© ${new Date().getFullYear()} Connect Capitals. All rights reserved.
    `;

    console.log('📧 Sending contact notification to support team:', to || FROM_EMAIL);

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Send email
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: to || FROM_EMAIL,
      subject: `🔔 New Contact: ${interestLabel} - ${firstName} ${lastName}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Contact notification email SENT SUCCESSFULLY!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 To:', to || FROM_EMAIL);

    return NextResponse.json({ 
      success: true,
      message: 'Notification email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Contact notification email FAILED!');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send notification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}