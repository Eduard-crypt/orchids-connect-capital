"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2, Upload, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface ListingData {
  // Step 1: Basics
  title: string;
  businessType: string;
  businessModel: string;
  niche: string;
  geography: string;
  ageMonths: number;
  
  // Step 2: Financials
  ttmRevenue: number;
  ttmProfit: number;
  profitMargin: number;
  askingPrice: number;
  
  // Step 3: Channels
  organicTraffic: string;
  paidTraffic: string;
  marketplaces: string;
  
  // Step 4: Operations
  teamSize: number;
  hoursPerWeek: number;
  
  // Step 5: Proof/Details
  fullDescription: string;
  businessUrl: string;
  brandName: string;
  documents: Array<{ name: string; url: string; type: string; size: number }>;
}

const initialData: ListingData = {
  title: "",
  businessType: "",
  businessModel: "",
  niche: "",
  geography: "",
  ageMonths: 0,
  ttmRevenue: 0,
  ttmProfit: 0,
  profitMargin: 0,
  askingPrice: 0,
  organicTraffic: "",
  paidTraffic: "",
  marketplaces: "",
  teamSize: 0,
  hoursPerWeek: 0,
  fullDescription: "",
  businessUrl: "",
  brandName: "",
  documents: [],
};

export function ListingWizard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ListingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (!isPending && !session) {
    router.push("/login?redirect=/listings/create");
    return null;
  }

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const updateData = (field: keyof ListingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!data.title || !data.businessType || !data.geography) {
        toast.error("Моля попълнете всички задължителни полета");
        return;
      }
    }
    if (step === 2) {
      if (!data.ttmRevenue || !data.ttmProfit || !data.askingPrice) {
        toast.error("Моля попълнете финансовите данни");
        return;
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Final validation
    if (!data.fullDescription) {
      toast.error("Моля добавете описание на бизнеса");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // Create the listing
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          businessType: data.businessType,
          businessModel: data.businessModel,
          niche: data.niche,
          geography: data.geography,
          ageMonths: parseInt(data.ageMonths.toString()),
          ttmRevenue: parseInt(data.ttmRevenue.toString()),
          ttmProfit: parseInt(data.ttmProfit.toString()),
          profitMargin: parseInt(data.profitMargin.toString()),
          askingPrice: parseInt(data.askingPrice.toString()),
          organicTraffic: data.organicTraffic,
          paidTraffic: data.paidTraffic,
          marketplaces: data.marketplaces,
          teamSize: parseInt(data.teamSize.toString()),
          hoursPerWeek: parseInt(data.hoursPerWeek.toString()),
          fullDescription: data.fullDescription,
          businessUrl: data.businessUrl,
          brandName: data.brandName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create listing");
      }

      const listing = await response.json();

      // Upload documents if any
      if (data.documents.length > 0) {
        for (const doc of data.documents) {
          await fetch(`/api/listings/${listing.id}/documents`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              documentName: doc.name,
              documentUrl: doc.url,
              documentType: doc.type,
              fileSize: doc.size,
              isPublic: false,
            }),
          });
        }
      }

      // Submit for moderation
      await fetch(`/api/listings/${listing.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Листингът е създаден и изпратен за одобрение!");
      router.push("/dashboard?tab=listings");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error(error instanceof Error ? error.message : "Грешка при създаване на листинга");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Basics data={data} updateData={updateData} />;
      case 2:
        return <Step2Financials data={data} updateData={updateData} />;
      case 3:
        return <Step3Channels data={data} updateData={updateData} />;
      case 4:
        return <Step4Operations data={data} updateData={updateData} />;
      case 5:
        return <Step5Proof data={data} updateData={updateData} />;
      default:
        return null;
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Стъпка {step} от {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {[
          { num: 1, label: "Основи" },
          { num: 2, label: "Финанси" },
          { num: 3, label: "Канали" },
          { num: 4, label: "Операции" },
          { num: 5, label: "Доказателства" },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step > s.num
                  ? "bg-primary text-primary-foreground"
                  : step === s.num
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? <Check className="w-5 h-5" /> : s.num}
            </div>
            <span className="text-xs text-center hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={step === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        {step < totalSteps ? (
          <Button onClick={handleNext}>
            Напред
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Изпращане...
              </>
            ) : (
              "Изпрати за одобрение"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step 1: Basics
function Step1Basics({
  data,
  updateData,
}: {
  data: ListingData;
  updateData: (field: keyof ListingData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Основна информация</h2>
        <p className="text-muted-foreground">
          Основни данни за вашия бизнес
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Заглавие на листинга *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => updateData("title", e.target.value)}
            placeholder="Напр. Успешен SaaS за управление на проекти"
          />
        </div>

        <div>
          <Label htmlFor="businessType">Тип бизнес *</Label>
          <Select
            value={data.businessType}
            onValueChange={(value) => updateData("businessType", value)}
          >
            <SelectTrigger id="businessType">
              <SelectValue placeholder="Изберете тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="eCom">eCommerce</SelectItem>
              <SelectItem value="Content">Content Site</SelectItem>
              <SelectItem value="Apps">Mobile/Desktop App</SelectItem>
              <SelectItem value="Brick-and-Mortar">Brick-and-Mortar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="businessModel">Бизнес модел</Label>
          <Input
            id="businessModel"
            value={data.businessModel}
            onChange={(e) => updateData("businessModel", e.target.value)}
            placeholder="Напр. Subscription, FBA, Affiliate"
          />
        </div>

        <div>
          <Label htmlFor="niche">Ниша</Label>
          <Input
            id="niche"
            value={data.niche}
            onChange={(e) => updateData("niche", e.target.value)}
            placeholder="Напр. Productivity, Fashion, Finance"
          />
        </div>

        <div>
          <Label htmlFor="geography">География / Локация *</Label>
          <Input
            id="geography"
            value={data.geography}
            onChange={(e) => updateData("geography", e.target.value)}
            placeholder="Напр. Global, United States, Europe"
          />
        </div>

        <div>
          <Label htmlFor="ageMonths">Възраст на бизнеса (месеци)</Label>
          <Input
            id="ageMonths"
            type="number"
            value={data.ageMonths || ""}
            onChange={(e) => updateData("ageMonths", parseInt(e.target.value) || 0)}
            placeholder="Напр. 36"
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Financials
function Step2Financials({
  data,
  updateData,
}: {
  data: ListingData;
  updateData: (field: keyof ListingData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Финансова информация</h2>
        <p className="text-muted-foreground">
          TTM (Trailing Twelve Months) метрики и ценообразуване
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="ttmRevenue">TTM Приходи (USD) *</Label>
          <Input
            id="ttmRevenue"
            type="number"
            value={data.ttmRevenue || ""}
            onChange={(e) => updateData("ttmRevenue", parseInt(e.target.value) || 0)}
            placeholder="480000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Общи приходи за последните 12 месеца
          </p>
        </div>

        <div>
          <Label htmlFor="ttmProfit">TTM Печалба (USD) *</Label>
          <Input
            id="ttmProfit"
            type="number"
            value={data.ttmProfit || ""}
            onChange={(e) => updateData("ttmProfit", parseInt(e.target.value) || 0)}
            placeholder="120000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Нетна печалба за последните 12 месеца
          </p>
        </div>

        <div>
          <Label htmlFor="profitMargin">Маржа на печалбата (%)</Label>
          <Input
            id="profitMargin"
            type="number"
            value={data.profitMargin || ""}
            onChange={(e) => updateData("profitMargin", parseInt(e.target.value) || 0)}
            placeholder="25"
            max="100"
          />
        </div>

        <div>
          <Label htmlFor="askingPrice">Искана цена (USD) *</Label>
          <Input
            id="askingPrice"
            type="number"
            value={data.askingPrice || ""}
            onChange={(e) => updateData("askingPrice", parseInt(e.target.value) || 0)}
            placeholder="1200000"
          />
        </div>

        {data.ttmRevenue > 0 && data.askingPrice > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Revenue Multiple:</p>
            <p className="text-2xl font-bold text-primary">
              {(data.askingPrice / data.ttmRevenue).toFixed(2)}x
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 3: Channels
function Step3Channels({
  data,
  updateData,
}: {
  data: ListingData;
  updateData: (field: keyof ListingData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Канали за трафик</h2>
        <p className="text-muted-foreground">
          Органичен трафик, платен трафик и marketplace-и
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="organicTraffic">Органичен трафик</Label>
          <Textarea
            id="organicTraffic"
            value={data.organicTraffic}
            onChange={(e) => updateData("organicTraffic", e.target.value)}
            placeholder="Напр. 25,000 месечни посетители от SEO, 15,000 от социални медии"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="paidTraffic">Платен трафик</Label>
          <Textarea
            id="paidTraffic"
            value={data.paidTraffic}
            onChange={(e) => updateData("paidTraffic", e.target.value)}
            placeholder="Напр. 5,000 месечни посетители от Google Ads, Facebook реклами"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="marketplaces">Marketplace-и</Label>
          <Textarea
            id="marketplaces"
            value={data.marketplaces}
            onChange={(e) => updateData("marketplaces", e.target.value)}
            placeholder="Напр. Amazon FBA, Shopify, App Store, собствен сайт"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Operations
function Step4Operations({
  data,
  updateData,
}: {
  data: ListingData;
  updateData: (field: keyof ListingData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Оперативна информация</h2>
        <p className="text-muted-foreground">
          Екип и необходимо време за управление
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="teamSize">Размер на екипа</Label>
          <Input
            id="teamSize"
            type="number"
            value={data.teamSize || ""}
            onChange={(e) => updateData("teamSize", parseInt(e.target.value) || 0)}
            placeholder="3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Брой на служителите (full-time + part-time)
          </p>
        </div>

        <div>
          <Label htmlFor="hoursPerWeek">Часове работа седмично</Label>
          <Input
            id="hoursPerWeek"
            type="number"
            value={data.hoursPerWeek || ""}
            onChange={(e) => updateData("hoursPerWeek", parseInt(e.target.value) || 0)}
            placeholder="20"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Колко часа седмично е нужно за управление на бизнеса
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 5: Proof & Documents
function Step5Proof({
  data,
  updateData,
}: {
  data: ListingData;
  updateData: (field: keyof ListingData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Доказателства и детайли</h2>
        <p className="text-muted-foreground">
          Пълно описание, URL и документи за верификация
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullDescription">Пълно описание *</Label>
          <Textarea
            id="fullDescription"
            value={data.fullDescription}
            onChange={(e) => updateData("fullDescription", e.target.value)}
            placeholder="Подробно опишете вашия бизнес, историята му, защо го продавате, какви са предимствата..."
            rows={8}
          />
        </div>

        <div>
          <Label htmlFor="businessUrl">URL на бизнеса</Label>
          <Input
            id="businessUrl"
            type="url"
            value={data.businessUrl}
            onChange={(e) => updateData("businessUrl", e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Този URL ще бъде видим само за верифицирани купувачи след подписване на NDA
          </p>
        </div>

        <div>
          <Label htmlFor="brandName">Име на бранда</Label>
          <Input
            id="brandName"
            value={data.brandName}
            onChange={(e) => updateData("brandName", e.target.value)}
            placeholder="MyBrand Pro"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Името на бранда ще бъде видимо само за верифицирани купувачи след подписване на NDA
          </p>
        </div>

        <div>
          <Label>Документи (опционално)</Label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Качете финансови отчети, анализи и други документи
            </p>
            <Button variant="outline" size="sm" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Качване (placeholder)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Файловете ще бъдат достъпни само след NDA
            </p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="font-semibold mb-2">Преглед на листинга</h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Заглавие:</span> {data.title || "—"}</p>
            <p><span className="font-medium">Тип:</span> {data.businessType || "—"}</p>
            <p><span className="font-medium">TTM Приходи:</span> ${data.ttmRevenue?.toLocaleString() || "0"}</p>
            <p><span className="font-medium">TTM Печалба:</span> ${data.ttmProfit?.toLocaleString() || "0"}</p>
            <p><span className="font-medium">Искана цена:</span> ${data.askingPrice?.toLocaleString() || "0"}</p>
            <p><span className="font-medium">Екип:</span> {data.teamSize || 0} души</p>
            <p><span className="font-medium">Часове/седмица:</span> {data.hoursPerWeek || 0}ч</p>
          </div>
        </div>
      </div>
    </div>
  );
}
