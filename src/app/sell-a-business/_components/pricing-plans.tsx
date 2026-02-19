'use client';

import { CheckCircle2, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PLANS = [
  {
    name: 'Basic Listing',
    icon: Star,
    price: 'Free',
    subtitle: 'Essential listing',
    description: 'Essential tools to get your business listed and discovered',
    features: [
      'Business listing on marketplace',
      'Basic business profile page',
      'Up to 5 professional photos',
      'Standard search visibility',
      'Email notifications for inquiries',
      'Basic buyer inquiry management',
      '90-day listing duration',
      'Community forum support'
    ],
    highlighted: false,
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
    planId: 'basic',
    badge: null
  },
  {
    name: 'Featured Listing',
    icon: Zap,
    price: '$499',
    priceDetail: 'one-time fee',
    subtitle: 'Maximum visibility',
    description: 'Maximum visibility with premium placement and support',
    features: [
      'Everything in Basic, plus:',
      'Featured placement in search results',
      'Priority listing badge & highlights',
      'Unlimited photos & documents',
      'Priority email support (24hr response)',
      'Advanced analytics & traffic insights',
      '180-day listing duration',
      'Social media promotion package',
      'Professional listing optimization',
      'Buyer screening & qualification'
    ],
    highlighted: true,
    buttonText: 'Choose Featured',
    buttonVariant: 'default' as const,
    popular: true,
    planId: 'featured',
    badge: 'MOST POPULAR'
  },
  {
    name: 'Premium Package',
    icon: Crown,
      price: '€1,499',
    priceDetail: 'one-time fee',
    subtitle: 'White-glove service',
    description: 'Complete white-glove service from listing to close',
    features: [
      'Everything in Featured, plus:',
      'Dedicated M&A advisor',
      'Professional business valuation report',
      'Custom marketing materials & pitch deck',
      'Direct buyer introductions from network',
      'Expert negotiation support',
      'Due diligence coordination & review',
      'Legal documentation assistance',
      'Unlimited listing duration',
      'Premium buyer network access',
      'Transaction closing support',
      'Post-sale transition guidance (30 days)'
    ],
    highlighted: false,
    buttonText: 'Choose Premium',
    buttonVariant: 'default' as const,
    planId: 'premium',
    badge: 'BEST VALUE'
  }
];

export const PricingPlans = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    if (isPending) return;
    
    if (!session) {
      toast.error('Please create an account or log in to continue');
      router.push(`/login?redirect=${encodeURIComponent(`/sell-a-business/start?plan=${planId}`)}`);
      return;
    }

    router.push(`/sell-a-business/start?plan=${planId}`);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {PLANS.map((plan, index) => {
        const Icon = plan.icon;
        
        return (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`relative bg-card rounded-2xl transition-all ${
              plan.highlighted
                ? 'border-2 border-accent shadow-2xl scale-105 md:scale-110 bg-gradient-to-br from-card to-accent/5'
                : 'border border-border hover:border-primary/30 hover:shadow-xl'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Icon & Name */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan.highlighted 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${
                    plan.highlighted ? 'text-accent' : 'text-primary'
                  }`}>
                    {plan.price}
                  </span>
                  {plan.priceDetail && (
                    <span className="text-muted-foreground font-medium">
                      {plan.priceDetail}
                    </span>
                  )}
                </div>
                {!plan.priceDetail && (
                  <p className="text-sm text-muted-foreground mt-2">No credit card required</p>
                )}
                {plan.priceDetail && (
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${
                      feature.includes('Everything in') 
                        ? 'text-muted-foreground' 
                        : plan.highlighted 
                          ? 'text-accent' 
                          : 'text-primary'
                    }`} />
                    <span className={`text-sm leading-relaxed ${
                      feature.includes('Everything in') 
                        ? 'font-medium text-foreground' 
                        : ''
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.buttonVariant}
                className={`w-full py-6 text-base font-semibold ${
                  plan.highlighted 
                    ? 'bg-accent hover:bg-accent/90 text-accent-foreground font-bold' 
                    : ''
                }`}
                onClick={() => handlePlanSelect(plan.planId)}
                disabled={isPending}
              >
                {plan.buttonText}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
