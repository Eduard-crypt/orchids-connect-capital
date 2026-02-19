import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyerVerifications, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Admin authorization check
    const userEmail = session.user.email?.toLowerCase() || '';
    const isAdmin = userEmail.endsWith('@admin.com') || userEmail === 'admin@example.com';
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      userId, 
      verificationStatus, 
      identityVerified, 
      proofOfFundsVerified, 
      notes 
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    // Validate verificationStatus if provided
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (verificationStatus && !validStatuses.includes(verificationStatus)) {
      return NextResponse.json({ 
        error: `Verification status must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_VERIFICATION_STATUS' 
      }, { status: 400 });
    }

    // Validate boolean fields if provided
    if (identityVerified !== undefined && typeof identityVerified !== 'boolean') {
      return NextResponse.json({ 
        error: 'identityVerified must be a boolean',
        code: 'INVALID_IDENTITY_VERIFIED' 
      }, { status: 400 });
    }

    if (proofOfFundsVerified !== undefined && typeof proofOfFundsVerified !== 'boolean') {
      return NextResponse.json({ 
        error: 'proofOfFundsVerified must be a boolean',
        code: 'INVALID_PROOF_OF_FUNDS_VERIFIED' 
      }, { status: 400 });
    }

    // Check if verification record exists
    const existingVerification = await db.select()
      .from(buyerVerifications)
      .where(eq(buyerVerifications.userId, userId))
      .limit(1);

    if (existingVerification.length === 0) {
      return NextResponse.json({ 
        error: 'Verification record not found for this user',
        code: 'VERIFICATION_NOT_FOUND' 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (verificationStatus !== undefined) {
      updateData.verificationStatus = verificationStatus;
    }

    if (identityVerified !== undefined) {
      updateData.identityVerified = identityVerified;
    }

    if (proofOfFundsVerified !== undefined) {
      updateData.proofOfFundsVerified = proofOfFundsVerified;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Check if both verifications are true and status is verified
    const finalIdentityVerified = identityVerified !== undefined 
      ? identityVerified 
      : existingVerification[0].identityVerified;
    
    const finalProofOfFundsVerified = proofOfFundsVerified !== undefined 
      ? proofOfFundsVerified 
      : existingVerification[0].proofOfFundsVerified;
    
    const finalVerificationStatus = verificationStatus !== undefined 
      ? verificationStatus 
      : existingVerification[0].verificationStatus;

    if (finalVerificationStatus === 'verified' && 
        finalIdentityVerified && 
        finalProofOfFundsVerified) {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = session.user.id;
    }

    // Update the verification record
    const updated = await db.update(buyerVerifications)
      .set(updateData)
      .where(eq(buyerVerifications.userId, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update verification record',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}