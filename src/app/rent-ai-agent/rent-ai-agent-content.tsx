"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, type ReactNode, useEffect, useRef } from "react";
import { Bot, Brain, MessageSquare, Zap, Clock, Shield, CheckCircle, TrendingUp, Users, Award, Star, Play, Code, BarChart, Mail, Share2, Search, DollarSign, UserCheck, ShoppingCart, Linkedin, Wind } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type Agent = {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: string;
  icon: ReactNode;
  badge: string;
  image: string;
};

const aiAgents: Agent[] = [
  {
    id: "chatgpt-assistant",
    name: "ChatGPT Pro Assistant",
    description:
    "Advanced conversational AI powered by OpenAI's GPT-4. Perfect for customer interactions, content creation, and intelligent automation.",
    features: ["GPT-4 Powered", "Context Memory", "Multi-language Support", "API Integration"],
    pricing: "€199/month",
    icon: <MessageSquare className="w-8 h-8" />,
    badge: "Most Popular",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-cha-448a8680-20251031191104.jpg"
  },
  {
    id: "claude-agent",
    name: "Claude Enterprise Agent",
    description:
    "Anthropic's Claude AI for complex reasoning, analysis, and ethical decision-making. Ideal for research and strategic planning.",
    features: ["Advanced Reasoning", "Document Analysis", "Code Generation", "Safety Focused"],
    pricing: "€179/month",
    icon: <Brain className="w-8 h-8" />,
    badge: "Enterprise Choice",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-cla-d8b5b2d9-20251031191103.jpg"
  },
  {
    id: "linkedin-post-generator",
    name: "LinkedIn Post Generator",
    description:
    "Create engaging, professional LinkedIn posts that drive engagement and grow your network. AI-powered content that resonates with your audience and builds your personal brand.",
    features: ["Engagement Optimization", "Hashtag Suggestions", "Post Scheduling", "Analytics Tracking"],
    pricing: "€29/month",
    icon: <Linkedin className="w-8 h-8" />,
    badge: "Networking Pro",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-lin-3d256482-20251207184901.jpg"
  },
  {
    id: "aqi-agent",
    name: "AQI Monitoring Agent",
    description:
    "Real-time air quality monitoring and analysis powered by AI. Track pollution levels, receive health alerts, and get actionable insights for environmental management and safety compliance.",
    features: ["Real-time AQI Tracking", "Health Risk Alerts", "Historical Data Analysis", "Compliance Reports"],
    pricing: "€89/month",
    icon: <Wind className="w-8 h-8" />,
    badge: "Environmental Pro",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-an--2df31eb7-20251207185642.jpg"
  },
  {
    id: "market-intelligence",
    name: "Market Intelligence Agent",
    description:
    "Analyze market trends, competitor performance, and industry insights with AI-powered data analysis and predictive modeling.",
    features: ["Competitor Benchmarking", "Trend Forecasting", "Sentiment Analysis", "Real-time Reports"],
    pricing: "€149/month",
    icon: <TrendingUp className="w-8 h-8" />,
    badge: "Best for Growth",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-mar-3f832537-20251031191104.jpg"
  },
  {
    id: "customer-support",
    name: "24/7 Support Agent",
    description:
    "Provide instant customer service, answer FAQs, resolve issues, and manage tickets with intelligent automation.",
    features: ["Instant Response", "Multi-Channel", "Issue Resolution", "CRM Integration"],
    pricing: "€99/month",
    icon: <Users className="w-8 h-8" />,
    badge: "Best Value",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-24--208d2bfa-20251031191105.jpg"
  },
  {
    id: "content-generation",
    name: "Content Creation Agent",
    description:
    "Generate high-quality content including articles, social media posts, marketing copy, and SEO-optimized content at scale.",
    features: ["SEO Optimization", "Tone Control", "Batch Processing", "50+ Languages"],
    pricing: "€129/month",
    icon: <Zap className="w-8 h-8" />,
    badge: "Content Pro",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--31617187-20251031191104.jpg"
  },
  {
    id: "code-assistant",
    name: "AI Code Assistant",
    description:
    "Accelerate development with intelligent code completion, debugging, refactoring, and documentation generation.",
    features: ["Code Completion", "Bug Detection", "Refactoring Tools", "Multi-Language"],
    pricing: "€159/month",
    icon: <Code className="w-8 h-8" />,
    badge: "Developer Favorite",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--b1164dc1-20251031191104.jpg"
  },
  {
    id: "data-analytics",
    name: "Data Analytics Agent",
    description:
    "Transform raw data into actionable insights with automated analysis, visualization, and predictive analytics.",
    features: ["Data Visualization", "Predictive Models", "Automated Reports", "BI Integration"],
    pricing: "€189/month",
    icon: <BarChart className="w-8 h-8" />,
    badge: "Analytics Pro",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-dat-d1aef919-20251031191104.jpg"
  },
  {
    id: "email-automation",
    name: "Email Automation Agent",
    description:
    "Automate email campaigns, personalize messages, optimize send times, and track engagement with AI-driven insights.",
    features: ["Smart Scheduling", "Personalization", "A/B Testing", "Analytics Dashboard"],
    pricing: "€119/month",
    icon: <Mail className="w-8 h-8" />,
    badge: "Marketing Essential",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ema-b6ad8cb8-20251031191104.jpg"
  },
  {
    id: "social-media-manager",
    name: "Social Media Manager",
    description:
    "Manage all social platforms, create engaging posts, schedule content, and analyze performance metrics automatically.",
    features: ["Multi-Platform", "Content Calendar", "Engagement Tracking", "Hashtag Optimization"],
    pricing: "€139/month",
    icon: <Share2 className="w-8 h-8" />,
    badge: "Social Pro",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-soc-85da3a71-20251031191104.jpg"
  },
  {
    id: "research-assistant",
    name: "Research Assistant Agent",
    description:
    "Conduct comprehensive research, summarize documents, extract key insights, and compile reports with AI precision.",
    features: ["Document Analysis", "Citation Management", "Fact Checking", "Summary Generation"],
    pricing: "€169/month",
    icon: <Search className="w-8 h-8" />,
    badge: "Research Pro",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-res-379fd90c-20251031191105.jpg"
  },
  {
    id: "sales-assistant",
    name: "AI Sales Assistant",
    description:
    "Boost sales with intelligent lead qualification, automated follow-ups, CRM management, and personalized sales strategies.",
    features: ["Lead Scoring", "Sales Forecasting", "Pipeline Management", "Automated Outreach"],
    pricing: "€155/month",
    icon: <DollarSign className="w-8 h-8" />,
    badge: "Sales Booster",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--11c8c992-20251031201212.jpg"
  },
  {
    id: "hr-recruitment",
    name: "HR Recruitment Agent",
    description:
    "Streamline hiring with AI-powered candidate screening, interview scheduling, talent matching, and onboarding automation.",
    features: ["Resume Screening", "Talent Matching", "Interview Automation", "Onboarding Support"],
    pricing: "€145/month",
    icon: <UserCheck className="w-8 h-8" />,
    badge: "HR Essential",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--597f0015-20251031201212.jpg"
  }];


const benefits = [
{
  icon: Clock,
  title: "Deploy in Minutes",
  description: "Get your AI agent up and running in less than 5 minutes with our simple setup process."
},
{
  icon: Shield,
  title: "Enterprise Security",
    description: "Encryption-based data protection, controlled access, and internal processes designed in line with European data protection principles and industry best practices."
},
{
  icon: TrendingUp,
  title: "Proven ROI",
  description: "Our clients see an average 40% increase in productivity within the first month."
}];


const stats = [
{ icon: Users, value: "200+", label: "Active Users" },
{ icon: Bot, value: "300+", label: "Tasks Automated Daily" },
{ icon: Award, value: "99.9%", label: "Uptime SLA" }];


const testimonials = [
{
  name: "Sarah Johnson",
  role: "CEO, TechStart Inc.",
  image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-headshot-portrait-photograp-564721c4-20251003151343.jpg",
  content: "The Market Intelligence Agent has revolutionized how we analyze our competition. We've cut research time by 70%.",
  rating: 5
},
{
  name: "Michael Chen",
  role: "CTO, Digital Solutions",
  image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-headshot-portrait-photograp-5ebb102c-20251003151351.jpg",
  content: "Our customer support costs dropped by 45% while satisfaction scores increased. These AI agents are game-changers.",
  rating: 5
},
{
  name: "Emily Rodriguez",
  role: "Marketing Director",
  image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-headshot-portrait-photograp-6b42cf87-20251003151359.jpg",
  content: "Content Generation Agent produces high-quality content that resonates with our audience. It's like having 10 writers.",
  rating: 5
}];


const heroImages = [
"https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-photograph-of-mod-0c05bc03-20251031191537.jpg",
"https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-photograph-of-ai--c00b28bb-20251031191536.jpg",
"https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-photograph-of-mod-e62b9bdc-20251031191537.jpg"];


export const RentAIAgentContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const { data: session, isPending } = useSession();
  const router = useRouter();

  const heroRef = useScrollAnimation();
  const agentsRef = useScrollAnimation();
  const benefitsRef = useScrollAnimation();
  const testimonialsRef = useScrollAnimation();

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (agentId: string, agentName: string) => {
    // Check authentication
    if (!session) {
      toast.error("Please log in to add items to cart");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setAddingToCart(agentId);

    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planSlug: agentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      const data = await response.json();
      
      // Show different messages based on whether item was already in cart
      if (data.alreadyInCart) {
        toast.info(`${agentName} is already in your cart`);
      } else {
        toast.success(`${agentName} added to cart! You can add more products or view your cart.`);
      }
      
      // DO NOT redirect - keep user on page to add more products
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const openModal = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAgent(null);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const t = requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen, closeModal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-32 pb-20 px-6 overflow-hidden">

        {/* Slideshow Background */}
        <div className="absolute inset-0 -z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0">

              <img
                src={heroImages[currentImageIndex]}
                alt="AI Technology"
                className="w-full h-full object-cover" />

              <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-secondary/90 to-primary/85"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI0MSwgMTQzLCAxLCAwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20 -z-10"
          aria-hidden="true" />


        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, duration: 1 }}
            className="inline-block mb-6 relative group"
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}>

            {/* Outer glow rings - only visible on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-orange-500 to-accent opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500"
            style={{
              transform: 'translateZ(-50px) scale(1.8)',
              animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />

            
            {/* Middle ring with 3D effect - only visible on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/40 via-orange-400/30 to-accent/40 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
            style={{
              transform: 'translateZ(-30px) scale(1.5)',
              boxShadow: '0 25px 50px -12px rgba(241, 143, 1, 0.5)'
            }} />

            
            {/* Main 3D container */}
            <div
              className="relative p-8 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-4 border-accent/60 shadow-2xl group-hover:border-accent transition-all duration-500"
              style={{
                transform: 'translateZ(0) rotateX(10deg)',
                boxShadow: `
                  0 0 20px rgba(241, 143, 1, 0.3),
                  0 30px 60px -15px rgba(0, 0, 0, 0.8),
                  inset 0 2px 10px rgba(255, 255, 255, 0.2),
                  inset 0 -5px 20px rgba(0, 0, 0, 0.4)
                `
              }}>

              {/* Shine overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-40"
              style={{ transform: 'translateZ(10px)' }} />

              
              {/* Bot icon with 3D effect */}
              <Bot
                className="w-20 h-20 text-accent relative z-10 transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(241, 143, 1, 0.4))',
                  transform: 'translateZ(20px)',
                  animation: 'float 6s ease-in-out infinite'
                }} />

            </div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] [text-shadow:_1px_1px_0_rgb(255_255_255_/_15%),_2px_2px_2px_rgb(0_0_0_/_10%)] transform hover:translate-y-[-2px] transition-transform duration-300 inline-block">AI Agent </span>
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] [text-shadow:_1px_1px_0_rgb(255_255_255_/_15%),_2px_2px_2px_rgb(0_0_0_/_10%)] transform hover:translate-y-[-2px] transition-transform duration-300 inline-block"> Marketplace

            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%),_2px_2px_4px_rgb(0_0_0_/_40%)] transform hover:translate-y-[-1px] transition-transform duration-300">
            Discover ready-to-deploy AI agents and custom-built solutions designed specifically for your business. Accelerate growth with next-generation intelligent automation.
          </p>

          <div className="flex flex-wrap gap-6 justify-center text-white/90">
            <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-3 rounded-xl backdrop-blur-sm border border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(241,143,1,0.3)] transform hover:translate-y-[-4px] hover:scale-105 transition-all duration-300" style={{ transform: 'perspective(1000px) rotateX(5deg)' }}>
              <Shield className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
              <span className="font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-3 rounded-xl backdrop-blur-sm border border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(241,143,1,0.3)] transform hover:translate-y-[-4px] hover:scale-105 transition-all duration-300" style={{ transform: 'perspective(1000px) rotateX(5deg)' }}>
              <Clock className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
              <span className="font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">24/7 Availability</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-3 rounded-xl backdrop-blur-sm border border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(241,143,1,0.3)] transform hover:translate-y-[-4px] hover:scale-105 transition-all duration-300" style={{ transform: 'perspective(1000px) rotateX(5deg)' }}>
              <Zap className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
              <span className="font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Instant Deployment</span>
            </div>
          </div>

          {/* Slideshow Indicators */}
          <div className="flex gap-2 justify-center mt-8">
            {heroImages.map((_, index) =>
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex ?
              "bg-accent w-8" :
              "bg-white/40 hover:bg-white/60"}`
              }
              aria-label={`Go to slide ${index + 1}`} />

            )}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut"
              }}
              className="flex items-center justify-center gap-4">

                <stat.icon className="h-12 w-12" />
                <div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* AI Agents Grid */}
      <section ref={agentsRef} className="py-20 px-6 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

              <h2 className="text-4xl font-bold text-white mb-4">Top 12 AI Agents</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Professional AI agents and tailor-made solutions built around real business needs. Trusted intelligent systems that work for you around the clock.
              </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiAgents.map((agent, index) =>
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3 } }}
              className="bg-slate-700/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-slate-600 hover:border-accent hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 flex flex-col group relative">

                {/* Agent Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                  <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  loading="lazy" />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-700 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {agent.badge}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-white mb-3">{agent.name}</h3>

                  <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-grow">{agent.description}</p>

                  <div className="space-y-2 mb-6">
                    {agent.features.slice(0, 4).map((feature, idx) =>
                  <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-gray-200">{feature}</span>
                      </div>
                  )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Starting at</div>
                        <div className="text-2xl font-bold text-accent">{agent.pricing}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        {agent.id === "linkedin-post-generator" ? (
                          <a
                            href="https://buy.stripe.com/28E3cu0Zgglk3xhfoW2Fa05"
                            className="flex-1 bg-accent text-white py-3 px-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg shadow-accent/30 btn-hover-effect flex items-center justify-center gap-2"
                            aria-label={`Start ${agent.name}`}>
                            <ShoppingCart className="w-4 h-4" />
                            Start risk-free
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(agent.id, agent.name)}
                            disabled={addingToCart === agent.id}
                            className="flex-1 bg-accent text-white py-3 px-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg shadow-accent/30 btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            aria-label={`Add ${agent.name} to cart`}>
                            {addingToCart === agent.id ? (
                              "Adding..."
                            ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4" />
                                  Start risk-free
                                </>
                            )}
                          </button>
                        )}
                      <button
                        type="button"
                        onClick={() => openModal(agent)}
                        className="px-4 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-500 transition-colors duration-200"
                        aria-label={`View details for ${agent.name}`}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          

        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">See AI Agents in Action</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Watch how our AI agents transform business operations and deliver measurable results
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gradient-to-br from-primary/20 to-accent/20 group border-2 border-slate-600 hover:border-accent transition-colors">

              <video
                controls
                className="w-full h-full object-cover"
                poster="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-showin-95d91333-20251003151451.jpg">

                <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_videos/dynamic-animated-explainer-video-showing-4cf83f0f-20251031191115.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-accent rounded-full p-6">
                  <Play className="h-16 w-16 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our AI Agents</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Enterprise-grade AI solutions built for businesses that demand excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {benefits.map((benefit, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="text-center p-8 bg-slate-700/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-accent/20 transition-all border-2 border-slate-600 hover:border-accent group">

                <div className="flex items-center justify-center mx-auto h-20 w-20 rounded-full bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors">
                  <benefit.icon className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Industry Leaders</h2>
            <p className="text-lg text-gray-300">See what our clients say about their AI transformation</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-accent/20 hover:border-accent transition-all p-8">

                <div className="flex items-center gap-4 mb-6">
                  <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                  loading="lazy" />

                  <div>
                    <h4 className="font-bold text-lg text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) =>
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                )}
                </div>
                <p className="text-gray-200 leading-relaxed italic">"{testimonial.content}"</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-successful-bu-9b0d6bd7-20251003151458.jpg"
            alt="AI Technology"
            className="w-full h-full object-cover"
            loading="lazy" />

          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/75"></div>
        </div>
        <div className="container relative z-10 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-6">

            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl mb-10 max-w-2xl mx-auto opacity-95">

              New to AI? Get started with confidence. Backed by a 7-day money-back guarantee.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">


              <motion.a
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                href="/reach-us"
                className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl transition-all shadow-xl inline-block">

                Get in Touch with Advisor
              </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Booking Form Modal */}
      {isModalOpen && selectedAgent &&
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-modal-title"
        onClick={(e) => {
          if (e.currentTarget === e.target) closeModal();
        }}>

          <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-accent">

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 id="agent-modal-title" className="text-3xl font-bold text-foreground mb-2">
                    {selectedAgent.name}
                  </h2>
                  <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedAgent.badge}
                  </div>
                </div>
                <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground text-3xl leading-none p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
                ref={closeBtnRef}>

                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-accent" />
                    Agent Details
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{selectedAgent.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    {selectedAgent.features.map((feature, index) =>
                  <div key={index} className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                  )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border-2 border-accent/20">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Pricing</h3>
                  <div className="text-4xl font-bold text-accent mb-2">{selectedAgent.pricing}</div>
                  <p className="text-muted-foreground">7-day money-back guarantee</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">What's Included</h3>
                  <ul className="space-y-3 text-foreground">
                    <li className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>24/7 AI-powered assistance with instant response</span>
                    </li>
                    <li className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Customizable workflows and automation rules</span>
                    </li>
                    <li className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Real-time analytics and performance dashboard</span>
                    </li>
                    <li className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Priority support with dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Monthly performance reports and optimization tips</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-background border-2 border-border text-foreground py-3 px-6 rounded-xl font-semibold hover:bg-muted transition-colors duration-200">

                    Cancel
                  </button>
                      <a
                      href={selectedAgent.id === "linkedin-post-generator" ? "https://buy.stripe.com/28E3cu0Zgglk3xhfoW2Fa05" : "/reach-us"}
                      onClick={() => closeModal()}
                      className="flex-1 bg-accent text-white py-3 px-6 rounded-xl font-semibold hover:bg-accent/90 transition-colors duration-200 shadow-lg shadow-accent/30 btn-hover-effect text-center">

                        Start risk-free →
                      </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      }
    </div>);

};

export default RentAIAgentContent;
