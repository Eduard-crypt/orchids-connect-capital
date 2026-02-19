'use client';

import { DollarSign, Users, CheckCircle2, Shield, Award, Laptop, ShoppingCart, Coffee, Heart, Briefcase, Store, TrendingUp, Target, Sparkles, ArrowRight, ChevronDown, Lock, Clock, Headphones, FileCheck, Eye, BadgeCheck, Star, BarChart3, Search, Zap, Globe, MessageSquare, ShieldCheck, CreditCard, Activity } from 'lucide-react';
import Link from 'next/link';
import { ValuationForm } from './_components/valuation-form';
import { FAQAccordion } from './_components/faq-accordion';
import { HeroSlideshow } from './_components/hero-slideshow';
import InstitutionalExpertise from '@/components/sections/institutional-expertise';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Floating particles component (adjusted for light theme)
const FloatingParticles = ({ count = 15 }: { count?: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/10 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
          }}
          animate={{
            x: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
            ],
            y: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
            ],
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Animated grid background (adjusted for light theme)
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="sell-grid-light" width="80" height="80" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
                className="text-blue-200/50"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sell-grid-light)" />
      </svg>
    </div>
  );
};

const BUSINESS_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function SellABusinessPage() {
    useEffect(() => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if (!href || href === '#') return;
          
          e.preventDefault();
          try {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (err) {
            console.error('Invalid selector:', href);
          }
        });
      });
    }, []);

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 selection:bg-primary/10">
      
      {/* Hero Section */}
      <div className="relative">
        <HeroSlideshow />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatedGrid />
          <FloatingParticles count={25} />
        </div>
      </div>

      {/* TrustBridge Section - New & Premium */}
      <section className="py-32 relative overflow-hidden bg-transparent">
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Badge className="mb-6 px-4 py-1 bg-primary/5 text-primary border-primary/10 text-sm font-semibold tracking-wider uppercase">Institutional Trust</Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-slate-900">
                The TrustBridge <br />
                <span className="text-primary italic">Security Protocol</span>
              </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-light max-w-2xl">
                  Selling a business requires a high level of security in managing funds and transferring assets. Our strategy ensures that all payments and legal actions are carried out through licensed banks and notaries acting as independent third parties, providing transparency, capital protection, and legal certainty for both the buyer and the seller.
                </p>

                <div className="grid sm:grid-cols-2 gap-8">
                  {[
                        {
                          title: 'TrustBridge Membership',
                          description: 'Gain premium market exposure, connect with qualified investors and buyers, and receive personalized online strategic consultation support.',
                          icon: Lock
                        },
                    {
                      title: 'Institutional Escrow',
                      description: 'Contracts are signed by a notary. Funds are held in a secure bank escrow account until the deal is complete, then released to the seller.',
                      icon: CreditCard
                    },
                      {
                        title: 'Professional Business Listing',
                        description: 'After purchasing any TrustBridge membership, the ‘Sell a Business’ button unlocks in your dashboard. After completing our specialized questionnaire the Connect Capitals team will review your information and contact you to prepare a precise, professional business listing!',
                        icon: ShieldCheck
                      },
                        {
                          title: 'Confidentiality First',
                          description: 'Enjoy a fully transparent and secure process at every step, ensuring clarity, confidence, and peace of mind from start to finish.',
                          icon: Shield
                        }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-500 leading-snug">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

            <motion.div
              className="relative lg:ml-auto lg:-mt-24"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="relative z-10 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <Activity className="w-32 h-32 text-primary" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <BadgeCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Security Status</div>
                        <div className="text-lg font-bold text-slate-900">Protocol Active (Tier 1)</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button asChild size="lg" className="w-full px-8 py-6 text-lg font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">
                        <Link href="/trustbridge">EXPLORE TRUSTBRIDGE MEMBERSHIPS</Link>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <span>Verification</span>
                        <span>100% Secure</span>
                      </div>
                    </div>
                        <p className="text-slate-500 italic font-light leading-relaxed border-l-4 border-primary pl-6">
                          "Connect Capitals ensures that every transaction is backed by institutional-grade compliance and ironclad legal protection."
                        </p>
                    </div>
                  </div>
                  <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10"></div>
                </motion.div>
              </div>
            </div>
          </section>


      {/* How It Works - Step Process */}
      <section id="process" className="py-32 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10">
          <motion.div 
            className="text-center mb-24"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge className="mb-4 px-4 py-1.5 bg-white/5 text-slate-400 border-white/10 text-xs font-bold tracking-[0.2em] uppercase rounded-full">Methodology</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">The Exit Strategy</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
              A streamlined digital pipeline designed for maximum value and security.
            </p>
          </motion.div>
  
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  number: '01',
                  title: 'Analysis',
                  description: 'Strategic valuation and market positioning.',
                  icon: BarChart3
                },
                {
                  number: '02',
                  title: 'Vetting',
                  description: 'Rigorous buyer qualification and KYC.',
                  icon: Users
                },
                {
                  number: '03',
                  title: 'Negotiation',
                  description: 'Expert intermediation for optimal terms.',
                  icon: Zap
                },
                {
                  number: '04',
                  title: 'Settlement',
                  description: 'Secure automated asset and payment transfer.',
                  icon: Shield
                }
                ].map((step) => (
                  <motion.div 
                    key={step.number}
                    className="group"
                    variants={fadeInUp}
                  >
                    <div className="mb-8 relative">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-500 relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                          <step.icon className="w-7 h-7 text-white group-hover:text-white transition-colors duration-300 relative z-10 drop-shadow-[0_0_0.5px_#fff] drop-shadow-[0_0_0.5px_#fff]" />
                      </div>
                      <div className="absolute top-7 left-14 right-0 h-px bg-gradient-to-r from-white/10 to-transparent group-hover:from-primary/30 transition-colors duration-500 -z-0"></div>
                      <div className="absolute -top-3 left-0 text-[10px] font-mono text-primary/40 font-bold tracking-widest">{step.number}</div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white tracking-tight group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-light text-sm group-hover:text-slate-300 transition-colors duration-300">{step.description}</p>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </div>
      </section>

        {/* Institutional Expertise Section */}
        <InstitutionalExpertise />

        {/* Subtle Transition Element */}
        <div className="relative h-px w-full flex items-center justify-center z-20 pointer-events-none">
          <div className="absolute w-2/3 h-40 bg-blue-400/[0.03] blur-[100px] -translate-y-1/2" />
          <div className="w-full h-[0.5px] bg-gradient-to-r from-transparent via-blue-200/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            <div className="w-1 h-1 rounded-full bg-blue-300/10 blur-[1px]" />
          </div>
        </div>

        {/* Valuation CTA */}
        <section id="get-valuation" className="py-32 relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.15),transparent_70%)]"></div>
        <AnimatedGrid />
        
        <div className="container relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <motion.div 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                  <Badge className="mb-6 px-4 py-1 bg-blue-100 text-blue-700 border-blue-200 text-sm font-semibold tracking-wider uppercase">Institutional Valuation</Badge>
                <h2 className="text-5xl md:text-7xl font-bold mb-12 text-slate-900 tracking-tighter leading-[1.1]">
                  Ready for your <br />
                  <span className="text-primary italic">Strategic Exit?</span>
                </h2>
                
                <div className="space-y-10 text-xl text-slate-600 mb-14 leading-relaxed font-light">
                  <p>Access precision-engineered business valuations powered by real-time market indices and proprietary transaction data from our global network.</p>
                    <div className="relative p-10 bg-white border border-slate-100 border-l-4 border-l-blue-500 rounded-r-3xl shadow-sm overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Target className="w-20 h-20" />
                    </div>
                    <p className="font-medium text-slate-900 italic text-2xl leading-snug">"Data integrity is the cornerstone of every successful high-value digital asset acquisition."</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex -space-x-4">
                      {BUSINESS_AVATARS.map((url, i) => (
                        <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-50 shadow-sm overflow-hidden group/avatar">
                          <img 
                            src={url} 
                            alt="Professional business person" 
                            className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>

                  <div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">12,000+ Active Acquirers</div>
                    <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Global Institutional Reach</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-400 rounded-full flex flex-col items-center justify-center shadow-xl shadow-yellow-400/20 rotate-12 z-20 border-4 border-white">
                  <span className="text-slate-900 font-black text-sm text-center uppercase tracking-tighter leading-tight">PREMIUM<br />MARKET<br />INSIGHT</span>
                </div>
                
                <div className="bg-white border border-slate-100 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] p-12 md:p-16 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative z-10 [&_h2]:text-slate-900 [&_p]:text-slate-600 [&_label]:text-slate-700 [&_input]:bg-slate-50 [&_input]:border-slate-100 [&_input]:text-slate-900 [&_textarea]:bg-slate-50 [&_textarea]:border-slate-100 [&_textarea]:text-slate-900">
                    <ValuationForm />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-transparent border-t border-slate-100 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
                Common Inquiries
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Everything you need to know about selling your business on our platform.
              </p>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white border border-slate-100 p-6 md:p-12 rounded-[2.5rem] shadow-sm relative overflow-hidden
                [&_[data-radix-accordion-item]]:border-slate-100 [&_[data-radix-accordion-item]]:mb-4 [&_[data-radix-accordion-item]]:bg-slate-50 [&_[data-radix-accordion-item]]:rounded-2xl [&_[data-radix-accordion-item]]:px-6 [&_[data-radix-accordion-item]]:transition-all
                [&_[data-radix-accordion-item][data-state=open]]:bg-white [&_[data-radix-accordion-item][data-state=open]]:border-primary/30 [&_[data-radix-accordion-item][data-state=open]]:shadow-sm
                [&_[data-radix-accordion-content]]:text-slate-600 [&_[data-radix-accordion-content]]:text-base [&_[data-radix-accordion-content]]:leading-relaxed [&_[data-radix-accordion-content]]:pb-6
                [&_button]:text-slate-900 [&_button]:text-lg [&_button]:font-semibold [&_button]:py-5 [&_button]:tracking-tight
                [&_svg]:text-primary transition-all">
                <FAQAccordion />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Support Banner */}
        <section className="py-24 relative overflow-hidden bg-transparent">
          <div className="container relative z-10">
            <motion.div 
              className="relative flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-50/50 backdrop-blur-xl border border-slate-200/60 p-12 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Animated Background Blobs */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="text-center md:text-left relative z-10 max-w-2xl">
                <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full backdrop-blur-md">
                  Professional Advisory
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 tracking-tight">
                  Ready to secure your <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">exit strategy?</span>
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Connect with our M&A experts for a confidential structure briefing and professional market positioning.
                </p>
              </div>

              <div className="shrink-0 relative z-10">
                <Link href="/reach-us" className="group/btn relative flex items-center gap-3 px-10 py-5 bg-primary text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 active:scale-95 uppercase tracking-wider text-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">Initiate Briefing</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
    </div>
  );
}
