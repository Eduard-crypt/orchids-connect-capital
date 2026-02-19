'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, Loader2, CheckCircle2, CreditCard } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════
 * PAYMENT REDIRECT PAGE
 * ═══════════════════════════════════════════════════════════════
 * Shows loading state and redirects to Stripe payment link
 * URL: https://buy.stripe.com/00w28q8rIb100l5gt02Fa01
 */

const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/00w28q8rIb100l5gt02Fa01';

export default function PaymentRedirectContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId') || localStorage.getItem('pending_order_id');
    const planSlug = searchParams.get('planSlug') || localStorage.getItem('pending_plan_slug');

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleRedirect(orderId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [searchParams]);

  const handleRedirect = (orderId: string | null) => {
    setRedirecting(true);

    // Build Stripe URL with order reference
    const paymentUrl = orderId 
      ? `${STRIPE_PAYMENT_URL}?client_reference_id=${orderId}`
      : STRIPE_PAYMENT_URL;

    console.log('🔗 Redirecting to Stripe:', paymentUrl);

    // Handle iframe context
    if (window.self !== window.top) {
      try {
        // Try to navigate parent window
        window.top!.location.href = paymentUrl;
      } catch (e) {
        // Fallback to current window if blocked
        window.location.href = paymentUrl;
      }
    } else {
      // Direct navigation
      window.location.href = paymentUrl;
    }
  };

  const handleManualRedirect = () => {
    const orderId = searchParams.get('orderId') || localStorage.getItem('pending_order_id');
    handleRedirect(orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-accent to-accent/80 rounded-full p-6">
                {redirecting ? (
                  <ExternalLink className="w-12 h-12 text-white animate-pulse" />
                ) : (
                  <CreditCard className="w-12 h-12 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-primary">
              {redirecting ? 'Redirecting to Stripe...' : 'Preparing Your Payment'}
            </h1>
            <p className="text-muted-foreground">
              You will be redirected to Stripe's secure payment page in {countdown} {countdown === 1 ? 'second' : 'seconds'}
            </p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center py-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>

          {/* Steps */}
          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">Order Created</p>
                <p className="text-xs text-muted-foreground">Your order has been saved</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Loader2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-primary">Redirecting to Stripe</p>
                <p className="text-xs text-muted-foreground">Opening secure payment page</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-50">
              <div className="w-5 h-5 border-2 border-muted rounded-full flex-shrink-0 mt-0.5"></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Complete Payment</p>
                <p className="text-xs text-muted-foreground">Enter payment details on Stripe</p>
              </div>
            </div>
          </div>

          {/* Manual Redirect Button */}
          <button
            onClick={handleManualRedirect}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Click Here if Not Redirected
          </button>

          {/* Security Note */}
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              🔒 Secure payment powered by <strong className="text-primary">Stripe</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              You will be redirected to: <br />
              <code className="text-[10px] bg-muted px-2 py-1 rounded">
                buy.stripe.com
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}