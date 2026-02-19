import type { Metadata } from "next";
import { ModerationQueue } from "./_components/moderation-queue";

export const metadata: Metadata = {
  title: "Moderation Queue — Admin",
  description: "Review and moderate business listings",
};

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Moderation Queue</h1>
          <p className="text-muted-foreground text-lg">
            Review submitted listings and approve or reject them with feedback
          </p>
        </div>
        <ModerationQueue />
      </div>
    </div>
  );
}
