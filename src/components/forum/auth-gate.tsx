'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface AuthGateProps {
  redirectUrl: string;
  title?: string;
  description?: string;
}

export function AuthGate({ 
  redirectUrl,
  title = "Join Connect Capitals to view this discussion",
  description = "This post is part of our forum for business owners and investors. Please log in or create an account to view the full content and participate in the conversation."
}: AuthGateProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const handleSignUp = () => {
    router.push(`/join-us?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl">
        <Card className="p-8 md:p-12 shadow-2xl border-2 border-primary/20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
            {title}
          </h1>

          {/* Description */}
          <p className="text-center text-muted-foreground text-lg mb-8 leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <Button
              onClick={handleSignUp}
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-white font-semibold py-6 text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              Create an account
            </Button>

            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full border-2 border-primary text-primary font-semibold py-6 text-lg hover:bg-primary hover:text-white transition-all duration-300">
              Log in
            </Button>
          </div>

          {/* Benefits */}
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-6 font-medium">
              What you'll get with a free account:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Verified Listings</p>
                <p className="text-xs text-muted-foreground mt-1">Access exclusive deals</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground">Forum Access</p>
                <p className="text-xs text-muted-foreground mt-1">Connect with experts</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm font-medium text-foreground">Free Valuations</p>
                <p className="text-xs text-muted-foreground mt-1">Know your business worth</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
