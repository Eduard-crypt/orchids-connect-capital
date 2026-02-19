'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Shield, TrendingUp, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Link } from 'lucide-react';

// Field error type
type FieldErrors = {
  [key: string]: string;
};

export default function JoinUsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [activeTab, setActiveTab] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessOwner: '',
    businessInterest: '',
    location: '',
    purchaseTimeframe: '',
    // Valuation fields
    businessName: '',
    businessWebsite: '',
    businessType: '',
    monthlyRevenue: '',
    monthlyProfit: '',
    businessAge: '',
    additionalInfo: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one digit
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasDigit;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    // Personal Information
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Business Information
    if (!formData.businessOwner) {
      errors.businessOwner = 'Please select whether you own a business';
    }
    
    if (!formData.businessInterest) {
      errors.businessInterest = 'Please select your primary business interest';
    }
    
    if (!formData.location) {
      errors.location = 'Please select your business location';
    }
    
    // Terms agreement
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register user with better-auth
      const { data, error } = await authClient.signUp.email({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      });
      
      if (error?.code) {
        const errorMap: Record<string, string> = {
          'USER_ALREADY_EXISTS': 'An account with this email already exists',
          'INVALID_EMAIL': 'Please enter a valid email address',
          'WEAK_PASSWORD': 'Password is too weak. Please use a stronger password',
        };
        
        const errorMessage = errorMap[error.code] || 'Registration failed. Please try again.';
        toast.error(errorMessage);
        
        if (error.code === 'USER_ALREADY_EXISTS') {
          setFieldErrors({ email: 'This email is already registered' });
        }
        
        // Log failed registration attempt
        await fetch('/api/audit-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'registration_failed',
            metadata: { email: formData.email, reason: error.code }
          })
        });
        
        setIsLoading(false);
        return;
      }
      
      // Create user profile with business information
      const token = localStorage.getItem('bearer_token');
      if (token) {
        await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            phone: formData.phone,
            ownsBusiness: formData.businessOwner === 'yes',
            primaryBusinessInterest: formData.businessInterest,
            businessLocation: formData.location,
            purchaseTimeframe: formData.purchaseTimeframe,
          })
        });
        
        // Log successful registration
        await fetch('/api/audit-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'registration_success',
            metadata: { email: formData.email }
          })
        });
      }
      
      // Show success message
      toast.success('Your account has been created. Redirecting...');
      
      // Redirect to the target page after short delay
      setTimeout(() => {
        router.push(redirect);
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // TODO: Send valuation request to backend
      toast.success('Valuation request submitted! We\'ll contact you within 24-48 hours.');
      
      // Reset form
      setFormData({
        ...formData,
        businessName: '',
        businessWebsite: '',
        businessType: '',
        monthlyRevenue: '',
        monthlyProfit: '',
        businessAge: '',
        additionalInfo: ''
      });
      
    } catch (err) {
      console.error('Valuation submission error:', err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] text-white py-16 md:py-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 !whitespace-pre-line">Join Connect Capitals Today

            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Create your free account to access exclusive business listings, get expert valuations, and connect with verified buyers and sellers worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <span className="text-base font-medium">100% Confidential</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <span className="text-base font-medium">Verified Listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <span className="text-base font-medium">Free Valuations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <span className="text-base font-medium">Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-card border-2 border-primary/10 p-1 !w-full !h-[63px]">
                <TabsTrigger
                  value="register"
                  className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">

                  Create Account
                </TabsTrigger>
                <TabsTrigger
                  value="valuation"
                  className="text-base py-3 data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-md transition-all">

                  Get Free Valuation
                </TabsTrigger>
              </TabsList>

              {/* Registration Tab */}
              <TabsContent value="register">
                <div className="bg-card rounded-lg shadow-xl border border-primary/10 p-6 md:p-10">
                  <div className="mb-8">
                    <div className="w-16 h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full mb-4"></div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
                      Create Your Free Account
                    </h2>
                    <p className="text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/login" className="text-primary hover:underline font-medium">
                        Log in to Connect Capitals
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">1</span>
                        </div>
                        <h3 className="text-lg font-semibold text-primary">
                          Personal Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-foreground font-medium">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Enter your first name"
                            className={`border-primary/20 focus:border-primary focus:ring-primary ${
                              fieldErrors.firstName ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                            }`} />
                          {fieldErrors.firstName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-foreground font-medium">
                            Last Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Enter your last name"
                            className={`border-primary/20 focus:border-primary focus:ring-primary ${
                              fieldErrors.lastName ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                            }`} />
                          {fieldErrors.lastName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground font-medium">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          className={`border-primary/20 focus:border-primary focus:ring-primary ${
                            fieldErrors.email ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                          }`} />
                        {fieldErrors.email && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="123-456-7890"
                          className="border-primary/20 focus:border-primary focus:ring-primary" />

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-foreground font-medium">
                            Password <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Enter password"
                              autoComplete="off"
                              className={`border-primary/20 focus:border-primary focus:ring-primary pr-10 ${
                                fieldErrors.password ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                              }`} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {fieldErrors.password ? (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.password}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              At least 8 characters with a number, uppercase, and lowercase letter
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                            Confirm Password <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirm password"
                              autoComplete="off"
                              className={`border-primary/20 focus:border-primary focus:ring-primary pr-10 ${
                                fieldErrors.confirmPassword ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                              }`} />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {fieldErrors.confirmPassword && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4 pt-6 border-t-2 border-primary/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-secondary font-bold text-sm">2</span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary">
                          Business Information
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessOwner" className="text-foreground font-medium">
                          Do you own a business? <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.businessOwner}
                          onValueChange={(value) => handleInputChange('businessOwner', value)}>

                          <SelectTrigger id="businessOwner" className={`border-primary/20 ${
                            fieldErrors.businessOwner ? 'border-destructive' : ''
                          }`}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes, I own a business</SelectItem>
                            <SelectItem value="no">No, I do not own a business</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldErrors.businessOwner && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.businessOwner}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessInterest" className="text-foreground font-medium">
                          Primary Business Interest <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.businessInterest}
                          onValueChange={(value) => handleInputChange('businessInterest', value)}>

                          <SelectTrigger id="businessInterest" className={`border-primary/20 ${
                            fieldErrors.businessInterest ? 'border-destructive' : ''
                          }`}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology / SaaS</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="digital-agency">Digital Agency / Services</SelectItem>
                            <SelectItem value="content">Content / Media</SelectItem>
                            <SelectItem value="newsletter">Newsletters</SelectItem>
                            <SelectItem value="youtube">YouTube Channels</SelectItem>
                            <SelectItem value="mobile-apps">Mobile Apps</SelectItem>
                            <SelectItem value="marketplace">Marketplaces / Platforms</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldErrors.businessInterest && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.businessInterest}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-foreground font-medium">
                            Business Location <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.location}
                            onValueChange={(value) => handleInputChange('location', value)}>

                            <SelectTrigger id="location" className={`border-primary/20 h-11 ${
                              fieldErrors.location ? 'border-destructive' : ''
                            }`}>
                              <SelectValue placeholder="Select state/country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              <SelectItem value="washington-dc" className="font-semibold">Washington D.C.</SelectItem>
                              <SelectItem value="california">California</SelectItem>
                              <SelectItem value="texas">Texas</SelectItem>
                              <SelectItem value="florida">Florida</SelectItem>
                              <SelectItem value="newyork">New York</SelectItem>
                              <SelectItem value="bulgaria">Bulgaria</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldErrors.location && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {fieldErrors.location}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="purchaseTimeframe" className="text-foreground font-medium">
                            {formData.businessOwner === 'yes' ? 'Selling Timeframe' : 'Purchase Timeframe'}
                          </Label>
                          <Select
                            value={formData.purchaseTimeframe}
                            onValueChange={(value) => handleInputChange('purchaseTimeframe', value)}>

                            <SelectTrigger id="purchaseTimeframe" className="border-primary/20 h-11">
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediately</SelectItem>
                              <SelectItem value="1-3months">1-3 months</SelectItem>
                              <SelectItem value="3-6months">3-6 months</SelectItem>
                              <SelectItem value="6-12months">6-12 months</SelectItem>
                              <SelectItem value="exploring">Just exploring</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Submit */}
                    <div className="space-y-4 pt-6 border-t-2 border-accent/20">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          className={`border-primary/40 ${fieldErrors.terms ? 'border-destructive' : ''}`}
                          checked={agreeToTerms}
                          onCheckedChange={(checked) => {
                            setAgreeToTerms(checked as boolean);
                            if (fieldErrors.terms) {
                              setFieldErrors({ ...fieldErrors, terms: '' });
                            }
                          }}
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-muted-foreground leading-relaxed cursor-pointer">

                          I agree to OptiFirm's Terms of Service and Privacy Policy. I consent to receive marketing communications and updates.
                        </label>
                      </div>
                      {fieldErrors.terms && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {fieldErrors.terms}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading || !agreeToTerms}
                        className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6 text-lg btn-hover-effect shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Free Account'
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        By creating an account, you'll get access to exclusive listings, free business valuations, and expert advisory services.
                      </p>
                    </div>
                  </form>
                </div>
              </TabsContent>

              {/* Valuation Tab */}
              <TabsContent value="valuation">
                <div className="bg-card rounded-lg shadow-xl border border-accent/20 p-6 md:p-10">
                  <div className="mb-8">
                    <div className="w-16 h-1 bg-gradient-to-r from-accent via-primary to-secondary rounded-full mb-4"></div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
                      Get Your Free Business Valuation
                    </h2>
                    <p className="text-muted-foreground">
                      Award-winning valuations. <span className="text-accent font-semibold">100% confidential.</span> Get an accurate estimate of your business worth in 24-48 hours.
                    </p>
                  </div>

                  <form onSubmit={handleValuationSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-accent font-bold text-sm">1</span>
                        </div>
                        <h3 className="text-lg font-semibold text-accent">
                          Your Contact Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="val-firstName" className="text-foreground font-medium">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="val-firstName"
                            type="text"
                            required
                            placeholder="Enter your first name"
                            className="border-accent/20 focus:border-accent focus:ring-accent" />

                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="val-lastName" className="text-foreground font-medium">
                            Last Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="val-lastName"
                            type="text"
                            required
                            placeholder="Enter your last name"
                            className="border-accent/20 focus:border-accent focus:ring-accent" />

                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="val-email" className="text-foreground font-medium">
                            Email Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="val-email"
                            type="email"
                            required
                            placeholder="your.email@example.com"
                            className="border-accent/20 focus:border-accent focus:ring-accent" />

                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="val-phone" className="text-foreground font-medium">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="val-phone"
                            type="tel"
                            required
                            placeholder="123-456-7890"
                            className="border-accent/20 focus:border-accent focus:ring-accent" />

                        </div>
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="space-y-4 pt-6 border-t-2 border-primary/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">2</span>
                        </div>
                        <h3 className="text-lg font-semibold text-primary">
                          Business Details
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-foreground font-medium">
                          Business Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="businessName"
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          placeholder="Your business name"
                          className="border-accent/20 focus:border-accent focus:ring-accent" />

                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessWebsite" className="text-foreground font-medium">Website URL</Label>
                        <Input
                          id="businessWebsite"
                          type="url"
                          value={formData.businessWebsite}
                          onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                          placeholder="https://yourbusiness.com"
                          className="border-accent/20 focus:border-accent focus:ring-accent" />

                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-foreground font-medium">
                          Business Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => handleInputChange('businessType', value)}>

                          <SelectTrigger id="businessType" className="border-accent/20">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="saas">SaaS / Software</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="content">Content / Media</SelectItem>
                            <SelectItem value="newsletter">Newsletters</SelectItem>
                            <SelectItem value="youtube">YouTube Channel</SelectItem>
                            <SelectItem value="mobile-apps">Mobile Apps</SelectItem>
                            <SelectItem value="plugins-themes">Plugins / Themes</SelectItem>
                            <SelectItem value="marketplace">Marketplace / Platform</SelectItem>
                            <SelectItem value="services">Digital Agency / Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="monthlyRevenue" className="text-foreground font-medium">
                            Average Monthly Revenue <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.monthlyRevenue}
                            onValueChange={(value) => handleInputChange('monthlyRevenue', value)}>

                            <SelectTrigger id="monthlyRevenue" className="border-accent/20">
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0-10k">€0 - €10,000</SelectItem>
                                <SelectItem value="10k-25k">€10,000 - €25,000</SelectItem>
                                <SelectItem value="25k-50k">€25,000 - €50,000</SelectItem>
                                <SelectItem value="50k-100k">€50,000 - €100,000</SelectItem>
                                <SelectItem value="100k-250k">€100,000 - €250,000</SelectItem>
                                <SelectItem value="250k-500k">€250,000 - €500,000</SelectItem>
                                <SelectItem value="500k+">€500,000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="monthlyProfit" className="text-foreground font-medium">
                            Average Monthly Net Profit <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.monthlyProfit}
                            onValueChange={(value) => handleInputChange('monthlyProfit', value)}>

                            <SelectTrigger id="monthlyProfit" className="border-accent/20">
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-5k">$0 - $5,000</SelectItem>
                              <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                              <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                              <SelectItem value="30k-75k">$30,000 - $75,000</SelectItem>
                              <SelectItem value="75k-150k">$75,000 - $150,000</SelectItem>
                              <SelectItem value="150k-300k">$150,000 - $300,000</SelectItem>
                              <SelectItem value="300k+">$300,000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessAge" className="text-foreground font-medium">
                          How long has the business been operating? <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.businessAge}
                          onValueChange={(value) => handleInputChange('businessAge', value)}>

                          <SelectTrigger id="businessAge" className="border-accent/20">
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">Less than 1 year</SelectItem>
                            <SelectItem value="1-2">1-2 years</SelectItem>
                            <SelectItem value="2-3">2-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo" className="text-foreground font-medium">
                          Additional Information
                        </Label>
                        <textarea
                          id="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                          placeholder="Tell us more about your business, growth trends, unique assets, or any specific questions you have..."
                          className="w-full min-h-[120px] px-3 py-2 border border-accent/20 rounded-md bg-background text-foreground resize-y focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors" />

                      </div>
                    </div>

                    {/* Submit */}
                    <div className="space-y-4 pt-6 border-t-2 border-secondary/20">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="confidentiality" className="border-accent/40" />
                        <label
                          htmlFor="confidentiality"
                          className="text-sm text-muted-foreground leading-relaxed cursor-pointer">

                          I understand this valuation is 100% confidential and I will receive my free business valuation report within 24-48 hours.
                        </label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-semibold py-6 text-lg btn-hover-effect shadow-lg">

                        Get Free Valuation
                      </Button>

                      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg p-4 mt-6">
                        <p className="text-sm text-foreground text-center flex items-center justify-center gap-2">
                          <Shield className="w-5 h-5 text-accent flex-shrink-0" />
                          <span>
                            Your information is <span className="font-semibold text-primary">protected</span> and will never be shared without your consent. Our expert advisors will review your submission and provide a comprehensive valuation report.
                          </span>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-16 border-t-2 border-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-20 h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full mx-auto mb-4"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 !whitespace-pre-line">Why Join Connect Capitals?

              </h2>
              <p className="text-muted-foreground text-lg">
                Experience the difference with our comprehensive platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4 shadow-md">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Verified Listings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access thousands of verified business listings with detailed financials, vetted by our expert team.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-lg border-2 border-accent/20 hover:border-accent/40 transition-all hover:shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center mb-4 shadow-md">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-accent">Expert Valuations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get free, award-winning business valuations from our team of M&A professionals with proven track records.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-lg border-2 border-secondary/10 hover:border-secondary/30 transition-all hover:shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center mb-4 shadow-md">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-secondary">Advisory Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with experienced advisors who guide you through every step of buying or selling a business.
                </p>
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
    );
  }
