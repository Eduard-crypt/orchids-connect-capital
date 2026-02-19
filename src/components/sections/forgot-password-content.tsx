'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackgroundSlideshow } from '@/components/ui/background-slideshow';

export default function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send reset email');
        setIsLoading(false);
        return;
      }

      // Always show success message for security (don't reveal if email exists)
      setEmailSent(true);
      
      // Log the event
      await fetch('/api/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'password_reset_requested',
          metadata: { email }
        })
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <BackgroundSlideshow 
          images={[
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-business-marketplace-concep-affb8b0c-20251103225233.jpg',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/business-consulting-and-expert-support-c-e30e0cbb-20251103225231.jpg',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/business-evaluation-and-analysis-concept-c4831daa-20251103225230.jpg'
          ]}
          interval={5000}
        />
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-primary mb-3">
              Check Your Email
            </h1>
            
            <p className="text-muted-foreground mb-6">
              If an account exists with <span className="font-semibold text-foreground">{email}</span>, you will receive a password reset link shortly.
            </p>

            <div className="bg-muted/50 border border-primary/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Didn't receive the email?</strong><br />
                Check your spam folder or try again in a few minutes.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <BackgroundSlideshow 
        images={[
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-business-marketplace-concep-affb8b0c-20251103225233.jpg',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/business-consulting-and-expert-support-c-e30e0cbb-20251103225231.jpg',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/business-evaluation-and-analysis-concept-c4831daa-20251103225230.jpg'
        ]}
        interval={5000}
      />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm">
              Reset Your Password
            </span>
          </h1>
          <p className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm text-lg font-medium">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-muted/30 border border-primary/10 rounded-lg p-4">
          <p className="text-sm text-foreground/80 text-center font-medium">
            For security reasons, we will send a reset link only if your email is registered. The link expires in 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}