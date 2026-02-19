import type { Metadata } from "next";
import RentAIAgentContent from "./rent-ai-agent-content";

export const metadata: Metadata = {
  title: "Rent an AI Agent | Connect Capitals",
  description:
    "Choose from AI agents for market intelligence, customer support, content generation, and sales assistance. Secure, fast, and ready in minutes.",
  openGraph: {
    title: "Rent an AI Agent | Connect Capitals",
    description:
      "Choose from AI agents for market intelligence, customer support, content generation, and sales assistance.",
    url: "/rent-ai-agent",
    type: "website",
  },
  alternates: { canonical: "/rent-ai-agent" },
};

export default function RentAIAgentPage() {
  return <RentAIAgentContent />;
}