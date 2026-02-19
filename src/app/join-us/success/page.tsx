/**
 * Payment Success Page
 * Displayed after successful payment completion
 */

import PaymentSuccessContent from '@/components/sections/payment-success-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful — Connect Capitals',
  description: 'Your membership has been activated successfully',
};

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <PaymentSuccessContent />
    </div>
  );
}
