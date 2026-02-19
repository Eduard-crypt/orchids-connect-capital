"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationForm, VerificationStatus } from "@/components/buyer-verification/verification-form";
import { Shield, ArrowLeft, Loader2, Lock, CheckCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface VerificationData {
  status: "pending" | "verified" | "rejected";
  identityVerified: boolean;
  proofOfFundsVerified: boolean;
  verifiedAt?: string | null;
  notes?: string | null;
}

export default function BuyerVerificationPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=" + encodeURIComponent("/buyer-verification"));
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchVerificationStatus();
    }
  }, [session]);

  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/buyer-verification/status", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationData(data);
      } else if (response.status === 404) {
        // No verification yet - show form
        setVerificationData(null);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      toast.error("Failed to load verification status");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    fetchVerificationStatus();
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Buyer Verification</h1>
              <p className="text-lg text-muted-foreground">
                Complete your identity verification to access confidential business information
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {verificationData ? (
          <div className="space-y-8">
            <VerificationStatus
              status={verificationData.status}
              identityVerified={verificationData.identityVerified}
              proofOfFundsVerified={verificationData.proofOfFundsVerified}
              verifiedAt={verificationData.verifiedAt}
              notes={verificationData.notes}
            />

            {verificationData.status === "rejected" && (
              <Card className="border-destructive/50 shadow-lg">
                <CardHeader>
                  <CardTitle>Resubmit Verification</CardTitle>
                  <CardDescription>
                    Your previous verification was declined. Please upload new documents for review.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VerificationForm onSuccess={handleVerificationSuccess} />
                </CardContent>
              </Card>
            )}

            {verificationData.status === "verified" && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 shadow-lg">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-9 h-9 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Verification Complete</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Your identity has been successfully verified. You now have full access to confidential business listings and financial information.
                    </p>
                    <Button size="lg" onClick={() => router.push("/buy-a-business")} className="btn-hover-effect">
                      Browse Business Opportunities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Begin Verification Process</CardTitle>
              <CardDescription className="text-base">
                To access confidential financial information and protected business details, please complete the identity verification process below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationForm onSuccess={handleVerificationSuccess} />
            </CardContent>
          </Card>
        )}

        {/* Why Verification Section */}
        <Card className="mt-10 shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              Why Identity Verification is Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-4 p-4 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Data Protection & Confidentiality</h4>
                <p className="text-sm text-muted-foreground">
                  Financial statements, proprietary data, and sensitive business information are only shared with verified buyers to protect seller interests.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Fraud Prevention & Security</h4>
                <p className="text-sm text-muted-foreground">
                  Identity verification helps prevent unauthorized access, fraudulent inquiries, and misuse of confidential business information.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Build Trust with Sellers</h4>
                <p className="text-sm text-muted-foreground">
                  Verified buyers are viewed as serious, qualified purchasers, increasing seller confidence and willingness to engage in detailed discussions.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Immediate Access to Premium Listings</h4>
                <p className="text-sm text-muted-foreground">
                  Once verified, gain instant access to complete financial reports, operational metrics, and exclusive off-market opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}