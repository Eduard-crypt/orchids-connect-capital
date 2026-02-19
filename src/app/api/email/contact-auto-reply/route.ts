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

console.log('📧 Contact Form Email Configuration:', {
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  user: EMAIL_CONFIG.auth.user,
  from: FROM_EMAIL
});

// POST /api/email/contact-auto-reply - Send auto-reply to customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, firstName, interestType } = body;

    // Format interest type for display
    const interestTypeMap: Record<string, string> = {
      'buying-online': 'buying an online business',
      'selling-online': 'selling an online business',
      'ai-agent': 'renting an AI Agent',
      'trustbridge': 'TrustBridge services',
      'education': 'our educational programs',
      'general': 'contacting us'
    };

    const interestLabel = interestTypeMap[interestType] || 'reaching out';

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Connect Capitals</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F2F4F7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">Connect Capitals</h1>
              <p style="margin: 10px 0 0 0; color: #FFFFFF; opacity: 0.9; font-size: 14px;">Your Message Has Been Received</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                Hi ${firstName},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                Thank you for ${interestLabel}. We've received your message and our support team will get back to you shortly.
              </p>

              <p style="margin: 0 0 30px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                We typically respond to all inquiries within 24 hours during business days.
              </p>

              <!-- Info Box -->
              <div style="background-color: #F2F4F7; padding: 20px; border-left: 4px solid #F18F01; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #1A3E6D; font-size: 15px;">📞 What happens next?</p>
                <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                  <li>Our team reviews your inquiry</li>
                  <li>We'll contact you within 24 hours</li>
                  <li>We'll answer your questions and discuss next steps</li>
                </ul>
              </div>

              <p style="margin: 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                In the meantime, feel free to explore our platform and learn more about buying and selling online businesses.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://connectcapitals.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1A3E6D 0%, #F18F01 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Visit Our Website</a>
              </div>

              <p style="margin: 30px 0 0 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Connect Capitals Support Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F2F4F7; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                © ${new Date().getFullYear()} Connect Capitals. All rights reserved.
              </p>
              <p style="margin: 0; color: #6B7280; font-size: 12px;">
                <a href="https://connectcapitals.com" style="color: #1A3E6D; text-decoration: none;">Visit our website</a>
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
Thank You for Contacting Connect Capitals

Hi ${firstName},

Thank you for ${interestLabel}. We've received your message and our support team will get back to you shortly.

We typically respond to all inquiries within 24 hours during business days.

WHAT HAPPENS NEXT?
• Our team reviews your inquiry
• We'll contact you within 24 hours
• We'll answer your questions and discuss next steps

In the meantime, feel free to explore our platform and learn more about buying and selling online businesses.

Visit our website: https://connectcapitals.com

Best regards,
The Connect Capitals Support Team

---
© ${new Date().getFullYear()} Connect Capitals. All rights reserved.
    `;

    console.log('📧 Sending auto-reply to customer:', to);

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Send email
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: to,
      subject: 'Thank you for contacting Connect Capitals',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Auto-reply email SENT SUCCESSFULLY!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 To:', to);

    return NextResponse.json({ 
      success: true,
      message: 'Auto-reply email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Auto-reply email FAILED!');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send auto-reply email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}