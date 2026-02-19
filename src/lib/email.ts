import nodemailer from 'nodemailer';

// FROZEN SMTP CONFIGURATION - DO NOT CHANGE
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465', // SSL for port 465
  auth: {
    user: process.env.SMTP_USER || 'deals@connectcapitals.com',
    pass: process.env.SMTP_PASSWORD || '',
  },
};

const SITE_URL = process.env.FRONTEND_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://connectcapitals.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'deals@connectcapitals.com';
const FROM_NAME = process.env.FROM_NAME || 'Connect Capitals Deals Team';

// CRITICAL: Validate SMTP configuration on startup
console.log('📧 Email Service Configuration (FROZEN):', {
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: EMAIL_CONFIG.secure,
  user: EMAIL_CONFIG.auth.user,
  fromEmail: FROM_EMAIL,
  fromName: FROM_NAME,
  siteUrl: SITE_URL,
  environment: process.env.NODE_ENV
});

// Validate critical settings
if (EMAIL_CONFIG.host !== 'mail.privateemail.com') {
  console.error('❌ CRITICAL: SMTP_HOST is incorrect! Should be: mail.privateemail.com');
}
if (EMAIL_CONFIG.port !== 465) {
  console.error('❌ CRITICAL: SMTP_PORT is incorrect! Should be: 465');
}
if (!EMAIL_CONFIG.secure) {
  console.error('❌ CRITICAL: SMTP must use SSL (secure: true) with port 465');
}
if (EMAIL_CONFIG.auth.user !== 'deals@connectcapitals.com') {
  console.error('❌ CRITICAL: SMTP_USER must be the full email: deals@connectcapitals.com');
}
if (!EMAIL_CONFIG.auth.pass || EMAIL_CONFIG.auth.pass === '') {
  console.error('❌ CRITICAL: SMTP_PASSWORD is not set!');
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    // Check if SMTP is configured
    if (!EMAIL_CONFIG.host || !EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.warn('⚠️  SMTP not configured. Emails will be logged to console only.');
      return null;
    }

    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

/**
 * Send password reset email with verification code
 * RESTORED: This function was working before URL changes
 */
export async function sendResetCode(email: string, code: string): Promise<boolean> {
  console.log('📧 Attempting to send reset CODE to:', email);
  console.log('📧 Using SMTP:', {
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    from: FROM_EMAIL
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Password Reset Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #F2F4F7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">Password Reset Code</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    Your verification code is:
                  </p>

                  <!-- Verification Code -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #1A3E6D 0%, #F18F01 100%); color: #FFFFFF; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px;">
                          ${code}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0; color: #4A4A4A; font-size: 14px; line-height: 1.6; text-align: center;">
                    Enter this code to reset your password
                  </p>

                  <!-- Security Info -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #FFF3E0; border-left: 4px solid #F18F01; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; color: #4A4A4A; font-size: 14px; font-weight: 600;">
                      🔒 Security Information:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #4A4A4A; font-size: 14px; line-height: 1.6;">
                      <li>This code will expire in <strong>15 minutes</strong></li>
                      <li>This code can only be used once</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>

                  <p style="margin: 20px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, someone may be trying to access your account. Please contact our support team immediately.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #F2F4F7; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                    This email was sent by Connect Capitals Support
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

  const textContent = `
Your Password Reset Code

Your verification code is: ${code}

Enter this code to reset your password.

Security Information:
• This code will expire in 15 minutes
• This code can only be used once
• If you didn't request this, please ignore this email

If you didn't request a password reset, someone may be trying to access your account. Please contact our support team immediately.

---
This email was sent by Connect Capitals Support
© ${new Date().getFullYear()} Connect Capitals. All rights reserved.
  `;

  try {
    const transporter = getTransporter();

    // If SMTP not configured, log to console (development mode)
    if (!transporter) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 PASSWORD RESET CODE EMAIL (Development Mode - SMTP Not Configured)');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`Verification Code: ${code}`);
      console.log(`Code expires in: 15 minutes`);
      console.log('='.repeat(80) + '\n');
      
      return true;
    }

    // Send actual email using configured SMTP
    console.log('📤 Sending email via SMTP...');
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Your Password Reset Code - Connect Capitals',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Password reset code email SENT SUCCESSFULLY!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Recipient:', email);
    console.log('📡 Response:', info.response);
    console.log('✉️  Email accepted by SMTP server:', EMAIL_CONFIG.host);
    
    return true;

  } catch (error) {
    console.error('❌ ❌ ❌ PASSWORD RESET CODE EMAIL FAILED! ❌ ❌ ❌');
    console.error('📧 Failed to send to:', email);
    console.error('🌐 SMTP Host:', EMAIL_CONFIG.host);
    console.error('🔌 SMTP Port:', EMAIL_CONFIG.port);
    console.error('🔒 SSL Enabled:', EMAIL_CONFIG.secure);
    console.error('👤 SMTP User:', EMAIL_CONFIG.auth.user);
    console.error('📨 From Email:', FROM_EMAIL);
    
    if (error instanceof Error) {
      console.error('❌ Error Message:', error.message);
      console.error('📋 Error Stack:', error.stack);
    } else {
      console.error('❌ Error Details:', error);
    }
    
    // DO NOT throw - return false so API can handle gracefully
    return false;
  }
}

/**
 * Send password reset email with token link
 * RESTORED: This function was working before URL changes
 * PRODUCTION URL: https://connectcapitals.com/reset-password
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> {
  // CRITICAL: Production URL with token
  const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  console.log('📧 Attempting to send reset TOKEN email to:', email);
  console.log('🔗 Reset URL:', resetUrl);
  console.log('📧 Using SMTP:', {
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    from: FROM_EMAIL
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Connect Capitals</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #F2F4F7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    Hi ${name || 'there'},
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    You requested to reset your password for your Connect Capitals account. Click the button below to create a new password:
                  </p>

                  <!-- Reset Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1A3E6D 0%, #F18F01 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0; color: #4A4A4A; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  
                  <p style="margin: 0 0 20px 0; padding: 12px; background-color: #F2F4F7; border-radius: 4px; word-break: break-all; font-size: 12px; color: #1A3E6D;">
                    ${resetUrl}
                  </p>

                  <!-- Security Info -->
                  <div style="margin: 30px 0; padding: 16px; background-color: #FFF3E0; border-left: 4px solid #F18F01; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; color: #4A4A4A; font-size: 14px; font-weight: 600;">
                      🔒 Security Information:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #4A4A4A; font-size: 14px; line-height: 1.6;">
                      <li>This link will expire in <strong>1 hour</strong></li>
                      <li>This link can only be used once</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>

                  <p style="margin: 20px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, someone may be trying to access your account. Please contact our support team immediately if you suspect unauthorized access.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #F2F4F7; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                    This email was sent by Connect Capitals Support
                  </p>
                  <p style="margin: 0; color: #6B7280; font-size: 12px;">
                    © ${new Date().getFullYear()} Connect Capitals. All rights reserved.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #6B7280; font-size: 12px;">
                    <a href="${SITE_URL}" style="color: #1A3E6D; text-decoration: none;">Visit Connect Capitals</a> |
                    <a href="${SITE_URL}/privacy-policy" style="color: #1A3E6D; text-decoration: none;">Privacy Policy</a>
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

  const textContent = `
Reset Your Password - Connect Capitals

Hi ${name || 'there'},

You requested to reset your password for your Connect Capitals account.

Click the link below to create a new password:
${resetUrl}

Security Information:
• This link will expire in 1 hour
• This link can only be used once
• If you didn't request this, please ignore this email

If you didn't request a password reset, someone may be trying to access your account. Please contact our support team immediately if you suspect unauthorized access.

---
This email was sent by Connect Capitals Support
© ${new Date().getFullYear()} Connect Capitals. All rights reserved.
Visit: ${SITE_URL}
  `;

  try {
    const transporter = getTransporter();

    // If SMTP not configured, log to console (development mode)
    if (!transporter) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 PASSWORD RESET EMAIL (Development Mode - SMTP Not Configured)');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token expires in: 1 hour`);
      console.log('='.repeat(80) + '\n');
      
      return true;
    }

    // Send actual email in production
    console.log('📤 Sending email via SMTP...');
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password - Connect Capitals',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ ✅ ✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Recipient:', email);
    console.log('📡 SMTP Response:', info.response);
    console.log('✉️  Email accepted by SMTP server:', EMAIL_CONFIG.host);
    console.log('🔗 Reset URL in email:', resetUrl);
    console.log('⏰ Token expires in: 1 hour');
    
    return true;

  } catch (error) {
    console.error('❌ ❌ ❌ PASSWORD RESET EMAIL FAILED! ❌ ❌ ❌');
    console.error('📧 Failed to send to:', email);
    console.error('🌐 SMTP Host:', EMAIL_CONFIG.host);
    console.error('🔌 SMTP Port:', EMAIL_CONFIG.port);
    console.error('🔒 SSL Enabled:', EMAIL_CONFIG.secure);
    console.error('👤 SMTP User:', EMAIL_CONFIG.auth.user);
    console.error('📨 From Email:', FROM_EMAIL);
    console.error('🔗 Reset URL:', resetUrl);
    
    if (error instanceof Error) {
      console.error('❌ Error Message:', error.message);
      console.error('📋 Error Stack:', error.stack);
    } else {
      console.error('❌ Error Details:', error);
    }
    
    // DO NOT throw - return false so API can handle gracefully
    return false;
  }
}

/**
 * Verify email service configuration
 * @returns Promise<boolean> - Configuration status
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    
    if (!transporter) {
      console.warn('⚠️  SMTP not configured');
      return false;
    }

    await transporter.verify();
    console.log('✅ Email service configured correctly');
    return true;

  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}

/**
 * Send welcome email to new users
 * @param email - Recipient email
 * @param name - Recipient name
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to OptiFirm</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #F2F4F7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px;">
              <tr>
                <td style="padding: 40px; text-align: center;">
                  <h1 style="color: #1A3E6D; font-size: 28px;">Welcome to OptiFirm! 🎉</h1>
                  <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    Hi ${name}, we're excited to have you on board!
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

  try {
    const transporter = getTransporter();
    if (!transporter) return true; // Skip in development

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to OptiFirm!',
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send business valuation submission to internal team
 * FROM: deals@connectcapitals.com
 * TO: deals@connectcapitals.com
 */
export async function sendValuationToTeam(
  formData: any,
  submissionTime: string,
  ipAddress?: string
): Promise<boolean> {
  console.log('📧 Attempting to send valuation submission to team: deals@connectcapitals.com');
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 25px; background: white; padding: 25px; border-radius: 6px; border-left: 4px solid #F18F01; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .section-title { font-weight: bold; font-size: 18px; color: #1A3E6D; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field { margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .field:last-child { border-bottom: none; }
    .field-label { font-weight: 600; color: #555; display: inline-block; min-width: 180px; }
    .field-value { color: #333; font-weight: 500; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 13px; }
    .alert { background: #FFF3E0; border-left: 4px solid #F18F01; padding: 15px; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 26px;">🔔 New Business Valuation Submission</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Connect Capitals Deal Pipeline</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">📋 Submission Details</div>
        <div class="field">
          <span class="field-label">Submitted:</span>
          <span class="field-value">${submissionTime}</span>
        </div>
        ${ipAddress ? `<div class="field">
          <span class="field-label">IP Address / Location:</span>
          <span class="field-value">${ipAddress}</span>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">👤 Contact Information</div>
        <div class="field">
          <span class="field-label">Full Name:</span>
          <span class="field-value"><strong>${formData.name}</strong></span>
        </div>
        <div class="field">
          <span class="field-label">Email Address:</span>
          <span class="field-value"><a href="mailto:${formData.email}" style="color: #1A3E6D; text-decoration: none;">${formData.email}</a></span>
        </div>
        <div class="field">
          <span class="field-label">Phone Number:</span>
          <span class="field-value"><strong>${formData.phone}</strong></span>
        </div>
        ${formData.country ? `<div class="field">
          <span class="field-label">Country:</span>
          <span class="field-value">${formData.country}</span>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">🏢 Business Overview</div>
        <div class="field">
          <span class="field-label">Business Name:</span>
          <span class="field-value"><strong>${formData.businessName}</strong></span>
        </div>
        <div class="field">
          <span class="field-label">Industry / Category:</span>
          <span class="field-value">${formData.industry}</span>
        </div>
        ${formData.location ? `<div class="field">
          <span class="field-label">Business Location:</span>
          <span class="field-value">${formData.location}</span>
        </div>` : ''}
        <div class="field">
          <span class="field-label">Years Established:</span>
          <span class="field-value">${formData.yearsEstablished} years</span>
        </div>
        ${formData.description ? `<div class="field">
          <span class="field-label">Business Description:</span>
          <div class="field-value" style="margin-top: 10px; padding: 15px; background: #f5f5f5; border-radius: 4px; line-height: 1.6;">${formData.description}</div>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">💰 Financial Details</div>
        <div class="field">
          <span class="field-label">Annual Revenue Range:</span>
          <span class="field-value"><strong style="color: #1A3E6D;">${formData.revenueRange}</strong></span>
        </div>
        ${formData.isProfitable ? `<div class="field">
          <span class="field-label">Currently Profitable:</span>
          <span class="field-value">${formData.isProfitable === 'yes' ? '<strong style="color: #28a745;">✅ Yes</strong>' : formData.isProfitable === 'no' ? '<strong style="color: #dc3545;">❌ No</strong>' : '<strong style="color: #ffc107;">➖ Break Even</strong>'}</span>
        </div>` : ''}
        ${formData.annualRevenue ? `<div class="field">
          <span class="field-label">Exact Annual Revenue:</span>
          <span class="field-value"><strong>${formData.annualRevenue}</strong></span>
        </div>` : ''}
        ${formData.ebitda ? `<div class="field">
          <span class="field-label">EBITDA / Net Profit:</span>
          <span class="field-value"><strong>${formData.ebitda}</strong></span>
        </div>` : ''}
      </div>

      <div class="alert">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1A3E6D;">⚡ Action Required:</p>
        <p style="margin: 0; color: #555; font-size: 14px;">Please review this submission and contact <strong>${formData.name}</strong> at <strong>${formData.email}</strong> within 24-48 hours to schedule a consultation.</p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 5px 0; font-weight: 600;">This is an automated notification from Connect Capitals</p>
        <p style="margin: 0; font-size: 12px;">deals@connectcapitals.com • https://connectcapitals.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
NEW BUSINESS VALUATION SUBMISSION
Connect Capitals Deal Pipeline

═══════════════════════════════════════════════════════════

SUBMISSION DETAILS
• Submitted: ${submissionTime}
${ipAddress ? `• IP Address / Location: ${ipAddress}` : ''}

CONTACT INFORMATION
• Full Name: ${formData.name}
• Email Address: ${formData.email}
• Phone Number: ${formData.phone}
${formData.country ? `• Country: ${formData.country}` : ''}

BUSINESS OVERVIEW
• Business Name: ${formData.businessName}
• Industry / Category: ${formData.industry}
${formData.location ? `• Business Location: ${formData.location}` : ''}
• Years Established: ${formData.yearsEstablished} years
${formData.description ? `• Business Description: ${formData.description}` : ''}

FINANCIAL DETAILS
• Annual Revenue Range: ${formData.revenueRange}
${formData.isProfitable ? `• Currently Profitable: ${formData.isProfitable}` : ''}
${formData.annualRevenue ? `• Exact Annual Revenue: ${formData.annualRevenue}` : ''}
${formData.ebitda ? `• EBITDA / Net Profit: ${formData.ebitda}` : ''}

═══════════════════════════════════════════════════════════

⚡ ACTION REQUIRED:
Please review this submission and contact ${formData.name} at ${formData.email} within 24-48 hours to schedule a consultation.

---
This is an automated notification from Connect Capitals
deals@connectcapitals.com • https://connectcapitals.com
  `;

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 VALUATION TEAM EMAIL (Development Mode - SMTP Not Configured)');
      console.log('='.repeat(80));
      console.log(`To: deals@connectcapitals.com`);
      console.log(`From: deals@connectcapitals.com`);
      console.log(`Subject: New Business Valuation Submission`);
      console.log(`Submitted: ${submissionTime}`);
      console.log('='.repeat(80) + '\n');
      return true;
    }

    console.log('📤 Sending team notification via SMTP...');
    const info = await transporter.sendMail({
      from: `"Connect Capitals Deals Team" <deals@connectcapitals.com>`,
      to: 'deals@connectcapitals.com',
      subject: `🔔 New Business Valuation: ${formData.businessName}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Team notification email SENT SUCCESSFULLY!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 To: deals@connectcapitals.com');
    console.log('📧 From: deals@connectcapitals.com');
    
    return true;

  } catch (error) {
    console.error('❌ Team notification email FAILED!');
    console.error('📧 Failed to send to: deals@connectcapitals.com');
    console.error('Error:', error);
    return false;
  }
}

/**
 * Send automatic confirmation email to customer
 * FROM: deals@connectcapitals.com
 * TO: customer's email
 */
export async function sendValuationConfirmationToCustomer(
  email: string,
  name: string
): Promise<boolean> {
  console.log('📧 Attempting to send confirmation email to customer:', email);
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for your submission – Connect Capitals</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #F2F4F7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">Connect Capitals</h1>
              <p style="margin: 10px 0 0 0; color: #FFFFFF; opacity: 0.9; font-size: 14px;">Business Acquisition & Sale Marketplace</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7;">
                Hello${name ? `,` : ''}
              </p>
              
              ${name ? `<p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7;">
                Thank you for submitting your business valuation and seller information.<br>
                We appreciate your interest in working with Connect Capitals.
              </p>` : `<p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7;">
                Thank you for submitting your business valuation and seller information.<br>
                We appreciate your interest in working with Connect Capitals.
              </p>`}
              
              <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7;">
                Our team will now review your information and contact you shortly to schedule a convenient time for a consultation and to discuss the next steps of the potential deal.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4A4A4A; font-size: 16px; line-height: 1.7;">
                If you have any questions, feel free to reply directly to this email.
              </p>

              <!-- Info Box -->
              <div style="background: #F2F4F7; border-left: 4px solid #F18F01; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #1A3E6D; font-size: 15px;">📞 What happens next?</p>
                <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                  <li>Our team reviews your submission (within 24-48 hours)</li>
                  <li>We'll contact you to schedule a consultation</li>
                  <li>We discuss valuation and next steps for your business</li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #E8EEF5; text-align: center;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #1A3E6D; font-size: 16px;">Best regards,</p>
                <p style="margin: 0 0 15px 0; color: #4A4A4A; font-size: 15px;">Connect Capitals Support</p>
                <p style="margin: 0;">
                  <a href="https://connectcapitals.com" style="color: #F18F01; text-decoration: none; font-weight: 600; font-size: 15px;">https://connectcapitals.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="padding: 20px 30px; background-color: #F2F4F7; border-radius: 0 0 8px 8px; text-align: center;">
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

  const textContent = `
Hello${name ? ',' : ''}

Thank you for submitting your business valuation and seller information.
We appreciate your interest in working with Connect Capitals.

Our team will now review your information and contact you shortly to schedule a convenient time for a consultation and to discuss the next steps of the potential deal.

If you have any questions, feel free to reply directly to this email.

WHAT HAPPENS NEXT?
• Our team reviews your submission (within 24-48 hours)
• We'll contact you to schedule a consultation
• We discuss valuation and next steps for your business

Best regards,
Connect Capitals Support
https://connectcapitals.com

---
© ${new Date().getFullYear()} Connect Capitals. All rights reserved.
  `;

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 CUSTOMER CONFIRMATION EMAIL (Development Mode - SMTP Not Configured)');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`From: deals@connectcapitals.com`);
      console.log(`Subject: Thank you for your submission – Connect Capitals`);
      console.log('='.repeat(80) + '\n');
      return true;
    }

    console.log('📤 Sending customer confirmation via SMTP...');
    const info = await transporter.sendMail({
      from: `"Connect Capitals Deals Team" <deals@connectcapitals.com>`,
      to: email,
      subject: 'Thank you for your submission – Connect Capitals',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Customer confirmation email SENT SUCCESSFULLY!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 To:', email);
    console.log('📧 From: deals@connectcapitals.com');
    
    return true;

  } catch (error) {
    console.error('❌ Customer confirmation email FAILED!');
    console.error('📧 Failed to send to:', email);
    console.error('Error:', error);
    return false;
  }
}