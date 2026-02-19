'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowLeft, AlertCircle, Clock, Shield, TrendingUp, CheckCircle, Zap, Loader2, XCircle, CheckCircle2, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIAgentWithTrial {
  id: number;
  name: string;
  description: string;
  startingPrice: string;
  features: string[];
  category: string | null;
  badge: string | null;
  iconName: string | null;
  imageUrl: string | null;
  createdAt: Date;
  trial: {
    id: number;
    status: string;
    startedAt: Date;
    expiresAt: Date;
    createdAt: Date;
  };
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        label: 'Active',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    case 'trial':
      return {
        label: 'Trial',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    case 'expired':
      return {
        label: 'Expired',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: XCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    default:
      return {
        label: status,
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
  }
};

const backgroundMedia = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-photograph-of-mod-0c05bc03-20251031191537.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-photograph-of-ai--c00b28bb-20251031191536.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-photograph-of-mod-e62b9bdc-20251031191537.jpg"
];

const stats = [
  { icon: TrendingUp, value: "12+", label: "AI Agents Available" },
  { icon: Shield, value: "99.9%", label: "Uptime SLA" },
  { icon: Clock, value: "24/7", label: "Support" }
];

export default function MyAIAgentsContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<AIAgentWithTrial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBgVideo, setCurrentBgVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgVideo((prev) => (prev + 1) % backgroundMedia.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login?redirect=/dashboard/my-ai-agents');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserAgents();
    }
  }, [session]);

  const fetchUserAgents = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/users/me/ai-agents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      } else if (response.status === 401) {
        toast.error('Please log in to view your AI agents');
        router.push('/login?redirect=/dashboard/my-ai-agents');
      }
    } catch (error) {
      console.error('Error fetching user agents:', error);
      toast.error('Failed to load AI agents');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysRemaining = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading state with enhanced animation
  if (isPending || isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-background"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-secondary/10 blur-3xl rounded-full"
          />
          <Loader2 className="h-16 w-16 animate-spin text-secondary relative z-10" />
        </motion.div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-foreground/70 text-lg mt-6 font-medium"
        >
          Loading your AI agents...
        </motion.p>
      </motion.div>
    );
  }

  // If no session after loading, show nothing (redirect will happen)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Animated Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {backgroundMedia.map((media, index) => (
              index === currentBgVideo && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={media}
                    alt={`AI Background ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-primary/85" />
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI0MSwgMTQzLCAxLCAwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20 z-0"
          aria-hidden="true"
        />
        
        <div className="relative py-16 mb-8 z-10">
          <div className="container max-w-7xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 mb-6 hover:bg-white/20 text-white border border-white/20">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </motion.div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 space-y-3"
              >
                {/* 3D Animated Bot Icon */}
                <motion.div
                  initial={{ scale: 0, rotateY: -180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200, duration: 1 }}
                  className="inline-block mb-4 relative group"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  {/* Outer glow rings */}
                  <div 
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-orange-500 to-accent opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500"
                    style={{
                      transform: 'translateZ(-50px) scale(1.8)',
                      animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                  
                  {/* Middle ring */}
                  <div 
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/40 via-orange-400/30 to-accent/40 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                    style={{
                      transform: 'translateZ(-30px) scale(1.5)',
                      boxShadow: '0 25px 50px -12px rgba(241, 143, 1, 0.5)'
                    }}
                  />
                  
                  {/* Main 3D container */}
                  <div
                    className="relative p-6 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-4 border-accent/60 shadow-2xl group-hover:border-accent transition-all duration-500"
                    style={{
                      transform: 'translateZ(0) rotateX(10deg)',
                      boxShadow: `
                        0 0 20px rgba(241, 143, 1, 0.3),
                        0 30px 60px -15px rgba(0, 0, 0, 0.8),
                        inset 0 2px 10px rgba(255, 255, 255, 0.2),
                        inset 0 -5px 20px rgba(0, 0, 0, 0.4)
                      `
                    }}
                  >
                    {/* Shine overlay */}
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-40"
                      style={{ transform: 'translateZ(10px)' }}
                    />
                    
                    {/* Bot icon */}
                    <Bot
                      className="w-12 h-12 text-accent relative z-10 transition-all duration-500"
                      style={{
                        filter: 'drop-shadow(0 4px 8px rgba(241, 143, 1, 0.4))',
                        transform: 'translateZ(20px)',
                        animation: 'float 6s ease-in-out infinite'
                      }}
                    />
                  </div>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                >
                  <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] [text-shadow:_1px_1px_0_rgb(255_255_255_/_15%),_2px_2px_2px_rgb(0_0_0_/_10%)]">
                    My AI Agents
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-white/90 text-base max-w-2xl leading-relaxed drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]"
                >
                  Manage and access your AI agent subscriptions and trials
                </motion.p>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex flex-wrap gap-3 pt-2"
                >
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(241,143,1,0.3)] transform hover:translate-y-[-2px] transition-all duration-300">
                    <Shield className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
                    <span className="text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(241,143,1,0.3)] transform hover:translate-y-[-2px] transition-all duration-300">
                    <Clock className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
                    <span className="text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">24/7 Active</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(241,143,1,0.3)] transform hover:translate-y-[-2px] transition-all duration-300">
                    <Zap className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
                    <span className="text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">High Performance</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/rent-ai-agent">
                  <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold px-6">
                    <Bot className="h-5 w-5" />
                    Rent an AI Agent
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                className="flex items-center justify-center gap-4"
              >
                <stat.icon className="h-12 w-12" />
                <div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container max-w-7xl py-8">
        {/* AI Agents List with Staggered Animation */}
        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600 shadow-2xl">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
              />
              <CardContent className="p-12 relative">
                <div className="text-center max-w-2xl mx-auto">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3
                    }}
                    className="inline-block p-8 rounded-2xl bg-accent/10 mb-6 border-2 border-accent/20"
                  >
                    <AlertCircle className="h-20 w-20 text-accent mx-auto drop-shadow-[0_0_12px_rgba(241,143,1,0.6)]" />
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-bold text-white mb-4"
                  >
                    No AI Agents Yet
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-300 text-lg mb-8 leading-relaxed"
                  >
                    You haven't rented any AI agents yet. Explore our marketplace to find the perfect AI agent to automate and enhance your business operations.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(241, 143, 1, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/rent-ai-agent">
                      <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-white shadow-xl hover:shadow-2xl shadow-accent/30 transition-all duration-300 font-semibold px-8">
                        <Bot className="h-5 w-5" />
                        Browse AI Agents
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-4"
            >
              <h2 className="text-2xl font-bold text-primary">Your Active Agents ({agents.length})</h2>
            </motion.div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, index) => {
                const statusConfig = getStatusConfig(agent.trial.status);
                const StatusIcon = statusConfig.icon;
                const daysRemaining = getDaysRemaining(agent.trial.expiresAt);

                return (
                  <motion.div
                    key={agent.trial.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Card className="group relative overflow-hidden bg-white border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent"
                      />
                      
                      {agent.badge && (
                        <motion.div 
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="absolute top-4 right-4 z-10"
                        >
                          <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full shadow-md">
                            {agent.badge}
                          </span>
                        </motion.div>
                      )}

                      <CardHeader className="relative pb-4">
                        <div className="flex items-start gap-4 mb-3">
                          <motion.div 
                            whileHover={{ 
                              rotate: 360,
                              scale: 1.1
                            }}
                            transition={{ duration: 0.6 }}
                            className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center flex-shrink-0"
                          >
                            <Bot className="h-7 w-7 text-secondary" />
                          </motion.div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-foreground group-hover:text-secondary transition-colors mb-1">
                              {agent.name}
                            </CardTitle>
                            {agent.category && (
                              <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                                {agent.category}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor} w-fit`}
                        >
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                          <span className={`text-xs font-bold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </motion.div>
                      </CardHeader>

                      <CardContent className="relative space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {agent.description}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-border/30">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Price</span>
                            <span className="font-bold text-secondary">{agent.startingPrice}</span>
                          </div>
                          
                          {agent.trial.status === 'trial' && daysRemaining > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 0.4 }}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Trial Expires
                              </span>
                              <span className="font-bold text-blue-600">
                                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                              </span>
                            </motion.div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Started
                            </span>
                            <span className="font-medium">
                              {new Date(agent.trial.startedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Features</h4>
                          <ul className="space-y-1">
                            {agent.features.slice(0, 3).map((feature, featureIndex) => (
                              <motion.li 
                                key={featureIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 + featureIndex * 0.1 }}
                                className="text-xs text-muted-foreground flex items-start gap-2"
                              >
                                <CheckCircle2 className="h-3 w-3 text-secondary flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link href={`/rent-ai-agent?agent=${agent.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-2 mt-4 group-hover:bg-secondary group-hover:text-white group-hover:border-secondary transition-all font-semibold"
                            >
                              View Details
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add floating animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateZ(20px) translateY(0px);
          }
          50% {
            transform: translateZ(20px) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}