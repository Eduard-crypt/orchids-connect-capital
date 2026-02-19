"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trash2, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AuthPromptDialog } from '@/components/forum/auth-prompt-dialog';
import { ShareDialog } from '@/components/forum/share-dialog';
import { useSession } from '@/lib/auth-client';

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    likesCount: number;
    commentsCount: number;
    handshakesCount?: number;
    createdAt: string;
    author: {
      name: string;
      email: string;
      image?: string;
    };
    category?: {
      name: string;
    };
  };
  currentUserId?: string;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function PostCard({ post, currentUserId, onDelete, onUpdate }: PostCardProps) {
  const { data: session, isPending } = useSession();
  
  // LIKE state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);

    const initials = post.author.name?.slice(0, 2).toUpperCase() || 'U';

  const timeAgo = getTimeAgo(new Date(post.createdAt));

  // Fetch initial LIKE status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!session?.user) return;
      
      try {
        const token = localStorage.getItem('bearer_token');
        const res = await fetch(`/api/forum/posts/${post.id}/liked`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked);
        }
      } catch (error) {
        console.error('Failed to fetch like status:', error);
      }
    };

    fetchLikeStatus();
  }, [post.id, session?.user]);

  // LIKE button handler
  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Don't do anything while session is loading
    if (isPending) return;

    if (!session?.user) {
      toast.error('You need an account to like posts');
      setShowAuthPrompt(true);
      return;
    }

    if (isLikeLoading) return;

    setIsLikeLoading(true);
    
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/forum/posts/${post.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await res.json();
      
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLikeLoading(false);
    }
  };

    // Share button handler
    const handleShare = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const shareData = {
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: `https://connectcapitals.com/forum/posts/${post.id}`,
      };
      
      // Try Web Share API first
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Share failed:', err);
          } else {
            return; // User cancelled
          }
        }
      }

      // Fallback to custom dialog
      setShowShareDialog(true);
    };

    return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{post.author.name}</h3>
                <p className="text-sm text-muted-foreground">{timeAgo}</p>
              </div>
              {post.category && (
                <Badge variant="secondary">{post.category.name}</Badge>
              )}
            </div>

            <h2 className="text-xl font-bold mt-4 mb-2">{post.title}</h2>
            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              {/* LIKE BUTTON */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`${isLiked ? 'text-accent' : ''}`}>
                <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="ml-auto text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} />
      <ShareDialog 
        open={showShareDialog} 
        onOpenChange={setShowShareDialog} 
        url={`https://connectcapitals.com/forum/posts/${post.id}`}
        title={post.title}
        description={post.content.substring(0, 100) + '...'}
      />
    </>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}