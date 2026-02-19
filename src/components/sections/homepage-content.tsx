"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, LineChart, Shield, Briefcase, MapPin, ChevronDown, TrendingUp, Users, Award, Star, Play, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { useScrollAnimation, useCountUp } from '@/hooks/use-scroll-animation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Floating particles component
const FloatingParticles = ({ count = 20 }: { count?: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-accent/30 rounded-full"
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
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Animated grid background
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

const HomepageContent = () => {
  const [searchTerm, setSearchTerm] = useState("The Connect Capitals Advantages");
  const [selectedType, setSelectedType] = useState<'business' | 'ai-agents'>('business');
  const [selectedTown, setSelectedTown] = useState('all-towns');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [townDropdownOpen, setTownDropdownOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const industryDropdownRef = useRef<HTMLDivElement>(null);
  const townDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Parallax effect for hero section
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Slideshow images for hero background (online-first visuals)
  const slideshowImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-bus-c2ddf6ed-20251003151318.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-secure-busine-4171dc8f-20251003151327.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-showin-95d91333-20251003151451.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-e-comm-f2575891-20251002160330.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg",
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-expert-busine-40207cd1-20251003151334.jpg"];


  // Auto-rotate slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  const industries = [
  { value: 'all', label: 'All Online Categories' },
  { value: 'saas', label: 'SaaS Businesses' },
  { value: 'mobile-apps', label: 'Mobile Apps' },
  { value: 'marketplaces', label: 'Marketplaces' },
  { value: 'ecommerce', label: 'E-commerce Stores / Brands' },
  { value: 'agencies', label: 'Digital Agencies' },
  { value: 'blogs', label: 'Online Media & Blogs' },
  { value: 'digital-products', label: 'Digital Products Businesses' },
  { value: 'dropshipping', label: 'Dropshipping Businesses' },
  { value: 'fintech', label: 'Fintech / Digital Tools' }
];



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target as Node)) {
        setIndustryDropdownOpen(false);
      }
      if (townDropdownRef.current && !townDropdownRef.current.contains(event.target as Node)) {
        setTownDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    const bulgarianTowns = [
    "All Locations", "Vienna", "Brussels", "Sofia", "Zagreb", "Nicosia", "Prague", "Copenhagen",
    "Tallinn", "Helsinki", "Paris", "Berlin", "Athens", "Budapest", "Dublin", "Rome",
    "Riga", "Vilnius", "Luxembourg", "Valletta", "Amsterdam", "Warsaw", "Lisbon",
    "Bucharest", "Bratislava", "Ljubljana", "Madrid", "Stockholm", "Yerevan", "Washington D.C.", "Remote"];


  const geoOptions = [
    { label: "All Locations", value: "all" },
    { label: "United States (US)", value: "us" },
    { label: "All Europe", value: "europe" },
    { label: "Austria", value: "at" },
    { label: "Belgium", value: "be" },
    { label: "Bulgaria", value: "bg" },
    { label: "Croatia", value: "hr" },
    { label: "Cyprus", value: "cy" },
    { label: "Czechia", value: "cz" },
    { label: "Denmark", value: "dk" },
    { label: "Estonia", value: "ee" },
    { label: "Finland", value: "fi" },
    { label: "France", value: "fr" },
    { label: "Germany", value: "de" },
    { label: "Greece", value: "gr" },
    { label: "Hungary", value: "hu" },
    { label: "Ireland", value: "ie" },
    { label: "Italy", value: "it" },
    { label: "Kosovo", value: "xk" },
    { label: "Latvia", value: "lv" },
    { label: "Lithuania", value: "lt" },
    { label: "Luxembourg", value: "lu" },
    { label: "Malta", value: "mt" },
    { label: "Poland", value: "pl" },
    { label: "Portugal", value: "pt" },
    { label: "Romania", value: "ro" },
    { label: "Serbia", value: "rs" },
    { label: "Slovakia", value: "sk" },
    { label: "Slovenia", value: "si" },
    { label: "Spain", value: "es" },
    { label: "Sweden", value: "se" },
    { label: "Armenia", value: "am" },
    { label: "Remote", value: "remote" }
  ];

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm.trim() && searchTerm !== "The Connect Capitals Advantages") {
      params.append('q', searchTerm.trim());
    }
    if (selectedTown !== 'all') {
      params.append('location', selectedTown);
    }
    if (selectedIndustry !== 'all') {
      params.append('category', selectedIndustry);
    }

    const queryString = params.toString();
    router.push(`/buy-a-business${queryString ? `?${queryString}` : ''}`);
  };

  const handleIndustrySelect = (value: string) => {
    setSelectedIndustry(value);
    setIndustryDropdownOpen(false);
  };

  const handleTownSelect = (value: string) => {
    setSelectedTown(value);
    setTownDropdownOpen(false);
  };

  const getSelectedIndustryLabel = () => {
    return industries.find((ind) => ind.value === selectedIndustry)?.label || 'All Online Categories';
  };

  const getSelectedTownLabel = () => {
    const option = geoOptions.find((o) => o.value === selectedTown);
    return option ? option.label : 'All Locations';
  };

  const features = [
  {
    icon: LineChart,
    title: "Professional Valuation",
    description: "We provide objective, market-based valuations of digital businesses, grounded in current buyer demand, financial performance, and growth potential. Pricing is designed to attract qualified buyers and support efficient negotiations.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-bus-c2ddf6ed-20251003151318.jpg"
  },
  {
    icon: Shield,
    title: "Preparation & Presentation",
    description: "We organize financials, KPIs, and operational data into a clear due-diligence package. Each business is presented honestly and professionally, enabling buyers to evaluate opportunities with confidence.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-secure-busine-4171dc8f-20251003151327.jpg"
  },
  {
    icon: Briefcase,
    title: "Brokerage & Closing",
    description: "We source and qualify buyers, manage negotiations, coordinate LOIs, and oversee escrow and transfer. Every step is handled with precision, discretion, and a clear focus on closing.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-expert-busine-40207cd1-20251003151334.jpg"
  }];


    const countriesForRandom = [
      'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
      'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
      'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Poland',
      'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
      'Armenia'
    ];

    const getRandLoc = (id: string) => {
      const index = parseInt(id) % countriesForRandom.length;
      return `${countriesForRandom[index]} / Remote`;
    };

    const featuredListings = [
      {
        id: "1",
        title: "Premium SaaS Platform",
        location: getRandLoc("1"),
        price: "€450,000",
        revenue: "€280,000/year",
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-showin-95d91333-20251003151451.jpg"
      },
      {
        id: "2",
        title: "SEO & Content Analytics Tool (SaaS)",
        location: getRandLoc("2"),
        price: "€520,000",
        revenue: "€340,000/year",
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg"
      },
      {
        id: "3",
        title: "Established E-Commerce Brand",
        location: getRandLoc("3"),
        price: "€320,000",
        revenue: "€450,000/year",
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-e-comm-f2575891-20251002160330.jpg"
      },
      {
        id: "4",
        title: "Digital Marketing Agency",
        location: getRandLoc("4"),
        price: "€580,000",
        revenue: "€720,000/year",
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-expert-busine-40207cd1-20251003151334.jpg"
      }];


  const stats = [
    { 
      icon: TrendingUp, 
      value: null, 
      title: "Fastest Growing",
      subtitle: "Marketplace in EU",
      suffix: "" 
    },
  { 
    icon: Users, 
    value: null, 
    title: "AI Agents Marketplace Designed to Expand Your Business Capabilities",
    subtitle: "",
    suffix: "" 
  },
  { 
    icon: Award, 
    value: 6, 
    title: "Trusted Expertise in Business Structure Analysis",
    subtitle: "",
    suffix: " Years" 
  }];



  const testimonials = [
  {
    name: "Maria Petrova",
    role: "SaaS Founder",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-headshot-portrait-photograp-564721c4-20251003151343.jpg",
    content: "Connect Capitals helped me exit our analytics tool in just 3 months. Great process, serious buyers, smooth closing.",
    rating: 5
  },
  {
    name: "Ivan Georgiev",
    role: "E‑commerce Operator",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-headshot-portrait-photograp-5ebb102c-20251003151351.jpg",
    content: "Found the perfect DTC brand to acquire. Diligence tools and guidance from the team were spot on.",
    rating: 5
  },
  {
    name: "Elena Dimitrova",
    role: "Content Creator",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-headshot-portrait-photograp-6b42cf87-20251003151359.jpg",
    content: "Sold my blog + newsletter package through Connect Capitals and leveled up to a new media project.",
    rating: 5
  }];


  const categoryShowcase = [
  {
    name: "SaaS Businesses",
    slug: "saas",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-showin-95d91333-20251003151451.jpg",
    count: "850+ listings"
  },
  {
    name: "Mobile Apps",
    slug: "mobile-apps",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg",
    count: "480+ listings"
  },
  {
    name: "Marketplaces",
    slug: "marketplaces",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-showin-95d91333-20251003151451.jpg",
    count: "290+ listings"
  },
  {
    name: "E-commerce Stores / Brands",
    slug: "ecommerce",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-e-comm-f2575891-20251002160330.jpg",
    count: "1,200+ listings"
  },
  {
    name: "Digital Agencies",
    slug: "agencies",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-expert-busine-40207cd1-20251003151334.jpg",
    count: "640+ listings"
  },
  {
    name: "Online Media & Blogs",
    slug: "blogs",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-bus-c2ddf6ed-20251003151318.jpg",
    count: "920+ listings"
  },
  {
    name: "Digital Products Businesses",
    slug: "digital-products",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-secure-busine-4171dc8f-20251003151327.jpg",
    count: "580+ listings"
  },
  {
    name: "Dropshipping Businesses",
    slug: "dropshipping",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg",
    count: "320+ listings"
  },
  {
    name: "Fintech / Digital Tools",
    slug: "fintech",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg",
    count: "290+ listings"
  }];


  const successMetrics = [
  { icon: CheckCircle, title: "Structured Evaluation Process", subtitle: "Each business is evaluated through a consistent, data-driven framework tailored to its specific model, risks, and buyer profile." },
    { icon: TrendingUp, title: "AI-Enhanced Business Insights", subtitle: "Advanced analytics provide clear insight into trends, scalability, and potential risks, enabling buyers to proceed with confidence." },
      { icon: Users, title: "Trusted Analysts Approach", subtitle: "We work with buyers and sellers, focusing on clarity and long-term value rather than transaction speed." },
    { icon: Award, title: "Professional Support", subtitle: "Clients work directly with the broker throughout the entire process, without hand-offs or intermediaries." }
  ];



  // Animated stats component
    const AnimatedStat = ({ stat, index }: {stat: typeof stats[0];index: number;}) => {
      return (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: index * 0.2
          }}
          className="flex items-center justify-center gap-4">
          <div>
            <stat.icon className="h-12 w-12 flex-shrink-0" />
          </div>
          <div>
            {stat.value !== null && (
              <div className="text-3xl font-bold">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
            )}
            <div className={`${stat.value !== null ? 'text-base' : 'text-lg'} font-semibold opacity-90 leading-tight`}>
              {stat.title}
            </div>
            {stat.subtitle && (
              <div className="text-sm opacity-80 mt-1">
                {stat.subtitle}
              </div>
            )}
          </div>
        </motion.div>);
    };

  return (
    <main className="bg-sky-50 text-foreground overflow-x-hidden">
      {/* Hero Section with Slideshow Background and Parallax */}
      <section className="relative w-full py-24 md:py-32 z-10">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated flowing gradient background */}
          <motion.div 
            className="absolute inset-0 z-0"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(26, 62, 109, 0.3) 0%, rgba(241, 143, 1, 0.2) 100%)",
                "linear-gradient(135deg, rgba(241, 143, 1, 0.2) 0%, rgba(63, 95, 139, 0.3) 100%)",
                "linear-gradient(135deg, rgba(63, 95, 139, 0.3) 0%, rgba(26, 62, 109, 0.2) 100%)",
                "linear-gradient(135deg, rgba(26, 62, 109, 0.3) 0%, rgba(241, 143, 1, 0.2) 100%)",
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Slideshow Background with Parallax */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
            {slideshowImages.map((image, index) =>
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'}
              }`}>
                <img
                src={image}
                alt={`Industry ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/80 via-[#0B132B]/60 to-[#0B132B]/80"></div>
          </motion.div>
        </div>

        <div className="container relative z-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[40px] font-bold tracking-tight leading-tight md:text-5xl text-white drop-shadow-lg">
            Reach • Connect • Growth
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-2xl mx-auto text-lg text-white/95 md:text-xl font-medium drop-shadow-md !whitespace-pre-line !whitespace-pre-line">


          </motion.p>
          
          {/* Type Selection Tabs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 max-w-xl mx-auto flex justify-center gap-3">

            {(['business', 'ai-agents'] as const).map((type, index) =>
            <motion.button
              key={type}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(241, 143, 1, 0.40)",
                rotateY: 5
              }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                if (type === 'ai-agents') {
                  router.push('/rent-ai-agent');
                } else {
                  router.push('/buy-a-business');
                }
              }}
              className={`px-8 py-4 font-bold rounded-xl transition-all !whitespace-pre-line !text-base !block !shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] !block !shadow-[0_32px_48px_-8px_rgba(0,0,0,0.3),0_16px_24px_-8px_rgba(0,0,0,0.2)] !shadow-[0_32px_48px_-8px_rgba(0,0,0,0.3),0_16px_24px_-8px_rgba(0,0,0,0.2)] !shadow-[0_48px_80px_-16px_rgba(0,0,0,0.4)] !whitespace-pre-line ${
              type === 'ai-agents' ?
              'bg-background text-foreground border-2 border-border hover:border-primary' :
              selectedType === type ?
              'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
              'bg-background text-foreground border-2 border-border hover:border-primary'}`
              }>

                {type === 'business' ? 'Online Business' : <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">AI-Agents</span>}
              </motion.button>
            )}
          </motion.div>

          {/* Location and Industry Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row justify-center gap-4 relative z-[200]">

            <div ref={townDropdownRef} className={`relative w-full sm:w-64 ${townDropdownOpen ? 'z-[300]' : 'z-50'}`}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                type="button"
                onClick={() => setTownDropdownOpen(!townDropdownOpen)}
                className="w-full px-6 py-3 font-semibold rounded-xl bg-background text-foreground border-2 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm flex items-center justify-between backdrop-blur-sm bg-background/90">

                <span>{getSelectedTownLabel()}</span>
                <motion.div
                  animate={{ rotate: townDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}>

                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </motion.button>

              {townDropdownOpen &&
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-lg border-2 border-border rounded-xl shadow-2xl z-[300] max-h-80 overflow-y-auto">

                  {bulgarianTowns.map((town) =>
                <motion.button
                  key={town}
                  whileHover={{ backgroundColor: "rgba(241, 143, 1, 0.10)", x: 4 }}
                  type="button"
                  onClick={() => handleTownSelect(town)}
                  className={`w-full px-6 py-3 text-left font-medium transition-colors ${
                  selectedTown === town.toLowerCase().replace(/\s+/g, '-') ? 'bg-primary/20 text-primary' : 'text-foreground'}`
                  }>

                      {town}
                    </motion.button>
                )}
                </motion.div>
              }
            </div>

            <div ref={industryDropdownRef} className={`relative w-full sm:w-64 ${industryDropdownOpen ? 'z-[400]' : 'z-[100]'}`}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                type="button"
                onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                className="w-full px-6 py-3 font-semibold rounded-xl bg-background text-foreground border-2 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm flex items-center justify-between backdrop-blur-sm bg-background/90">

                <span>{getSelectedIndustryLabel()}</span>
                <motion.div
                  animate={{ rotate: industryDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}>

                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </motion.button>

              {industryDropdownOpen &&
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-lg border-2 border-border rounded-xl shadow-2xl z-[400] max-h-80 overflow-y-auto">

                  {industries.map((industry) =>
                <motion.button
                  key={industry.value}
                  whileHover={{ backgroundColor: "rgba(241, 143, 1, 0.10)", x: 4 }}
                  type="button"
                  onClick={() => handleIndustrySelect(industry.value)}
                  className={`w-full px-6 py-3 text-left font-medium transition-colors ${
                  selectedIndustry === industry.value ? 'bg-primary/20 text-primary' : 'text-foreground'}`
                  }>

                      {industry.label}
                    </motion.button>
                )}
                </motion.div>
              }
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">

            <div className="relative w-full">
              {/* Pulsating search icon */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <Search className="h-6 w-6 text-accent" />
              </motion.div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by keyword, niche, or URL"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-background/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm text-base" />

            </div>
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(241, 143, 1, 0.50)",
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full sm:w-auto h-14 px-10 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/30 whitespace-nowrap">

              Search
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground relative z-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(241, 143, 1, 0.1) 0%, transparent 100%)",
              "linear-gradient(225deg, rgba(241, 143, 1, 0.1) 0%, transparent 100%)",
              "linear-gradient(315deg, rgba(241, 143, 1, 0.1) 0%, transparent 100%)",
              "linear-gradient(45deg, rgba(241, 143, 1, 0.1) 0%, transparent 100%)",
              "linear-gradient(135deg, rgba(241, 143, 1, 0.1) 0%, transparent 100%)",
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) =>
            <AnimatedStat key={index} stat={stat} index={index} />
            )}
          </div>
        </div>
      </section>

      {/* Main Features Section with Scroll Animations */}
      <FeaturesSection features={features} />

      {/* Featured Listings Section */}
      <FeaturedListingsSection listings={featuredListings} />

      {/* Category Showcase */}
      <CategoryShowcaseSection categories={categoryShowcase} />

      {/* Success Metrics */}
      <SuccessMetricsSection metrics={successMetrics} />

      {/* Video Section - How It Works */}
      <VideoSection />

      {/* Success Stories Video */}
      <SuccessStoriesSection />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* CTA Section */}
      <CTASection />

      {/* Browse All Categories */}
      <BrowseCategoriesSection industries={industries} />
      </main>
    );
  };

// Extracted section components with animations
const FeaturesSection = ({ features }: {features: any[];}) => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-sky-50 overflow-hidden relative">
      {/* Flowing gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(241, 143, 1, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(26, 62, 109, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(63, 95, 139, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(241, 143, 1, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, rgba(241, 143, 1, 0.15) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <h2 className="text-3xl font-bold !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line">The Connect Capitals Advantages</h2>
          <p className="mt-3 text-lg !text-[#4c4c4c] !whitespace-pre-line">We are fully dedicated to the valuation, preparation, presentation, and brokerage of digital business assets — including e-commerce stores, SaaS products, digital media properties, mobile applications, and other online enterprises.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, rotateY: -15 }}
            animate={isVisible ? { opacity: 1, y: 0, rotateY: 0 } : {}}
            transition={{ 
              delay: index * 0.2, 
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -15, 
              rotateY: 5,
              rotateX: 5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(241, 143, 1, 0.25)",
              transition: { duration: 0.3 } 
            }}
            className="relative overflow-hidden text-center p-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-border group cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="relative z-10">
                <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center mx-auto h-20 w-20 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">

                  <feature.icon className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

const FeaturedListingsSection = ({ listings }: {listings: any[];}) => {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const router = useRouter();

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Animated grid background */}
      <AnimatedGrid />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-3xl font-bold">Featured Online Businesses For Sale</h2>
          <p className="mt-3 text-muted-foreground text-lg">Explore a selection of top online businesses and digital assets currently on the market.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {listings.map((listing, index) =>
          <motion.div
            key={index}
            onClick={() => router.push(`/listing/${listing.id}`)}
            initial={{ opacity: 0, y: 50, rotateY: -10 }}
            animate={isVisible ? { opacity: 1, y: 0, rotateY: 0 } : {}}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6,
              type: "spring",
              stiffness: 120,
              damping: 15
            }}
            whileHover={{ 
              y: -15,
              rotateY: 3,
              scale: 1.03,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              transition: { 
                type: "spring",
                stiffness: 300,
                damping: 20
              } 
            }}
            className="bg-card/80 backdrop-blur-md border-2 border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col group hover:border-primary cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}>

              <div className="relative bg-accent h-48 overflow-hidden">
                <motion.img
                whileHover={{ scale: 1.15, rotate: 2 }}
                transition={{ duration: 0.4 }}
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
                loading="lazy" />

                <motion.div 
                  className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  Featured
                </motion.div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg leading-snug">{listing.title}</h3>
                <div className="mt-3 flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  <span>{listing.location}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Revenue: <span className="font-semibold text-foreground">{listing.revenue}</span>
                </div>
                <motion.p 
                  className="mt-3 font-bold text-2xl text-primary"
                  whileHover={{ scale: 1.05, color: "#F18F01" }}
                >
                  {listing.price}
                </motion.p>
                <Link
                  href={`/listing/${listing.id}`}
                  className="mt-5 w-full text-center py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Listing
                </Link>
              </div>
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-16">

            <Link
              href="/buy-a-business"
              className="py-4 px-10 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/30 inline-block">

              View All Online Businesses
            </Link>
        </motion.div>
      </div>
    </section>);

};

const CategoryShowcaseSection = ({ categories }: {categories: any[];}) => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-sky-50 overflow-hidden relative">
      {/* Floating particles */}
      <FloatingParticles count={20} />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-3xl font-bold">Browse Online Categories</h2>
          <p className="mt-3 text-muted-foreground text-lg">Discover opportunities in digital niches you're passionate about.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) =>
          <Link
            key={index}
            href={`/buy-a-business?category=${category.slug}`}
            className="block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={isVisible ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.08, 
                rotateY: 5,
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                transition: { 
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                } 
              }}
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all group h-64 flex items-end cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}>

              <motion.img
                whileHover={{ scale: 1.15, rotate: 1 }}
                transition={{ duration: 0.5 }}
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all"></div>
              <div className="relative z-10 p-6 w-full backdrop-blur-sm bg-black/20 group-hover:bg-black/30 transition-all">
                <motion.h3 
                  className="text-2xl font-bold text-white mb-2"
                  whileHover={{ x: 5 }}
                >
                  {category.name}
                </motion.h3>
                <p className="text-white/90 text-sm font-medium flex items-center">
                  {category.count}
                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.3 }}>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </p>
              </div>
            </motion.div>
          </Link>
          )}
        </div>
      </div>
    </section>);

};

const SuccessMetricsSection = ({ metrics }: {metrics: any[];}) => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
              "linear-gradient(225deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
              "linear-gradient(315deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
              "linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-3xl font-bold">Built on Expertise, Driven by Innovation</h2>
          <p className="mt-3 opacity-90 text-lg">Our approach is rooted in precision, strategy, and measurable business value.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, rotateX: -45 }}
            animate={isVisible ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ 
              delay: index * 0.15, 
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -12, 
              scale: 1.08,
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
              transition: { 
                type: "spring",
                stiffness: 300,
                damping: 15
              } 
            }}
            className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}>

              <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              whileHover={{ 
                rotate: 0,
                scale: 1.2,
                transition: { duration: 0.3 }
              }}>

                <metric.icon className="h-12 w-12 mx-auto mb-4" />
              </motion.div>
              <div className="text-xl font-bold mb-2 leading-tight">{metric.title}</div>
              <div className="text-sm opacity-90 leading-relaxed">{metric.subtitle}</div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

const VideoSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-sky-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground text-lg">Learn how Connect Capitals makes buying and selling online businesses simple.</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
            animate={isVisible ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ 
              scale: 1.02,
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
            className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-accent group">

            <video
              controls
              className="w-full h-full object-cover"
              poster="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-showin-95d91333-20251003151451.jpg">

              <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_videos/clean-animated-explainer-video-showing-h-5d39c628-20251002160308.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Play className="h-20 w-20 text:white" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>);

};

const SuccessStoriesSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-sky-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold !text-[#2a2a2a]">Success Stories</h2>
            <p className="mt-3 text-lg !font-thin !text-[#2a2a2a]">Real people, real online businesses, real success.</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={isVisible ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ 
              scale: 1.02,
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
            className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-accent">

            <video
              controls
              className="w-full h-full object-cover">

              <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_videos/professional-business-success-story-mont-8430a8cd-20251003151533.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>
      </div>
    </section>);

};

const TestimonialsSection = ({ testimonials }: {testimonials: any[];}) => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-sky-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-3xl font-bold">What Our Clients Say</h2>
          <p className="mt-3 text-muted-foreground text-lg">Join thousands of satisfied buyers and sellers.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) =>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, rotateX: -30 }}
            animate={isVisible ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ 
              delay: index * 0.2, 
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -12, 
              scale: 1.03,
              rotateZ: 1,
              boxShadow: "0 25px 50px -12px rgba(241, 143, 1, 0.2)",
              backgroundColor: "rgba(241, 143, 1, 0.05)",
              transition: { 
                type: "spring",
                stiffness: 300,
                damping: 15
              } 
            }}
            className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}>

              <div className="flex items-center gap-4 mb-6">
                <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                src={testimonial.image}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                loading="lazy" />

                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) =>
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.2 + i * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.3, rotate: 360 }}>

                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </motion.div>
              )}
              </div>
              <p className="text-foreground/80 leading-relaxed">{testimonial.content}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};

const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-photograph-of-modern-tech-s-02adfc0d-20251003151414.jpg"
          alt="Digital workspace"
          className="w-full h-full object-cover"
          loading="lazy" />
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(to right, rgba(26, 62, 109, 0.95), rgba(63, 95, 139, 0.85))",
              "linear-gradient(to right, rgba(63, 95, 139, 0.90), rgba(26, 62, 109, 0.90))",
              "linear-gradient(to right, rgba(26, 62, 109, 0.95), rgba(63, 95, 139, 0.85))",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="container relative z-10 text-center text:white">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-6 !text-white">

          Ready to Start Your Journey?
        </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl mb-10 max-w-2xl mx-auto opacity-95 !text-white">

            If you are considering the purchase of an online business or preparing one for sale, we are available for a confidential, straightforward discussion.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">

            <a
              href="/reach-us"
              className="px-10 py-4 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all shadow-xl inline-block">

              Speak with an Advisor
            </a>
          </motion.div>
      </div>
    </section>);

};

const BrowseCategoriesSection = ({ industries }: {industries: any[];}) => {
  const { ref, isVisible = true } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-20 bg-sky-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">

          <h2 className="text-3xl font-bold">Explore Online Categories</h2>
          <p className="mt-3 text-muted-foreground text-lg">Find the perfect online business in any niche.</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {industries.slice(1).map((industry, index) =>
          <Link
            key={industry.value}
            href={`/buy-a-business?category=${industry.value}`}
            className="block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateZ: -10 }}
              animate={isVisible ? { opacity: 1, scale: 1, rotateZ: 0 } : {}}
              transition={{ 
                delay: index * 0.05, 
                duration: 0.4,
                type: "spring",
                stiffness: 150
              }}
              whileHover={{
                scale: 1.08,
                backgroundColor: "#F18F01",
                color: "#ffffff",
                borderColor: "#F18F01",
                boxShadow: "0 10px 25px -5px rgba(241, 143, 1, 0.40)",
                y: -5,
                rotateZ: 2,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }
              }}
              className="p-6 bg-background/80 backdrop-blur-sm border-2 border-border rounded-xl text-center font-bold text-primary transition-all shadow-sm">

              {industry.label}
            </motion.div>
          </Link>
          )}
        </div>
      </div>
    </section>);

};

export default HomepageContent;