"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { CheckCircle, Upload, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const INDUSTRIES = [
  'SaaS',
  'E-Commerce',
  'Content/Media',
  'Manufacturing',
  'Retail',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Food & Beverage',
  'Technology',
  'Education',
  'Other'
];

const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Australia',
  'Global'
];

export const BuyerOnboardingForm: React.FC = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    budgetMin: '',
    budgetMax: '',
    industries: [] as string[],
    regions: [] as string[],
    proofOfFundsDocument: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/onboarding/buyer');
    }
  }, [session, isPending, router]);

  // Fetch existing buyer profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      const token = localStorage.getItem('bearer_token');
      if (!token) return;

      try {
        const response = await fetch('/api/buyer-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const profile = await response.json();
          setExistingProfile(profile);
          
          // Populate form with existing data
          setFormData({
            budgetMin: profile.budgetMin?.toString() || '',
            budgetMax: profile.budgetMax?.toString() || '',
            industries: profile.industries ? JSON.parse(profile.industries) : [],
            regions: profile.regions ? JSON.parse(profile.regions) : [],
            proofOfFundsDocument: profile.proofOfFundsDocument || ''
          });
        }
      } catch (error) {
        console.error('Error fetching buyer profile:', error);
      }
    };

    fetchProfile();
  }, [session]);

  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleRegionToggle = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

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
        budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        industries: JSON.stringify(formData.industries),
        regions: JSON.stringify(formData.regions),
        proofOfFundsDocument: formData.proofOfFundsDocument || null,
        onboardingCompleted: true
      };

      const method = existingProfile ? 'PUT' : 'POST';
      const response = await fetch('/api/buyer-profile', {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Buyer profile saved successfully!');
        router.push('/dashboard?tab=roles');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving buyer profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.budgetMin && formData.budgetMax && 
               parseInt(formData.budgetMin) <= parseInt(formData.budgetMax);
      case 2:
        return formData.industries.length > 0;
      case 3:
        return formData.regions.length > 0;
      case 4:
        return true; // Document is optional
      default:
        return false;
    }
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

      {/* Step 1: Budget */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What's your budget range?</CardTitle>
            <CardDescription>
              This helps us show you businesses within your price range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum Budget ($)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="50000"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum Budget ($)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="500000"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                />
              </div>
            </div>

            {formData.budgetMin && formData.budgetMax && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm">
                  <span className="font-semibold">Budget Range: </span>
                  ${parseInt(formData.budgetMin).toLocaleString()} - ${parseInt(formData.budgetMax).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Industries */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Which industries interest you?</CardTitle>
            <CardDescription>
              Select all industries you're interested in (select at least one)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {INDUSTRIES.map((industry) => (
                <div
                  key={industry}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.industries.includes(industry)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleIndustryToggle(industry)}
                >
                  <Checkbox
                    checked={formData.industries.includes(industry)}
                    onCheckedChange={() => handleIndustryToggle(industry)}
                  />
                  <label className="flex-1 cursor-pointer font-medium">
                    {industry}
                  </label>
                </div>
              ))}
            </div>

            {formData.industries.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium">Selected:</span>
                {formData.industries.map((industry) => (
                  <Badge key={industry} variant="secondary">
                    {industry}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Regions */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Which regions are you targeting?</CardTitle>
            <CardDescription>
              Select all regions where you'd like to invest (select at least one)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {REGIONS.map((region) => (
                <div
                  key={region}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.regions.includes(region)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleRegionToggle(region)}
                >
                  <Checkbox
                    checked={formData.regions.includes(region)}
                    onCheckedChange={() => handleRegionToggle(region)}
                  />
                  <label className="flex-1 cursor-pointer font-medium">
                    {region}
                  </label>
                </div>
              ))}
            </div>

            {formData.regions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium">Selected:</span>
                {formData.regions.map((region) => (
                  <Badge key={region} variant="secondary">
                    {region}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Proof of Funds */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Proof of Funds (Optional)</CardTitle>
            <CardDescription>
              Upload a document or bank statement to verify your purchasing power. This increases seller trust.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Upload Document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to browse
              </p>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="max-w-xs mx-auto"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // In a real app, upload to storage and get URL
                    setFormData(prev => ({
                      ...prev,
                      proofOfFundsDocument: `placeholder-${file.name}`
                    }));
                    toast.info('File upload simulation (not implemented)');
                  }
                }}
              />
            </div>

            {formData.proofOfFundsDocument && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Document uploaded: {formData.proofOfFundsDocument}
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Note: Document upload is a placeholder. In production, files would be securely uploaded to cloud storage.
            </p>
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
              <Label className="text-muted-foreground">Budget Range</Label>
              <p className="font-semibold">
                ${formData.budgetMin && parseInt(formData.budgetMin).toLocaleString()} - 
                ${formData.budgetMax && parseInt(formData.budgetMax).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Industries ({formData.industries.length})</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.industries.map((industry) => (
                  <Badge key={industry}>{industry}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Regions ({formData.regions.length})</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.regions.map((region) => (
                  <Badge key={region}>{region}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Proof of Funds</Label>
              <p className="font-semibold">
                {formData.proofOfFundsDocument ? '✓ Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuyerOnboardingForm;