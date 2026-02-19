import PaymentFailedContent from './_components/payment-failed-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Failed | Connect Capitals',
  description: 'Your payment could not be processed. Please try again or contact support.',
};

export default function PaymentFailedPage() {
  return <PaymentFailedContent />;
}
