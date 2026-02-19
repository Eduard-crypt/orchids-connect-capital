/**
 * Checkout Page
 * Final step before payment - redirects to Stripe Checkout
 */

import CheckoutContent from '@/components/sections/checkout-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout — Connect Capitals',
  description: 'Complete your membership purchase',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <CheckoutContent />
    </div>
  );
}
