'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundSlideshow } from '@/components/ui/background-slideshow';

export default function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Email:', formData.email);
    console.log('Redirect URL:', redirect);
    
    try {
      // Step 1: Attempt sign in
      console.log('Step 1: Calling authClient.signIn.email...');
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: redirect,
      });
      
      console.log('Sign-in response:', { data, error });
      
      if (error) {
        console.error('❌ Login failed:', error);
        
        // Log failed attempt to audit log
        try {
          await fetch('/api/audit-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'login_failed',
              metadata: { email: formData.email, reason: error.code || error.message }
            })
          });
        } catch (auditError) {
          console.error('Audit log failed (non-critical):', auditError);
        }
        
        toast.error('Invalid email or password. Please make sure you have already registered an account and try again.');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Login successful!');
      
      // Step 2: Wait for token to be stored
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Check if 2FA is enabled
      console.log('Step 2: Checking 2FA status...');
      const token = localStorage.getItem('bearer_token');
      console.log('Bearer token retrieved:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.warn('⚠️ No bearer token found, proceeding without 2FA check');
        toast.success('Login successful! Redirecting...');
        console.log('Redirecting to:', redirect);
        router.push(redirect);
        return;
      }
      
      try {
        const twoFactorCheck = await fetch('/api/2fa/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('2FA status response:', twoFactorCheck.status);
        
        if (twoFactorCheck.ok) {
          const twoFactorData = await twoFactorCheck.json();
          console.log('2FA data:', twoFactorData);
          
          if (twoFactorData.enabled) {
            console.log('2FA required, showing verification form');
            setRequires2FA(true);
            setIsLoading(false);
            return;
          }
        } else {
          console.warn('2FA check returned non-OK status, proceeding without 2FA');
        }
      } catch (twoFactorError) {
        console.error('2FA check failed:', twoFactorError);
        console.log('Proceeding without 2FA due to error');
        // Don't block login if 2FA check fails
      }
      
      // Step 4: Log successful login
      console.log('Step 3: Logging audit trail...');
      try {
        await fetch('/api/audit-log', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'login_success',
            metadata: { email: formData.email }
          })
        });
        console.log('✅ Audit log recorded');
      } catch (auditError) {
        console.error('Audit logging failed (non-critical):', auditError);
      }
      
      // Step 5: Redirect to target page
      console.log('Step 4: Redirecting...');
      toast.success('Login successful! Redirecting...');
      
      // Use router.push for internal navigation
      console.log('Final redirect URL:', redirect);
      router.push(redirect);
      
    } catch (err) {
      console.error('❌ UNEXPECTED LOGIN ERROR:', err);
      toast.error(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
      setIsLoading(false);
    }
    
    console.log('=== LOGIN ATTEMPT END ===');
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (twoFactorCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    
    console.log('=== 2FA VERIFICATION START ===');
    setVerifying2FA(true);
    
    try {
      const token = localStorage.getItem('bearer_token');
      console.log('Verifying 2FA code with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: twoFactorCode })
      });
      
      console.log('2FA verify response status:', response.status);
      const data = await response.json();
      console.log('2FA verify response data:', data);
      
      if (!response.ok || !data.verified) {
        console.error('❌ 2FA verification failed');
        
        // Log failed 2FA
        try {
          await fetch('/api/audit-log', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              action: '2fa_failed',
              metadata: { email: formData.email }
            })
          });
        } catch (auditError) {
          console.error('Audit log failed (non-critical):', auditError);
        }
        
        toast.error('Invalid 2FA code. Please try again.');
        setVerifying2FA(false);
        return;
      }
      
      console.log('✅ 2FA verification successful');
      
      // Log successful 2FA verification
      try {
        await fetch('/api/audit-log', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            action: '2fa_verified',
            metadata: { email: formData.email }
          })
        });
      } catch (auditError) {
        console.error('Audit log failed (non-critical):', auditError);
      }
      
      toast.success('2FA verified successfully! Redirecting...');
      console.log('Redirecting to:', redirect);
      router.push(redirect);
      
    } catch (error) {
      console.error('❌ 2FA verification error:', error);
      toast.error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setVerifying2FA(false);
    }
    
    console.log('=== 2FA VERIFICATION END ===');
  };

  const handleGoogle = async () => {
    console.log('=== GOOGLE SIGN-IN START ===');
    try {
      const { error } = await authClient.signIn.social({ provider: 'google' });
      if (error?.code) {
        console.error('❌ Google sign-in failed:', error);
        toast.error('Google sign-in failed');
      }
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      toast.error('Google sign-in failed');
    }
  };

  const handleLinkedIn = async () => {
    console.log('=== LINKEDIN SIGN-IN START ===');
    try {
      const { error } = await authClient.signIn.social({ provider: 'linkedin' });
      if (error?.code) {
        console.error('❌ LinkedIn sign-in failed:', error);
        toast.error('LinkedIn sign-in failed');
      }
    } catch (err) {
      console.error('❌ LinkedIn sign-in error:', err);
      toast.error('LinkedIn sign-in failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Show 2FA verification form if required
  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Shield className="w-5 h-5 text-primary" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-center">
                Enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <Label htmlFor="2fa-code">Authentication Code</Label>
                  <Input
                    id="2fa-code"
                    type="text"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifying2FA || twoFactorCode.length !== 6}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying2FA ? 'Verifying...' : 'Verify & Continue'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setTwoFactorCode('');
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
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
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-muted-foreground text-base">
            Log in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            {/* Email Field */}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-accent focus:ring-accent border-input rounded cursor-pointer"
                />
                <Label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid gap-3">
              <button 
                type="button"
                onClick={handleGoogle} 
                className="w-full flex items-center justify-center gap-3 border border-input rounded-lg py-3 px-4 font-semibold hover:bg-muted transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button 
                type="button"
                onClick={handleLinkedIn} 
                className="w-full flex items-center justify-center gap-3 border border-input rounded-lg py-3 px-4 font-semibold hover:bg-muted transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
              </button>
            </div>

            {/* Divider */}
            <div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">
                    or
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In to Your Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/join-us" 
                className="font-semibold text-primary hover:text-accent transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-accent transition-colors">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:text-accent transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Free Access</h3>
            <p className="text-xs text-muted-foreground">To all listings</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl font-bold">★</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Expert Help</h3>
            <p className="text-xs text-muted-foreground">24/7 Support</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl font-bold">⚡</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Quick Evaluation</h3>
            <p className="text-xs text-muted-foreground">Of your business</p>
          </div>
        </div>
      </div>
    </div>
  );
}