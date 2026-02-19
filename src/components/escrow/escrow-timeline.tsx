"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight,
  DollarSign,
  Truck,
  FileCheck,
  Unlock
} from "lucide-react";
import { format } from "date-fns";

interface EscrowTransaction {
  id: number;
  status: "initiated" | "funded" | "in_migration" | "complete" | "released";
  escrowAmount: number;
  escrowProvider?: string;
  escrowReferenceId?: string;
  initiatedAt?: string;
  fundedAt?: string;
  migrationStartedAt?: string;
  completedAt?: string;
  releasedAt?: string;
  notes?: string;
}

const statusSteps = [
  {
    key: "initiated",
    label: "Initiated",
    description: "Escrow transaction created",
    icon: DollarSign,
    dateField: "initiatedAt",
  },
  {
    key: "funded",
    label: "Funded",
    description: "Funds deposited into escrow",
    icon: CheckCircle2,
    dateField: "fundedAt",
  },
  {
    key: "in_migration",
    label: "In Migration",
    description: "Business assets being transferred",
    icon: Truck,
    dateField: "migrationStartedAt",
  },
  {
    key: "complete",
    label: "Complete",
    description: "Migration completed successfully",
    icon: FileCheck,
    dateField: "completedAt",
  },
  {
    key: "released",
    label: "Released",
    description: "Funds released to seller",
    icon: Unlock,
    dateField: "releasedAt",
  },
];

const statusOrder = {
  initiated: 0,
  funded: 1,
  in_migration: 2,
  complete: 3,
  released: 4,
};

export function EscrowTimeline({ transaction }: { transaction: EscrowTransaction }) {
  const currentStatusIndex = statusOrder[transaction.status];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escrow Status</CardTitle>
        <CardDescription>
          Reference: {transaction.escrowReferenceId || `ESC-${transaction.id}`}
          {transaction.escrowProvider && ` • ${transaction.escrowProvider}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-border" />

          {/* Timeline Steps */}
          <div className="space-y-8">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isComplete = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const date = transaction[step.dateField as keyof EscrowTransaction];

              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isComplete
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <StepIcon className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{step.label}</h4>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {step.description}
                    </p>
                    {date && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Amount Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Escrow Amount</p>
              <p className="text-2xl font-bold">${transaction.escrowAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
            <p className="text-sm text-blue-800">{transaction.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
