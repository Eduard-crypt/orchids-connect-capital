'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

const INDUSTRIES = [
  'SaaS & Technology',
  'E-commerce',
  'Digital Agency',
  'Content Sites & Blogs',
  'YouTube Channels',
  'Newsletters',
  'Mobile Apps',
  'Marketplaces',
  'Plugins & Themes',
  'Domains',
  'Other'
];

const REVENUE_RANGES = [
  'Under €100K',
  '€100K - €500K',
  '€500K - €1M',
  '€1M - €5M',
  '€5M - €10M',
  'Over €10M'
];

export const ValuationForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Contact Info
    name: '',
    email: '',
    phone: '',
    country: '',
    
    // Step 2: Business Overview
    businessName: '',
    industry: '',
    location: '',
    yearsEstablished: '',
    description: '',
    
    // Step 3: Financial Details
    revenueRange: '',
    isProfitable: '',
    annualRevenue: '',
    ebitda: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!formData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
    } else if (step === 2) {
      if (!formData.businessName || !formData.industry || !formData.yearsEstablished) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.revenueRange) {
      toast.error('Please select a revenue range');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📋 Submitting valuation form...');
      
      // Call the API endpoint
      const response = await fetch('/api/valuation/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }

      console.log('✅ Valuation form submitted successfully:', data);
      
      // Show success state
      setIsSuccess(true);
      toast.success('Valuation request submitted successfully!');

      // Optional: Redirect to thank-you page after 3 seconds
      // Uncomment the lines below to enable redirect
      // setTimeout(() => {
      //   window.location.href = 'https://connectcapitals.com/thank-you';
      // }, 3000);

    } catch (error) {
      console.error('❌ Form submission error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'We couldn\'t process your submission at the moment. Please try again shortly.';
      
      toast.error(errorMessage, {
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => handleSubmit(e),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-border">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Thank You!</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Your information has been submitted. Our team will contact you soon.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          We've sent a confirmation email to <strong>{formData.email}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          You'll hear from us within 24-48 hours with a comprehensive business valuation and next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-border">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
          <span className="text-sm text-muted-foreground">Takes ~5 minutes</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Contact Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Let's Get Started</h3>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleNext}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Business Overview */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">About Your Business</h3>
              <p className="text-muted-foreground">Help us understand your business</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => updateField('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsEstablished">Years Established *</Label>
                  <Input
                    id="yearsEstablished"
                    type="number"
                    value={formData.yearsEstablished}
                    onChange={(e) => updateField('yearsEstablished', e.target.value)}
                    placeholder="5"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Business Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Remote / Global"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brief Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe what your business does..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Financial Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Financial Overview</h3>
              <p className="text-muted-foreground">This information helps us provide an accurate valuation</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="revenueRange">Annual Revenue Range *</Label>
                <Select value={formData.revenueRange} onValueChange={(value) => updateField('revenueRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVENUE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isProfitable">Is the Business Currently Profitable?</Label>
                <Select value={formData.isProfitable} onValueChange={(value) => updateField('isProfitable', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="breakeven">Break Even</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Annual Revenue (Optional)</Label>
                  <Input
                    id="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={(e) => updateField('annualRevenue', e.target.value)}
                    placeholder="$500,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ebitda">EBITDA (Optional)</Label>
                  <Input
                    id="ebitda"
                    value={formData.ebitda}
                    onChange={(e) => updateField('ebitda', e.target.value)}
                      placeholder="€150,000"
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Confidentiality Guarantee</p>
                <p>All information you provide is strictly confidential and will only be used to prepare your business valuation. We will never share your data without your explicit permission.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Valuation'
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By submitting, you agree to our terms and privacy policy. You'll receive a comprehensive valuation within 24-48 hours.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};