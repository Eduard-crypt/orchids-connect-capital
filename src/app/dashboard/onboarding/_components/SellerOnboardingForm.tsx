"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Loader2, ChevronLeft, ChevronRight, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const BUSINESS_TYPES = [
  { value: 'SaaS', label: 'SaaS', description: 'Software as a Service' },
  { value: 'E-Commerce', label: 'E-Commerce', description: 'Online retail business' },
  { value: 'Content/Media', label: 'Content/Media', description: 'Digital content or media' },
  { value: 'Brick-and-Mortar', label: 'Brick-and-Mortar', description: 'Physical location business' },
  { value: 'Manufacturing', label: 'Manufacturing', description: 'Production business' },
  { value: 'Services', label: 'Services', description: 'Professional services' },
  { value: 'Other', label: 'Other', description: 'Other business type' }
];

const METRIC_TEMPLATES = {
  'SaaS': ['MRR', 'ARR', 'Churn Rate', 'CAC', 'LTV', 'Active Users'],
  'E-Commerce': ['Monthly Revenue', 'Profit Margin', 'AOV', 'Conversion Rate', 'Traffic', 'Return Rate'],
  'Content/Media': ['Monthly Visits', 'Ad Revenue', 'Subscriber Count', 'Engagement Rate', 'CPM'],
  'Brick-and-Mortar': ['Monthly Revenue', 'Profit Margin', 'Location', 'Employees', 'Lease Terms'],
  'default': ['Monthly Revenue', 'Profit Margin', 'Customer Base', 'Growth Rate']
};

export const SellerOnboardingForm: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    businessType: '',
    keyMetrics: '',
    targetPrice: ''
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/onboarding/seller');
    }
  }, [session, isPending, router]);

  // Fetch existing seller profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      const token = localStorage.getItem('bearer_token');
      if (!token) return;

      try {
        const response = await fetch('/api/seller-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const profile = await response.json();
          setExistingProfile(profile);
          
          // Populate form with existing data
          setFormData({
            businessType: profile.businessType || '',
            keyMetrics: profile.keyMetrics || '',
            targetPrice: profile.targetPrice?.toString() || ''
          });
        }
      } catch (error) {
        console.error('Error fetching seller profile:', error);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSubmit = async () => {
    if (!session?.user) return;

    const token = localStorage.getItem('bearer_token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        businessType: formData.businessType,
        keyMetrics: formData.keyMetrics,
        targetPrice: formData.targetPrice ? parseInt(formData.targetPrice) : null,
        onboardingCompleted: true
      };

      const method = existingProfile ? 'PUT' : 'POST';
      const response = await fetch('/api/seller-profile', {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Seller profile saved successfully!');
        router.push('/dashboard?tab=roles');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving seller profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.businessType !== '';
      case 2:
        return formData.keyMetrics.trim() !== '';
      case 3:
        return formData.targetPrice !== '';
      default:
        return false;
    }
  };

  const getMetricSuggestions = () => {
    const type = formData.businessType as keyof typeof METRIC_TEMPLATES;
    return METRIC_TEMPLATES[type] || METRIC_TEMPLATES.default;
  };

  if (isPending || !session?.user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard?tab=roles')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Business Type */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What type of business are you selling?</CardTitle>
            <CardDescription>
              Select the category that best describes your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.businessType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
              className="grid gap-3 sm:grid-cols-2"
            >
              {BUSINESS_TYPES.map((type) => (
                <div key={type.value}>
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.value}
                    className="flex flex-col items-start justify-between rounded-lg border-2 border-muted p-4 hover:bg-accent cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {formData.businessType && (
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Selected: {formData.businessType}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Key Metrics */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Key Business Metrics
            </CardTitle>
            <CardDescription>
              Provide important metrics that showcase your business performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Suggested Metrics for {formData.businessType}:</Label>
              <div className="flex flex-wrap gap-2">
                {getMetricSuggestions().map((metric) => (
                  <Badge key={metric} variant="outline">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyMetrics">Enter Your Metrics</Label>
              <Textarea
                id="keyMetrics"
                rows={8}
                placeholder={`Example:\n- Monthly Revenue: $50,000\n- Profit Margin: 40%\n- Active Users: 5,000\n- Growth Rate: 15% MoM\n- Customer Retention: 85%\n\nBe specific and include numbers where possible.`}
                value={formData.keyMetrics}
                onChange={(e) => setFormData(prev => ({ ...prev, keyMetrics: e.target.value }))}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed metrics to help buyers evaluate your business. Include revenue, profit, growth rates, customer metrics, etc.
              </p>
            </div>

            {formData.keyMetrics && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Metrics Preview</span>
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                  {formData.keyMetrics}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Target Price */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              What's your target asking price?
            </CardTitle>
            <CardDescription>
              Set a realistic asking price based on your business value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price ($)</Label>
              <Input
                id="targetPrice"
                type="number"
                placeholder="500000"
                value={formData.targetPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Consider factors like revenue multiples, profit margins, growth potential, and market conditions
              </p>
            </div>

            {formData.targetPrice && parseInt(formData.targetPrice) > 0 && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Your Asking Price</p>
                    <p className="text-4xl font-bold text-primary">
                      ${parseInt(formData.targetPrice).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Range</p>
                    <p className="font-semibold">
                      ${(parseInt(formData.targetPrice) * 0.9).toLocaleString()} - 
                      ${(parseInt(formData.targetPrice) * 1.1).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground mb-1">Down Payment (20%)</p>
                    <p className="font-semibold">
                      ${(parseInt(formData.targetPrice) * 0.2).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed() || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Complete Onboarding
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Summary Card */}
      {currentStep === totalSteps && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Business Type</Label>
              <p className="font-semibold">{formData.businessType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Key Metrics</Label>
              <pre className="mt-1 p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                {formData.keyMetrics}
              </pre>
            </div>
            <div>
              <Label className="text-muted-foreground">Target Price</Label>
              <p className="text-2xl font-bold text-primary">
                ${formData.targetPrice && parseInt(formData.targetPrice).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerOnboardingForm;