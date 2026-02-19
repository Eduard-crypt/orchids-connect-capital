"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PenSquare } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePostFormProps {
  user: {
    name?: string;
    email?: string;
    image?: string;
  };
  onPostCreated: () => void;
}

export function CreatePostForm({ user, onPostCreated }: CreatePostFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = user.name?.slice(0, 2).toUpperCase() || 'U';

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('bearer_token');
      
      console.log('Submitting post:', { title: title.trim(), content: content.trim() });
      
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Show specific error message from backend
        const errorMessage = data.error || 'Failed to create post';
        console.error('Post creation failed:', data);
        toast.error(errorMessage);
        return;
      }

      console.log('Post created successfully:', data);
      toast.success('Post created successfully!');
      setTitle('');
      setContent('');
      setIsOpen(false);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex gap-3 items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image} alt={user.name || user.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-full px-4 py-3 text-muted-foreground hover:bg-muted/80 transition-colors">
              Start a post...
            </div>
            <Button size="icon" variant="ghost">
              <PenSquare className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name || user.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name || user.email}</p>
            </div>
          </div>

          <Input
            placeholder="What do you want to talk about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
            disabled={isSubmitting}
          />

          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}