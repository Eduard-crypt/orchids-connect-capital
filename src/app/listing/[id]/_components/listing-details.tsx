"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NDADialog } from "@/components/ui/nda-dialog";
import { SellerPotentialBuyers } from "@/components/matching/seller-potential-buyers";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Globe,
  FileText,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";

interface Listing {
  id: number;
  sellerId: string;
  status: string;
  title: string;
  businessModel: string | null;
  niche: string | null;
  geography: string | null;
  ttmRevenue: number | null;
  ttmProfit: number | null;
  profitMargin: number | null;
  organicTraffic: string | null;
  paidTraffic: string | null;
  marketplaces: string | null;
  teamSize: number | null;
  hoursPerWeek: number | null;
  askingPrice: number | null;
  businessType: string | null;
  businessUrl: string | null;
  brandName: string | null;
  fullDescription: string | null;
    ageMonths: number | null;
    yearEstablished: number | null;
    revenueMultiple: number | null;
  isVerified: boolean;
  underLoi: boolean;
  sellerResponseTimeHours: number | null;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
}

interface NDAStatus {
  hasSigned: boolean;
  agreement?: {
    id: number;
    agreedAt: string;
    ipAddress: string;
  };
}

interface ListingDocument {
  id: number;
  documentName: string;
  documentUrl: string;
  documentType: string;
  fileSize: number;
}

export function ListingDetails({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [ndaStatus, setNdaStatus] = useState<NDAStatus | null>(null);
  const [documents, setDocuments] = useState<ListingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNDADialog, setShowNDADialog] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("bearer_token");

      // Fetch listing
      const listingRes = await fetch(`/api/listings/${listingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!listingRes.ok) {
        throw new Error("Failed to load listing");
      }

        const listingData = await listingRes.json();
        
        // Transform "Global" or "Global / Remote" locations to a random country / Remote
        const countriesForRandom = [
          'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
          'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
          'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Poland',
          'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
          'Armenia'
        ];
        
        if (listingData.geography === 'Global' || listingData.geography === 'Global / Remote' || listingData.geography === 'Remote') {
          const index = listingData.id % countriesForRandom.length;
          listingData.geography = `${countriesForRandom[index]} / Remote`;
        }

        setListing(listingData);

      // If user is logged in, check NDA status
      if (session?.user) {
        const ndaRes = await fetch(`/api/nda/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (ndaRes.ok) {
          const ndaData = await ndaRes.json();
          setNdaStatus(ndaData);

          // If NDA is signed, fetch documents
          if (ndaData.hasSigned) {
            const docsRes = await fetch(`/api/listings/${listingId}/documents`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (docsRes.ok) {
              const docsData = await docsRes.json();
              setDocuments(docsData);
            }
          }
        }

        // Check buyer verification
        const verificationRes = await fetch("/api/buyer-verification", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (verificationRes.ok) {
          const verificationData = await verificationRes.json();
          setIsVerified(verificationData.verificationStatus === "verified");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load listing details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionPending) {
      fetchData();
    }
  }, [listingId, session, sessionPending]);

  const handleUnlockData = () => {
    if (!session) {
      router.push(`/login?redirect=/listing/${listingId}`);
      return;
    }
    setShowNDADialog(true);
  };

  const handleRequestInfo = () => {
    if (!session) {
      router.push(`/login?redirect=/listing/${listingId}`);
      return;
    }
    router.push(`/messages?listingId=${listingId}`);
  };

  const canAccessGatedData = session && ndaStatus?.hasSigned && isVerified;
  const isSeller = session?.user?.id === listing?.sellerId;

  if (isLoading || sessionPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Listing not found</h2>
        <Button onClick={() => router.push("/listings")}>Browse Listings</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">{listing.title}</h1>
                    {listing.isVerified && (
                      <Badge className="bg-green-600">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {listing.underLoi && (
                      <Badge variant="secondary">Under LOI</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {listing.businessType && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {listing.businessType}
                      </span>
                    )}
                    {listing.geography && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.geography}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Asking Price</div>
                  <div className="text-3xl font-bold text-primary">
                    ${listing.askingPrice?.toLocaleString() || "N/A"}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Seller Analytics - Potential Buyers */}
          {isSeller && (
            <SellerPotentialBuyers listingId={parseInt(listingId)} />
          )}

          {/* Public Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics (Public)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">TTM Revenue</div>
                    <div className="text-xl font-bold">
                      ${listing.ttmRevenue?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">TTM Profit</div>
                    <div className="text-xl font-bold">
                      ${listing.ttmProfit?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Team Size</div>
                    <div className="text-xl font-bold">{listing.teamSize || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Hours/Week</div>
                    <div className="text-xl font-bold">{listing.hoursPerWeek || 0}h</div>
                  </div>
                </div>
              </div>

              {listing.revenueMultiple && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Revenue Multiple</div>
                  <div className="text-2xl font-bold text-primary">
                    {listing.revenueMultiple.toFixed(2)}x
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

            {/* Media Gallery - Video and Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Business Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Business Overview Video</h4>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <video 
                      controls 
                      className="w-full h-full object-cover"
                      poster="/placeholder-video-poster.jpg"
                    >
                      <source src="/demo-business-video.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Photos Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Business Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border hover:opacity-90 transition-opacity cursor-pointer">
                      <img 
                        src="/business-photo-1.jpg" 
                        alt="Business photo 1"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EYXNoYm9hcmQgU2NyZWVuc2hvdDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </div>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border hover:opacity-90 transition-opacity cursor-pointer">
                      <img 
                        src="/business-photo-2.jpg" 
                        alt="Business photo 2"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BbmFseXRpY3MgUGFuZWw8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border hover:opacity-90 transition-opacity cursor-pointer">
                      <img 
                        src="/business-photo-3.jpg" 
                        alt="Business photo 3"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IFZpZXc8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Business Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {listing.fullDescription || "No description available"}
                </p>
              </CardContent>
            </Card>

          {/* Gated Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Confidential Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!session ? (
                <div className="text-center py-8 space-y-4">
                  <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please log in to view confidential business information
                    </p>
                    <Button onClick={() => router.push(`/login?redirect=/listing/${listingId}`)}>
                      Log In to Continue
                    </Button>
                  </div>
                </div>
              ) : !ndaStatus?.hasSigned ? (
                <div className="text-center py-8 space-y-4">
                  <ShieldCheck className="w-12 h-12 mx-auto text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">NDA Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign a Non-Disclosure Agreement to access:
                    </p>
                    <ul className="text-sm text-left max-w-md mx-auto space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-primary" />
                        Full financial breakdown
                      </li>
                      <li className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Business URL and brand name
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Detailed traffic and channel data
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Attached documents and proof files
                      </li>
                    </ul>
                    <Button
                      onClick={handleUnlockData}
                      size="lg"
                      className="btn-hover-effect"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Sign NDA & Unlock Data
                    </Button>
                  </div>
                </div>
              ) : !isVerified ? (
                <div className="text-center py-8 space-y-4">
                  <ShieldCheck className="w-12 h-12 mx-auto text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Verification Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete buyer verification to access confidential data
                    </p>
                    <Button onClick={() => router.push("/dashboard?tab=verification")}>
                      Start Verification
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">Confidential data unlocked</span>
                  </div>

                  {/* Brand & URL */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {listing.brandName && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Brand Name</div>
                        <div className="font-semibold text-lg">{listing.brandName}</div>
                      </div>
                    )}
                    {listing.businessUrl && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Website URL</div>
                        <a
                          href={listing.businessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-lg text-primary hover:underline"
                        >
                          {listing.businessUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Traffic & Channels */}
                  <div className="space-y-3">
                    {listing.organicTraffic && (
                      <div>
                        <div className="text-sm font-semibold mb-1">Organic Traffic</div>
                        <p className="text-sm text-muted-foreground">{listing.organicTraffic}</p>
                      </div>
                    )}
                    {listing.paidTraffic && (
                      <div>
                        <div className="text-sm font-semibold mb-1">Paid Traffic</div>
                        <p className="text-sm text-muted-foreground">{listing.paidTraffic}</p>
                      </div>
                    )}
                    {listing.marketplaces && (
                      <div>
                        <div className="text-sm font-semibold mb-1">Marketplaces</div>
                        <p className="text-sm text-muted-foreground">{listing.marketplaces}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  {documents.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3">Attached Documents</h4>
                        <div className="space-y-2">
                          {documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <FileText className="w-5 h-5 text-primary" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{doc.documentName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {doc.documentType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {listing.sellerResponseTimeHours && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Responds within {listing.sellerResponseTimeHours}h</span>
                </div>
              )}
              <Button
                onClick={handleRequestInfo}
                className="w-full btn-hover-effect"
                size="lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request More Info
              </Button>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {listing.businessModel && (
                <div>
                  <div className="text-muted-foreground">Business Model</div>
                  <div className="font-medium">{listing.businessModel}</div>
                </div>
              )}
              {listing.niche && (
                <div>
                  <div className="text-muted-foreground">Niche</div>
                  <div className="font-medium">{listing.niche}</div>
                </div>
              )}
                { (listing.ageMonths || listing.yearEstablished) && (
                  <div>
                    <div className="text-muted-foreground">Business Age</div>
                    <div className="font-medium">
                      {listing.ageMonths 
                        ? (listing.ageMonths >= 12 
                            ? `${Math.floor(listing.ageMonths / 12)} years ${listing.ageMonths % 12 > 0 ? `${listing.ageMonths % 12} months` : ''}`
                            : `${listing.ageMonths} months`)
                        : `${new Date().getFullYear() - (listing.yearEstablished || new Date().getFullYear())} years`
                      }
                    </div>
                  </div>
                )}
              {listing.profitMargin && (
                <div>
                  <div className="text-muted-foreground">Profit Margin</div>
                  <div className="font-medium">{listing.profitMargin}%</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* NDA Dialog */}
      <NDADialog
        open={showNDADialog}
        onOpenChange={setShowNDADialog}
        listingId={listing.id}
        listingTitle={listing.title}
        onSuccess={fetchData}
      />
    </div>
  );
}