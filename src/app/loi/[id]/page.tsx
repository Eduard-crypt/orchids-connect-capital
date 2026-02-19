"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, FileText, Send, CheckCircle, XCircle, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { FeeBreakdownCard } from "@/components/fees/fee-breakdown-card";
import { FeeAcceptanceDialog } from "@/components/fees/fee-acceptance-dialog";

interface LOIOffer {
  id: number;
  listingId: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  offerPrice: number;
  cashAmount: number;
  earnoutAmount: number;
  earnoutTerms: string | null;
  dueDiligenceDays: number;
  exclusivityDays: number;
  conditions: string[] | null;
  expirationDate: string;
  sentAt: string | null;
  respondedAt: string | null;
  responseNotes: string | null;
  createdAt: string;
  listing: {
    title: string;
    businessType: string;
    askingPrice: number;
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

export default function LOIDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [loi, setLoi] = useState<LOIOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"accept" | "reject" | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (params.id && session) {
      fetchLOI();
    }
  }, [params.id, session]);

  const fetchLOI = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/loi/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch LOI");

      const data = await response.json();
      setLoi(data);
    } catch (error) {
      toast.error("Failed to load LOI details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!loi) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/loi/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ loiId: loi.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send LOI");
      }

      toast.success("LOI sent successfully!");
      fetchLOI();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRespondAccept = async (notes: string) => {
    if (!loi) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/loi/${loi.id}/respond?id=${loi.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "accept",
          responseNotes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept LOI");
      }

      toast.success("LOI accepted successfully!");
      fetchLOI();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleRespondReject = async (notes: string) => {
    if (!loi) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/loi/${loi.id}/respond?id=${loi.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "reject",
          responseNotes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject LOI");
      }

      toast.success("LOI rejected successfully!");
      fetchLOI();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
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

  if (!loi) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>LOI Not Found</CardTitle>
            <CardDescription>The LOI you're looking for could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard?tab=loi-offers")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBuyer = session?.user?.id === loi.buyer?.id;
  const isExpired = new Date(loi.expirationDate) < new Date() && loi.status === "sent";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Letter of Intent</h1>
            <Badge className={`${
              loi.status === "accepted" ? "bg-green-500" :
              loi.status === "rejected" ? "bg-red-500" :
              loi.status === "sent" ? "bg-blue-500" :
              "bg-gray-500"
            } text-white`}>
              {isExpired ? "Expired" : loi.status.charAt(0).toUpperCase() + loi.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            For listing: <span className="font-semibold">{loi.listing.title}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                  <p className="font-semibold">{loi.buyer.name}</p>
                  <p className="text-sm text-muted-foreground">{loi.buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seller</p>
                  <p className="font-semibold">{loi.seller.name}</p>
                  <p className="text-sm text-muted-foreground">{loi.seller.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Total Offer Price</span>
                  </div>
                  <span className="text-2xl font-bold">${loi.offerPrice.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Cash Amount</p>
                    <p className="text-xl font-semibold">${loi.cashAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Earnout Amount</p>
                    <p className="text-xl font-semibold">${loi.earnoutAmount.toLocaleString()}</p>
                  </div>
                </div>

                {loi.earnoutTerms && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-2">Earnout Terms:</p>
                    <p className="text-sm">{loi.earnoutTerms}</p>
                  </div>
                )}

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Listing Asking Price: ${loi.listing.askingPrice.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown - Show to both parties when LOI is sent or about to be accepted */}
          {(loi.status === "sent" || loi.status === "accepted") && (
            <FeeBreakdownCard
              transactionAmount={loi.offerPrice * 100}
              platformFeePercent={5}
              showLabels={true}
              compact={false}
            />
          )}

          {/* Timeline & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Diligence</p>
                    <p className="font-semibold">{loi.dueDiligenceDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Exclusivity</p>
                    <p className="font-semibold">{loi.exclusivityDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expires</p>
                    <p className="font-semibold">
                      {format(new Date(loi.expirationDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {loi.conditions && loi.conditions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-semibold mb-2">Conditions:</p>
                      <ul className="space-y-2">
                        {loi.conditions.map((condition, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response */}
          {(loi.status === "accepted" || loi.status === "rejected") && loi.responseNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Seller Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  loi.status === "accepted" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                  <p className="text-sm">{loi.responseNotes}</p>
                  {loi.respondedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(loi.respondedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {isBuyer && loi.status === "draft" && (
              <Button onClick={handleSend} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Send LOI
              </Button>
            )}

            {!isBuyer && loi.status === "sent" && !isExpired && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    setDialogMode("accept");
                    setDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept LOI
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDialogMode("reject");
                    setDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject LOI
                </Button>
              </>
            )}

            {loi.status === "accepted" && (
              <Button
                onClick={() => router.push(`/escrow/create?loiId=${loi.id}&listingId=${loi.listingId}`)}
                className="flex-1"
              >
                Create Escrow Transaction
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fee Acceptance Dialog */}
      <FeeAcceptanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionAmount={loi.offerPrice * 100}
        onAccept={handleRespondAccept}
        onReject={handleRespondReject}
        mode={dialogMode}
        isBuyer={isBuyer}
      />
    </div>
  );
}