'use client';

import { motion } from 'framer-motion';
import { 
  Building2, 
  Coins, 
  Repeat, 
  ShoppingCart, 
  PlayCircle, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const INDUSTRIES = [
  {
    title: "FinTech & Trading Platforms",
    description: "Liquidity optimization, execution efficiency, algorithmic allocation, and institutional risk modeling.",
    icon: Activity,
    color: "from-blue-700 to-emerald-600",
    iconColor: "text-white",
    capabilities: ["Liquidity Optimization", "Execution Efficiency", "Risk Modeling"]
  },
  {
    title: "Investment Funds & Family Offices",
    description: "Portfolio diversification, drawdown control, performance attribution, and multi-asset exposure.",
    icon: Building2,
    color: "from-blue-700 to-emerald-600",
    iconColor: "text-white",
    capabilities: ["Portfolio Diversification", "Drawdown Control", "Multi-asset Exposure"]
  },
  {
    title: "Crypto & Digital Asset Firms",
    description: "Arbitrage systems, hedging frameworks, on-chain analytics, and volatility-managed strategies.",
    icon: Coins,
    color: "from-blue-700 to-emerald-600",
    iconColor: "text-white",
    capabilities: ["Arbitrage Systems", "Hedging Frameworks", "On-chain Analytics"]
  },
  {
    title: "SaaS with Recurring Revenue",
    description: "Cash-flow modeling, reinvestment optimization, valuation analytics, and growth capital structuring.",
    icon: Repeat,
    color: "from-blue-700 to-emerald-600",
    iconColor: "text-white",
    capabilities: ["Cash-flow Modeling", "Valuation Analytics", "Capital Structuring"]
  },
  {
    title: "E-commerce Brands",
    description: "Margin optimization, demand forecasting, inventory financing, and expansion capital planning.",
    icon: ShoppingCart,
    color: "from-blue-700 to-emerald-600",
    iconColor: "text-white",
    capabilities: ["Margin Optimization", "Demand Forecasting", "Capital Planning"]
  },
  {
    title: "Media & Creator Businesses",
    description: "Revenue stabilization, monetization scaling, platform diversification, and long-term growth models.",
    icon: PlayCircle,
    color: "from-blue-700 to-emerald-600",
    iconColor: "text-white",
    capabilities: ["Revenue Stabilization", "Monetization Scaling", "Growth Models"]
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
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
                  className="text-blue-300/50"
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

export default function InstitutionalExpertise() {
  return (
    <section className="py-32 relative overflow-hidden bg-sky-50">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_70%)]"></div>
      <AnimatedGrid />

      <div className="container relative z-10">
        {/* Header */}
        <div className="max-w-4xl mb-20">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge className="mb-6 px-4 py-1.5 bg-slate-900 text-white border-none text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
              GLOBAL CAPITAL DEPLOYMENT
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 tracking-tight leading-[1.1]">
              Capital Solutions Across <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-emerald-600">
                High-Growth Digital Markets
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed font-light">
              We allocate and manage capital using quantitative models, real-time data, and disciplined risk frameworks across multiple digital and financial sectors.
            </p>
          </motion.div>
        </div>

        {/* Industry Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {INDUSTRIES.map((industry, i) => (
            <motion.div 
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
                className="group relative p-8 bg-sky-50 border border-slate-200 rounded-3xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-blue-300 transition-all duration-500"
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <industry.icon className={`w-7 h-7 ${industry.iconColor} group-hover:animate-pulse`} />
                </div>

                <h3 className="text-xl font-bold mb-4 text-slate-900 tracking-tight">
                  {industry.title}
                </h3>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-8 font-light">
                  {industry.description}
                </p>

                {/* Capabilities */}
                <ul className="space-y-3 mb-10">
                  {industry.capabilities.map((cap, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                      {cap}
                    </li>
                  ))}
                </ul>

                {/* CTA Link */}
                <Link 
                  href="#" 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 group/link"
                >
                  View Strategies
                  <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-blue-700 group-hover/link:w-full transition-all duration-300" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
