'use client';

import { useEffect, useState } from 'react';
import { useSession, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, ShoppingBag, Briefcase, CheckCircle2, Clock, Building2, MapPin, DollarSign, Heart, ExternalLink, FileText, AlertCircle, TrendingUp, User, Mail, Phone, Calendar, BarChart3, Plus, Bot } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface UserProfile {
  id: number;
  userId: string;
  plan: string;
  stripeCustomerId: string | null;
  kycStatus: string;
  kycVerifiedAt: string | null;
  phone: string | null;
  companyName: string | null;
  ownsBusiness: boolean;
  primaryBusinessInterest: string | null;
  businessLocation: string | null;
  purchaseTimeframe: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SavedListing {
  saveId: number;
  savedAt: string;
  listing: {
    id: number;
    title: string;
    location: string;
    category: string;
    price: number;
    annualRevenue: number;
    annualCashFlow: number;
    description: string;
    isFeatured: boolean;
    isVerified: boolean;
    employees: number;
    yearEstablished: number;
  };
}

interface SellRequest {
  id: number;
  userId: string;
  plan: string;
  businessName: string;
  businessUrl: string;
  businessModel: string;
  annualRevenue: number;
  annualProfit: number;
  employeesCount: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileTypeData {
  profileType: 'Business Seller' | 'Business Teacher' | 'Viewer';
  hasActiveMembership: boolean;
  isTeacherVerified: boolean;
  canCreateListings: boolean;
  membershipDetails?: {
    planName: string;
    status: string;
    renewsAt: Date;
  };
}

interface UserMembership {
  id: number;
  userId: string;
  planId: number;
  status: string;
  startedAt: string;
  renewsAt: string;
  canceledAt: string | null;
  plan: {
    id: number;
    name: string;
    slug: string;
    priceAmount: number;
  };
}

const STATUS_CONFIG = {
  pending_review: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  in_progress: {
    label: 'In Progress',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800'
  }
};

export default function DashboardContent() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileType, setProfileType] = useState<ProfileTypeData | null>(null);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingProfileType, setIsLoadingProfileType] = useState(true);
  const [isLoadingSavedListings, setIsLoadingSavedListings] = useState(true);
  const [isLoadingSellRequests, setIsLoadingSellRequests] = useState(true);
  const [isLoadingMembership, setIsLoadingMembership] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login?redirect=/dashboard');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchProfileType();
      fetchSavedListings();
      fetchSellRequests();
      fetchMembership();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/user-profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchProfileType = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/users/me/profile-type', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileType(data);
      }
    } catch (error) {
      console.error('Error fetching profile type:', error);
    } finally {
      setIsLoadingProfileType(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/users/me/saved-listings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        if (response.ok) {
          const data = await response.json();
          
          // Transform "Global" or "Global / Remote" locations to a random country / Remote
          const countriesForRandom = [
            'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
            'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
            'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Poland',
            'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
            'Armenia'
          ];
          
          const transformedData = data.map((saved: SavedListing) => {
            const loc = saved.listing.location;
            if (loc === 'Global' || loc === 'Global / Remote' || loc === 'Remote') {
              const index = saved.listing.id % countriesForRandom.length;
              return {
                ...saved,
                listing: {
                  ...saved.listing,
                  location: `${countriesForRandom[index]} / Remote`
                }
              };
            }
            return saved;
          });

          setSavedListings(transformedData);
        }
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    } finally {
      setIsLoadingSavedListings(false);
    }
  };

  const fetchSellRequests = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/users/me/sell-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSellRequests(data);
      }
    } catch (error) {
      console.error('Error fetching sell requests:', error);
    } finally {
      setIsLoadingSellRequests(false);
    }
  };

  const fetchMembership = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/users/me/membership', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembership(data);
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    } finally {
      setIsLoadingMembership(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error(error.code);
      } else {
        localStorage.removeItem('bearer_token');
        toast.success('Logged out successfully');
        refetch();
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleStartVerification = () => {
    // Check if user is already verified
    if (profile?.kycStatus === 'verified') {
      toast.success('You are already verified! ✓');
      return;
    }

    // Check if verification is pending
    if (profile?.kycStatus === 'pending') {
      toast.info('Your verification is currently being reviewed. We\'ll notify you once it\'s complete.');
      return;
    }

    // Redirect to buyer verification flow
    router.push('/buyer-verification');
  };

  const getProfileTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Business Seller':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Business Teacher':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Viewer':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatPrice = (priceInCents: number) => {
    const priceInDollars = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceInDollars);
  };

  const getFirstName = (fullName: string | undefined) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  // Loading state
  if (isPending || isLoadingProfile || isLoadingProfileType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="h-16 w-16 animate-spin text-accent relative z-10" />
        </div>
        <p className="text-foreground/70 text-lg mt-6 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  // If no session after loading, show nothing (redirect will happen)
  if (!session?.user) {
    return null;
  }

  // Get membership status display
  const getMembershipStatus = () => {
    if (isLoadingMembership) {
      return 'Loading...';
    }
    if (!membership) {
      return 'No Plan';
    }
    return membership.plan.name;
  };

  const getMembershipStatusColor = () => {
    if (!membership) {
      return 'text-muted-foreground';
    }
    if (membership.status === 'active') {
      return 'text-secondary';
    }
    if (membership.status === 'expired') {
      return 'text-red-600';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background/95">
      {/* Light Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-muted/30 to-background border-b border-border/40">
        {/* Subtle Light Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative py-12 mb-8">
          <div className="container max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="inline-block">
                  <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2 px-3 py-1 bg-accent/10 rounded-full">
                    Dashboard
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                  Welcome back, {getFirstName(session.user.name)}
                </h1>
                <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                  Manage your portfolio, track opportunities, and grow your business with confidence
                </p>
                {profileType && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Status:</span>
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${getProfileTypeBadgeColor(profileType.profileType)} shadow-sm`}>
                      {profileType.profileType}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {profileType?.canCreateListings && (
                  <Button
                    onClick={() => router.push('/listings/create')}
                    size="lg"
                    className="gap-2 bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold px-6"
                  >
                    <Plus className="h-5 w-5" />
                    Create Listing
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-white hover:bg-muted border-border shadow-md transition-all duration-300 font-semibold px-6"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl py-8">
        {/* Light Premium Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Saved Listings</p>
                  <p className="text-4xl font-bold text-primary">{savedListings.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sell Requests</p>
                  <p className="text-4xl font-bold text-accent">{sellRequests.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-accent/50 to-transparent rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Account Status</p>
                  <p className={`text-xl font-bold ${getMembershipStatusColor()}`}>
                    {getMembershipStatus()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {membership?.status === 'active' ? (
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  ) : (
                    <Clock className="h-6 w-6 text-secondary" />
                  )}
                </div>
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-secondary/50 to-transparent rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Member Since</p>
                  <p className="text-xl font-bold text-primary">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent rounded-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Light Premium Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-primary mb-6 tracking-tight">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/buy-a-business">
              <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">Browse Businesses</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Explore verified businesses for sale in our curated marketplace
                      </p>
                    </div>
                    <Button className="w-full mt-2 bg-primary hover:bg-primary/90 shadow-md group-hover:shadow-lg transition-all font-semibold">
                      View Marketplace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

              <Link href="/sell-a-business/questionnaire">
                <Card className="group relative overflow-hidden bg-white border-2 border-accent/20 shadow-md hover:shadow-xl hover:border-accent transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 ring-2 ring-accent/20 group-hover:ring-accent">
                        <Briefcase className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-accent transition-colors">Sell Your Business</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          List your business with professional advisory support
                        </p>
                      </div>
                      <Button className="w-full mt-2 bg-accent hover:bg-accent/90 shadow-lg group-hover:shadow-accent/20 transition-all font-bold text-white ring-2 ring-accent/50 group-hover:ring-accent border-2 border-white/20">
                        Get Started
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>

            <Link href="/dashboard/my-ai-agents">
              <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <Bot className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-secondary transition-colors">My AI Agents</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Manage and access your AI agent subscriptions
                      </p>
                    </div>
                    <Button className="w-full mt-2 bg-secondary hover:bg-secondary/90 shadow-md group-hover:shadow-lg transition-all font-semibold text-white">
                      View Agents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card onClick={handleStartVerification} className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <CheckCircle2 className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-secondary transition-colors">Get Verified</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Unlock premium features and trusted buyer status
                    </p>
                  </div>
                  <Button className="w-full mt-2 bg-secondary hover:bg-secondary/90 shadow-md group-hover:shadow-lg transition-all font-semibold text-white">
                    Start Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Light Premium Profile and Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-10">
          {/* Profile Information */}
          <Card className="lg:col-span-2 relative overflow-hidden bg-white border border-border/50 shadow-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <CardHeader className="relative pb-4 border-b border-border/30">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-5">
                  <div className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Full Name</label>
                      <p className="text-foreground font-semibold">{session.user.name || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Email Address</label>
                      <p className="text-foreground font-semibold text-sm break-all">{session.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Phone Number</label>
                      <p className="text-foreground font-semibold">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/15 transition-colors">
                      {profile?.kycStatus === 'verified' ? (
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      ) : (
                        <Clock className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Verification Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {profile?.kycStatus === 'verified' ? (
                          <span className="px-3 py-1 rounded-lg bg-green-50 text-green-700 font-bold text-xs border border-green-200">
                            ✓ Verified
                          </span>
                        ) : profile?.kycStatus === 'pending' ? (
                          <span className="px-3 py-1 rounded-lg bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-200">
                            ⏳ Pending
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 font-bold text-xs border border-gray-200">
                            Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Business Owner</label>
                      <p className="text-foreground font-semibold">
                        {profile?.ownsBusiness ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                      <BarChart3 className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Primary Interest</label>
                      <p className="text-foreground font-semibold">
                        {profile?.primaryBusinessInterest || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="relative overflow-hidden bg-white border border-border/50 shadow-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
            <CardHeader className="relative pb-4 border-b border-border/30">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-primary">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-0.5">Account Created</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </p>
                  </div>
                </div>
                
                {savedListings.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-0.5">Saved Listings</p>
                      <p className="text-xs text-muted-foreground">
                        {savedListings.length} business{savedListings.length !== 1 ? 'es' : ''} saved
                      </p>
                    </div>
                  </div>
                )}

                {sellRequests.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-secondary/5 to-transparent hover:from-secondary/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-0.5">Sell Requests</p>
                      <p className="text-xs text-muted-foreground">
                        {sellRequests.length} submission{sellRequests.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Sell Requests Section */}
        <Card className="mb-10 relative overflow-hidden bg-white border border-border/50 shadow-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between relative border-b border-border/30 pb-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-primary mb-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                Your Sell Requests ({sellRequests.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground ml-13">
                Track the status of your business submissions
              </p>
            </div>
            <Link href="/sell-a-business">
              <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-muted border-border shadow-sm font-semibold">
                <Building2 className="h-4 w-4" />
                Submit New
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6 relative">
            {isLoadingSellRequests ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : sellRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-xl bg-accent/10 mb-4">
                  <FileText className="h-12 w-12 text-accent mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No sell requests yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Ready to sell your business? Submit your first listing to get started
                </p>
                <Link href="/sell-a-business">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-md font-semibold px-8">Submit Your Business</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sellRequests.map((request) => {
                  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Card key={request.id} className={`border ${statusConfig.borderColor} hover:shadow-lg transition-all duration-300 bg-white`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground text-lg mb-1">
                              {request.businessName}
                            </h4>
                            <a 
                              href={request.businessUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:text-primary/80 flex items-center gap-2 font-medium transition-colors"
                            >
                              {request.businessUrl}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-xs font-bold">{statusConfig.label}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 pb-3 border-b border-border/30">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Plan</p>
                            <p className="text-sm font-bold capitalize">{request.plan}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Business Model</p>
                            <p className="text-sm font-bold">{request.businessModel}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Annual Revenue</p>
                            <p className="text-sm font-bold text-primary">
                              {formatPrice(request.annualRevenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Employees</p>
                            <p className="text-sm font-bold">{request.employeesCount}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {request.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Listings Section */}
        <Card className="relative overflow-hidden bg-white border border-border/50 shadow-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between relative border-b border-border/30 pb-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-primary mb-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                Saved Listings ({savedListings.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground ml-13">
                Your watchlist of businesses you're interested in
              </p>
            </div>
            <Link href="/buy-a-business">
              <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-muted border-border shadow-sm font-semibold">
                <Building2 className="h-4 w-4" />
                Browse More
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6 relative">
            {isLoadingSavedListings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : savedListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-xl bg-primary/10 mb-4">
                  <Heart className="h-12 w-12 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No saved listings yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start exploring the marketplace and save businesses you're interested in
                </p>
                <Link href="/buy-a-business">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-md font-semibold px-8">Browse Businesses</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {savedListings.map((saved) => (
                  <Card key={saved.saveId} className="group hover:shadow-lg transition-all duration-300 border border-border/50 bg-white hover:-translate-y-1">
                    <CardContent className="p-5">
                      <div className="mb-3">
                        <h4 className="font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {saved.listing.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {saved.listing.location}
                        </div>
                        <span className="inline-block px-2 py-1 bg-muted rounded-md text-xs font-bold uppercase tracking-wide">
                          {saved.listing.category}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 pb-4 border-b border-border/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Price</span>
                          <span className="font-bold text-primary">
                            {formatPrice(saved.listing.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Revenue</span>
                          <span className="font-bold">
                            {formatPrice(saved.listing.annualRevenue)}
                          </span>
                        </div>
                      </div>

                      <Link href={`/listing/${saved.listing.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all font-semibold">
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}