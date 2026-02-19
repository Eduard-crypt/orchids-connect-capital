"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
} from "lucide-react";

interface VerificationRequest {
  id: number;
  userId: string;
  verificationStatus: "pending" | "verified" | "rejected";
  identityVerified: boolean;
  proofOfFundsVerified: boolean;
  verifiedAt: string | number | Date | null;
  verifiedBy: string | null;
  notes: string | null;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  user?: {
    name: string;
    email: string;
  };
}

export default function VerificationModerationPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    // Check if user is admin (simple check - in production use proper role management)
    if (session?.user?.email && !session.user.email.includes("admin")) {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
      return;
    }

    fetchVerificationRequests();
  }, [session, isPending, router]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      
      // In production, create a dedicated admin API endpoint
      // For now, we'll need to create this endpoint
      const response = await fetch("/api/admin/verification-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch verification requests");
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    userId: string,
    requestId: number,
    status: "verified" | "rejected",
    identityVerified: boolean,
    proofOfFundsVerified: boolean
  ) => {
    setProcessing(requestId);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/buyer-verification/status", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          verificationStatus: status,
          identityVerified,
          proofOfFundsVerified,
          notes: notes[requestId] || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update verification status");
      }

      toast.success(`Verification ${status === "verified" ? "approved" : "rejected"}`);
      fetchVerificationRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Verification Moderation</h1>
        <p className="text-muted-foreground">
          Review and approve buyer verification requests
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending verifications</h3>
            <p className="text-sm text-muted-foreground">
              All verification requests have been processed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {request.user?.name || "Unknown User"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {request.user?.email}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      request.verificationStatus === "verified"
                        ? "default"
                        : request.verificationStatus === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {request.verificationStatus === "verified" && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    {request.verificationStatus === "rejected" && (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {request.verificationStatus === "pending" && (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {request.verificationStatus.charAt(0).toUpperCase() +
                      request.verificationStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Status */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">ID Document</span>
                    </div>
                    {request.identityVerified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Proof of Funds</span>
                    </div>
                    {request.proofOfFundsVerified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                {/* Submission Details */}
                <div className="text-sm text-muted-foreground">
                  <div>
                    Submitted:{" "}
                    {new Date(request.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {request.verifiedAt && (
                    <div className="mt-1">
                      Verified:{" "}
                      {new Date(request.verifiedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>

                {/* Existing Notes */}
                {request.notes && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Previous Notes:</p>
                    <p className="text-sm text-muted-foreground">{request.notes}</p>
                  </div>
                )}

                {/* Notes Input */}
                {request.verificationStatus === "pending" && (
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${request.id}`}>
                      Reviewer Notes (optional)
                    </Label>
                    <Textarea
                      id={`notes-${request.id}`}
                      placeholder="Add notes about this verification..."
                      value={notes[request.id] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {request.verificationStatus === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          request.userId,
                          request.id,
                          "verified",
                          true,
                          true
                        )
                      }
                      disabled={processing === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing === request.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Approve Verification
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          request.userId,
                          request.id,
                          "rejected",
                          false,
                          false
                        )
                      }
                      disabled={processing === request.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing === request.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject Verification
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
