"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Shield } from "lucide-react";

interface VerificationFormProps {
  onSuccess?: () => void;
}

export function VerificationForm({ onSuccess }: VerificationFormProps) {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "id" | "proof") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size: 10MB");
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, JPG, or PNG");
      return;
    }

    if (type === "id") {
      setIdFile(file);
    } else {
      setProofFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!idFile || !proofFile) {
      toast.error("Please upload both required documents");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // Upload ID document
      const idFormData = new FormData();
      idFormData.append("file", idFile);

      // Simulate file upload - in production, upload to storage service
      const idFileUrl = `https://storage.optifirm.com/verification/${Date.now()}_${idFile.name}`;

      const idResponse = await fetch("/api/buyer-verification/documents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "id_document",
          fileName: idFile.name,
          fileUrl: idFileUrl,
          fileSize: idFile.size,
        }),
      });

      if (!idResponse.ok) {
        throw new Error("Failed to upload ID document");
      }

      // Upload proof of funds
      const proofFileUrl = `https://storage.optifirm.com/verification/${Date.now()}_${proofFile.name}`;

      const proofResponse = await fetch("/api/buyer-verification/documents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "proof_of_funds",
          fileName: proofFile.name,
          fileUrl: proofFileUrl,
          fileSize: proofFile.size,
        }),
      });

      if (!proofResponse.ok) {
        throw new Error("Failed to upload proof of funds");
      }

      toast.success("Documents uploaded successfully! Your verification is under review.");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ID Document Upload */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Government-Issued Identification
          </CardTitle>
          <CardDescription>
            Upload a valid passport, driver's license, or national ID card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="id-upload" className="text-sm font-semibold">
                Select Document (PDF, JPG, PNG - Max 10MB)
              </Label>
              <div className="mt-2">
                <Input
                  id="id-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "id")}
                  disabled={uploading}
                  className="cursor-pointer"
                />
              </div>
            </div>
            {idFile && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  {idFile.name} ({(idFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proof of Funds Upload */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Proof of Financial Capacity
          </CardTitle>
          <CardDescription>
            Upload bank statement, investment account statement, or letter of credit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="proof-upload" className="text-sm font-semibold">
                Select Document (PDF, JPG, PNG - Max 10MB)
              </Label>
              <div className="mt-2">
                <Input
                  id="proof-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "proof")}
                  disabled={uploading}
                  className="cursor-pointer"
                />
              </div>
            </div>
            {proofFile && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  {proofFile.name} ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!idFile || !proofFile || uploading}
        className="w-full btn-hover-effect"
        size="lg"
      >
        {uploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Uploading Documents...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Submit for Verification
          </>
        )}
      </Button>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-foreground">Important Information:</p>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                <li>Documents are reviewed by our compliance team within 24-48 business hours</li>
                <li>All personal information is encrypted and stored securely in compliance with data protection regulations</li>
                <li>Upon approval, you will gain immediate access to confidential business listings and financial data</li>
                <li>Your verified status enables direct communication with sellers and their advisors</li>
              </ul>
              <p className="text-sm text-muted-foreground mb-4">
                Connect Capitals uses secure verification to protect all parties in transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatusDisplayProps {
  status: "pending" | "verified" | "rejected";
  identityVerified: boolean;
  proofOfFundsVerified: boolean;
  verifiedAt?: string | number | Date | null;
  notes?: string | null;
}

export function VerificationStatus({
  status,
  identityVerified,
  proofOfFundsVerified,
  verifiedAt,
  notes,
}: StatusDisplayProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white px-3 py-1">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="px-3 py-1">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Verification Status</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold">Government-Issued Identification</span>
            </div>
            {identityVerified ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Under Review</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold">Proof of Financial Capacity</span>
            </div>
            {proofOfFundsVerified ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Under Review</span>
              </div>
            )}
          </div>
        </div>

        {verifiedAt && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              Verified on {new Date(verifiedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {notes && status === "rejected" && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm font-semibold mb-2 text-destructive">Reason for Decline:</p>
            <p className="text-sm text-muted-foreground">{notes}</p>
          </div>
        )}

        {status === "pending" && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Your documents are under review
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Our compliance team is reviewing your submitted documents. You will receive a notification once the verification process is complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}