'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban,
  User,
  Package,
  DollarSign,
  Calendar,
  ShoppingCart,
  Loader2,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { authClient, useSession } from '@/lib/auth-client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface OrderDetailsContentProps {
  orderId: string;
}

interface Order {
  id: number;
  userId: string;
  planId: number;
  status: string;
  totalAmount: number;
  currency: string;
  paymentProvider: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
  planName: string | null;
  planSlug: string | null;
  planDescription: string | null;
  planFeatures: any;
}

interface Membership {
  id: number;
  userId: string;
  planId: number;
  status: string;
  startedAt: Date;
  renewsAt: Date;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function OrderDetailsContent({ orderId }: OrderDetailsContentProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const isAdmin = session?.user?.email?.includes('admin');

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push('/login?redirect=/dashboard/orders');
    }
  }, [session, sessionPending, router]);

  // Fetch order details
  useEffect(() => {
    if (session?.user) {
      fetchOrderDetails();
    }
  }, [session, orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setMembership(data.membership);
        setNewStatus(data.order.status);
      } else {
        toast.error('Failed to load order details');
        router.push('/dashboard/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes,
        }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        setShowStatusDialog(false);
        fetchOrderDetails();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/orders/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: parseInt(orderId),
          paymentReference,
          notes: verificationNotes,
        }),
      });

      if (response.ok) {
        toast.success('Payment verified and membership activated!');
        setShowVerifyDialog(false);
        fetchOrderDetails();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500 text-white"><Ban className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (amountInCents: number, currency: string) => {
    return `${currency.toUpperCase()} ${(amountInCents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (sessionPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || !order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/orders')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-primary">Order #{order.id}</h1>
              </div>
              <p className="text-muted-foreground">
                Created {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Order ID</Label>
                    <p className="font-semibold">#{order.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-semibold text-lg text-accent">
                      {formatPrice(order.totalAmount, order.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Provider</Label>
                    <p className="font-semibold">Revolut</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-semibold">{order.userName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{order.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono">{order.userId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Plan Name</Label>
                  <p className="font-semibold text-lg">{order.planName || 'N/A'}</p>
                </div>
                {order.planDescription && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">{order.planDescription}</p>
                  </div>
                )}
                {order.planFeatures && Array.isArray(order.planFeatures) && (
                  <div>
                    <Label className="text-muted-foreground">Features</Label>
                    <ul className="mt-2 space-y-2">
                      {order.planFeatures.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Membership Status */}
            {membership && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Shield className="w-5 h-5" />
                    Active Membership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <p className="font-semibold text-green-700">{membership.status}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Started</Label>
                      <p className="text-sm">{formatDate(membership.startedAt)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Renews</Label>
                      <p className="text-sm">{formatDate(membership.renewsAt)}</p>
                    </div>
                    {membership.canceledAt && (
                      <div>
                        <Label className="text-muted-foreground">Cancelled</Label>
                        <p className="text-sm">{formatDate(membership.canceledAt)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Admin Actions */}
            {isAdmin && (
              <>
                {/* Verify Payment */}
                {order.status === 'pending' && (
                  <Card className="border-accent">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                      <CardDescription>Admin tools for order management</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verify Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Verify Payment</DialogTitle>
                            <DialogDescription>
                              Confirm payment received via Revolut and activate membership
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="paymentRef">Payment Reference (Optional)</Label>
                              <Input
                                id="paymentRef"
                                placeholder="Revolut transaction ID"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="verificationNotes">Notes (Optional)</Label>
                              <Textarea
                                id="verificationNotes"
                                placeholder="Add any notes about the verification"
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowVerifyDialog(false)}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleVerifyPayment}
                              disabled={isUpdating}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Verify & Activate
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                            <DialogDescription>
                              Change the order status and add notes
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="status">New Status</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger id="status">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="statusNotes">Notes (Optional)</Label>
                              <Textarea
                                id="statusNotes"
                                placeholder="Add notes about this status change"
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowStatusDialog(false)}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateStatus}
                              disabled={isUpdating || newStatus === order.status}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                'Update Status'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revolut Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">Payment Link:</p>
                      <a
                        href="https://revolut.me/eduardk2o4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm break-all"
                      >
                        https://revolut.me/eduardk2o4
                      </a>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2 font-medium">To verify payment:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Check Revolut account for payment</li>
                        <li>Verify amount matches order total</li>
                        <li>Click "Verify Payment" button above</li>
                        <li>Enter transaction reference (optional)</li>
                        <li>Membership will be activated automatically</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Status History */}
            {order.metadata?.statusHistory && Array.isArray(order.metadata.statusHistory) && order.metadata.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.metadata.statusHistory.map((history: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary/30 pl-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {history.from} → {history.to}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(history.changedAt).toLocaleString()}
                        </p>
                        {history.notes && (
                          <p className="text-xs mt-1">{history.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Need Help */}
            {!isAdmin && order.status === 'pending' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    If you've completed your payment on Revolut but your order is still pending, please contact support with your order ID.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/reach-us')}>
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
