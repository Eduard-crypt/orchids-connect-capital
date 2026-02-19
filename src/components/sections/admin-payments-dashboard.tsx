'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';

interface Order {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

interface Payment {
  id: number;
  orderId: number;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

interface UserMembership {
  id: number;
  userName: string;
  userEmail: string;
  plan: string;
  createdAt: string;
}

export default function AdminPaymentsDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<UserMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeMembers: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/admin/payments');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      // Fetch orders
      const ordersRes = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
        
        // Calculate stats
        const revenue = ordersData.orders
          .filter((o: Order) => o.status === 'paid')
          .reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
        
        const pending = ordersData.orders.filter((o: Order) => o.status === 'pending').length;
        
        setStats(prev => ({
          ...prev,
          totalRevenue: revenue,
          totalOrders: ordersData.orders.length,
          pendingOrders: pending,
        }));
      }

      // Fetch payments
      const paymentsRes = await fetch('/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }

      // Fetch users with memberships
      const usersRes = await fetch('/api/admin/users/memberships', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        setStats(prev => ({
          ...prev,
          activeMembers: usersData.users.filter((u: UserMembership) => 
            u.plan !== 'free'
          ).length,
        }));
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amountInCents: number) => {
    return `$${(amountInCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      succeeded: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#142B4C] via-[#1A3E6D] to-[#142B4C] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Payment Administration</h1>
          </div>
          <p className="text-white/90 text-lg">Manage orders, payments, and user memberships</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-accent" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">
                {formatPrice(stats.totalRevenue)}
              </h3>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>

            <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">
                {stats.totalOrders}
              </h3>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>

            <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">
                {stats.pendingOrders}
              </h3>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </div>

            <div className="bg-card rounded-lg border-2 border-primary/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">
                {stats.activeMembers}
              </h3>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="bg-card rounded-lg border-2 border-primary/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Order ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Plan</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono">#{order.id}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <p className="font-medium text-primary">{order.userName}</p>
                                <p className="text-muted-foreground text-xs">{order.userEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold">{order.planName}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-accent">
                              {formatPrice(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <div className="bg-card rounded-lg border-2 border-primary/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Payment ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Order ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Provider</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payments.length > 0 ? (
                        payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono">#{payment.id}</td>
                            <td className="px-6 py-4 text-sm font-mono">#{payment.orderId}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold">
                                {payment.provider.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-accent">
                              {formatPrice(payment.amount)}
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            No payments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card rounded-lg border-2 border-primary/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">User ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Plan</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Member Since</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono">#{user.id}</td>
                            <td className="px-6 py-4 text-sm font-medium">{user.userName}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{user.userEmail}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                user.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                                user.plan === 'starter' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
