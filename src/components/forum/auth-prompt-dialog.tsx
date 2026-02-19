"use client";

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthPromptDialog({ open, onOpenChange }: AuthPromptDialogProps) {
  const router = useRouter();

  const handleSignUp = () => {
    onOpenChange(false);
    router.push('/join-us');
  };

  const handleLogIn = () => {
    onOpenChange(false);
    router.push('/login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Join our platform</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Create an account or log in to follow discussions, like posts and get notified about deal opportunities.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-col gap-3 pt-4">
          <Button
            onClick={handleSignUp}
            className="w-full"
            size="lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Create an account
          </Button>
          <Button
            onClick={handleLogIn}
            variant="outline"
            className="w-full"
            size="lg">
            <LogIn className="h-5 w-5 mr-2" />
            Log in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
