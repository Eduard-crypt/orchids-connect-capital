'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Mail, FileText, ArrowRight, Download, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function ThankYouPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    
    const fireConfetti = () => {
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.5) },
          colors: ['#F18F01', '#1A3E6D', '#3F5F8B', '#FFD700', '#00C853'],
        });
      }, 250);
    };

    fireConfetti();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(241,143,1,0.08),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-14 h-14 md:w-20 md:h-20 text-white" strokeWidth={2.5} />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
                  Thank You!
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-primary font-semibold mb-2">
                Payment Successful
              </p>
              <p className="text-muted-foreground text-lg mb-12">
                Your purchase has been confirmed and processed.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border-2 border-green-500/20 shadow-xl p-8 mb-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-3 shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">Confirmation Email</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Check your inbox for details
                    </p>
                  </div>

                  <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3 shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">Receipt & Invoice</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Sent automatically by Stripe
                    </p>
                  </div>

                  <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3 shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">Instant Activation</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Your plan is now active
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 mb-10 border border-primary/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-primary mb-2">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Confirmation email from support@connectcapitals.com
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Automatic receipt/invoice PDF from Stripe
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Full access to your selected plan features
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/dashboard">
                  <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent text-white shadow-lg shadow-accent/30 group">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/subscriptions">
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-primary/20 hover:border-primary/40">
                    <Download className="w-5 h-5 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-10 text-sm text-muted-foreground"
              >
                Questions? Contact us at{' '}
                <a href="mailto:support@connectcapitals.com" className="text-accent hover:underline font-medium">
                  support@connectcapitals.com
                </a>
              </motion.p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
