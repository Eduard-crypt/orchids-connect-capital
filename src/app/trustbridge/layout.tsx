import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrustBridge - Connect Capitals',
  description: 'Premium membership for serious buyers and sellers',
};

export default function TrustBridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}