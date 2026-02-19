"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

interface NDADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  listingTitle: string;
  onSuccess?: () => void;
}

export function NDADialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  onSuccess,
}: NDADialogProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSign = async () => {
    if (!agreed) {
      toast.error("Please agree to the NDA terms");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/nda/${listingId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sign NDA");
      }

      toast.success("NDA signed successfully! You can now view confidential information.");
      onOpenChange(false);
      
      // Call success callback or refresh page
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error signing NDA:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign NDA");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Non-Disclosure Agreement (NDA)
          </DialogTitle>
          <DialogDescription>
            Please read and agree to the terms below to access confidential information about "{listingTitle}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Confidential Information</h3>
              <p className="text-muted-foreground">
                By signing this NDA, you acknowledge that you will have access to confidential and proprietary 
                information about the business listing, including but not limited to: financial records, 
                customer data, business operations, trade secrets, pricing strategies, brand identity, 
                website URLs, and any other sensitive business information.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Obligations</h3>
              <p className="text-muted-foreground mb-2">You agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Keep all confidential information strictly private</li>
                <li>Not disclose any information to third parties without written consent</li>
                <li>Use the information solely for evaluating a potential acquisition</li>
                <li>Not compete with or replicate the business model</li>
                <li>Return or destroy all confidential materials upon request</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Duration</h3>
              <p className="text-muted-foreground">
                This agreement remains in effect for 2 years from the date of signing, or until the 
                confidential information becomes publicly available through no fault of your own.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Penalties</h3>
              <p className="text-muted-foreground">
                Breach of this agreement may result in legal action, including claims for damages and 
                injunctive relief. You may be held liable for any losses incurred by the business owner 
                due to unauthorized disclosure or use of confidential information.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Consent to Record</h3>
              <p className="text-muted-foreground">
                By signing this NDA, you consent to the recording of your agreement details, including 
                timestamp, IP address, and browser information, for legal verification purposes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Governing Law</h3>
              <p className="text-muted-foreground">
                This agreement shall be governed by and construed in accordance with the laws of the 
                jurisdiction where the business is registered.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-3 rounded-md border p-4 bg-muted/50">
          <Checkbox
            id="nda-agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            disabled={isSubmitting}
          />
          <Label
            htmlFor="nda-agree"
            className="text-sm font-medium leading-relaxed cursor-pointer"
          >
            I have read and agree to the terms of this Non-Disclosure Agreement. I understand that 
            my agreement will be recorded with timestamp, IP address, and browser information for 
            legal purposes.
          </Label>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!agreed || isSubmitting}
            className="btn-hover-effect"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Sign NDA & Unlock Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
