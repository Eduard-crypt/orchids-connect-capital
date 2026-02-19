import PaymentSuccessContent from './_components/payment-success-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful | Connect Capitals',
  description: 'Your payment has been processed successfully and your membership has been activated.',
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}
