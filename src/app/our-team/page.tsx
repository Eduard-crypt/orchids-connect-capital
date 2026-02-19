"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { Linkedin, ArrowRight, Sparkles, Target, Shield, Zap, Brain, Globe, Rocket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

export default function OurTeamPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const founder = {
    name: 'Eduard Sahakyan',
    title: 'Founder & Lead Business Strategist',
    bio: 'Edward specializes in business structure valuation, operational analysis, and digital strategy. With six years of experience analyzing companies and their business structures, he founded Connect Capitals to bring discipline to an innovative and convenient approach to brokering online businesses and workflows integrated with artificial intelligence.',
    linkedin: 'https://www.linkedin.com/in/eduard-sahakyan-76721930b/',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-corporate-headshot-of-eduar-906d8be3-20251129132834.jpg'
  };

  const stats = [
    { value: '6+', label: 'Years Experience' },
    { value: 'Analytical Mind', label: '' },
    { value: 'Strategic Execution', label: '' },
    { value: '98%', label: 'Client Satisfaction' }
  ];

  const expertise = [
    { icon: Brain, title: 'AI Integration', desc: 'Cutting-edge automation for business workflows' },
    { icon: Target, title: 'Strategic Analysis', desc: 'Data-driven valuation and growth planning' },
    { icon: Shield, title: 'Secure Transactions', desc: 'End-to-end protected deal processes' },
    { icon: Globe, title: 'Global Reach', desc: 'Connecting buyers and sellers worldwide' },
    { icon: Zap, title: 'Fast Execution', desc: 'Streamlined processes for quick closings' },
    { icon: Rocket, title: 'Growth Focus', desc: 'Scaling strategies for digital businesses' }
  ];

  const values = [
    {
      title: 'Transparency',
      description: 'Clear methods. No hidden processes. Every step of our methodology is open for you to see.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Precision',
      description: 'Structured frameworks and data-supported decisions that minimize risk and maximize value.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Innovation',
      description: 'AI-driven systems powering every step of the acquisition and integration process.',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Confidentiality',
      description: 'Bank-level security for handling sensitive business information and deal details.',
      gradient: 'from-rose-500 to-pink-600'
    }
  ];

  const timeline = [
    { 
      year: '2019', 
      period: '2019 – Present',
      title: 'Introduction to Finance', 
      desc: 'Developed advanced analytical capabilities in evaluating American corporate structures. Built expertise in identifying undervalued companies with exceptional fundamentals and sustainable growth potential.' 
    },
    { 
      year: '2023', 
      period: '2023 – 2024',
      title: 'Institutional Excellence', 
      desc: 'Served at EuroBank headquarters in Varna, Bulgaria within the Corporate Department. Collaborated with Schwarz IT Bulgaria on innovative digital product development. Represented a brokerage firm as a licensed broker-dealer for securities trading.' 
    },
    { 
      year: '2025', 
      period: '2025',
      title: 'Planning Connect Capitals', 
      desc: 'Conducted comprehensive market niche assessment and jurisdictional analysis. Architected a secure, transparent platform for online brokerage transactions across Europe, backed by banking partners and legal entities. Pioneered the integration of AI-driven business automation with verified educational programs.' 
    },
    { 
      year: '2026', 
      period: '2026',
      title: 'Official Company Formation', 
      desc: 'Completed all legal documentation and founded Prosper 91 — the trusted entity behind every Connect Capitals transaction. Established the foundation for a new standard in digital business brokerage and AI-powered workflow solutions.' 
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-violet-950/20" />
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
        <div className="absolute inset-0">
          <svg className="w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Meet the Visionary
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.05]"
          >
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              Intelligence Meets
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Ambition
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed"
          >
            Building the future of digital business acquisitions with AI-powered 
            precision and unwavering commitment to excellence.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center min-h-[120px]">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-1 text-center">
                      {stat.value}
                    </div>
                    {stat.label && <div className="text-sm text-gray-500 font-medium text-center">{stat.label}</div>}
                  </div>
                </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Founder Spotlight */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            {/* Image Side */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6 }}
                  className="relative rounded-3xl overflow-hidden aspect-[4/5]"
                >
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                </motion.div>
                
                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -right-4 md:-right-8 bottom-1/4 p-4 md:p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/30"
                >
                  <div className="text-2xl md:text-3xl font-bold">6+</div>
                  <div className="text-xs md:text-sm text-indigo-200">Years Leading</div>
                </motion.div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:pl-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {founder.name}
                </h2>
                <p className="text-xl md:text-2xl text-indigo-400 font-medium mb-8">
                  {founder.title}
                </p>
                <p className="text-lg text-gray-400 leading-relaxed mb-10">
                  {founder.bio}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300"
                  >
                    <Linkedin className="w-5 h-5 text-indigo-400" />
                    <span className="font-medium">Connect on LinkedIn</span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Expertise Grid */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Areas of Excellence
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Comprehensive expertise across the digital business acquisition lifecycle
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertise.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all duration-500 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Guiding Principles
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              The foundational values that shape every decision and interaction
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${value.gradient} rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="relative p-10 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500">
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${value.gradient} mb-6`}>
                    <span className="text-sm font-bold text-white">0{index + 1}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{value.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Year Roadmap */}
        <section className="relative py-32 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent" />
          
          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-300 mb-6">
                <Rocket className="w-4 h-4" />
                Professional Journey
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Year Roadmap
                </span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                A chronicle of milestones, expertise, and vision that shaped Connect Capitals
              </p>
            </motion.div>

            <div className="relative">
              {/* Central Timeline Line - Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2">
                <div className="h-full bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-500 rounded-full" />
              </div>
              
              {/* Mobile Timeline Line */}
              <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5">
                <div className="h-full bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-500 rounded-full" />
              </div>

              <div className="space-y-12 md:space-y-0">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className={`relative md:grid md:grid-cols-2 md:gap-12 ${index > 0 ? 'md:mt-16' : ''}`}
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-6 md:left-1/2 w-4 h-4 -translate-x-1/2 z-10">
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/50">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-ping opacity-30" />
                      </div>
                    </div>

                    {/* Content - Alternating sides on desktop */}
                    <div className={`pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:col-start-2 md:pl-12 md:text-left'}`}>
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-500">
                          {/* Year Badge */}
                          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600/30 via-violet-600/25 to-purple-600/30 border-2 border-indigo-400/40 mb-6 shadow-lg shadow-indigo-500/20 ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 animate-pulse shadow-md shadow-indigo-400/50" />
                            <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent drop-shadow-sm">
                              {item.period}
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {item.title}
                          </h3>
                          
                          {/* Description */}
                          <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className={`hidden md:block ${index % 2 === 0 ? 'col-start-2' : 'col-start-1 row-start-1'}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/30 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              Ready to Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Business Journey?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join hundreds of entrepreneurs who have trusted Connect Capitals to guide their digital business transitions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reach-us"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/buy-a-business"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 font-semibold transition-all duration-300"
            >
              Explore Listings
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Bottom Spacing */}
      <div className="h-20" />
    </div>
  );
}
