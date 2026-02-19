import TransactionDashboardContent from '@/components/sections/transaction-dashboard-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaction Dashboard | Connect Capitals',
  description:
    'Manage all your transactions, escrow funds, payments, and invoices in one place. Real-time status tracking and comprehensive transaction history.',
  openGraph: {
    title: 'Transaction Dashboard',
    description:
      'Track active transactions, escrow funds, completed deals, and payment history.',
    url: '/dashboard/transactions',
    type: 'website'
  }
};

export default function TransactionDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <TransactionDashboardContent />
    </div>
  );
}
