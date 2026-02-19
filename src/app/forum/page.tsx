"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { PostCard } from '@/components/forum/post-card';
import { CreatePostForm } from '@/components/forum/create-post-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Clock, Users, Linkedin, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ForumPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=' + encodeURIComponent('/forum'));
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      loadCategories();
      loadPosts();
    }
  }, [session, selectedCategory, sortBy]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch('/api/forum/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to load categories');

      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const params = new URLSearchParams({
        sort: sortBy,
        limit: '20'
      });

      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }

      const res = await fetch(`/api/forum/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to load posts');

      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/forum/posts?id=${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete post');

      toast.success('Post deleted');
      loadPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = session.user as { name?: string; email?: string; image?: string; id?: string };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Business Forum</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Connect with professionals, share insights, and discuss everything related to business growth
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              {/* Founder Profile Card */}
                <Card className="p-4 overflow-hidden relative group border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="absolute -top-6 -right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                    <Linkedin className="h-24 w-24 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                        <Image
                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-headshot-of-eduar-906d8be3-20251129132834.jpg"
                          alt="Eduard Sahakyan"
                          fill
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight">Eduard Sahakyan</h3>
                        <p className="text-xs text-primary font-medium">Founder & Strategist</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Passionate about business structure assessment, AI workflows, and strategic growth. Let's connect!
                    </p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={() => window.open('https://www.linkedin.com/in/eduard-sahakyan-76721930b/', '_blank')}
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect on LinkedIn
                    </Button>
                  </div>
                </Card>

                {/* Company Profile Card */}
                <Card className="p-4 overflow-hidden relative group border-primary/20 bg-gradient-to-br from-blue-600/5 to-transparent">
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                    <TrendingUp className="h-24 w-24 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden border-2 border-primary/10 shadow-sm bg-white">
                        <Image
                            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/ChatGPT-Image-Jan-9-2026-01_51_37-PM-1768164586312.png?width=8000&height=8000&resize=contain"
                          alt="Connect Capitals"
                          fill
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight">Connect Capitals</h3>
                        <p className="text-xs text-primary font-medium">Intelligence • Growth • M&A</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Transforming asset marketplaces as Europe's fastest-growing platform with quality services and secure transactions.
                    </p>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => window.open('https://www.linkedin.com/in/connect-capitals-41544339b/', '_blank')}
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        Connect Our Company
                      </Button>
                  </div>
                </Card>

            {/* Forum Stats Card */}
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4">Forum Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shared</span>
                  <span className="font-semibold">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-semibold">
                    {new Set(posts.map(p => p.author?.email)).size}
                  </span>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-6">
            {/* Create Post */}
            <CreatePostForm user={user} onPostCreated={loadPosts} />

            {/* Sort Options */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-sm">Sort by:</span>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'newest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('newest')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Newest
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Popular
                  </Button>
                </div>
              </div>
            </Card>

            {/* Posts Feed */}
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No posts yet. Be the first to start a discussion!
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    onDelete={
                      post.userId === user.id
                        ? () => handleDeletePost(post.id)
                        : undefined
                    }
                    onUpdate={loadPosts}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
