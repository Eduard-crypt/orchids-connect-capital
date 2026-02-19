"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  Circle, 
  Clock,
  UserCheck,
  Building2,
  Code,
  CreditCard,
  Megaphone,
  Package,
  MoreHorizontal,
  Globe
} from "lucide-react";

interface MigrationTask {
  id: number;
  taskName: string;
  taskCategory: string;
  taskDescription: string | null;
  status: "pending" | "in_progress" | "complete";
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt: string | null;
  notes: string | null;
  completedAt: string | null;
}

interface MigrationChecklist {
  id: number;
  status: "in_progress" | "complete";
  tasks: MigrationTask[];
  tasksByCategory: Record<string, MigrationTask[]>;
  userRole: "buyer" | "seller";
  listing: {
    title: string;
  };
}

const categoryIcons: Record<string, any> = {
  domain: Globe,
  hosting: Building2,
  code: Code,
  payments: CreditCard,
  ads: Megaphone,
  inventory: Package,
  other: MoreHorizontal,
};

const categoryLabels: Record<string, string> = {
  domain: "Domain Transfer",
  hosting: "Hosting & Infrastructure",
  code: "Codebase & Repositories",
  payments: "Payment Processors",
  ads: "Advertising Accounts",
  inventory: "Inventory & Suppliers",
  other: "Other Tasks",
};

export function MigrationChecklist({ checklistId }: { checklistId: number }) {
  const [checklist, setChecklist] = useState<MigrationChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);

  const fetchChecklist = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/migration/${checklistId}?id=${checklistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch checklist");

      const data = await response.json();
      setChecklist(data);
    } catch (error) {
      toast.error("Failed to load migration checklist");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (taskId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/migration/tasks/${taskId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to confirm task");
      }

      toast.success("Task confirmed successfully!");
      fetchChecklist();
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

  if (!checklist) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Migration checklist not found</p>
        </CardContent>
      </Card>
    );
  }

  const totalTasks = checklist.tasks.length;
  const completedTasks = checklist.tasks.filter((t) => t.status === "complete").length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const categories = Object.keys(checklist.tasksByCategory);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Progress</CardTitle>
          <CardDescription>{checklist.listing.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {checklist.status === "complete" && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="font-medium text-green-900">
                    Migration Complete! Ready for escrow release.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Category */}
      {categories.map((category) => {
        const CategoryIcon = categoryIcons[category] || MoreHorizontal;
        const tasks = checklist.tasksByCategory[category];

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{categoryLabels[category] || category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => {
                  const isComplete = task.status === "complete";
                  const userConfirmed =
                    checklist.userRole === "buyer" ? task.buyerConfirmed : task.sellerConfirmed;
                  const otherPartyConfirmed =
                    checklist.userRole === "buyer" ? task.sellerConfirmed : task.buyerConfirmed;

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 ${
                        isComplete ? "bg-green-50 border-green-200" : "bg-background"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{task.taskName}</h4>
                          {task.taskDescription && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {task.taskDescription}
                            </p>
                          )}

                          {/* Confirmation Status */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <UserCheck
                                className={`h-4 w-4 ${
                                  task.buyerConfirmed ? "text-green-600" : "text-gray-400"
                                }`}
                              />
                              <span className="text-sm">
                                Buyer {task.buyerConfirmed ? "✓" : "○"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck
                                className={`h-4 w-4 ${
                                  task.sellerConfirmed ? "text-green-600" : "text-gray-400"
                                }`}
                              />
                              <span className="text-sm">
                                Seller {task.sellerConfirmed ? "✓" : "○"}
                              </span>
                            </div>
                          </div>

                          {task.notes && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                              <p className="text-xs text-blue-900">{task.notes}</p>
                            </div>
                          )}

                          {/* Action Button */}
                          {!isComplete && !userConfirmed && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirm(task.id)}
                              disabled={!otherPartyConfirmed && task.status !== "pending"}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirm Completion
                            </Button>
                          )}

                          {!isComplete && userConfirmed && !otherPartyConfirmed && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Waiting for {checklist.userRole === "buyer" ? "seller" : "buyer"}{" "}
                              confirmation
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
