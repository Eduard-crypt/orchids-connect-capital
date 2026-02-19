"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Loader2, ExternalLink, User, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Listing {
  id: number;
  sellerId: string;
  status: string;
  title: string;
  businessModel: string | null;
  niche: string | null;
  geography: string | null;
  ttmRevenue: number | null;
  ttmProfit: number | null;
  profitMargin: number | null;
  askingPrice: number | null;
  businessType: string | null;
  fullDescription: string | null;
  ageMonths: number | null;
  revenueMultiple: number | null;
  teamSize: number | null;
  hoursPerWeek: number | null;
  submittedAt: string | null;
  seller: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function ModerationQueue() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"submitted" | "approved" | "rejected">("submitted");

  // Check admin access
  useEffect(() => {
    if (!isPending && session?.user) {
      const isAdmin = session.user.email === "admin@example.com" || session.user.email?.endsWith("@admin.com");
      if (!isAdmin) {
        toast.error("Admin access required");
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  // Fetch listings
  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/moderation/listings?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (listingId: number) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/moderation/listings/${listingId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve listing");
      }

      toast.success("Листингът е одобрен успешно!");
      // TODO: Send email notification to seller
      fetchListings();
    } catch (error) {
      console.error("Error approving listing:", error);
      toast.error(error instanceof Error ? error.message : "Грешка при одобряване");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedListing || !rejectionReason.trim()) {
      toast.error("Моля въведете причина за отказ");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/moderation/listings/${selectedListing.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject listing");
      }

      toast.success("Листингът е отхвърлен");
      // TODO: Send email notification to seller with rejection reason
      setShowRejectDialog(false);
      setSelectedListing(null);
      setRejectionReason("");
      fetchListings();
    } catch (error) {
      console.error("Error rejecting listing:", error);
      toast.error(error instanceof Error ? error.message : "Грешка при отхвърляне");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectDialog = (listing: Listing) => {
    setSelectedListing(listing);
    setShowRejectDialog(true);
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Listings */}
      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No listings found with status: {statusFilter}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-base">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {listing.seller.name} ({listing.seller.email})
                      </span>
                      {listing.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(listing.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={listing.businessType === "SaaS" ? "default" : "secondary"}>
                    {listing.businessType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Asking Price</p>
                    <p className="text-2xl font-bold text-primary">
                      ${listing.askingPrice?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">TTM Revenue</p>
                    <p className="text-xl font-semibold">
                      ${listing.ttmRevenue?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">TTM Profit</p>
                    <p className="text-xl font-semibold">
                      ${listing.ttmProfit?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue Multiple</p>
                    <p className="text-xl font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {listing.revenueMultiple?.toFixed(1)}x
                    </p>
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {listing.niche && (
                    <div>
                      <span className="text-muted-foreground">Niche:</span>
                      <p className="font-medium">{listing.niche}</p>
                    </div>
                  )}
                  {listing.geography && (
                    <div>
                      <span className="text-muted-foreground">Geography:</span>
                      <p className="font-medium">{listing.geography}</p>
                    </div>
                  )}
                  {listing.ageMonths && (
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <p className="font-medium">{Math.floor(listing.ageMonths / 12)}y {listing.ageMonths % 12}m</p>
                    </div>
                  )}
                  {listing.teamSize !== null && (
                    <div>
                      <span className="text-muted-foreground">Team:</span>
                      <p className="font-medium">{listing.teamSize} people</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {listing.fullDescription && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {listing.fullDescription}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {listing.status === "submitted" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(listing.id)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Одобри
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(listing)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отхвърли
                    </Button>
                  </div>
                )}

                {listing.status === "approved" && (
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Badge variant="default" className="bg-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/listing/${listing.id}`} target="_blank" rel="noopener noreferrer">
                        View Public Page
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                )}

                {listing.status === "rejected" && (
                  <div className="pt-4 border-t">
                    <Badge variant="destructive">
                      <X className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отхвърляне на листинг</DialogTitle>
            <DialogDescription>
              Моля предоставете причина за отхвърляне. Seller-ът ще получи имейл с тази информация.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Причина за отказ *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Напр. Недостатъчна документация, неточни финансови данни, несъответствие с политиките..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Отказ
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отхвърляне...
                </>
              ) : (
                "Потвърди отхвърлянето"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
