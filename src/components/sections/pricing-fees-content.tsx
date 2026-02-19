"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Shield,
  TrendingUp,
  FileText,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const PricingFeesContent = () => {
  const router = useRouter();

  const pricingTiers = [
    {
      name: 'Marketplace Fees',
      description: 'Commission on completed business sales',
      icon: TrendingUp,
      color: '#1A73E8',
      tiers: [
        { range: '€0 - €100,000', fee: '5%', min: '€1,000' },
        { range: '€100,001 - €500,000', fee: '3.5%', min: '€5,000' },
        { range: '€500,001 - €2,000,000', fee: '2.5%', min: '€17,500' },
        { range: '€2,000,001+', fee: '2%', min: 'Contact us' }
      ]
    },
    {
      name: 'Escrow Services',
      description: 'Secure fund holding during transaction',
      icon: Shield,
      color: '#00C48C',
      flat: [
        { service: 'Standard Escrow (< €500K)', fee: '€500 flat' },
        { service: 'Large Transaction Escrow (€500K+)', fee: '0.1% (min €2,000)' },
        { service: 'Multi-milestone Escrow', fee: '+€250 per milestone' }
      ]
    },
    {
      name: 'Listing Fees',
      description: 'Premium marketplace visibility',
      icon: FileText,
      color: '#FFA500',
      packages: [
        { name: 'Basic Listing', price: '€0', features: ['30-day visibility', 'Standard search placement', 'Basic analytics'] },
        { name: 'Premium Listing', price: '€299', features: ['60-day visibility', 'Priority search placement', 'Advanced analytics', 'Featured badge'] },
        { name: 'Ultimate Package', price: '€799', features: ['90-day visibility', 'Top search placement', 'Full analytics suite', 'Homepage feature', 'Social promotion'] }
      ]
    },
    {
      name: 'Valuation Services',
      description: 'Professional business valuations',
      icon: DollarSign,
      color: '#9333EA',
      services: [
        { service: 'Quick Valuation Report', price: '€499', turnaround: '3-5 days' },
        { service: 'Comprehensive Valuation', price: '€1,499', turnaround: '7-10 days' },
        { service: 'Full Due Diligence Package', price: '€3,999', turnaround: '14-21 days' }
      ]
    }
  ];

  const paymentMethods = [
    'Credit/Debit Cards (Visa, Mastercard, Amex)',
    'Bank Transfer (SEPA, SWIFT)',
    'Digital Wallets (Apple Pay, Google Pay)',
    'Cryptocurrency (BTC, ETH, USDT)'
  ];

  const refundPolicy = [
    {
      title: 'Listing Fees',
      policy: 'Full refund within 48 hours if listing not published. Pro-rated refund after 14 days if dissatisfied.',
      icon: FileText
    },
    {
      title: 'Valuation Services',
      policy: '100% refund if report not delivered within promised timeframe. Partial refund if quality concerns within 7 days.',
      icon: DollarSign
    },
    {
      title: 'Escrow Fees',
      policy: 'Full refund if transaction cancelled before funds released. No refund after successful transaction completion.',
      icon: Shield
    },
    {
      title: 'Marketplace Commission',
      policy: 'No refund on completed transactions. Dispute resolution available for transaction issues.',
      icon: TrendingUp
    }
  ];

  return (
    <main className="bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A73E8] to-[#00C48C] text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white), linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}></div>
        </div>

        <div className="container max-w-[1280px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transparent Pricing & Fees
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              No hidden charges. Clear marketplace fees, escrow costs, and service pricing. You always know what you're paying for.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pricingTiers.slice(0, 2).map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-8 hover:border-[#1A73E8] hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                    <tier.icon className="h-7 w-7" style={{ color: tier.color }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#222222]">{tier.name}</h3>
                    <p className="text-[#666666]">{tier.description}</p>
                  </div>
                </div>

                {tier.tiers && (
                  <div className="space-y-3">
                    {tier.tiers.map((t, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-[#E5E7EB]">
                        <span className="text-[#666666] font-medium">{t.range}</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: tier.color }}>{t.fee}</div>
                          <div className="text-xs text-[#999999]">Min: {t.min}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tier.flat && (
                  <div className="space-y-3">
                    {tier.flat.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-[#E5E7EB]">
                        <span className="text-[#666666] font-medium">{f.service}</span>
                        <div className="text-2xl font-bold" style={{ color: tier.color }}>{f.fee}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {pricingTiers.slice(2).map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-8 hover:border-[#1A73E8] hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                    <tier.icon className="h-7 w-7" style={{ color: tier.color }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#222222]">{tier.name}</h3>
                    <p className="text-[#666666]">{tier.description}</p>
                  </div>
                </div>

                {tier.packages && (
                  <div className="space-y-4">
                    {tier.packages.map((pkg, i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#1A73E8] transition-all">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-bold text-[#222222]">{pkg.name}</h4>
                          <div className="text-2xl font-bold" style={{ color: tier.color }}>{pkg.price}</div>
                        </div>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-[#666666]">
                              <Check className="h-4 w-4 text-[#00C48C]" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {tier.services && (
                  <div className="space-y-3">
                    {tier.services.map((service, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-[#E5E7EB]">
                        <div>
                          <div className="text-[#222222] font-bold">{service.service}</div>
                          <div className="text-sm text-[#999999]">{service.turnaround}</div>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: tier.color }}>{service.price}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8F9FA]">
        <div className="container max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-[#222222]">Accepted Payment Methods</h2>
            <p className="text-lg text-[#666666]">Pay securely with your preferred method</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center border-2 border-[#E5E7EB] hover:border-[#1A73E8] hover:shadow-lg transition-all"
              >
                <Check className="h-10 w-10 text-[#00C48C] mx-auto mb-4" />
                <p className="font-semibold text-[#222222]">{method}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-[#222222]">Refund Policy</h2>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              We stand behind our services. Clear refund terms for every transaction type.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {refundPolicy.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#F8F9FA] to-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#1A73E8]/10 p-3 rounded-xl">
                    <policy.icon className="h-6 w-6 text-[#1A73E8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-[#222222]">{policy.title}</h3>
                    <p className="text-sm text-[#666666] leading-relaxed">{policy.policy}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 bg-[#FFF3E0] border-2 border-[#FFA500] rounded-2xl p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-[#FFA500] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold mb-2 text-[#222222]">Dispute Resolution</h3>
                <p className="text-[#666666] leading-relaxed">
                  All refund requests are reviewed within 2-3 business days. For disputes related to completed transactions, 
                  our mediation team will work with both parties to reach a fair resolution. Contact support@connectcapitals.com 
                  with your transaction ID for assistance.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#1A73E8] to-[#00C48C] text-white">
        <div className="container max-w-[1280px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Questions About Pricing?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Our payment specialists are available 24/7 to help you understand our fee structure and find the right plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/reach-us')}
                size="lg"
                className="h-14 px-8 bg-white text-[#1A73E8] hover:bg-white/90 font-bold rounded-xl shadow-2xl"
              >
                Contact Sales Team
              </Button>
              <Button
                onClick={() => router.push('/payments')}
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold rounded-xl"
              >
                View Payment Options
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default PricingFeesContent;
