import type { Metadata } from "next";
import { SellerOnboardingForm } from "../_components/SellerOnboardingForm";

export const metadata: Metadata = {
  title: "Seller Onboarding — Dashboard | Connect Capitals",
  description: "Provide business type, key metrics, and target price.",
};

export default function SellerOnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Onboarding</h1>
        <SellerOnboardingForm />
      </div>
    </div>
  );
}