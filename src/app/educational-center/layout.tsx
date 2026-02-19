import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Educational Center - Connect Capitals',
  description: 'Learn about buying and selling online businesses',
};

export default function EducationalCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}