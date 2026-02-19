import PaymentRedirectContent from '@/components/sections/payment-redirect-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting to Payment - Connect Capitals',
  description: 'Redirecting you to secure payment processing',
};

export default function PaymentRedirectPage() {
  return (
    <div className="min-h-screen bg-background">
      <PaymentRedirectContent />
    </div>
  );
}
