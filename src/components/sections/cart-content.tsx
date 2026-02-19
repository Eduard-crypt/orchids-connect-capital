'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { authClient, useSession } from '@/lib/auth-client';
import PromoCodeBox from '@/components/sections/promo-code-box';

interface CartItem {
  id: number;
  planName: string;
  planSlug: string;
  planDescription: string;
  priceAmount: number;
  currency: string;
  billingInterval: string;
  quantity: number;
  features: string[];
  type?: string; // 'ai_agent' | 'business_listing_plan' | 'membership'
}

interface CartData {
  items: CartItem[];
  total: number;
  currency: string;
  itemCount: number;
}

export default function CartContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/cart');
    }
  }, [session, isPending, router]);

  // Fetch cart data
  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        setFinalTotal(data.total);
      } else {
        toast.error('Failed to load cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Cart cleared');
        setCart({ items: [], total: 0, currency: 'usd', itemCount: 0 });
        setPromoDiscount(0);
        setFinalTotal(0);
        setAppliedPromoCode(null);
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleProceedToCheckout = () => {
    if (cart && cart.items.length > 0) {
      const planSlug = cart.items[0].planSlug;
      router.push(`/checkout?plan=${planSlug}`);
    }
  };

  const handleContinueBrowsing = () => {
    router.push('/rent-ai-agent');
  };

  const handlePromoApplied = (discount: number, newFinalTotal: number, promoCode: any) => {
    setPromoDiscount(discount);
    setFinalTotal(newFinalTotal);
    setAppliedPromoCode(promoCode);
  };

  const handlePromoRemoved = () => {
    setPromoDiscount(0);
    setFinalTotal(cart?.total || 0);
    setAppliedPromoCode(null);
  };

  const formatPrice = (amountInCents: number) => {
    return `$${(amountInCents / 100).toFixed(2)}`;
  };

  // Group items by type
  const groupItemsByType = (items: CartItem[]) => {
    const aiAgents = items.filter(item => {
      const name = item.planName.toLowerCase();
      return name.includes('agent') || name.includes('ai');
    });
    
    const businessPlans = items.filter(item => {
      const name = item.planName.toLowerCase();
      return !name.includes('agent') && !name.includes('ai');
    });

    return { aiAgents, businessPlans };
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { aiAgents, businessPlans } = cart ? groupItemsByType(cart.items) : { aiAgents: [], businessPlans: [] };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-10 h-10 text-accent" />
            <h1 className="text-4xl md:text-5xl font-bold">Shopping Cart</h1>
          </div>
          <p className="text-white/90 text-lg">Review your selected products and proceed to checkout</p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {cart && cart.items.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                  {/* AI Agents Section */}
                  {aiAgents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-accent" />
                        <h2 className="text-2xl font-bold text-primary">AI Agents</h2>
                      </div>
                      <div className="space-y-4">
                        {aiAgents.map((item) => (
                          <div
                            key={item.id}
                            className="bg-card rounded-xl border-2 border-primary/10 p-6 shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-5 h-5 text-accent" />
                                  <h3 className="text-xl font-bold text-primary">
                                    {item.planName}
                                  </h3>
                                </div>
                                <p className="text-muted-foreground mb-4">
                                  {item.planDescription}
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-bold text-accent">
                                    {formatPrice(item.priceAmount)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    / {item.billingInterval}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveItem}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>

                            {/* Features */}
                            <div className="border-t border-primary/10 pt-4 mt-4">
                              <h4 className="font-semibold text-sm text-primary mb-3">
                                What's Included:
                              </h4>
                              <ul className="space-y-2">
                                {(typeof item.features === 'string' 
                                  ? JSON.parse(item.features) 
                                  : item.features
                                ).map((feature: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Listing Plans Section */}
                  {businessPlans.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-secondary" />
                        <h2 className="text-2xl font-bold text-primary">Business Listing Plans</h2>
                      </div>
                      <div className="space-y-4">
                        {businessPlans.map((item) => (
                          <div
                            key={item.id}
                            className="bg-card rounded-xl border-2 border-secondary/10 p-6 shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="w-5 h-5 text-secondary" />
                                  <h3 className="text-xl font-bold text-primary">
                                    {item.planName} Plan
                                  </h3>
                                </div>
                                <p className="text-muted-foreground mb-4">
                                  {item.planDescription}
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-bold text-accent">
                                    {formatPrice(item.priceAmount)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    / {item.billingInterval}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveItem}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>

                            {/* Features */}
                            <div className="border-t border-secondary/10 pt-4 mt-4">
                              <h4 className="font-semibold text-sm text-primary mb-3">
                                What's Included:
                              </h4>
                              <ul className="space-y-2">
                                {(typeof item.features === 'string' 
                                  ? JSON.parse(item.features) 
                                  : item.features
                                ).map((feature: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary - Sticky Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border-2 border-primary/20 p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-primary mb-6">
                      Order Summary
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">{formatPrice(cart.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span className="font-semibold">{cart.itemCount}</span>
                      </div>
                      
                      {/* Promo Code Box */}
                      <PromoCodeBox
                        cartTotal={cart.total}
                        onPromoApplied={handlePromoApplied}
                        onPromoRemoved={handlePromoRemoved}
                      />
                      
                      <div className="flex justify-between text-sm pb-3 border-b border-primary/10">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-semibold text-xs">Calculated at checkout</span>
                      </div>
                      <div className="pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary text-lg">Total</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-accent block">
                              {formatPrice(finalTotal)}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              / {cart.items[0].billingInterval}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleProceedToCheckout}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleContinueBrowsing}
                        variant="outline"
                        className="w-full border-2 border-primary/20 hover:bg-primary/5 font-semibold py-6 text-base"
                      >
                        Continue Browsing
                      </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-primary/10">
                      <div className="space-y-2 text-xs text-center text-muted-foreground">
                        <p className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          Secure checkout powered by Stripe
                        </p>
                        <p className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          Cancel anytime, no questions asked
                        </p>
                        <p className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          24/7 customer support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Empty Cart State
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-primary mb-3">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Add AI agents or business listing plans to get started
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => router.push('/trustbridge')}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-lg"
                  >
                    Browse Plans
                  </Button>
                  <Button
                    onClick={() => router.push('/rent-ai-agent')}
                    variant="outline"
                    className="border-2 border-primary hover:bg-primary/5 px-8 py-6 text-lg"
                  >
                    Explore AI Agents
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}