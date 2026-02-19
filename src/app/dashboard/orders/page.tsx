import { Metadata } from 'next';
import OrdersManagementContent from './_components/orders-management-content';

export const metadata: Metadata = {
  title: 'Order Management | Connect Capitals',
  description: 'Manage and track all orders and payments',
};

export default function OrdersManagementPage() {
  return <OrdersManagementContent />;
}
