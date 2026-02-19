import MessagesPageContent from './_components/messages-page-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages - Connect Capitals',
  description: 'Your Connect Capitals messages',
};

export default function MessagesPage() {
  return <MessagesPageContent />;
}