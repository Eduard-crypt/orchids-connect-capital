'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Mail, Shield, RefreshCw } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="w-full">
      <section className="relative bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Clock className="w-14 h-14 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Thank You for Your Order!
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Your payment is being processed. We'll send you a confirmation email once everything is complete.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-xl border-2 border-accent/20 p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-accent animate-spin-slow" />
                <h2 className="text-2xl font-bold text-primary">
                  Processing Your Payment
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Your payment has been submitted and is currently being verified by our payment provider. 
                This usually takes just a few moments, but may take up to a few minutes in some cases.
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Check Your Email
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You'll receive a confirmation email at{' '}
                      <span className="font-semibold">
                        {session?.user?.email || 'your registered email'}
                      </span>{' '}
                      once your payment is confirmed and your membership is activated.
                    </p>
                  </div>
                </div>
              </div>

              {sessionId && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Reference ID</p>
                  <p className="font-mono text-sm text-primary break-all">
                    {sessionId}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => router.push('/buy-a-business')}
                  variant="outline"
                  className="border-2 border-primary py-6"
                >
                  Browse Listings
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-xl border-2 border-primary/10 p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                What Happens Next?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Payment Verification
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Our payment provider verifies your payment. This is automatic and typically instant.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Confirmation Email
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Once verified, you'll receive a confirmation email with your membership details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Access Your Benefits
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      After confirmation, all premium features will be unlocked in your account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">?</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Need Help?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      If you don't receive a confirmation within 10 minutes, please{' '}
                      <a href="/reach-us" className="text-accent hover:underline">
                        contact our support team
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg p-6 mt-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Your Information is Secure
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All transactions are encrypted and processed securely through Stripe. We never store your payment details on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}