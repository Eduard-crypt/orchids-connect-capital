"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  FileText,
  CreditCard,
  Shield,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type TabType = 'active' | 'escrow' | 'completed' | 'invoices';

interface Transaction {
  id: string;
  type: 'business_acquisition' | 'listing_fee' | 'valuation' | 'subscription';
  title: string;
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'in_escrow';
  date: string;
  description: string;
  invoice?: string;
}

const TransactionDashboardContent = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const mockActiveTransactions: Transaction[] = [
    {
      id: 'TXN-2024-001',
      type: 'business_acquisition',
      title: 'E-commerce Platform Acquisition',
      amount: '€850,000',
      status: 'processing',
      date: '2024-01-15',
      description: 'Deposit payment for SaaS business acquisition'
    },
    {
      id: 'TXN-2024-002',
      type: 'listing_fee',
      title: 'Premium Listing Package',
      amount: '€499',
      status: 'pending',
      date: '2024-01-14',
      description: '30-day featured listing placement'
    }
  ];

  const mockEscrowTransactions: Transaction[] = [
    {
      id: 'ESC-2024-001',
      type: 'business_acquisition',
      title: 'Mobile App Portfolio',
      amount: '€450,000',
      status: 'in_escrow',
      date: '2024-01-10',
      description: 'Funds held in escrow pending due diligence'
    }
  ];

  const mockCompletedTransactions: Transaction[] = [
    {
      id: 'TXN-2023-156',
      type: 'valuation',
      title: 'Business Valuation Report',
      amount: '€999',
      status: 'completed',
      date: '2023-12-20',
      description: 'Professional valuation for SaaS business',
      invoice: 'INV-2023-156'
    },
    {
      id: 'TXN-2023-142',
      type: 'subscription',
      title: 'Pro Membership - Monthly',
      amount: '€99',
      status: 'completed',
      date: '2023-12-01',
      description: 'Monthly subscription renewal',
      invoice: 'INV-2023-142'
    }
  ];

  const mockInvoices = [
    {
      id: 'INV-2024-001',
      title: 'Premium Listing Fee',
      amount: '€499',
      date: '2024-01-14',
      status: 'paid' as const,
      dueDate: '2024-01-21'
    },
    {
      id: 'INV-2023-156',
      title: 'Valuation Services',
      amount: '€999',
      date: '2023-12-20',
      status: 'paid' as const,
      dueDate: '2023-12-27'
    }
  ];

  const tabs = [
    { id: 'active' as TabType, label: 'Active Transactions', icon: Clock, count: mockActiveTransactions.length },
    { id: 'escrow' as TabType, label: 'Escrow Funds', icon: Shield, count: mockEscrowTransactions.length },
    { id: 'completed' as TabType, label: 'Completed Deals', icon: CheckCircle, count: mockCompletedTransactions.length },
    { id: 'invoices' as TabType, label: 'Invoices & Billing', icon: FileText, count: mockInvoices.length }
  ];

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-[#00C48C] text-white';
      case 'processing':
      case 'in_escrow':
        return 'bg-[#1A73E8] text-white';
      case 'pending':
        return 'bg-[#FFA500] text-white';
      case 'failed':
        return 'bg-[#EF4444] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'in_escrow':
        return <Shield className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const renderTransactions = () => {
    let transactions: Transaction[] = [];
    
    switch (activeTab) {
      case 'active':
        transactions = mockActiveTransactions;
        break;
      case 'escrow':
        transactions = mockEscrowTransactions;
        break;
      case 'completed':
        transactions = mockCompletedTransactions;
        break;
    }

    if (transactions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="bg-[#F8F9FA] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-[#999999]" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-[#222222]">No transactions found</h3>
          <p className="text-[#666666] mb-6">Start your first transaction to see it here.</p>
          <Button onClick={() => router.push('/payments')} className="bg-[#1A73E8] text-white rounded-xl">
            Start Transaction
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#1A73E8] hover:shadow-lg transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="bg-[#1A73E8]/10 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-[#1A73E8]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#222222]">{transaction.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-[#666666] mb-2">{transaction.description}</p>
                    <div className="flex items-center gap-4 text-sm text-[#999999]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {transaction.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#1A73E8]">{transaction.amount}</div>
                  {transaction.invoice && (
                    <div className="text-sm text-[#666666]">{transaction.invoice}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {transaction.invoice && (
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderInvoices = () => {
    if (mockInvoices.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="bg-[#F8F9FA] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-[#999999]" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-[#222222]">No invoices found</h3>
          <p className="text-[#666666]">Your invoices will appear here once generated.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {mockInvoices.map((invoice, index) => (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#1A73E8] hover:shadow-lg transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="bg-[#00C48C]/10 p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-[#00C48C]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#222222]">{invoice.title}</h3>
                      <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#00C48C] text-white">
                        Paid
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#999999]">
                      <span>Invoice: {invoice.id}</span>
                      <span>•</span>
                      <span>Issued: {new Date(invoice.date).toLocaleDateString('en-GB')}</span>
                      <span>•</span>
                      <span>Due: {new Date(invoice.dueDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-[#222222]">{invoice.amount}</div>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <main className="bg-[#F8F9FA] min-h-screen py-12">
      <div className="container max-w-[1280px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#222222]">Transaction Dashboard</h1>
          <p className="text-lg text-[#666666]">Manage payments, escrow funds, and transaction history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Volume', value: '€1.3M', icon: DollarSign, color: '#1A73E8' },
            { label: 'Active Deals', value: '2', icon: TrendingUp, color: '#00C48C' },
            { label: 'In Escrow', value: '€450K', icon: Shield, color: '#FFA500' },
            { label: 'This Month', value: '€51K', icon: Calendar, color: '#9333EA' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[#666666]">{stat.label}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-[#E5E7EB]">
            <div className="flex flex-wrap gap-2 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#1A73E8] text-white shadow-lg'
                      : 'bg-[#F8F9FA] text-[#666666] hover:bg-[#E5E7EB]'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-[#E5E7EB]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999999]" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#1A73E8]"
                />
              </div>
              <Button variant="outline" className="rounded-xl px-6">
                <Filter className="h-5 w-5" />
                Filter
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'invoices' ? renderInvoices() : renderTransactions()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TransactionDashboardContent;
