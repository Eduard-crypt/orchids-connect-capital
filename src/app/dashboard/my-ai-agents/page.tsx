import type { Metadata } from "next";
import MyAIAgentsContent from "./_components/my-ai-agents-content";
import { PageLoadAnimation } from "@/components/page-load-animation";

export const metadata: Metadata = {
  title: 'My AI Agents - Connect Capitals',
  description: 'Manage your AI agent subscriptions',
};

export default function MyAIAgentsPage() {
  return (
    <>
      <PageLoadAnimation />
      <MyAIAgentsContent />
    </>
  );
}