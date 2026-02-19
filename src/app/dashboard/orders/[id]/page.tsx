import { Metadata } from 'next';
import OrderDetailsContent from './_components/order-details-content';

export const metadata: Metadata = {
  title: 'Order Details | Connect Capitals',
  description: 'View and manage order details',
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <OrderDetailsContent orderId={id} />;
}
