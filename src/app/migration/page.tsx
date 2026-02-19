"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { MigrationChecklist } from "@/components/migration/migration-checklist";

interface MigrationChecklistData {
  id: number;
  escrowId: number;
}

export default function MigrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const escrowId = searchParams.get("escrowId");
  
  const [checklist, setChecklist] = useState<MigrationChecklistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (escrowId && session) {
      fetchChecklistByEscrow();
    }
  }, [escrowId, session]);

  const fetchChecklistByEscrow = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/migration/escrow/${escrowId}?escrowId=${escrowId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setChecklist(null);
        } else {
          throw new Error("Failed to fetch checklist");
        }
      } else {
        const data = await response.json();
        setChecklist(data);
      }
    } catch (error) {
      toast.error("Failed to load migration checklist");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklist = async () => {
    if (!escrowId) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/migration/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          escrowId: parseInt(escrowId),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checklist");
      }

      const data = await response.json();
      setChecklist(data);
      toast.success("Migration checklist created!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Migration Checklist</h3>
              <p className="text-muted-foreground mb-4">
                A migration checklist hasn't been created for this escrow yet.
              </p>
              <Button onClick={handleCreateChecklist}>Create Migration Checklist</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <MigrationChecklist checklistId={checklist.id} />
      </div>
    </div>
  );
}
