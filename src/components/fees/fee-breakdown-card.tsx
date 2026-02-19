"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Info, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeeBreakdownProps {
  transactionAmount: number;
  platformFeePercent?: number;
  platformFeeAmount?: number;
  buyerTotalAmount?: number;
  sellerNetAmount?: number;
  showLabels?: boolean;
  compact?: boolean;
}

export function FeeBreakdownCard({
  transactionAmount,
  platformFeePercent = 5,
  platformFeeAmount: providedFeeAmount,
  buyerTotalAmount: providedBuyerTotal,
  sellerNetAmount: providedSellerNet,
  showLabels = true,
  compact = false,
}: FeeBreakdownProps) {
  // Calculate fees if not provided
  const platformFeeAmount = providedFeeAmount ?? Math.round(transactionAmount * (platformFeePercent / 100));
  const buyerTotalAmount = providedBuyerTotal ?? transactionAmount + platformFeeAmount;
  const sellerNetAmount = providedSellerNet ?? transactionAmount;

  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Transaction Amount</span>
          <span className="font-semibold">{formatCurrency(transactionAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Platform Fee ({platformFeePercent}%)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Platform fee covers transaction processing, escrow management, and migration support.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm">{formatCurrency(platformFeeAmount)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Buyer Pays</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(buyerTotalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Seller Receives</span>
          <span className="text-lg font-bold text-green-600">{formatCurrency(sellerNetAmount)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Breakdown</CardTitle>
            <CardDescription>Transaction and platform fee details</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {platformFeePercent}% Platform Fee
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Transaction Amount */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Transaction Amount</p>
              {showLabels && <p className="text-xs text-muted-foreground mt-1">Agreed purchase price</p>}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(transactionAmount)}</p>
          </div>

          {/* Platform Fee */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-semibold">Platform Fee ({platformFeePercent}%)</p>
                {showLabels && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect Capitals success fee (3%)
                  </p>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      The platform fee is charged to the buyer and covers transaction processing, 
                      secure escrow management, migration checklist support, and ongoing platform maintenance.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xl font-semibold">{formatCurrency(platformFeeAmount)}</p>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
              <div>
                <p className="font-semibold text-primary">Buyer Total Payment</p>
                {showLabels && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount buyer deposits into escrow
                  </p>
                )}
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(buyerTotalAmount)}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Seller Net Proceeds</p>
                {showLabels && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount seller receives after transaction
                  </p>
                )}
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(sellerNetAmount)}</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Fee Transfer Process</p>
              <p className="text-blue-700 dark:text-blue-300">
                The platform fee will be automatically transferred to OptiFirm after successful 
                migration and escrow release. The seller receives the full transaction amount.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}