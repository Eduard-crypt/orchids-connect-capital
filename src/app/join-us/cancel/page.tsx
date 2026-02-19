/**
 * Payment Cancelled Page
 * Displayed when user cancels payment
 */

import PaymentCancelContent from '@/components/sections/payment-cancel-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Cancelled — Connect Capitals',
  description: 'Your payment was cancelled',
};

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background">
      <PaymentCancelContent />
    </div>
  );
}
