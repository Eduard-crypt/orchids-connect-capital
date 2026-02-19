'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { PostCard } from '@/components/forum/post-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const postId = params.id as string;

  // Load post data on mount
  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setIsLoadingPost(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/forum/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Post not found');
          router.push('/forum');
          return;
        }
        throw new Error('Failed to load post');
      }

      const data = await res.json();
      setPost(data);
      
      // Load comments after post is loaded
      loadComments();
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Failed to load post');
      router.push('/forum');
    } finally {
      setIsLoadingPost(false);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/forum/posts?id=${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete post');

      toast.success('Post deleted');
      router.push('/forum');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const user = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground py-8">
        <div className="container">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => router.push('/forum')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold">Discussion</h1>
        </div>
      </section>

      <div className="container py-8">
        {isLoadingPost ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : post ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Post Card */}
            <PostCard
              post={post}
              currentUserId={user?.id}
              onDelete={post.userId === user?.id ? handleDeletePost : undefined}
              onUpdate={loadPost}
            />

            {/* Comments Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">
                  Comments ({comments.length})
                </h2>
              </div>

              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{comment.author?.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground text-lg">
              Post not found or has been removed.
            </p>
            <Button
              onClick={() => router.push('/forum')}
              className="mt-6">
              Return to Forum
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}