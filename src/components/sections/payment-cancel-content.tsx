'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, HelpCircle, MessageCircle, RefreshCw } from 'lucide-react';

export default function PaymentCancelContent() {
  const router = useRouter();

  return (
    <div className="w-full">
      <section className="relative bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-destructive/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-destructive/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-14 h-14 text-destructive" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Checkout Cancelled
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Your checkout session was cancelled. No charges have been made.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-xl border-2 border-primary/10 p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">
                  Ready to Try Again?
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Your payment was not processed. This could happen if you closed the checkout page or clicked cancel. 
                No charges were made to your payment method.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/pricing')}
                  className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6"
                >
                  Return to Pricing
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="border-2 border-primary py-6"
                >
                  Return Home
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Have Questions?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Not sure which plan is right for you? Check out our detailed plan comparison.
                    </p>
                    <Button
                      variant="link"
                      className="text-accent p-0 h-auto"
                      onClick={() => router.push('/pricing')}
                    >
                      View Plans
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      Need Support?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our support team is here to help with any payment or technical issues.
                    </p>
                    <Button
                      variant="link"
                      className="text-accent p-0 h-auto"
                      onClick={() => router.push('/reach-us')}
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">
                Why Join Connect Capitals?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    Verified Listings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Access thousands of verified business listings with detailed financials
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    Expert Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get guidance from experienced M&A professionals every step of the way
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    Secure Transactions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Protected escrow services and secure document management
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={() => router.push('/pricing')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6"
                >
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}