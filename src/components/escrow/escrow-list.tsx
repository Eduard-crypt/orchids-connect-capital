"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Shield, 
  Eye, 
  DollarSign,
  CheckCircle2,
  Clock,
  Truck,
  FileCheck,
  Unlock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EscrowTransaction {
  id: number;
  listingId: number;
  status: "initiated" | "funded" | "in_migration" | "complete" | "released";
  escrowAmount: number;
  escrowProvider?: string;
  escrowReferenceId?: string;
  createdAt: string;
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

const statusConfig = {
  initiated: {
    label: "Initiated",
    color: "bg-gray-500",
    icon: Clock,
  },
  funded: {
    label: "Funded",
    color: "bg-blue-500",
    icon: CheckCircle2,
  },
  in_migration: {
    label: "In Migration",
    color: "bg-purple-500",
    icon: Truck,
  },
  complete: {
    label: "Complete",
    color: "bg-green-500",
    icon: FileCheck,
  },
  released: {
    label: "Released",
    color: "bg-emerald-600",
    icon: Unlock,
  },
};

export function EscrowList() {
  const router = useRouter();
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/escrow", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch escrow transactions");

      const data = await response.json();
      setEscrows(data);
    } catch (error) {
      toast.error("Failed to load escrow transactions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Escrow Transactions</h3>
          <p className="text-muted-foreground text-center">
            You don't have any escrow transactions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {escrows.map((escrow) => {
        const StatusIcon = statusConfig[escrow.status].icon;

        return (
          <Card key={escrow.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{escrow.listing.title}</CardTitle>
                  <CardDescription>
                    Ref: {escrow.escrowReferenceId || `ESC-${escrow.id}`}
                    {escrow.escrowProvider && ` • ${escrow.escrowProvider}`}
                  </CardDescription>
                </div>
                <Badge className={`${statusConfig[escrow.status].color} text-white`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[escrow.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Escrow Amount</p>
                  <p className="font-semibold text-lg">${escrow.escrowAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="text-sm font-medium">{escrow.buyer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="text-sm font-medium">{escrow.seller.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/escrow/${escrow.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>

                {(escrow.status === "funded" || escrow.status === "in_migration") && (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/migration?escrowId=${escrow.id}`)}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    View Migration
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
