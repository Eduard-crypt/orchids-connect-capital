/**
 * Admin Payments Dashboard
 * View and manage all orders and payments
 */

import AdminPaymentsDashboard from '@/components/sections/admin-payments-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Administration — Connect Capitals',
  description: 'Manage orders and payments',
};

export default function AdminPaymentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminPaymentsDashboard />
    </div>
  );
}
