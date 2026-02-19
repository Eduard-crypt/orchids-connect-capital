import type { Metadata } from "next";
import { BuyerOnboardingForm } from "../_components/BuyerOnboardingForm";

export const metadata: Metadata = {
  title: "Buyer Onboarding — Dashboard | Connect Capitals",
  description: "Provide your budget, industries, regions, and proof of funds (placeholder).",
};

export default function BuyerOnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Buyer Onboarding</h1>
        <BuyerOnboardingForm />
      </div>
    </div>
  );
}