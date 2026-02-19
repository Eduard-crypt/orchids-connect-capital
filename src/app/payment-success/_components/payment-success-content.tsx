'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [membershipDetails, setMembershipDetails] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Вземи order ID от localStorage или URL
      const orderId = searchParams.get('orderId') || localStorage.getItem('pending_order_id');

      if (!orderId) {
        toast.error('No order found to verify');
        setVerificationStatus('failed');
        setIsVerifying(false);
        return;
      }

      const token = localStorage.getItem('bearer_token');

      // Извикай verification API
      const response = await fetch('/api/payments/revolut-direct/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: parseInt(orderId),
          paymentConfirmed: true, // Потребителят потвърждава, че е платил
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus('success');
        setMembershipDetails(data.membership);
        
        // Изчисти localStorage
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_order_ref');
        localStorage.removeItem('pending_plan_slug');

        toast.success('🎉 Payment confirmed! Your membership is now active.');
      } else {
        setVerificationStatus('failed');
        toast.error(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      toast.error('Failed to verify payment');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-primary">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl border-2 border-destructive/20 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-destructive">Verification Failed</h1>
            <p className="text-muted-foreground">
              We couldn't verify your payment at this time.
            </p>
          </div>

          <div className="bg-destructive/5 rounded-lg p-4 text-sm text-left space-y-2">
            <p className="font-semibold">What to do next:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check if payment was deducted from your account</li>
              <li>Contact support with your order reference</li>
              <li>Try the payment process again</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push('/reach-us')}
              variant="destructive"
              className="w-full"
            >
              Contact Support
            </Button>
            <Button
              onClick={() => router.push('/join-us')}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl border-2 border-accent/20 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your membership has been activated successfully
          </p>
        </div>

        {membershipDetails && (
          <div className="bg-accent/5 rounded-lg p-4 space-y-2 text-left">
            <h3 className="font-semibold text-primary">Membership Details:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{membershipDetails.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">
                  {new Date(membershipDetails.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until:</span>
                <span className="font-medium">
                  {new Date(membershipDetails.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-primary/5 rounded-lg p-4 text-sm text-left space-y-2">
          <p className="font-semibold text-primary">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You now have full access to all membership features</li>
            <li>A confirmation email has been sent to your inbox</li>
            <li>You can manage your subscription from your dashboard</li>
          </ul>
        </div>

        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground">
          Need help? <a href="/reach-us" className="text-primary hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
