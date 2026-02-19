"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, DollarSign, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PotentialBuyer {
  buyer: {
    userId: string;
    name: string;
    email: string;
    image: string | null;
  };
  matchScore: number;
  matchReasons: string[];
  budgetRange: {
    min: number;
    max: number;
  };
}

interface SellerPotentialBuyersProps {
  listingId: number;
}

export const SellerPotentialBuyers: React.FC<SellerPotentialBuyersProps> = ({ listingId }) => {
  const [potentialBuyers, setPotentialBuyers] = useState<PotentialBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPotentialBuyers();
  }, [listingId]);

  const fetchPotentialBuyers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('bearer_token');
      const res = await fetch(`/api/matching/potential-buyers/${listingId}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.code === 'LISTING_NOT_FOUND') {
          setError('Listing not found.');
        } else if (errorData.code === 'FORBIDDEN') {
          setError('You do not have access to view this listing.');
        } else {
          throw new Error(errorData.error || 'Failed to fetch potential buyers');
        }
        return;
      }

      const data = await res.json();
      setPotentialBuyers(data);
    } catch (err) {
      console.error('Failed to fetch potential buyers:', err);
      toast.error('Failed to load potential buyers');
      setError('Failed to load potential buyers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Potential Buyers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Potential Buyers
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">Unable to Load Data</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Button onClick={fetchPotentialBuyers} variant="secondary">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Potential Buyers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {potentialBuyers.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">No Matches Yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                We haven't found any buyers matching this listing yet. Check back later!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {potentialBuyers.length} potential buyer{potentialBuyers.length !== 1 ? 's' : ''} interested in similar businesses
            </p>

            <div className="grid gap-3">
              {potentialBuyers.map((match) => (
                <div
                  key={match.buyer.userId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Left: Buyer Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-semibold">{match.buyer.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {match.buyer.email}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-semibold text-sm ${getScoreColor(match.matchScore)}`}>
                        <TrendingUp className="h-3 w-3" />
                        <span>{match.matchScore}%</span>
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Budget: {formatCurrency(match.budgetRange.min)} - {formatCurrency(match.budgetRange.max)}
                      </span>
                    </div>

                    {/* Match Reasons */}
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchReasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> These are verified buyers whose preferences match your listing. 
                They haven't viewed your listing yet, but their profiles indicate strong potential interest.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
