import type { Metadata } from "next";
import DashboardContent from "./_components/dashboard-content";

export const metadata: Metadata = {
  title: 'Dashboard - Connect Capitals',
  description: 'Your Connect Capitals dashboard',
};

export default function DashboardPage() {
  return <DashboardContent />;
}