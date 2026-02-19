"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Loader2, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface TwoFactorSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onSuccess, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"initial" | "setup" | "verify">("initial");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to setup 2FA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("setup");
    } catch (error) {
      console.error("2FA setup error:", error);
      toast.error(error instanceof Error ? error.message : "Грешка при настройка на 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Моля въведете 6-цифрен код");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/2fa/verify-setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid verification code");
      }

      toast.success("2FA активиран успешно!");
      setStep("verify");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      toast.error(error instanceof Error ? error.message : "Невалиден код");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast.success("Копирано!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (step === "initial") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Добавете допълнителен слой на сигурност към вашия акаунт
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Защо да използвам 2FA?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Защитава акаунта ви дори ако паролата ви бъде компрометирана</li>
                  <li>Изисква код от вашето устройство при всяко влизане</li>
                  <li>Предпазва от неоторизиран достъп</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ще ви трябва приложение за автентикация като:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-muted/50 rounded">Google Authenticator</div>
              <div className="p-2 bg-muted/50 rounded">Microsoft Authenticator</div>
              <div className="p-2 bg-muted/50 rounded">Authy</div>
              <div className="p-2 bg-muted/50 rounded">1Password</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleStartSetup}
              disabled={loading}
              className="flex-1 btn-hover-effect"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Зареждане...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Активирай 2FA
                </>
              )}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Отказ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "setup") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Настройка на 2FA</CardTitle>
          <CardDescription>Сканирайте QR кода с вашето приложение</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-border">
              {qrCode && (
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="w-48 h-48"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Сканирайте този код с вашето приложение за автентикация
            </p>
          </div>

          {/* Manual Secret */}
          <div className="space-y-2">
            <Label>Или въведете ръчно този код:</Label>
            <div className="flex gap-2">
              <Input value={secret} readOnly className="font-mono" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(secret, "secret")}
              >
                {copiedCode === "secret" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Backup Codes */}
          <div className="space-y-3">
            <div>
              <Label>Резервни кодове (запазете ги на сигурно място)</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Използвайте тези кодове ако загубите достъп до устройството си
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted/50 rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-background rounded"
                >
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(code, `backup-${index}`)}
                  >
                    {copiedCode === `backup-${index}` ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Input */}
          <div className="space-y-3">
            <Label htmlFor="verification-code">
              Въведете код от приложението за потвърждение
            </Label>
            <div className="flex gap-2">
              <Input
                id="verification-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="font-mono text-lg text-center"
                autoComplete="off"
              />
              <Button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="btn-hover-effect"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Потвърди"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          2FA активиран успешно!
        </CardTitle>
        <CardDescription>
          Вашият акаунт вече е защитен с двуфакторна автентикация
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            От сега нататък ще трябва да въвеждате код от приложението си при всяко влизане.
          </p>
        </div>

        <Button onClick={onSuccess} className="w-full">
          Готово
        </Button>
      </CardContent>
    </Card>
  );
}

interface TwoFactorStatusProps {
  enabled: boolean;
  enabledAt?: string | number | Date | null;
  backupCodesRemaining?: number;
  onEnable?: () => void;
  onDisable?: () => void;
}

export function TwoFactorStatus({
  enabled,
  enabledAt,
  backupCodesRemaining = 0,
  onEnable,
  onDisable,
}: TwoFactorStatusProps) {
  const [disabling, setDisabling] = useState(false);

  const handleDisable = async () => {
    if (!confirm("Сигурни ли сте, че искате да деактивирате 2FA? Това ще намали сигурността на акаунта ви.")) {
      return;
    }

    setDisabling(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to disable 2FA");
      }

      toast.success("2FA деактивиран");
      
      if (onDisable) {
        onDisable();
      }
    } catch (error) {
      console.error("Disable 2FA error:", error);
      toast.error("Грешка при деактивиране на 2FA");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="mt-1">
              Допълнителна защита за вашия акаунт
            </CardDescription>
          </div>
          {enabled ? (
            <Badge className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Активен
            </Badge>
          ) : (
            <Badge variant="secondary">Неактивен</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled ? (
          <>
            <div className="space-y-3">
              {enabledAt && (
                <div className="text-sm text-muted-foreground">
                  Активиран на: {new Date(enabledAt).toLocaleDateString("bg-BG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Резервни кодове</span>
                <Badge variant={backupCodesRemaining > 5 ? "secondary" : "destructive"}>
                  {backupCodesRemaining} останали
                </Badge>
              </div>
              {backupCodesRemaining < 3 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Малко резервни кодове! Препоръчваме да генерирате нови.
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disabling}
              className="w-full"
            >
              {disabling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Деактивиране...
                </>
              ) : (
                "Деактивирай 2FA"
              )}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              2FA не е активиран. Препоръчваме да го активирате за по-добра сигурност.
            </p>
            <Button onClick={onEnable} className="w-full btn-hover-effect">
              <Shield className="w-4 h-4 mr-2" />
              Активирай 2FA
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
