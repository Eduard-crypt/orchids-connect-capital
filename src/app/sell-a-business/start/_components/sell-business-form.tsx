'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Building2, DollarSign, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const BUSINESS_MODELS = [
  'SaaS',
  'E-commerce',
  'Digital Agency',
  'Content Site',
  'Mobile App',
  'Marketplace',
  'Other'
] as const;

const PLAN_NAMES = {
  basic: 'Basic Listing',
  featured: 'Featured Listing',
  premium: 'Premium Package'
};

interface FormData {
  businessName: string;
  businessUrl: string;
  businessModel: string;
  annualRevenue: string;
  annualProfit: string;
  employeesCount: string;
  description: string;
}

export default function SellBusinessForm() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'basic';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessUrl: '',
    businessModel: '',
    annualRevenue: '',
    annualProfit: '',
    employeesCount: '',
    description: ''
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      toast.error('Please create an account or log in before submitting your business.');
      router.push(`/login?redirect=${encodeURIComponent(`/sell-a-business/start?plan=${plan}`)}`);
    }
  }, [session, isSessionPending, router, plan]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const parseCurrencyToCents = (value: string): number => {
    const numericValue = value.replace(/[^0-9-]/g, '');
    if (!numericValue) return 0;
    return parseInt(numericValue) * 100;
  };

  const handleCurrencyChange = (field: 'annualRevenue' | 'annualProfit', value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange(field, formatted);
  };

  const validateForm = (): boolean => {
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return false;
    }

    if (!formData.businessUrl.trim()) {
      toast.error('Business URL is required');
      return false;
    }

    if (!formData.businessModel) {
      toast.error('Please select a business model');
      return false;
    }

    const revenueValue = parseCurrencyToCents(formData.annualRevenue);
    if (revenueValue <= 0) {
      toast.error('Annual revenue must be greater than zero');
      return false;
    }

    const employeesCount = parseInt(formData.employeesCount);
    if (isNaN(employeesCount) || employeesCount < 0) {
      toast.error('Please enter a valid number of employees (0 or more)');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Business description is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        router.push('/login');
        return;
      }

      const payload = {
        businessName: formData.businessName.trim(),
        businessUrl: formData.businessUrl.trim(),
        businessModel: formData.businessModel,
        annualRevenue: parseCurrencyToCents(formData.annualRevenue),
        annualProfit: parseCurrencyToCents(formData.annualProfit),
        employeesCount: parseInt(formData.employeesCount),
        description: formData.description.trim(),
        plan: plan
      };

      const response = await fetch('/api/sell-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit business listing');
      }

      toast.success('Business listing submitted successfully! We\'ll review it shortly.');
      router.push('/dashboard');

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit business listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-12">
      <Link href="/sell-a-business">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Button>
      </Link>

      <Card className="shadow-lg">
        <CardHeader className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Submit Your Business</CardTitle>
              <CardDescription className="text-base mt-2">
                Selected Plan: <span className="font-semibold text-primary">{PLAN_NAMES[plan as keyof typeof PLAN_NAMES]}</span>
              </CardDescription>
            </div>
            <Building2 className="h-12 w-12 text-primary" />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-base font-semibold">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                placeholder="e.g., TechStartup Inc."
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Business URL */}
            <div className="space-y-2">
              <Label htmlFor="businessUrl" className="text-base font-semibold">
                Business URL/Domain <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessUrl"
                type="url"
                placeholder="https://yourbusiness.com"
                value={formData.businessUrl}
                onChange={(e) => handleInputChange('businessUrl', e.target.value)}
                className="text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Business Model */}
            <div className="space-y-2">
              <Label htmlFor="businessModel" className="text-base font-semibold">
                Business Model <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.businessModel}
                onValueChange={(value) => handleInputChange('businessModel', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="businessModel" className="text-base">
                  <SelectValue placeholder="Select business model" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_MODELS.map((model) => (
                    <SelectItem key={model} value={model} className="text-base">
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Annual Revenue */}
              <div className="space-y-2">
                <Label htmlFor="annualRevenue" className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Annual Revenue <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="annualRevenue"
                  placeholder="$100,000"
                  value={formData.annualRevenue}
                  onChange={(e) => handleCurrencyChange('annualRevenue', e.target.value)}
                  className="text-base"
                  disabled={isSubmitting}
                />
              </div>

              {/* Annual Profit */}
              <div className="space-y-2">
                <Label htmlFor="annualProfit" className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Annual Profit
                </Label>
                <Input
                  id="annualProfit"
                  placeholder="$50,000"
                  value={formData.annualProfit}
                  onChange={(e) => handleCurrencyChange('annualProfit', e.target.value)}
                  className="text-base"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Can be negative if applicable</p>
              </div>
            </div>

            {/* Employees Count */}
            <div className="space-y-2">
              <Label htmlFor="employeesCount" className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Employees <span className="text-destructive">*</span>
              </Label>
              <Input
                id="employeesCount"
                type="number"
                min="0"
                placeholder="5"
                value={formData.employeesCount}
                onChange={(e) => handleInputChange('employeesCount', e.target.value)}
                className="text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Business Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your business, its products/services, market position, growth potential, and why it's a great opportunity..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="text-base resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed information to attract serious buyers
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Business Listing'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
