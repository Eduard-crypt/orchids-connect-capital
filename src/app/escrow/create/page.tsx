"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Shield } from "lucide-react";
import { FeeBreakdownCard } from "@/components/fees/fee-breakdown-card";

interface LOIOffer {
  id: number;
  offerPrice: number;
  sellerId: string;
  listing: {
    id: number;
    title: string;
  };
}

export default function CreateEscrowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const loiId = searchParams.get("loiId");
  const listingId = searchParams.get("listingId");

  const [loi, setLoi] = useState<LOIOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLOI, setLoadingLOI] = useState(!!loiId);

  // Form state
  const [escrowAmount, setEscrowAmount] = useState("");
  const [escrowProvider, setEscrowProvider] = useState("Escrow.com");
  const [escrowReferenceId, setEscrowReferenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [sellerId, setSellerId] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (loiId && session) {
      fetchLOI();
    } else if (!loiId && listingId) {
      setLoadingLOI(false);
    }
  }, [loiId, listingId, session]);

  const fetchLOI = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/loi/${loiId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch LOI");

      const data = await response.json();
      setLoi(data);
      setEscrowAmount(data.offerPrice.toString());
      setSellerId(data.sellerId);
    } catch (error) {
      toast.error("Failed to load LOI details");
      console.error(error);
    } finally {
      setLoadingLOI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    const amount = parseInt(escrowAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid escrow amount");
      return;
    }

    if (!listingId) {
      toast.error("Listing ID is required");
      return;
    }

    if (!sellerId) {
      toast.error("Seller ID is required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/escrow/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: parseInt(listingId),
          sellerId: sellerId,
          escrowAmount: amount,
          loiId: loiId ? parseInt(loiId) : null,
          escrowProvider: escrowProvider.trim() || null,
          escrowReferenceId: escrowReferenceId.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create escrow transaction");
      }

      const escrow = await response.json();

      toast.success("Escrow transaction created successfully!");
      router.push(`/escrow/${escrow.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create escrow transaction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loadingLOI) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const escrowAmountNumber = parseInt(escrowAmount) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Escrow Transaction</h1>
          <p className="text-muted-foreground">
            {loi ? `For LOI offer on ${loi.listing.title}` : "Set up secure escrow for this transaction"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Details</CardTitle>
              <CardDescription>
                Enter the escrow transaction details. Funds will be held securely until migration is complete.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="escrowAmount">Escrow Amount ($)</Label>
                <Input
                  id="escrowAmount"
                  type="number"
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(e.target.value)}
                  placeholder="e.g., 1000000"
                  required
                />
                {loi && (
                  <p className="text-sm text-muted-foreground mt-1">
                    LOI Offer Price: ${loi.offerPrice.toLocaleString()}
                  </p>
                )}
              </div>

              {!loi && (
                <div>
                  <Label htmlFor="sellerId">Seller ID</Label>
                  <Input
                    id="sellerId"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    placeholder="Seller user ID"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="escrowProvider">Escrow Provider (Optional)</Label>
                <Input
                  id="escrowProvider"
                  value={escrowProvider}
                  onChange={(e) => setEscrowProvider(e.target.value)}
                  placeholder="e.g., Escrow.com, Acquire.com Escrow"
                />
              </div>

              <div>
                <Label htmlFor="escrowReferenceId">Escrow Reference ID (Optional)</Label>
                <Input
                  id="escrowReferenceId"
                  value={escrowReferenceId}
                  onChange={(e) => setEscrowReferenceId(e.target.value)}
                  placeholder="e.g., ESC-2024-00123"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  If you've already initiated escrow with a provider, enter their reference ID
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this escrow transaction"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Secure Escrow Process</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Funds will be held securely in escrow until the migration checklist is completed and both parties confirm the transfer.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown Preview */}
          {escrowAmountNumber > 0 && (
            <FeeBreakdownCard
              transactionAmount={escrowAmountNumber * 100}
              platformFeePercent={5}
              showLabels={true}
              compact={false}
            />
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Escrow Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}