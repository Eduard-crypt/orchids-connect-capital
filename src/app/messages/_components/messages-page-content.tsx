"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, User, Mail, ExternalLink, MailOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Thread {
  id: number;
  listingId: number;
  subject: string;
  lastMessageAt: string | null;
  unreadCount: number;
  otherParticipant: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  listing: {
    id: number;
    title: string;
    askingPrice: number | null;
    businessType: string | null;
  } | null;
  lastMessage: {
    id: number;
    messageBody: string;
    senderId: string;
    createdAt: string;
  } | null;
}

export default function MessagesPageContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=' + encodeURIComponent('/messages'));
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchThreads();
    }
  }, [session]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/messages/threads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsUnread = async (threadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/messages/threads/${threadId}/mark-unread`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark as unread');
      }

      toast.success('Marked as unread');
      fetchThreads();
    } catch (error) {
      console.error('Error marking as unread:', error);
      toast.error('Failed to mark as unread');
    }
  };

  const handleThreadClick = (threadId: number) => {
    setSelectedThreadId(threadId);
    router.push(`/messages/${threadId}`);
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">
            View and manage your conversations with buyers and sellers
          </p>
        </div>

        {threads.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
            <p className="text-muted-foreground mb-6">
              Start a conversation by contacting a seller on a listing
            </p>
            <Button onClick={() => router.push('/buy-a-business')}>
              Browse Listings
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <Card
                key={thread.id}
                className={`p-5 cursor-pointer transition-all hover:shadow-md border-2 ${
                  thread.unreadCount > 0
                    ? 'border-accent/30 bg-accent/5'
                    : 'border-border'
                }`}
                onClick={() => handleThreadClick(thread.id)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={thread.otherParticipant?.image || undefined} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {thread.otherParticipant?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.listing?.title || 'Listing'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {thread.unreadCount > 0 && (
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            {thread.unreadCount} new
                          </Badge>
                        )}
                        {thread.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    {thread.lastMessage && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {thread.lastMessage.senderId === session.user.id && 'You: '}
                        {thread.lastMessage.messageBody}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {thread.listing?.businessType && (
                        <Badge variant="outline" className="text-xs">
                          {thread.listing.businessType}
                        </Badge>
                      )}
                      {thread.listing?.askingPrice && (
                        <Badge variant="outline" className="text-xs">
                          ${thread.listing.askingPrice.toLocaleString()}
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={(e) => handleMarkAsUnread(thread.id, e)}
                      >
                        <MailOpen className="h-4 w-4 mr-1" />
                        Mark Unread
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/listings/${thread.listingId}`);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Listing
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}