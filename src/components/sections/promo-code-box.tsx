'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCodeBoxProps {
  cartTotal: number;
  onPromoApplied: (discount: number, finalTotal: number, promoCode: any) => void;
  onPromoRemoved: () => void;
}

export default function PromoCodeBox({
  cartTotal,
  onPromoApplied,
  onPromoRemoved,
}: PromoCodeBoxProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isLoadingApplied, setIsLoadingApplied] = useState(true);

  // Fetch currently applied promo on mount
  useEffect(() => {
    fetchAppliedPromo();
  }, []);

  const fetchAppliedPromo = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) return;

      const response = await fetch('/api/promo/applied', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.appliedPromo) {
          setAppliedPromo(data.appliedPromo);
          onPromoApplied(
            data.appliedPromo.discountAmount,
            data.appliedPromo.finalTotal,
            data.appliedPromo.promoCode
          );
        }
      }
    } catch (error) {
      console.error('Error fetching applied promo:', error);
    } finally {
      setIsLoadingApplied(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplying(true);

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Please log in to apply promo codes');
        setIsApplying(false);
        return;
      }

      const response = await fetch('/api/promo/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          cartTotal,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Promo code applied successfully!');
        setAppliedPromo({
          discountAmount: data.discountAmount,
          finalTotal: data.finalTotal,
          promoCode: data.promoCode,
        });
        onPromoApplied(data.discountAmount, data.finalTotal, data.promoCode);
        setPromoCode('');
      } else {
        toast.error(data.message || 'Failed to apply promo code');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Failed to apply promo code');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromo = async () => {
    setIsRemoving(true);

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) return;

      const response = await fetch('/api/promo/remove', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Promo code removed');
        setAppliedPromo(null);
        onPromoRemoved();
      } else {
        toast.error('Failed to remove promo code');
      }
    } catch (error) {
      console.error('Error removing promo code:', error);
      toast.error('Failed to remove promo code');
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoadingApplied) {
    return (
      <div className="border-t border-primary/10 pt-4 mt-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-primary/10 pt-4 mt-4">
      {appliedPromo ? (
        // Applied Promo Display
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-semibold text-primary">
                  Promo code applied: {appliedPromo.promoCode.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appliedPromo.promoCode.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePromo}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-semibold text-accent">
              -${(appliedPromo.discountAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        // Promo Code Input
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold text-primary">
              Have a promo code?
            </label>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyPromo();
                }
              }}
              className="flex-1 uppercase"
              disabled={isApplying}
            />
            <Button
              onClick={handleApplyPromo}
              disabled={isApplying || !promoCode.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Enter your promo code to receive a discount on your order</span>
          </p>
        </div>
      )}
    </div>
  );
}
