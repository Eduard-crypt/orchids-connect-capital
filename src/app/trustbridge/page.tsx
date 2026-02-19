"use client";

import { motion } from "framer-motion";
import { Shield, FileCheck, Scale, Lock, CheckCircle2, Award, TrendingUp, Users, Zap, Crown, Rocket, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function TrustBridgePage() {
  const heroRef = useScrollAnimation();
  const pricingRef = useScrollAnimation();
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleAddToCart = async (planSlug: string, planName: string) => {
    // Check authentication first
    if (!session?.user) {
      toast.error("Please log in to continue");
      router.push(`/login?redirect=${encodeURIComponent("/trustbridge")}`);
      return;
    }

    setLoadingPlan(planSlug);

    try {
      const token = localStorage.getItem("bearer_token");
      
      if (!token) {
        toast.error("Session expired. Please log in again.");
        router.push(`/login?redirect=${encodeURIComponent("/trustbridge")}`);
        return;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ planSlug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      const data = await response.json();
      
      // Show different messages based on whether item was already in cart
      if (data.alreadyInCart) {
        toast.info(`${planName} is already in your cart`);
      } else {
        toast.success(`${planName} added to cart! You can add more products or view your cart.`);
      }
      
      // DO NOT redirect - keep user on page to add more products
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Simple Clean Design */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-background py-32">

        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}>

              <Badge className="mb-6 px-6 py-2 bg-accent/20 text-accent border-accent/30 text-base font-semibold backdrop-blur-sm">
                🎯 Premium Membership Access
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-8 text-foreground leading-tight">
              TrustBridge Membership
            </motion.h1>
            
            
            {/* Unified CTA Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Your First Step to Successful Deal
              </h2>
                <p className="text-xl mb-10 text-muted-foreground max-w-2xl mx-auto">
                  Put your business in the spotlight and connect with verified, serious buyers.<br />
                  Choose your plan and start your journey today.
                </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-10 py-7 text-lg">
                  <Link href="#pricing">Choose Your Plan</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-10 py-7 text-lg">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section - Simple Design */}
      <section className="py-16 bg-secondary/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-primary tracking-tighter">Scalable</div>
                  <div className="text-sm text-muted-foreground">Brokerage Infrastructure</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-primary">Secure</div>
                  <div className="text-sm text-muted-foreground">Deal Mediation</div>
              </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans - Main Focus */}
      <section ref={pricingRef} id="pricing" className="py-24 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-accent/20 text-accent border-accent/30">
              Choose Your Plan
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Unlock Membership Access</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select the perfect plan to list your business or access premium opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card border-2 border-border rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:border-primary/30">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <p className="text-sm text-muted-foreground">For individuals</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">€59</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Built for first-time sellers</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>List up to 3 active businesses</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Full access to the marketplace</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Standard verification (within 24 hours)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Email support (up to 48h response)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Assigned account manager (onboarding & guidance)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Secure escrow transactions (3% fee)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Document storage (5 GB)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Basic listing analytics</span>
                </li>
              </ul>

                <Button 
                  className="w-full py-6 text-base" 
                  variant="outline"
                  asChild
                >
                  <a href="https://buy.stripe.com/4gMfZg7nE4CC0l52Ca2Fa02" target="_blank" rel="noopener noreferrer">
                    Purchase Now
                  </a>
                </Button>
            </motion.div>

            {/* Professional Plan - Most Popular */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary to-primary/80 border-2 border-accent rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 relative overflow-hidden">

                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent text-accent-foreground font-bold px-3 py-1">
                    MOST POPULAR
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Professional</h3>
                    <p className="text-sm text-white/80">For serious sellers</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">€75</span>
                    <span className="text-white/80">/month</span>
                  </div>
                  <p className="text-sm text-white/80 mt-2">Best balance of visibility, speed, and support</p>
                </div>

                <ul className="space-y-4 mb-8 text-white">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">List up to 10 active businesses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Enhanced marketplace visibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Fast-track verification (12 hours)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Priority support 12hr response</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Active account manager (listing & deal support)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Premium escrow protection (2.5% fee)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Publish verified courses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Featured listing placement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Document & media storage (25 GB)</span>
                  </li>
                </ul>

                  <Button 
                    className="w-full py-6 text-base bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                    asChild
                  >
                    <a href="https://buy.stripe.com/5kQ4gy0Zg5GG2td0u22Fa03" target="_blank" rel="noopener noreferrer">
                      Purchase Now
                    </a>
                  </Button>
              </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-card border-2 border-border rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:border-accent/30">

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Enterprise</h3>
                    <p className="text-sm text-muted-foreground">For brokers & agencies</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-accent">€89</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Designed for high-volume sellers</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Unlimited business listings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Maximum marketplace exposure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Same-day priority verification (1–2 hours)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">24/7 dedicated support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Dedicated account manager (strategy, buyers & deals)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">VIP escrow services (2.0% fee)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Priority course publishing & promotion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Top-tier listing placement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Buyer & investor matching assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="font-medium">Document & media storage (35 GB)</span>
                  </li>
                </ul>

                  <Button 
                    className="w-full py-6 text-base bg-accent hover:bg-accent/90"
                    asChild
                  >
                    <a href="https://buy.stripe.com/28E5kC5fwedc1p92Ca2Fa04" target="_blank" rel="noopener noreferrer">
                      Purchase Now
                    </a>
                  </Button>
              </motion.div>
          </div>

          {/* Plan Comparison Note */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              All plans include secure transactions, identity verification, and fraud protection
            </p>
          </div>
        </div>
      </section>

      {/* Membership Benefits */}
      <section id="features" className="py-20 bg-secondary/10">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose TrustBridge Membership?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Premium features and services that make buying and selling businesses secure and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Membership</h3>
              <p className="text-muted-foreground">
                Every member is thoroughly vetted and verified. Connect with legitimate buyers and sellers only.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Professional escrow services protect your funds throughout the entire transaction process.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FileCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Due Diligence</h3>
              <p className="text-muted-foreground">
                Comprehensive verification of financials, legal documents, and business operations.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4">Premium Exposure</h3>
              <p className="text-muted-foreground">
                TrustBridge subscriptions are the first step toward successful, professional publishing and sustainable growth for your online business in a competitive market.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Support</h3>
              <p className="text-muted-foreground">
                Dedicated transaction managers guide you through every step of the buying or selling process.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4">100% Guarantee</h3>
              <p className="text-muted-foreground">
                TrustBridge includes verified third parties such as banks and notaries to ensure secure transactions and protect client funds throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Simple steps to start buying or selling</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
            { step: 1, title: "Choose Your Plan", desc: "Select the subscription plan that fits your needs - Starter, Professional, or Enterprise." },
            { step: 2, title: "Get Verified", desc: "Complete our secure identity verification process to access the marketplace." },
            { step: 3, title: "We List Your Business", desc: "After verifying your business information we list your professional business ad" },
            { step: 4, title: "Connect Securely", desc: "Communicate through our secure platform and negotiate terms with confidence." },
            { step: 5, title: "Secure Transaction Closing", desc: "We collaborate with EU-based banks and notaries to ensure a fully secure deal." }].
            map((item, index) =>
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-6 items-start group hover:scale-102 transition-transform">

                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg group-hover:shadow-primary/30 transition-shadow">
                  {item.step}
                </div>
                <div className="flex-1 bg-card p-6 rounded-xl border border-border group-hover:border-primary/30 transition-all shadow-sm group-hover:shadow-md">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Verified and Trusted</h2>
            <p className="text-lg text-muted-foreground">See what our marketplace members say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
            {
              name: "Sarah Mitchell",
              role: "Business Broker",
              plan: "Enterprise",
                quote: "Choosing the top-tier plan was absolutely worth it. The features are thoughtfully designed, and the support team is fast, responsive, and highly professional. You can truly feel that the service is built with the customer in mind."

            },
              {
                name: "James Chen",
                role: "Restaurant Owner",
                plan: "Professional",
                quote: "What stands out the most is the customer support. Every question is answered quickly and clearly, and the plan I use perfectly fits my business needs. It’s rare to find this level of service today."
              },
              {
                name: "Maria Rodriguez",
                role: "First-time Buyer",
                plan: "Starter",
                quote: "As a new customer, I was looking for transparency and reliability. The plan I chose delivered exactly that – clear terms, useful features, and excellent support from day one."
              }].
            map((testimonial, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-8 shadow-lg">

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) =>
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                )}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.plan}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period."
                },
                {
                  q: "Is there a free trial available?",
                  a: "We offer a 14-day money-back guarantee on all plans. If you're not satisfied, we'll refund your payment in full."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, debit cards, and wire transfers for Enterprise plans."
                },
                {
                  q: "Can I upgrade or downgrade my plan?",
                  a: "Absolutely! You can change your plan at any time from your account settings. Changes take effect immediately."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
