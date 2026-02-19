'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';

export default function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('orderRef') || localStorage.getItem('pending_order_ref');

  const handleRetry = () => {
    const planSlug = searchParams.get('plan') || localStorage.getItem('pending_plan_slug') || 'starter';
    router.push(`/checkout?plan=${planSlug}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl border-2 border-destructive/20 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-destructive">Payment Failed</h1>
          <p className="text-muted-foreground">
            We couldn't process your payment at this time
          </p>
        </div>

        {orderRef && (
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">Order Reference:</p>
            <p className="font-mono font-semibold text-primary">{orderRef}</p>
          </div>
        )}

        <div className="bg-destructive/5 rounded-lg p-4 text-sm text-left space-y-3">
          <p className="font-semibold text-primary">Common reasons for payment failure:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Payment was cancelled or not completed</li>
            <li>Insufficient funds in your account</li>
            <li>Network connection issues</li>
            <li>Payment timeout</li>
          </ul>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-sm text-left space-y-2">
          <p className="font-semibold text-primary">What to do next:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Check your internet connection</li>
            <li>Verify your payment details</li>
            <li>Try again or use a different payment method</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={() => router.push('/reach-us')}
            variant="outline"
            className="w-full"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact Support
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Having trouble? Our support team is here to help: <a href="/reach-us" className="text-primary hover:underline">Contact Us</a>
        </p>
      </div>
    </div>
  );
}
