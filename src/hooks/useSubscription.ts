'use client';

import { useEffect, useState } from 'react';
import { UserSubscription } from '@/lib/access-control';

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscriptions/status');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscriptions/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    refresh,
    isActive: subscription?.isActive || false,
    isTrial: subscription?.isTrial || false,
    planName: subscription?.planName || 'Free',
    planSlug: subscription?.planSlug || null,
  };
}

export function useFeatureAccess(featureName: string) {
  const { subscription, loading } = useSubscription();
  
  const hasAccess = 
    subscription?.isActive && 
    subscription.features?.[featureName] === true;

  return {
    hasAccess,
    loading,
    subscription,
  };
}

export function useFeatureLimits() {
  const [limits, setLimits] = useState<{
    listings: { used: number; limit: number; remaining: number; percentage: number; exceeded: boolean };
    documents: { used: number; limit: number; remaining: number; percentage: number; exceeded: boolean };
    messages: { used: number; limit: number; remaining: number; percentage: number; exceeded: boolean };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/limits');

      if (!response.ok) {
        throw new Error('Failed to fetch limits');
      }

      const data = await response.json();
      setLimits(data.limits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return {
    limits,
    loading,
    error,
    refresh: fetchLimits,
  };
}
