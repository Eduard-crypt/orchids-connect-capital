import SellBusinessForm from './_components/sell-business-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Selling - Connect Capitals',
  description: 'Start the process of selling your business',
};

export default function SellBusinessStartPage() {
  return (
    <div className="min-h-screen bg-background">
      <SellBusinessForm />
    </div>
  );
}