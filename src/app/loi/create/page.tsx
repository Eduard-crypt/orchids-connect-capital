"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, FileText, Send, Plus, X } from "lucide-react";

interface Listing {
  id: number;
  title: string;
  askingPrice: number;
  sellerId: string;
}

export default function CreateLOIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const listingId = searchParams.get("listingId");

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(true);

  // Form state
  const [offerPrice, setOfferPrice] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [earnoutAmount, setEarnoutAmount] = useState("");
  const [earnoutTerms, setEarnoutTerms] = useState("");
  const [dueDiligenceDays, setDueDiligenceDays] = useState("30");
  const [exclusivityDays, setExclusivityDays] = useState("45");
  const [expirationDate, setExpirationDate] = useState("");
  const [conditions, setConditions] = useState<string[]>([""]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (listingId && session) {
      fetchListing();
    }
  }, [listingId, session]);

  useEffect(() => {
    // Set default expiration date to 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    setExpirationDate(thirtyDaysFromNow.toISOString().split("T")[0]);
  }, []);

  const fetchListing = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/listings/${listingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch listing");

      const data = await response.json();
      setListing(data);
      setOfferPrice(data.askingPrice?.toString() || "");
    } catch (error) {
      toast.error("Failed to load listing");
      console.error(error);
    } finally {
      setLoadingListing(false);
    }
  };

  const handleOfferPriceChange = (value: string) => {
    setOfferPrice(value);
    const price = parseInt(value) || 0;
    const earnout = parseInt(earnoutAmount) || 0;
    setCashAmount((price - earnout).toString());
  };

  const handleCashAmountChange = (value: string) => {
    setCashAmount(value);
    const price = parseInt(offerPrice) || 0;
    const cash = parseInt(value) || 0;
    setEarnoutAmount((price - cash).toString());
  };

  const handleEarnoutAmountChange = (value: string) => {
    setEarnoutAmount(value);
    const price = parseInt(offerPrice) || 0;
    const earnout = parseInt(value) || 0;
    setCashAmount((price - earnout).toString());
  };

  const addCondition = () => {
    setConditions([...conditions, ""]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!listing || !session) return;

    const price = parseInt(offerPrice);
    const cash = parseInt(cashAmount);
    const earnout = parseInt(earnoutAmount);

    if (!price || !cash || isNaN(earnout)) {
      toast.error("Please fill in all price fields");
      return;
    }

    if (price !== cash + earnout) {
      toast.error("Offer price must equal cash + earnout amount");
      return;
    }

    const filteredConditions = conditions.filter((c) => c.trim() !== "");

    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/loi/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing.id,
          sellerId: listing.sellerId,
          offerPrice: price,
          cashAmount: cash,
          earnoutAmount: earnout,
          earnoutTerms: earnoutTerms.trim() || null,
          dueDiligenceDays: parseInt(dueDiligenceDays),
          exclusivityDays: parseInt(exclusivityDays),
          expirationDate: new Date(expirationDate).toISOString(),
          conditions: filteredConditions.length > 0 ? filteredConditions : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create LOI");
      }

      const loi = await response.json();

      if (!asDraft) {
        // Send immediately
        const sendResponse = await fetch("/api/loi/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ loiId: loi.id }),
        });

        if (!sendResponse.ok) {
          throw new Error("Failed to send LOI");
        }

        toast.success("LOI created and sent successfully!");
      } else {
        toast.success("LOI saved as draft");
      }

      router.push("/dashboard?tab=loi-offers");
    } catch (error: any) {
      toast.error(error.message || "Failed to create LOI");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loadingListing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Listing Not Found</CardTitle>
            <CardDescription>The listing you're trying to create an LOI for could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/buy-a-business")} className="w-full">
              Browse Listings
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
          <h1 className="text-3xl font-bold mb-2">Create Letter of Intent</h1>
          <p className="text-muted-foreground">
            Submit your offer for <span className="font-semibold">{listing.title}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Price Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Structure</CardTitle>
              <CardDescription>Define your offer price and payment structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="offerPrice">Total Offer Price ($)</Label>
                <Input
                  id="offerPrice"
                  type="number"
                  value={offerPrice}
                  onChange={(e) => handleOfferPriceChange(e.target.value)}
                  placeholder="e.g., 1000000"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Asking Price: ${listing.askingPrice?.toLocaleString() || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cashAmount">Cash Amount ($)</Label>
                  <Input
                    id="cashAmount"
                    type="number"
                    value={cashAmount}
                    onChange={(e) => handleCashAmountChange(e.target.value)}
                    placeholder="e.g., 800000"
                  />
                </div>

                <div>
                  <Label htmlFor="earnoutAmount">Earnout Amount ($)</Label>
                  <Input
                    id="earnoutAmount"
                    type="number"
                    value={earnoutAmount}
                    onChange={(e) => handleEarnoutAmountChange(e.target.value)}
                    placeholder="e.g., 200000"
                  />
                </div>
              </div>

              {parseInt(earnoutAmount) > 0 && (
                <div>
                  <Label htmlFor="earnoutTerms">Earnout Terms</Label>
                  <Textarea
                    id="earnoutTerms"
                    value={earnoutTerms}
                    onChange={(e) => setEarnoutTerms(e.target.value)}
                    placeholder="Describe the earnout conditions (e.g., based on 12 months revenue performance)"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Due Diligence & Exclusivity */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Set due diligence period and exclusivity terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDiligenceDays">Due Diligence Period (days)</Label>
                  <Input
                    id="dueDiligenceDays"
                    type="number"
                    value={dueDiligenceDays}
                    onChange={(e) => setDueDiligenceDays(e.target.value)}
                    placeholder="30"
                  />
                </div>

                <div>
                  <Label htmlFor="exclusivityDays">Exclusivity Period (days)</Label>
                  <Input
                    id="exclusivityDays"
                    type="number"
                    value={exclusivityDays}
                    onChange={(e) => setExclusivityDays(e.target.value)}
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expirationDate">LOI Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>Add any conditions or contingencies for this offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={condition}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder={`Condition ${index + 1} (e.g., Complete financial audit)`}
                  />
                  {conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(index)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button variant="outline" onClick={addCondition} type="button" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Condition
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={loading} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create & Send LOI"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
