'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Building2, 
  FileText, 
  LineChart, 
  Globe, 
  Laptop, 
  Settings, 
  Tag, 
  Image as ImageIcon,
  Send,
  Loader2,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  { id: 'overview', title: 'Business Overview', icon: Building2 },
  { id: 'description', title: 'Business Description', icon: FileText },
  { id: 'financials', title: 'Financial Information', icon: LineChart },
  { id: 'traffic', title: 'Traffic & Marketing', icon: Globe },
  { id: 'assets', title: 'Assets & Technology', icon: Laptop },
  { id: 'operations', title: 'Operations', icon: Settings },
  { id: 'details', title: 'Sale Details', icon: Tag },
  { id: 'media', title: 'Media & Documents', icon: ImageIcon },
  { id: 'confirmation', title: 'Final Confirmation', icon: CheckCircle2 },
];

export default function SellQuestionnaireContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    // Section 1: Overview
    businessName: '',
      businessType: '',
      industry: '',
      yearEstablished: '',
      jurisdiction: '',
      businessLocation: '',
      vatNumber: '',
      
      // Section 2: Description
    summary: '',
    businessModel: '',
    products: '',
    targetAudience: '',
    
    // Section 3: Financials
    monthlyRevenue: '',
    monthlyProfit: '',
    revenueSources: '',
    expenses: '',
    financialRecordsFiles: [],
    
    // Section 4: Traffic
    trafficSources: '',
    monthlyVisitors: '',
    emailListSize: '',
    socialMedia: '',
    
    // Section 5: Assets
    websiteUrl: '',
    techStack: '',
    assets: '',
    dependencies: '',
    
    // Section 6: Operations
    timeRequired: '',
    teamMembers: '',
    processesDocumented: '',
    
    // Section 7: Sale Details
    reasonForSelling: '',
    askingPrice: '',
    priceNegotiable: '',
    dealStructure: '',
    
    // Section 8: Media
    businessImages: [],
    supportingDocuments: [],
    
    // Section 9: Confirmation
    additionalInfo: '',
    confirmed: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < SECTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.confirmed) {
      toast.error('Please confirm the information provided is accurate.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate file uploads
      const uploadedFinancials = formData.financialRecordsFiles.map((file: any) => ({
        name: file.name,
        url: `https://storage.connectcapitals.com/financials/${Date.now()}_${file.name}`,
        size: file.size,
        type: file.type
      }));

      const uploadedImages = formData.businessImages.map((file: any) => ({
        name: file.name,
        url: `https://storage.connectcapitals.com/media/${Date.now()}_${file.name}`,
        size: file.size,
        type: file.type
      }));

      const uploadedDocs = formData.supportingDocuments.map((file: any) => ({
        name: file.name,
        url: `https://storage.connectcapitals.com/documents/${Date.now()}_${file.name}`,
        size: file.size,
        type: file.type
      }));

      const response = await fetch('/api/sell-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName || 'Unnamed Business',
          businessUrl: formData.websiteUrl || 'https://example.com',
          businessModel: formData.businessType || 'Other',
          annualRevenue: parseInt(formData.monthlyRevenue || '0') * 12 * 100, // stored in cents
          annualProfit: parseInt(formData.monthlyProfit || '0') * 12 * 100, // stored in cents
          employeesCount: parseInt(formData.teamMembers || '0') || 0,
          description: formData.summary || 'No description provided',
          plan: 'basic',
          formData: {
            ...formData,
            financialRecordsFiles: uploadedFinancials,
            businessImages: uploadedImages,
            supportingDocuments: uploadedDocs
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit questionnaire');
      }

      toast.success('Thank you. Your submission has been received and is currently under review by the Connect Capitals advisory team.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / SECTIONS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Business Overview
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Legal business name (or working title)</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="e.g. Acme SaaS Ltd."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Type of business</Label>
                <Select value={formData.businessType} onValueChange={(v) => updateField('businessType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Content Website">Content Website</SelectItem>
                    <SelectItem value="Marketplace">Marketplace</SelectItem>
                    <SelectItem value="Mobile Application">Mobile Application</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Primary industry or market sector</Label>
                <Input 
                  id="industry" 
                  value={formData.industry} 
                  onChange={(e) => updateField('industry', e.target.value)}
                  placeholder="e.g. Fintech, Health & Wellness"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearEstablished">Year of establishment</Label>
                <Input 
                  id="yearEstablished" 
                  type="number"
                  value={formData.yearEstablished} 
                  onChange={(e) => updateField('yearEstablished', e.target.value)}
                  placeholder="2020"
                />
              </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="jurisdiction">Country of registration and legal jurisdiction</Label>
                  <Input 
                    id="jurisdiction" 
                    value={formData.jurisdiction} 
                    onChange={(e) => updateField('jurisdiction', e.target.value)}
                    placeholder="e.g. Spain, Madrid"
                  />
                </div>

                <div className="space-y-3 md:col-span-2 pt-2">
                  <Label className="text-sm font-semibold">Business Location</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['European Union', 'United Kingdom', 'Armenia'].map((loc) => (
                      <Button
                        key={loc}
                        type="button"
                        variant={formData.businessLocation === loc ? 'default' : 'outline'}
                        onClick={() => updateField('businessLocation', loc)}
                        className={cn(
                          "w-full h-11 transition-all duration-200 border-2",
                          formData.businessLocation === loc 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "hover:bg-muted/50 border-muted"
                        )}
                      >
                        {loc}
                      </Button>
                    ))}
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input 
                        id="vatNumber" 
                        value={formData.vatNumber} 
                        onChange={(e) => updateField('vatNumber', e.target.value)}
                        placeholder="Type Your VAT Number"
                      />
                  </div>
                </div>
              </div>
            );


      case 1: // Business Description
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="summary">Brief business summary (2–4 concise sentences)</Label>
              <Textarea 
                id="summary" 
                value={formData.summary} 
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Describe the core activity of your business..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessModel">Detailed description of the business model</Label>
              <Textarea 
                id="businessModel" 
                value={formData.businessModel} 
                onChange={(e) => updateField('businessModel', e.target.value)}
                placeholder="Explain how value is created and monetized..."
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="products">Primary products and/or services offered</Label>
              <Textarea 
                id="products" 
                value={formData.products} 
                onChange={(e) => updateField('products', e.target.value)}
                placeholder="List your key offerings..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target customers or client segments</Label>
              <Input 
                id="targetAudience" 
                value={formData.targetAudience} 
                onChange={(e) => updateField('targetAudience', e.target.value)}
                placeholder="e.g. B2B SaaS for SMEs in North America"
              />
            </div>
          </div>
        );

      case 2: // Financial Information
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyRevenue">Average monthly revenue (last 6–12 months)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    id="monthlyRevenue" 
                    type="number"
                    value={formData.monthlyRevenue} 
                    onChange={(e) => updateField('monthlyRevenue', e.target.value)}
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyProfit">Average monthly net profit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    id="monthlyProfit" 
                    type="number"
                    value={formData.monthlyProfit} 
                    onChange={(e) => updateField('monthlyProfit', e.target.value)}
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueSources">Primary revenue sources</Label>
              <Input 
                id="revenueSources" 
                value={formData.revenueSources} 
                onChange={(e) => updateField('revenueSources', e.target.value)}
                placeholder="Subscriptions, Ad revenue, Sales, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Material or recurring operating expenses</Label>
              <Textarea 
                id="expenses" 
                value={formData.expenses} 
                onChange={(e) => updateField('expenses', e.target.value)}
                placeholder="Server costs, inventory, marketing budget, team, etc."
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Upload Your Financial Records (Last 2 Years)</Label>
                <p className="text-sm text-muted-foreground">
                  Please upload any available financial documents from the last 24 months. Accepted documents include profit & loss statements, revenue reports, Stripe or PayPal exports, bank summaries, or accounting software reports. All files are private and reviewed only by the Connect Capitals team.
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.xls,.xlsx,.csv"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const validFiles = files.filter(file => {
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        return ['pdf', 'xls', 'xlsx', 'csv'].includes(ext || '');
                      });
                      
                      if (validFiles.length < files.length) {
                        toast.error('Some files were rejected. Only PDF, XLS, XLSX, and CSV are allowed.');
                      }
                      
                      setFormData((prev: any) => ({
                        ...prev,
                        financialRecordsFiles: [...prev.financialRecordsFiles, ...validFiles]
                      }));
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="h-10 w-10 text-muted-foreground mb-3 group-hover:text-accent transition-colors" />
                  <p className="text-sm font-medium">Click or drag files to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, XLS, XLSX, CSV (Multiple allowed)</p>
                </div>

                {formData.financialRecordsFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.financialRecordsFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-accent" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                            <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData((prev: any) => ({
                              ...prev,
                              financialRecordsFiles: prev.financialRecordsFiles.filter((_: any, i: number) => i !== index)
                            }));
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded border border-border/50">
                  You may upload multiple files. If documents are not available at this stage, our team may request them later during the review process.
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Traffic & Marketing
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trafficSources">Primary traffic or acquisition channels</Label>
              <Input 
                id="trafficSources" 
                value={formData.trafficSources} 
                onChange={(e) => updateField('trafficSources', e.target.value)}
                placeholder="e.g. SEO, Paid Advertising, Social Media, Partnerships"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyVisitors">Average monthly visitors or active users</Label>
                <Input 
                  id="monthlyVisitors" 
                  type="number"
                  value={formData.monthlyVisitors} 
                  onChange={(e) => updateField('monthlyVisitors', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailListSize">Email subscriber base size (if applicable)</Label>
                <Input 
                  id="emailListSize" 
                  type="number"
                  value={formData.emailListSize} 
                  onChange={(e) => updateField('emailListSize', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialMedia">Social media presence (optional official links)</Label>
              <Textarea 
                id="socialMedia" 
                value={formData.socialMedia} 
                onChange={(e) => updateField('socialMedia', e.target.value)}
                placeholder="Twitter, LinkedIn, Facebook, etc."
              />
            </div>
          </div>
        );

      case 4: // Assets & Technology
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Primary website or platform URL</Label>
              <Input 
                id="websiteUrl" 
                value={formData.websiteUrl} 
                onChange={(e) => updateField('websiteUrl', e.target.value)}
                placeholder="https://yourbusiness.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStack">Technology stack</Label>
              <Input 
                id="techStack" 
                value={formData.techStack} 
                onChange={(e) => updateField('techStack', e.target.value)}
                placeholder="CMS, frameworks, hosting, tools (e.g. Next.js, Vercel, Stripe)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assets">Assets included in the proposed sale</Label>
              <Textarea 
                id="assets" 
                value={formData.assets} 
                onChange={(e) => updateField('assets', e.target.value)}
                placeholder="Domains, applications, content, IP, databases, licenses, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dependencies">Third-party dependencies or integrations</Label>
              <Input 
                id="dependencies" 
                value={formData.dependencies} 
                onChange={(e) => updateField('dependencies', e.target.value)}
                placeholder="Software, APIs, contractual tools"
              />
            </div>
          </div>
        );

      case 5: // Operations
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timeRequired">Estimated weekly time commitment (hours)</Label>
              <Input 
                id="timeRequired" 
                type="number"
                value={formData.timeRequired} 
                onChange={(e) => updateField('timeRequired', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamMembers">Team structure (employees, contractors, providers)</Label>
              <Textarea 
                id="teamMembers" 
                value={formData.teamMembers} 
                onChange={(e) => updateField('teamMembers', e.target.value)}
                placeholder="Describe your current team arrangement..."
              />
            </div>
            <div className="space-y-2">
              <Label>Are standard operating procedures documented?</Label>
              <Select value={formData.processesDocumented} onValueChange={(v) => updateField('processesDocumented', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 6: // Sale Details
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reasonForSelling">Primary reason for considering a sale</Label>
              <Textarea 
                id="reasonForSelling" 
                value={formData.reasonForSelling} 
                onChange={(e) => updateField('reasonForSelling', e.target.value)}
                placeholder="Share your motivation for the exit..."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="askingPrice">Indicative asking price (if determined)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    id="askingPrice" 
                    type="number"
                    value={formData.askingPrice} 
                    onChange={(e) => updateField('askingPrice', e.target.value)}
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Is the price open to negotiation?</Label>
                <Select value={formData.priceNegotiable} onValueChange={(v) => updateField('priceNegotiable', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred transaction structure</Label>
              <Select value={formData.dealStructure} onValueChange={(v) => updateField('dealStructure', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset sale">Asset sale</SelectItem>
                  <SelectItem value="Share sale">Share sale</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 7: // Media & Documents
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Upload Images or Visual Materials (Optional)</Label>
                <p className="text-sm text-muted-foreground">Upload any business-related images, dashboards, or visual assets.</p>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData((prev: any) => ({
                        ...prev,
                        businessImages: [...prev.businessImages, ...files]
                      }));
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-3 group-hover:text-accent transition-colors" />
                  <p className="text-sm font-medium">Click or drag images to upload</p>
                </div>
                {formData.businessImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {formData.businessImages.map((file: any, index: number) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({
                              ...prev,
                              businessImages: prev.businessImages.filter((_: any, i: number) => i !== index)
                            }));
                          }}
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="text-base font-semibold">Supporting Documentation (Optional)</Label>
                <p className="text-sm text-muted-foreground">Upload financial reports, operational documents, or other relevant files. (PDF, XLS, XLSX, CSV)</p>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.xls,.xlsx,.csv"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData((prev: any) => ({
                        ...prev,
                        supportingDocuments: [...prev.supportingDocuments, ...files]
                      }));
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="h-10 w-10 text-muted-foreground mb-3 group-hover:text-accent transition-colors" />
                  <p className="text-sm font-medium">Click or drag files to upload</p>
                </div>
                {formData.supportingDocuments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.supportingDocuments.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({
                              ...prev,
                              supportingDocuments: prev.supportingDocuments.filter((_: any, i: number) => i !== index)
                            }));
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground p-3 bg-muted/30 rounded border border-border/50">
              Note: Files remain private and are visible only to the Connect Capitals advisory team for the purpose of evaluation.
            </p>
          </div>
        );

      case 8: // Final Confirmation
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional information or disclosures relevant for evaluation</Label>
              <Textarea 
                id="additionalInfo" 
                value={formData.additionalInfo} 
                onChange={(e) => updateField('additionalInfo', e.target.value)}
                placeholder="Any other details we should be aware of..."
                className="min-h-[120px]"
              />
            </div>
            <div className="flex items-start space-x-3 p-6 bg-accent/5 border border-accent/20 rounded-lg shadow-inner">
              <Checkbox 
                id="confirmed" 
                checked={formData.confirmed} 
                onCheckedChange={(checked) => updateField('confirmed', checked)}
                className="mt-1"
              />
              <Label 
                htmlFor="confirmed" 
                className="text-sm leading-relaxed cursor-pointer font-medium"
              >
                I confirm that the information provided is accurate, complete, and truthful to the best of my knowledge. I authorize Connect Capitals to review, process, and professionally prepare this information for the purpose of evaluating and presenting the business for potential sale.
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm border border-primary/5">
          {React.createElement(SECTIONS[currentStep].icon, { className: "h-8 w-8" })}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">Sell Your Business</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Please complete the following questionnaire. The information provided will be reviewed by our advisory team and used to professionally prepare your business listing for evaluation and potential publication.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-sm font-medium">
          <span>Section {currentStep + 1} of {SECTIONS.length}: {SECTIONS[currentStep].title}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-lg border-border/50">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {currentStep === SECTIONS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!formData.confirmed || isSubmitting}
                className="bg-accent hover:bg-accent/90 text-white min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-3 sm:grid-cols-9 gap-2">
        {SECTIONS.map((section, idx) => (
          <div 
            key={section.id}
            className={`h-1.5 rounded-full transition-colors ${
              idx <= currentStep ? 'bg-accent' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      
      <div className="mt-12 p-4 bg-muted/50 rounded-lg border border-border flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Important Rules:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>This form DOES NOT publish anything automatically.</li>
            <li>All submitted information is reviewed and manually approved by the Connect Capitals team.</li>
            <li>We use clear, professional, institutional language.</li>
            <li>We do NOT give advice, valuations, or feedback through this form.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
