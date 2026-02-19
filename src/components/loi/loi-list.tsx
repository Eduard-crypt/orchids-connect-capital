"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  FileText, 
  Eye, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  CalendarX
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LOIOffer {
  id: number;
  listingId: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  offerPrice: number;
  cashAmount: number;
  earnoutAmount: number;
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
  buyer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
}

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-gray-500",
    icon: FileText,
  },
  sent: {
    label: "Sent",
    color: "bg-blue-500",
    icon: Send,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-500",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-orange-500",
    icon: CalendarX,
  },
};

export function LOIList({ role = "buyer" }: { role?: "buyer" | "seller" }) {
  const router = useRouter();
  const [offers, setOffers] = useState<LOIOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, [role]);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/loi?role=${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch LOI offers");

      const data = await response.json();
      setOffers(data);
    } catch (error) {
      toast.error("Failed to load LOI offers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDraft = async (offerId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/loi/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ loiId: offerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send LOI");
      }

      toast.success("LOI sent successfully!");
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message || "Failed to send LOI");
    }
  };

  const handleRespond = async (offerId: number, action: "accept" | "reject") => {
    const notes = prompt(`${action === "accept" ? "Accept" : "Reject"} this LOI. Add notes (optional):`);
    if (notes === null) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/loi/${offerId}/respond?id=${offerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          responseNotes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} LOI`);
      }

      toast.success(`LOI ${action}ed successfully!`);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No LOI Offers Yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            {role === "buyer"
              ? "You haven't created any LOI offers yet. Browse listings to make an offer."
              : "You haven't received any LOI offers yet."}
          </p>
          {role === "buyer" && (
            <Button onClick={() => router.push("/buy-a-business")}>
              Browse Listings
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const StatusIcon = statusConfig[offer.status].icon;
        const isExpired = new Date(offer.expirationDate) < new Date() && offer.status === "sent";

        return (
          <Card key={offer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{offer.listing.title}</CardTitle>
                  <CardDescription>
                    {role === "buyer" ? (
                      <>Sent to: {offer.seller?.name || "Seller"}</>
                    ) : (
                      <>From: {offer.buyer?.name || "Buyer"}</>
                    )}
                  </CardDescription>
                </div>
                <Badge className={`${statusConfig[offer.status].color} text-white`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {isExpired ? "Expired" : statusConfig[offer.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Offer Price</p>
                  <p className="font-semibold">${offer.offerPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cash</p>
                  <p className="font-semibold">${offer.cashAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Earnout</p>
                  <p className="font-semibold">${offer.earnoutAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {offer.status === "draft" ? "Created" : offer.sentAt ? "Sent" : "Created"}
                  </p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(offer.sentAt || offer.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {offer.status === "accepted" && offer.responseNotes && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <p className="text-sm font-medium text-green-900 mb-1">Seller Notes:</p>
                  <p className="text-sm text-green-800">{offer.responseNotes}</p>
                </div>
              )}

              {offer.status === "rejected" && offer.responseNotes && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-sm font-medium text-red-900 mb-1">Rejection Notes:</p>
                  <p className="text-sm text-red-800">{offer.responseNotes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/loi/${offer.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>

                {role === "buyer" && offer.status === "draft" && (
                  <Button size="sm" onClick={() => handleSendDraft(offer.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send LOI
                  </Button>
                )}

                {role === "seller" && offer.status === "sent" && !isExpired && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleRespond(offer.id, "accept")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRespond(offer.id, "reject")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                {offer.status === "accepted" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/escrow/create?loiId=${offer.id}&listingId=${offer.listingId}`)
                    }
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Create Escrow
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
