"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FeeBreakdownCard } from "./fee-breakdown-card";
import { AlertTriangle } from "lucide-react";

interface FeeAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionAmount: number;
  onAccept: (notes: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  mode: "accept" | "reject" | null;
  isBuyer?: boolean;
}

export function FeeAcceptanceDialog({
  open,
  onOpenChange,
  transactionAmount,
  onAccept,
  onReject,
  mode,
  isBuyer = false,
}: FeeAcceptanceDialogProps) {
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === "accept" && !acknowledged) return;

    setLoading(true);
    try {
      if (mode === "accept") {
        await onAccept(notes);
      } else if (mode === "reject") {
        await onReject(notes);
      }
      onOpenChange(false);
      setNotes("");
      setAcknowledged(false);
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setLoading(false);
    }
  };

  const platformFeePercent = 5;
  const platformFeeAmount = Math.round(transactionAmount * (platformFeePercent / 100));
  const buyerTotalAmount = transactionAmount + platformFeeAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "accept" ? "Accept LOI Offer" : "Reject LOI Offer"}
          </DialogTitle>
          <DialogDescription>
            {mode === "accept"
              ? "Review the fee breakdown and transaction details before accepting this offer."
              : "Provide feedback to the buyer about why you're rejecting this offer."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {mode === "accept" && (
            <>
              {/* Fee Breakdown */}
              <FeeBreakdownCard
                transactionAmount={transactionAmount}
                platformFeePercent={platformFeePercent}
                platformFeeAmount={platformFeeAmount}
                buyerTotalAmount={buyerTotalAmount}
                sellerNetAmount={transactionAmount}
                showLabels={true}
                compact={false}
              />

              {/* Important Notice */}
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    Important Information
                  </p>
                  <ul className="text-orange-700 dark:text-orange-300 space-y-1 list-disc list-inside">
                    <li>The buyer will pay the transaction amount plus a {platformFeePercent}% platform fee</li>
                    <li>You will receive the full transaction amount of ${(transactionAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</li>
                    <li>The platform fee covers escrow services, migration support, and platform maintenance</li>
                    <li>Once accepted, this LOI will move to escrow for transaction completion</li>
                  </ul>
                </div>
              </div>

              {/* Acknowledgment Checkbox */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="acknowledge"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I understand and acknowledge the fee structure
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    I confirm that I have reviewed the fee breakdown and understand that the buyer
                    will pay ${(buyerTotalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} total, 
                    and I will receive ${(transactionAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {mode === "accept" ? "Acceptance Notes (Optional)" : "Rejection Reason"}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                mode === "accept"
                  ? "Add any comments or conditions..."
                  : "Explain why you're rejecting this offer..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {mode === "accept"
                ? "These notes will be shared with the buyer."
                : "This feedback will help the buyer understand your decision."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setNotes("");
              setAcknowledged(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (mode === "accept" && !acknowledged)}
            variant={mode === "reject" ? "destructive" : "default"}
          >
            {loading ? "Processing..." : mode === "accept" ? "Accept Offer" : "Reject Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
