import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, verification } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  console.log('🔐 Forgot password request received');
  
  try {
    const { email } = await request.json();

    if (!email) {
      console.error('❌ No email provided in request');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('📧 Processing password reset for:', email);

    // Find user by email
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    // Always return success for security (don't reveal if email exists)
    // But only send email if user exists
    if (existingUser.length > 0) {
      const foundUser = existingUser[0];
      console.log('✅ User found in database:', foundUser.email);

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      console.log('🔑 Generated reset token (first 10 chars):', resetToken.substring(0, 10) + '...');
      console.log('⏰ Token expires at:', expiresAt.toISOString());

      // Store token in verification table
      await db.insert(verification).values({
        id: crypto.randomUUID(),
        identifier: foundUser.email,
        value: resetToken,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('💾 Token stored in database');

      // Send password reset email
      console.log('📤 Attempting to send password reset email...');
      try {
        const emailSent = await sendPasswordResetEmail(
          foundUser.email,
          foundUser.name || 'User',
          resetToken
        );

        if (emailSent) {
          console.log('✅ ✅ ✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅');
        } else {
          console.error('❌ ❌ ❌ EMAIL SENDING FAILED (returned false) ❌ ❌ ❌');
          console.error('⚠️  Email function returned false - check email service logs above');
        }
      } catch (emailError) {
        console.error('❌ ❌ ❌ EMAIL SENDING THREW EXCEPTION! ❌ ❌ ❌');
        console.error('📧 Email error:', emailError);
        if (emailError instanceof Error) {
          console.error('Error message:', emailError.message);
          console.error('Error stack:', emailError.stack);
        }
        // Continue anyway - don't reveal email send failure to user
      }
    } else {
      console.log('⚠️  User not found in database (will still return success for security)');
    }

    // Always return success message (security best practice)
    console.log('✅ Returning success response to client');
    return NextResponse.json({
      message: 'If an account exists with that email, a reset link has been sent.',
      success: true
    });

  } catch (error) {
    console.error('❌ ❌ ❌ FORGOT PASSWORD ROUTE ERROR! ❌ ❌ ❌');
    console.error('Forgot password error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}