"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { EscrowTimeline } from "@/components/escrow/escrow-timeline";
import { FeeBreakdownCard } from "@/components/fees/fee-breakdown-card";

interface EscrowTransaction {
  id: number;
  listingId: number;
  loiId: number | null;
  status: "initiated" | "funded" | "in_migration" | "complete" | "released";
  escrowAmount: number;
  escrowProvider?: string;
  escrowReferenceId?: string;
  initiatedAt?: string;
  fundedAt?: string;
  migrationStartedAt?: string;
  completedAt?: string;
  releasedAt?: string;
  notes?: string;
  platformFeePercent?: number;
  platformFeeAmount?: number;
  buyerTotalAmount?: number;
  sellerNetAmount?: number;
  feeInvoiceUrl?: string;
  feeTransferredAt?: string;
  listing: {
    title: string;
    businessType: string;
  };
  buyer: {
    name: string;
    email: string;
  };
  seller: {
    name: string;
    email: string;
  };
}

export default function EscrowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (params.id && session) {
      fetchEscrow();
    }
  }, [params.id, session]);

  const fetchEscrow = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/escrow/${params.id}?id=${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch escrow");

      const data = await response.json();
      setEscrow(data);
    } catch (error) {
      toast.error("Failed to load escrow details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMigration = async () => {
    if (!escrow) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/migration/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          escrowId: escrow.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create migration checklist");
      }

      const migration = await response.json();

      toast.success("Migration checklist created successfully!");
      router.push(`/migration/${migration.id}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!escrow) return;

    setGeneratingInvoice(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/fees/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          escrowId: escrow.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate invoice");
      }

      const result = await response.json();
      toast.success("Invoice generated successfully!");
      
      // Refresh escrow data to show updated invoice URL
      fetchEscrow();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Escrow transaction not found</p>
            <Button onClick={() => router.push("/dashboard?tab=escrow")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Escrow Transaction</h1>
          <p className="text-muted-foreground">{escrow.listing.title}</p>
        </div>

        <div className="space-y-6">
          {/* Timeline */}
          <EscrowTimeline transaction={escrow} />

          {/* Fee Breakdown */}
          <FeeBreakdownCard
            transactionAmount={escrow.escrowAmount}
            platformFeePercent={escrow.platformFeePercent || 5}
            platformFeeAmount={escrow.platformFeeAmount}
            buyerTotalAmount={escrow.buyerTotalAmount}
            sellerNetAmount={escrow.sellerNetAmount}
            showLabels={true}
            compact={false}
          />

          {/* Invoice Section */}
          {escrow.feeInvoiceUrl && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Platform Fee Invoice</p>
                    <p className="text-sm text-muted-foreground">Download your transaction fee invoice</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(escrow.feeInvoiceUrl, "_blank")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parties */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                  <p className="font-semibold">{escrow.buyer.name}</p>
                  <p className="text-sm text-muted-foreground">{escrow.buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seller</p>
                  <p className="font-semibold">{escrow.seller.name}</p>
                  <p className="text-sm text-muted-foreground">{escrow.seller.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            {!escrow.feeInvoiceUrl && (
              <Button
                variant="outline"
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
              >
                <FileText className="mr-2 h-4 w-4" />
                {generatingInvoice ? "Generating..." : "Generate Invoice"}
              </Button>
            )}
            
            {(escrow.status === "funded" || escrow.status === "in_migration") && (
              <>
                <Button
                  onClick={() => router.push(`/migration?escrowId=${escrow.id}`)}
                  className="flex-1"
                >
                  View Migration Checklist
                </Button>
                {escrow.status === "funded" && (
                  <Button variant="outline" onClick={handleCreateMigration}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Migration Checklist
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}