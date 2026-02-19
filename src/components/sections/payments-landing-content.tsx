"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  CreditCard, 
  Globe, 
  Zap,
  TrendingUp,
  FileText,
  ArrowRight,
  DollarSign,
  Users,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PaymentsLandingContent = () => {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "PCI DSS Level 1 compliant with end-to-end encryption, SSL/TLS 1.3, and SOC 2 Type II certified infrastructure."
    },
    {
      icon: Lock,
      title: "3D Secure (SCA)",
      description: "Strong Customer Authentication for EU compliance. Multi-factor verification on every transaction."
    },
    {
      icon: Globe,
      title: "135+ Currencies",
      description: "Accept payments globally with automatic currency conversion and local payment methods."
    },
    {
      icon: Zap,
      title: "Instant Settlements",
      description: "Real-time payment processing with automated escrow release and fund disbursement."
    },
    {
      icon: FileText,
      title: "Smart Invoicing",
      description: "Automated invoice generation, recurring billing, and subscription management built-in."
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Methods",
      description: "Credit cards, bank transfers, digital wallets, and cryptocurrency support."
    }
  ];

  const trustIndicators = [
    { icon: CheckCircle, label: "PCI DSS Level 1" },
    { icon: Shield, label: "SOC 2 Type II" },
    { icon: Lock, label: "256-bit SSL" },
    { icon: Award, label: "3D Secure 2.0" }
  ];

  const useCases = [
    {
      title: "Business Acquisition",
      description: "Complete M&A payment flow from initial deposit through escrow to final closing.",
      icon: TrendingUp,
      amount: "€50K - €10M+"
    },
    {
      title: "Listing Fees",
      description: "Premium listing placements, featured promotions, and marketplace visibility upgrades.",
      icon: FileText,
      amount: "€99 - €999"
    },
    {
      title: "Valuation Services",
      description: "Professional business valuation, due diligence reports, and financial analysis.",
      icon: DollarSign,
      amount: "€499 - €2,499"
    },
    {
      title: "Subscription Plans",
      description: "Monthly or annual membership plans with automatic renewal and usage-based billing.",
      icon: Users,
      amount: "€29 - €299/mo"
    }
  ];

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A73E8] via-[#1557B0] to-[#0D3A7A] text-white py-24 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container relative z-10 max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold">PCI DSS Certified • 3D Secure • SOC 2 Type II</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Secure Global Payments for Digital Acquisitions
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Enterprise payment infrastructure trusted by CFOs, founders, and brokers worldwide. Complete checkout, escrow, and settlement in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/dashboard/transactions')}
                size="lg"
                className="h-14 px-8 bg-white text-[#1A73E8] hover:bg-white/90 font-bold text-base rounded-xl shadow-2xl"
              >
                Start a Transaction
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => router.push('/payments/pricing')}
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-base rounded-xl"
              >
                View Pricing & Fees
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8">
              {trustIndicators.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-5 w-5 text-[#00C48C]" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        ></motion.div>
      </section>

      <section className="py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-[#222222]">Payment Use Cases</h2>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Flexible payment solutions for every stage of your business transaction lifecycle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(26, 115, 232, 0.2)' }}
                className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#1A73E8] transition-all"
              >
                <div className="bg-[#1A73E8]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <useCase.icon className="h-6 w-6 text-[#1A73E8]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#222222]">{useCase.title}</h3>
                <p className="text-[#666666] mb-4 text-sm leading-relaxed">{useCase.description}</p>
                <div className="text-[#1A73E8] font-bold text-lg">{useCase.amount}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-[#F8F9FA] to-white">
        <div className="container max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-[#222222]">Enterprise Security & Compliance</h2>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Built on battle-tested infrastructure trusted by Fortune 500 companies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="bg-gradient-to-br from-[#1A73E8] to-[#00C48C] w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#222222]">{feature.title}</h3>
                <p className="text-[#666666] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#1A73E8] to-[#00C48C] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(45deg, transparent 48%, white 49%, white 51%, transparent 52%)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="container max-w-[1280px] mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Ready to Accept Secure Payments?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl mb-10 text-white/90"
            >
              Join 10,000+ businesses processing €2.5B+ in secure transactions annually.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => router.push('/dashboard/transactions')}
                size="lg"
                className="h-14 px-8 bg-white text-[#1A73E8] hover:bg-white/90 font-bold text-base rounded-xl shadow-2xl"
              >
                Create Transaction
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => router.push('/payments/api-docs')}
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-base rounded-xl"
              >
                View API Docs
              </Button>
            </motion.div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#00C48C]" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#00C48C]" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#00C48C]" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F8F9FA] border-t border-[#E5E7EB]">
        <div className="container max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-[#222222]">Need Help Getting Started?</h3>
              <p className="text-[#666666]">Our payment specialists are available 24/7 to assist you.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/reach-us">
                <Button variant="outline" size="lg" className="h-12 px-6 border-2 rounded-xl">
                  Contact Support
                </Button>
              </Link>
              <Link href="/payments/pricing">
                <Button size="lg" className="h-12 px-6 bg-[#1A73E8] text-white rounded-xl">
                  View Pricing
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PaymentsLandingContent;
