"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CheckCircle, Rocket, ShieldCheck, Wallet, MessageSquare, Bookmark, FileText, Settings, CreditCard, Loader2, Trash2, Bell, BellOff, Shield, Truck, Clock } from "lucide-react";
import { DocumentsSection } from "./documents-section";
import { LOIList } from "@/components/loi/loi-list";
import { EscrowList } from "@/components/escrow/escrow-list";
import { VerificationForm, VerificationStatus } from "@/components/buyer-verification/verification-form";
import { TwoFactorSetup, TwoFactorStatus } from "@/components/security/two-factor-setup";
import { BuyerRecommendations } from "@/components/matching/buyer-recommendations";
import { useSearchParams } from "next/navigation";

type DashboardTabsProps = {
  initialSession?: any;
};

type Profile = {
  id: number;
  userId: string;
  roleBuyer: boolean;
  roleSeller: boolean;
  kycStatus: "not_verified" | "pending" | "verified";
  plan: string;
  messagesLimit: number;
  savedSearchesLimit: number;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
};

type SavedSearch = {
  id: number;
  userId: string;
  name: string;
  searchCriteria: any;
  emailAlertsEnabled: boolean;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
};

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ initialSession }) => {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const user = initialSession?.user as { name?: string; email?: string } | undefined;
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [loadingSearches, setLoadingSearches] = React.useState(false);
  
  // Buyer verification state
  const [verificationData, setVerificationData] = React.useState<any>(null);
  const [loadingVerification, setLoadingVerification] = React.useState(false);
  
  // 2FA state
  const [twoFactorData, setTwoFactorData] = React.useState<any>(null);
  const [loadingTwoFactor, setLoadingTwoFactor] = React.useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as Profile;
      setProfile(data);
    } catch (e) {
      // no-op
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  const fetchSavedSearches = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSearches(true);
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/saved-searches", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as SavedSearch[];
      setSavedSearches(data);
    } catch (e) {
      console.error("Failed to fetch saved searches:", e);
    } finally {
      setLoadingSearches(false);
    }
  }, [user]);

  // Fetch verification status
  const fetchVerification = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoadingVerification(true);
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/buyer-verification", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationData(data);
      }
    } catch (e) {
      console.error("Failed to fetch verification:", e);
    } finally {
      setLoadingVerification(false);
    }
  }, [user]);

  // Fetch 2FA status
  const fetchTwoFactorStatus = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoadingTwoFactor(true);
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/2fa/status", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTwoFactorData(data);
      }
    } catch (e) {
      console.error("Failed to fetch 2FA status:", e);
    } finally {
      setLoadingTwoFactor(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchProfile();
    fetchSavedSearches();
    fetchVerification();
    fetchTwoFactorStatus();
  }, [fetchProfile, fetchSavedSearches, fetchVerification, fetchTwoFactorStatus]);

  const updateRoles = async (updates: Partial<Pick<Profile, "roleBuyer" | "roleSeller">>) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        toast.error("Failed to update roles");
        return;
      }
      const data = (await res.json()) as Profile;
      setProfile(data);
      toast.success("Roles updated");
    } catch (e) {
      toast.error("Could not update roles");
    }
  };

  const toggleEmailAlerts = async (searchId: number, currentValue: boolean) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/saved-searches?id=${searchId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ emailAlertsEnabled: !currentValue }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to toggle email alerts");
      }

      const updated = await res.json();
      setSavedSearches((prev) =>
        prev.map((s) => (s.id === searchId ? updated : s))
      );
      toast.success(`Email alerts ${!currentValue ? "enabled" : "disabled"}`);
    } catch (e) {
      console.error("Failed to toggle email alerts:", e);
      toast.error("Failed to toggle email alerts");
    }
  };

  const deleteSavedSearch = async (searchId: number) => {
    if (!confirm("Are you sure you want to delete this saved search?")) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/saved-searches?id=${searchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete saved search");
      }

      setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
      toast.success("Saved search deleted");
    } catch (e) {
      console.error("Failed to delete saved search:", e);
      toast.error("Failed to delete saved search");
    }
  };

  const formatDate = (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | number | Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const planName = profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Free";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="flex flex-wrap gap-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="loi-offers">LOI Offers</TabsTrigger>
        <TabsTrigger value="escrow">Escrow</TabsTrigger>
        <TabsTrigger value="migration">Migration</TabsTrigger>
        <TabsTrigger value="billing">Plan & Billing</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="verification">Verification</TabsTrigger>
        <TabsTrigger value="saved-searches">Saved Searches</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="mt-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> KYC Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{loadingProfile ? "Loading..." : (profile?.kycStatus === "verified" ? "Verified" : profile?.kycStatus === "pending" ? "Pending" : "Not Verified")}</Badge>
                <span className="text-muted-foreground">Improve trust to message sellers faster.</span>
              </div>
              <Link href="/dashboard?tab=verification" className="inline-block">
                <Button size="sm" className="btn-hover-effect">Start verification</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Plan Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">Current plan: <span className="font-semibold">{planName} Plan</span></div>
              <div>
                <div className="mb-1 flex justify-between text-sm"><span>Messages</span><span>0 / {profile?.messagesLimit ?? 50}</span></div>
                <Progress value={0} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm"><span>Saved Searches</span><span>{savedSearches.length} / {profile?.savedSearchesLimit ?? 10}</span></div>
                <Progress value={(savedSearches.length / (profile?.savedSearchesLimit ?? 10)) * 100} />
              </div>
              <Link href="/dashboard?tab=billing" className="inline-block">
                <Button variant="secondary" size="sm">Upgrade plan</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/dashboard/onboarding/buyer"><Button variant="outline" className="justify-start"><CheckCircle className="mr-2 h-4 w-4" /> Start Buyer Onboarding</Button></Link>
              <Link href="/dashboard/onboarding/seller"><Button variant="outline" className="justify-start"><CheckCircle className="mr-2 h-4 w-4" /> Start Seller Onboarding</Button></Link>
              <Link href="/listings"><Button variant="outline" className="justify-start"><Bookmark className="mr-2 h-4 w-4" /> Browse & Save Searches</Button></Link>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Recommendations */}
      <TabsContent value="recommendations" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BuyerRecommendations />
          </CardContent>
        </Card>
      </TabsContent>

      {/* LOI Offers */}
      <TabsContent value="loi-offers" className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                LOI Offers
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buyer" className="w-full">
              <TabsList>
                <TabsTrigger value="buyer">As Buyer</TabsTrigger>
                <TabsTrigger value="seller">As Seller</TabsTrigger>
              </TabsList>
              <TabsContent value="buyer" className="mt-4">
                <LOIList role="buyer" />
              </TabsContent>
              <TabsContent value="seller" className="mt-4">
                <LOIList role="seller" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Escrow */}
      <TabsContent value="escrow" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Escrow Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EscrowList />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Migration */}
      <TabsContent value="migration" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Migration Checklists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState 
              icon={Truck} 
              title="Migration checklists" 
              description="View migration checklists from your escrow transactions"
              ctaHref="/dashboard?tab=escrow" 
              ctaLabel="View Escrow Transactions" 
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Plan & Billing */}
      <TabsContent value="billing" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Plan & Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">Current plan: {planName} Plan</div>
            <div className="flex flex-wrap gap-3">
              <Button disabled title="Stripe portal will be enabled after setup">Open Stripe Customer Portal</Button>
              <Link href="/pricing"><Button variant="secondary">View Plans</Button></Link>
            </div>
            <p className="text-xs text-muted-foreground">To enable the billing portal, add Stripe API keys. We will connect this button once keys are provided.</p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Roles */}
      <TabsContent value="roles" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">Choose one or both roles. You can switch anytime.</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <div className="font-medium">Buyer</div>
                  <div className="text-xs text-muted-foreground">Search, save, and message sellers</div>
                </div>
                <Switch
                  checked={!!profile?.roleBuyer}
                  onCheckedChange={(v) => updateRoles({ roleBuyer: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <div className="font-medium">Seller</div>
                  <div className="text-xs text-muted-foreground">List a business and track interest</div>
                </div>
                <Switch
                  checked={!!profile?.roleSeller}
                  onCheckedChange={(v) => updateRoles({ roleSeller: v })}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/onboarding/buyer"><Button variant="outline">Start Buyer Onboarding</Button></Link>
              <Link href="/dashboard/onboarding/seller"><Button variant="outline">Start Seller Onboarding</Button></Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Verification */}
      <TabsContent value="verification" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Buyer Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVerification ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : verificationData ? (
                <VerificationStatus
                  status={verificationData.verificationStatus}
                  identityVerified={verificationData.identityVerified}
                  proofOfFundsVerified={verificationData.proofOfFundsVerified}
                  verifiedAt={verificationData.verifiedAt}
                  notes={verificationData.notes}
                />
              ) : (
                <VerificationForm onSuccess={fetchVerification} />
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Saved Searches */}
      <TabsContent value="saved-searches" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                Saved Searches
              </span>
              <Link href="/listings">
                <Button variant="outline" size="sm">
                  Create New Search
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSearches ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : savedSearches.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">No saved searches yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start browsing listings and save your searches to receive daily email alerts
                  </p>
                </div>
                <Link href="/listings">
                  <Button>Browse Listings</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  You have {savedSearches.length} saved search{savedSearches.length !== 1 ? "es" : ""}.
                  Email alerts are sent daily with new matching listings.
                </p>
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base truncate">{search.name}</h4>
                          {search.emailAlertsEnabled ? (
                            <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              Alerts On
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BellOff className="w-3 h-3" />
                              Alerts Off
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(search.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Email alerts:</span>
                          <Switch
                            checked={search.emailAlertsEnabled}
                            onCheckedChange={() => toggleEmailAlerts(search.id, search.emailAlertsEnabled)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedSearch(search.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Messages */}
      <TabsContent value="messages" className="mt-6">
        <EmptyState icon={MessageSquare} title="No messages yet" ctaHref="/rent-ai-agent" ctaLabel="Explore listings" />
      </TabsContent>

      {/* Documents */}
      <TabsContent value="documents" className="mt-6">
        <DocumentsSection />
      </TabsContent>

      {/* Settings */}
      <TabsContent value="settings" className="mt-6">
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          {loadingTwoFactor ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : showTwoFactorSetup ? (
            <TwoFactorSetup
              onSuccess={() => {
                setShowTwoFactorSetup(false);
                fetchTwoFactorStatus();
              }}
              onCancel={() => setShowTwoFactorSetup(false)}
            />
          ) : (
            <TwoFactorStatus
              enabled={twoFactorData?.enabled || false}
              enabledAt={twoFactorData?.enabledAt}
              backupCodesRemaining={twoFactorData?.backupCodesRemaining || 0}
              onEnable={() => setShowTwoFactorSetup(true)}
              onDisable={fetchTwoFactorStatus}
            />
          )}

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Name</div>
                  <div className="text-sm text-muted-foreground">{user?.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

function EmptyState({ icon: Icon, title, description, ctaHref, ctaLabel }: { icon: any; title: string; description?: string; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="py-12 text-center space-y-4">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <div className="text-lg font-semibold">{title}</div>
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      </div>
      <Link href={ctaHref}><Button variant="secondary">{ctaLabel}</Button></Link>
    </div>
  );
}