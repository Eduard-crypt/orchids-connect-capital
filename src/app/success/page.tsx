'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (sid) {
      setSessionId(sid);
      clearCart();
    }
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border-2 border-green-200 dark:border-green-800 p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Payment Successful!
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>

          {sessionId && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-8 border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
              <p className="font-mono text-sm text-primary break-all">{sessionId}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3 text-left bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">Order Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  You will receive an email confirmation shortly with your order details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <Package className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">Access Granted</p>
                <p className="text-sm text-muted-foreground">
                  Your purchased products are now available in your account.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => router.push('/products')}
              variant="outline"
              className="border-2 border-primary/20 hover:bg-primary/5 px-8 py-6 text-lg"
            >
              Continue Shopping
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@connectcapitals.com" className="text-primary hover:underline">
              support@connectcapitals.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
