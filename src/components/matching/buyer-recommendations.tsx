"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, MapPin, DollarSign, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MatchedListing {
  listing: {
    id: number;
    title: string;
    businessType: string | null;
    geography: string | null;
    askingPrice: number | null;
    ttmRevenue: number | null;
    ttmProfit: number | null;
    profitMargin: number | null;
    isVerified: boolean;
  };
  seller: {
    name: string;
    email: string;
  };
  matchScore: number;
  matchReasons: string[];
}

export const BuyerRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MatchedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('bearer_token');
      const res = await fetch('/api/matching/recommendations', {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.code === 'BUYER_PROFILE_NOT_FOUND') {
          setError('Please complete your buyer profile first to see recommendations.');
        } else if (errorData.code === 'ONBOARDING_NOT_COMPLETED') {
          setError('Please complete buyer onboarding to see personalized recommendations.');
        } else {
          throw new Error(errorData.error || 'Failed to fetch recommendations');
        }
        return;
      }

      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      toast.error('Failed to load recommendations');
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">No Recommendations Yet</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Link href="/dashboard/onboarding/buyer">
              <Button>Complete Buyer Onboarding</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">No Matches Found</p>
              <p className="text-sm text-muted-foreground mt-2">
                We couldn't find any listings matching your preferences. Try adjusting your search criteria.
              </p>
            </div>
            <Link href="/listings">
              <Button variant="secondary">Browse All Listings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Found {recommendations.length} personalized recommendation{recommendations.length !== 1 ? 's' : ''} based on your preferences
          </p>
        </div>
        <Link href="/listings">
          <Button variant="outline" size="sm">
            Browse All
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {recommendations.map((match) => (
          <Card key={match.listing.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left: Listing Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Link 
                        href={`/listing/${match.listing.id}`}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {match.listing.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {match.listing.businessType && (
                          <Badge variant="secondary">{match.listing.businessType}</Badge>
                        )}
                        {match.listing.isVerified && (
                          <Badge variant="default" className="bg-green-600">Verified</Badge>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-semibold ${getScoreColor(match.matchScore)}`}>
                      <TrendingUp className="h-4 w-4" />
                      <span>{match.matchScore}% Match</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Asking Price
                      </div>
                      <div className="font-semibold">{formatCurrency(match.listing.askingPrice)}</div>
                    </div>
                    {match.listing.ttmRevenue !== null && (
                      <div>
                        <div className="text-muted-foreground">TTM Revenue</div>
                        <div className="font-semibold">{formatCurrency(match.listing.ttmRevenue)}</div>
                      </div>
                    )}
                    {match.listing.ttmProfit !== null && (
                      <div>
                        <div className="text-muted-foreground">TTM Profit</div>
                        <div className="font-semibold">{formatCurrency(match.listing.ttmProfit)}</div>
                      </div>
                    )}
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Why this matches:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.matchReasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {match.listing.geography && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {match.listing.geography}
                    </div>
                  )}
                </div>

                {/* Right: CTA */}
                <div className="flex lg:flex-col gap-2 lg:justify-center">
                  <Link href={`/listing/${match.listing.id}`} className="flex-1 lg:flex-initial">
                    <Button className="w-full gap-2">
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
