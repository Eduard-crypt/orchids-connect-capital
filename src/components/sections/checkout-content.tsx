'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, Shield, CheckCircle2, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authClient, useSession } from '@/lib/auth-client';
import PromoCodeBox from '@/components/sections/promo-code-box';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceAmount: number;
  currency: string;
  billingInterval: string;
  features: string[];
}

/**
 * ═══════════════════════════════════════════════════════════════
 * НОВИЯТ REVOLUT.ME CHECKOUT FLOW
 * ═══════════════════════════════════════════════════════════════
 * 
 * ДИРЕКТЕН REDIRECT КЪМ: https://buy.stripe.com/00w28q8rIb100l5gt02Fa01
 * 
 * Flow:
 * 1. User clicks "Pay Now" → Create order in database
 * 2. Redirect to Stripe payment link
 * 3. User completes payment on Stripe
 * 4. User returns to /payment-success
 * 5. Backend verifies & activates Starter plan
 * 
 * NO SDK. NO test mode. REAL PAYMENTS ONLY.
 * ═══════════════════════════════════════════════════════════════
 */

const REVOLUT_PAYMENT_URL = 'https://buy.stripe.com/00w28q8rIb100l5gt02Fa01';

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);
  
  const [billingInfo, setBillingInfo] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  const planSlug = searchParams.get('plan');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/login?redirect=/checkout?plan=${planSlug}`);
    }
  }, [session, isPending, router, planSlug]);

  // Update billing info when session loads
  useEffect(() => {
    if (session?.user) {
      setBillingInfo({
        name: session.user.name || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  // Fetch plan data
  useEffect(() => {
    if (session?.user && planSlug) {
      fetchPlan();
    }
  }, [session, planSlug]);

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plans');

      if (response.ok) {
        const data = await response.json();
        const selectedPlan = data.plans.find((p: Plan) => p.slug === planSlug);
        
        if (selectedPlan) {
          setPlan(selectedPlan);
          setFinalTotal(selectedPlan.priceAmount);
        } else {
          toast.error('Plan not found');
          router.push('/join-us');
        }
      } else {
        toast.error('Failed to load plan');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoApplied = (discount: number, total: number, promoCode: any) => {
    setDiscountAmount(discount);
    setFinalTotal(total);
    setAppliedPromoCode(promoCode);
    
    if (total === 0) {
      toast.success('🎉 Promo code applied! Total: $0.00', {
        description: 'You still need to complete payment verification.',
        duration: 5000,
      });
    } else {
      toast.success(`Promo code applied! You saved ${formatPrice(discount)}`);
    }
  };

  const handlePromoRemoved = () => {
    setDiscountAmount(0);
    setFinalTotal(plan?.priceAmount || 0);
    setAppliedPromoCode(null);
  };

  /**
   * ═══════════════════════════════════════════════════════════════
   * PAY NOW BUTTON - ДИРЕКТНА STRIPE ИНТЕГРАЦИЯ
   * ═══════════════════════════════════════════════════════════════
   */
  const handlePayNow = async () => {
    if (!plan) return;

    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('bearer_token');
      
      console.log('═══════════════════════════════════════');
      console.log('🚀 [CHECKOUT] Starting payment process...');
      console.log('═══════════════════════════════════════');
      console.log('Plan slug:', plan.slug);
      console.log('Plan name:', plan.name);
      console.log('Token exists:', !!token);
      console.log('Promo code:', appliedPromoCode?.code || 'none');
      console.log('Final total:', finalTotal / 100, plan.currency);
      console.log('═══════════════════════════════════════');
      
      // Step 1: Create order in backend
      console.log('📡 [CHECKOUT] Calling API: /api/payments/revolut-direct/create-order');
      const response = await fetch('/api/payments/revolut-direct/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planSlug: plan.slug,
          promoCode: appliedPromoCode?.code,
        }),
      });

      console.log('📡 [CHECKOUT] API Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('═══════════════════════════════════════');
        console.error('❌ [CHECKOUT] API Error Response');
        console.error('═══════════════════════════════════════');
        console.error('Status:', response.status);
        console.error('Error:', error);
        console.error('Error message:', error.error || error.message);
        console.error('Details:', error.details);
        console.error('═══════════════════════════════════════');
        
        toast.error(error.error || error.message || 'Failed to create order. Redirecting to payment...');
        
        // Fallback: Redirect to checkout redirect page even if order creation fails
        setTimeout(() => {
          console.log('🔄 [CHECKOUT] Fallback redirect to /checkout/redirect');
          router.push(`/checkout/redirect?planSlug=${plan.slug}`);
        }, 800);
        return;
      }

      const data = await response.json();
      console.log('═══════════════════════════════════════');
      console.log('✅ [CHECKOUT] Order created successfully');
      console.log('═══════════════════════════════════════');
      console.log('Order ID:', data.orderId);
      console.log('Amount:', data.amount / 100, data.currency);
      console.log('Plan name:', data.planName);
      console.log('Stripe URL:', data.stripePaymentUrl);
      console.log('═══════════════════════════════════════');
      
      // Step 2: Save order data in localStorage for verification later
      localStorage.setItem('pending_order_id', data.orderId.toString());
      localStorage.setItem('pending_plan_slug', plan.slug);
      
      toast.success('Order created successfully!', {
        description: 'Redirecting to payment page...',
        duration: 2000,
      });

      // Step 3: Redirect to intermediate redirect page (not directly to Stripe)
      console.log('🔄 [CHECKOUT] Redirecting to /checkout/redirect');
      setTimeout(() => {
        router.push(`/checkout/redirect?orderId=${data.orderId}&planSlug=${plan.slug}`);
      }, 1500);

    } catch (error) {
      console.error('═══════════════════════════════════════');
      console.error('❌ [CHECKOUT] Unexpected error');
      console.error('═══════════════════════════════════════');
      console.error('Error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('═══════════════════════════════════════');
      
      toast.error('Failed to initialize payment. Redirecting to payment...');
      
      // Fallback redirect even on unexpected errors
      setTimeout(() => {
        console.log('🔄 [CHECKOUT] Fallback redirect after error');
        router.push(`/checkout/redirect?planSlug=${plan.slug}`);
      }, 800);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Показва UI за verification след като потребителят е пренасочен към Stripe
   */
  const showPaymentVerificationUI = (orderId: number) => {
    // Redirect към success page за verification
    router.push(`/payment-success?orderId=${orderId}`);
  };

    const formatPrice = (amountInCents: number) => {
      return `€${(amountInCents / 100).toFixed(2)}`;
    };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user || !plan) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Secure Checkout</h1>
          </div>
          <p className="text-white/90 text-lg">
            Complete your membership purchase with Stripe
          </p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg h-fit">
                <h2 className="text-2xl font-bold text-primary mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-accent mb-2">
                      {plan.name} Plan
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {plan.description}
                    </p>
                  </div>

                  <div className="border-t border-primary/10 pt-4">
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-muted-foreground">Plan Price</span>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${discountAmount > 0 ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                          {formatPrice(plan.priceAmount)}
                        </span>
                        <span className="text-muted-foreground text-sm ml-1">
                          / {plan.billingInterval}
                        </span>
                      </div>
                    </div>

                    {/* Promo Code Section */}
                    <PromoCodeBox
                      cartTotal={plan.priceAmount}
                      onPromoApplied={handlePromoApplied}
                      onPromoRemoved={handlePromoRemoved}
                    />

                    <div className="border-t border-primary/10 pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="font-bold text-primary">Total Due Today</span>
                        <span className="text-2xl font-bold text-accent">
                          {formatPrice(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="border-t border-primary/10 pt-6">
                  <h4 className="font-semibold text-primary mb-4">What's Included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-6">
                {/* Billing Information */}
                <div className="bg-card rounded-lg border-2 border-primary/10 p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Billing Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billing-name">Full Name</Label>
                      <Input
                        id="billing-name"
                        value={billingInfo.name}
                        placeholder="John Doe"
                        className="mt-1"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-email">Email Address</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        value={billingInfo.email}
                        placeholder="john@example.com"
                        className="mt-1"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    ГЛАВЕН БУТОН: PAY NOW → ДИРЕКТНО КЪМ STRIPE
                    ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border-2 border-accent/20 p-6">
                  <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <ExternalLink className="w-6 h-6 text-accent" />
                    Complete Payment via Stripe
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Click "Pay Now" to be redirected to Stripe where you can complete your secure payment. 
                    After successful payment, your <strong>{plan.name}</strong> membership will be activated automatically.
                  </p>

                  <Button
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6 text-lg shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Pay Now ({formatPrice(finalTotal)})
                      </>
                    )}
                  </Button>

                  <div className="mt-4 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground">
                    <p className="font-semibold text-primary mb-1">🔒 Secure Payment Process:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>You'll be redirected to Stripe payment page</li>
                      <li>Complete payment securely on Stripe</li>
                      <li>Return here to verify payment</li>
                      <li>Your {plan.name} plan activates immediately</li>
                    </ol>
                  </div>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    💳 Powered by <strong>Stripe</strong> • Bank-level security
                  </p>
                </div>

                {/* Security Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-primary/10">
                    <Shield className="w-6 h-6 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-primary mb-1">
                        100% Secure Payments
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your payment is processed securely through Stripe with bank-grade encryption
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-primary/10">
                    <Lock className="w-6 h-6 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-primary mb-1">
                        Cancel Anytime
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        No long-term contracts. Cancel your subscription anytime from your account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-primary/10">
                    <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-primary mb-1">
                        Instant Activation
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your membership will be activated immediately after payment confirmation
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our <a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
