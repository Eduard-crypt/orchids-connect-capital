import ThreadChatContent from './_components/thread-chat-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Message Thread - Connect Capitals',
  description: 'View message thread',
};

export default function ThreadPage() {
  return <ThreadChatContent />;
}