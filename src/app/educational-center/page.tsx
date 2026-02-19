"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { BookOpen, Video, FileText, Users, Award, TrendingUp, BarChart, Settings, Download, ExternalLink, ArrowRight, ArrowLeft, X, ChevronUp, ChevronDown, Check, Clock, Sparkles, File, Table, Wrench, Target, Zap, Rocket, Shield, MapPin, Phone, Mail, MessageSquare, Linkedin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { toast } from 'sonner';

type ResourceStatus = 'available' | 'new' | 'updated';
type FileType = 'PDF' | 'XLSX' | 'DOCX' | 'Tool';
type SortKey = 'dateModified' | 'title' | 'fileType' | 'size';
type SortOrder = 'asc' | 'desc';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'spreadsheet' | 'tool';
  cta: string;
  status: ResourceStatus;
  dateModified: string;
  fileType: FileType;
  size: string;
}

const FREE_RESOURCES: Resource[] = [
  { id: 1, title: "Business Buyer's Guide", description: "Complete 50-page guide covering search to closing.", type: "document", cta: "Download", status: "available", dateModified: "2025-01-10", fileType: "PDF", size: "2.4 MB" },
  { id: 2, title: "Seller's Preparation Checklist", description: "Maximize your selling price with this checklist.", type: "document", cta: "Download", status: "new", dateModified: "2025-01-15", fileType: "PDF", size: "1.1 MB" },
  { id: 3, title: "Due Diligence Template", description: "Professional checklist used by top M&A advisors.", type: "spreadsheet", cta: "Download", status: "updated", dateModified: "2025-01-12", fileType: "XLSX", size: "890 KB" },
  { id: 4, title: "Valuation Calculator", description: "Excel tool with multiple valuation methodologies.", type: "tool", cta: "Open", status: "available", dateModified: "2024-12-20", fileType: "Tool", size: "— " },
  { id: 5, title: "SaaS Metrics Tracker", description: "Essential dashboard for tracking churn and LTV.", type: "spreadsheet", cta: "Download", status: "new", dateModified: "2025-01-14", fileType: "XLSX", size: "1.3 MB" },
  { id: 6, title: "NDA Template", description: "Standard confidentiality agreement for deals.", type: "document", cta: "Download", status: "available", dateModified: "2024-11-05", fileType: "DOCX", size: "245 KB" },
  { id: 7, title: "LOI Framework", description: "Structure your offer with this professional LOI.", type: "document", cta: "Download", status: "available", dateModified: "2024-10-18", fileType: "PDF", size: "580 KB" },
  { id: 8, title: "Market Analysis Tool", description: "Compare your business against industry benchmarks.", type: "tool", cta: "Open", status: "updated", dateModified: "2025-01-08", fileType: "Tool", size: "— " },
  { id: 9, title: "P&L Statement Builder", description: "Create professional financials for your business.", type: "spreadsheet", cta: "Download", status: "available", dateModified: "2024-09-22", fileType: "XLSX", size: "720 KB" },
  { id: 10, title: "Asset Transfer List", description: "Ensure no asset is left behind during transition.", type: "document", cta: "Download", status: "available", dateModified: "2024-08-30", fileType: "PDF", size: "390 KB" },
  { id: 11, title: "Growth Strategy Map", description: "Visualize your path to the next revenue milestone.", type: "document", cta: "Download", status: "new", dateModified: "2025-01-13", fileType: "PDF", size: "1.8 MB" },
  { id: 12, title: "Unit Economics Calculator", description: "Analyze profitability per customer or order.", type: "spreadsheet", cta: "Download", status: "available", dateModified: "2024-12-01", fileType: "XLSX", size: "650 KB" },
  { id: 13, title: "Integration Checklist", description: "Post-merger integration best practices.", type: "document", cta: "Download", status: "available", dateModified: "2024-11-15", fileType: "PDF", size: "920 KB" },
  { id: 14, title: "Cash Flow Forecast", description: "Predict future liquidity with this simple tool.", type: "spreadsheet", cta: "Download", status: "updated", dateModified: "2025-01-05", fileType: "XLSX", size: "480 KB" },
  { id: 15, title: "Deal Sourcing Log", description: "Track your pipeline of potential acquisitions.", type: "spreadsheet", cta: "Download", status: "available", dateModified: "2024-10-10", fileType: "XLSX", size: "310 KB" },
  { id: 16, title: "Risk Assessment Matrix", description: "Identify and mitigate business vulnerabilities.", type: "tool", cta: "Open", status: "available", dateModified: "2024-09-05", fileType: "Tool", size: "— " },
  { id: 17, title: "Competitive Analysis Template", description: "Template for mapping out your market landscape.", type: "document", cta: "Download", status: "available", dateModified: "2024-08-20", fileType: "PDF", size: "1.2 MB" },
  { id: 18, title: "Churn Prediction Tool", description: "Simple calculator for subscription businesses.", type: "tool", cta: "Open", status: "new", dateModified: "2025-01-11", fileType: "Tool", size: "— " },
  { id: 19, title: "Email Outreach Guide", description: "Templates for reaching out to business owners.", type: "document", cta: "Download", status: "available", dateModified: "2024-07-15", fileType: "PDF", size: "680 KB" },
  { id: 20, title: "Inventory Management Sheet", description: "Optimize stock levels for e-commerce brands.", type: "spreadsheet", cta: "Download", status: "available", dateModified: "2024-06-28", fileType: "XLSX", size: "540 KB" },
  { id: 21, title: "Brand Identity Audit", description: "Evaluate your brand strength and positioning.", type: "document", cta: "Download", status: "available", dateModified: "2024-05-10", fileType: "PDF", size: "2.1 MB" },
  { id: 22, title: "Customer Survey Kit", description: "Get actionable feedback from your users.", type: "tool", cta: "Open", status: "available", dateModified: "2024-04-22", fileType: "Tool", size: "— " },
  { id: 23, title: "Marketing ROI Calculator", description: "Track the performance of your ad spend.", type: "spreadsheet", cta: "Download", status: "updated", dateModified: "2025-01-02", fileType: "XLSX", size: "420 KB" },
  { id: 24, title: "SEO Health Check", description: "Quick diagnostic tool for organic search.", type: "tool", cta: "Open", status: "available", dateModified: "2024-03-15", fileType: "Tool", size: "— " },
  { id: 25, title: "Hiring Scorecard", description: "Standardized system for evaluating candidates.", type: "document", cta: "Download", status: "available", dateModified: "2024-02-28", fileType: "PDF", size: "350 KB" },
  { id: 26, title: "Partnership Agreement", description: "Legal framework for joint ventures.", type: "document", cta: "Download", status: "available", dateModified: "2024-01-20", fileType: "DOCX", size: "290 KB" },
  { id: 27, title: "Tech Stack Audit", description: "Inventory and optimize your software costs.", type: "spreadsheet", cta: "Download", status: "available", dateModified: "2023-12-10", fileType: "XLSX", size: "380 KB" },
  { id: 28, title: "Sales Script Library", description: "Proven scripts for high-ticket closing.", type: "document", cta: "Download", status: "available", dateModified: "2023-11-05", fileType: "PDF", size: "1.5 MB" },
  { id: 29, title: "Social Media Planner", description: "Content calendar for multi-channel growth.", type: "spreadsheet", cta: "Download", status: "available", dateModified: "2023-10-18", fileType: "XLSX", size: "620 KB" },
  { id: 30, title: "Exit Readiness Quiz", description: "Self-assessment to see if you're ready to sell.", type: "tool", cta: "Open", status: "available", dateModified: "2023-09-22", fileType: "Tool", size: "— " }
];

const getResourceIcon = (type: Resource['type']) => {
  switch (type) {
    case 'document': return File;
    case 'spreadsheet': return Table;
    case 'tool': return Wrench;
    default: return FileText;
  }
};

const getStatusBadge = (status: ResourceStatus) => {
  switch (status) {
    case 'new':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><Sparkles className="w-3 h-3" />New</span>;
    case 'updated':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20"><Clock className="w-3 h-3" />Updated</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20"><Check className="w-3 h-3" /></span>;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function EducationalCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAllResources, setShowAllResources] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || 'User',
          email: formData.email,
          message: formData.message,
          interestType: 'education'
        }),
      });
      if (response.ok) {
        toast.success('Your message has been sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroRef = useScrollAnimation();
  
  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'buyer', label: 'Buyer Fundamentals' },
    { id: 'seller', label: 'Seller Masterclass' },
    { id: 'online-growth', label: 'Online Business Growth' },
    { id: 'valuation', label: 'Valuation & Analysis' },
    { id: 'legal', label: 'Legal & Contracts' }
  ];

    const courses = [
      { id: 1, category: 'buyer', title: 'Business Buyer Fundamentals', level: 'Beginner', weeks: 8, lessons: 40, thumbnail: '📚', price: 'Free' },
      { id: 2, category: 'seller', title: 'Business Seller Masterclass', level: 'Intermediate', weeks: 10, lessons: 55, thumbnail: '📊', price: '€299' },
      { id: 3, category: 'online-growth', title: 'Online Business Growth Program (SaaS, E‑com, Media)', level: 'Advanced', weeks: 12, lessons: 65, thumbnail: '🚀', price: '€499' },
      { id: 4, category: 'valuation', title: 'Business Valuation Mastery', level: 'Intermediate', weeks: 6, lessons: 30, thumbnail: '💰', price: '€199' },
      { id: 5, category: 'legal', title: 'Legal Essentials for M&A', level: 'Beginner', weeks: 4, lessons: 20, thumbnail: '⚖️', price: '€149' },
      { id: 6, category: 'buyer', title: 'Due Diligence Deep Dive', level: 'Advanced', weeks: 8, lessons: 45, thumbnail: '🔍', price: '€349' }
    ];

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animation */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 overflow-hidden"
      >
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
            >
              📚 Learn & Grow
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Business Education Center
            </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  This is Europe’s first Verified Business Educational Center.<br />
                  It exists for one reason: to elevate how you think, decide, and perform across any niche.<br />
                  Whether you are a serious operator, a specialist, or an entrepreneur, the mission is the same: to turn you into a sharper, faster, and more effective operator.
                </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#courses" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg">
                Browse Courses
              </Link>
              <Link href="#resources" className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all">
                Free Resources
              </Link>
            </div>
          </div>
        </div>
      </motion.section>



      {/* Category Filters with Animation */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-foreground border border-border hover:border-primary'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Course Cards with Thumbnail Animations */}
      <section id="courses" className="py-20">
        <div className="container">
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg group"
              >
                {/* Animated Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  <motion.div
                    className="text-8xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {course.thumbnail}
                  </motion.div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    {course.level}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <span>⏱️ {course.weeks} weeks</span>
                      <span>•</span>
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div>🎓 Certificate included</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{course.price}</span>
                      <Link href="/educational-center/enroll">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all"
                        >
                          Enroll Now
                        </motion.button>
                      </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



        {/* Free Resources Redesigned */}
        <section id="resources" className="py-24 bg-slate-50/50 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Free Resource Library</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                A curated collection of professional tools, guides, and templates designed to accelerate your business journey.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <motion.div 
                layout
                className="flex flex-col gap-2 mt-2"
              >
                <AnimatePresence mode="popLayout">
                  {FREE_RESOURCES.slice(0, 5).map((resource, idx) => {
                    const IconComponent = getResourceIcon(resource.type);
                    return (
                      <motion.div
                        key={resource.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className="group bg-white border border-slate-200 rounded-xl p-3 md:p-4 hover:border-primary/40 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="flex flex-col lg:grid lg:grid-cols-[2.5fr_1fr_1fr_auto] items-center gap-4">
                          {/* Name & Icon */}
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                                {resource.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 truncate max-w-[350px]">
                                {resource.description}
                              </p>
                            </div>
                          </div>

                          {/* Status - Desktop Only */}
                          <div className="hidden lg:block">
                            {getStatusBadge(resource.status)}
                          </div>

                          {/* Type & Size - Desktop Only */}
                          <div className="hidden lg:flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{resource.fileType}</span>
                            <span className="text-[10px] text-slate-400">{resource.size}</span>
                          </div>

                          {/* Mobile Metadata Layout */}
                          <div className="flex lg:hidden items-center justify-between w-full px-2 py-2.5 bg-slate-50 rounded-lg text-[10px] border border-slate-100">
                            <div className="flex gap-4">
                              {getStatusBadge(resource.status)}
                            </div>
                            <span className="font-bold text-slate-700">{resource.fileType} • {resource.size}</span>
                          </div>

                          {/* Action */}
                          <div className="w-full lg:w-auto flex justify-end">
                            <Link 
                              href="#" 
                              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                            >
                              {resource.cta}
                              <Download className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="mt-14 text-center">
              <button
                onClick={() => setShowAllResources(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-primary font-medium transition-all group border border-slate-200 rounded-lg hover:border-primary/30 bg-white hover:bg-primary/5"
              >
                View all free resources
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Full Resource Library Modal */}
        <AnimatePresence>
          {showAllResources && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8"
              onClick={() => setShowAllResources(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Full Resource Library</h2>
                      <p className="text-sm text-slate-500 mt-1">{FREE_RESOURCES.length} professional resources available</p>
                    </div>
                    <button
                      onClick={() => setShowAllResources(false)}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                          <th className="text-right px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {FREE_RESOURCES.map((resource) => {
                          const IconComponent = getResourceIcon(resource.type);
                          return (
                            <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <IconComponent className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900 text-sm">{resource.title}</div>
                                    <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{resource.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">{getStatusBadge(resource.status)}</td>
                              <td className="px-4 py-4">
                                <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600">{resource.fileType}</span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-500">{resource.size}</td>
                              <td className="px-8 py-4 text-right">
                                <Link
                                  href="#"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                  {resource.cta}
                                  <Download className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Showing {FREE_RESOURCES.length} of {FREE_RESOURCES.length} resources</p>
                  <button
                    onClick={() => setShowAllResources(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Library
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Webinars & Events */}
      <section className="py-20 bg-secondary/30 relative overflow-hidden">
        <div className="container relative z-10 filter blur-sm select-none pointer-events-none opacity-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Webinars & Events</h2>
            <p className="text-lg text-muted-foreground">Live sessions with industry experts and successful entrepreneurs</p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row gap-6">
              <div className="md:w-48 shrink-0">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-primary">LIVE WEBINAR</div>
                  <div className="text-lg font-bold mt-2">Nov 15, 2025</div>
                  <div className="text-sm text-muted-foreground">2:00 PM EST</div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Mastering Business Valuations: Methods & Best Practices</h3>
                <p className="text-muted-foreground mb-4">Learn proven valuation techniques from certified business appraisers. Includes Q&A session.</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">👤 250 spots left</span>
                  <Link href="#" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all">
                    Register Free
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row gap-6">
              <div className="md:w-48 shrink-0">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-primary">WORKSHOP</div>
                  <div className="text-lg font-bold mt-2">Nov 22, 2025</div>
                  <div className="text-sm text-muted-foreground">10:00 AM EST</div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">SaaS & E‑commerce Growth Workshop: Scale Online</h3>
                <p className="text-muted-foreground mb-4">A full‑day intensive on scaling online businesses. Hands‑on playbooks for traffic, conversion, retention, and monetization.</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">👤 Limited to 50 attendees</span>
                    <Link href="#" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all">
                      €299 Register
                    </Link>
                  </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row gap-6">
              <div className="md:w-48 shrink-0">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-primary">LIVE WEBINAR</div>
                  <div className="text-lg font-bold mt-2">Dec 5, 2025</div>
                  <div className="text-sm text-muted-foreground">3:00 PM EST</div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Due Diligence Deep Dive: Uncover Hidden Risks</h3>
                <p className="text-muted-foreground mb-4">Expert panel discusses red flags, investigation techniques, and risk mitigation strategies.</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">👤 300 spots left</span>
                  <Link href="#" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all">
                    Register Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-background/40 backdrop-blur-xl border border-white/20 p-10 md:p-16 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-center max-w-lg w-full relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary/20">
                <Clock className="w-3.5 h-3.5" />
                Launching Soon
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-primary via-primary/90 to-primary/40 leading-none">
                COMING<br />SOON
              </h2>
              <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                We are curating high-impact events with global industry leaders.
                Registration opens soon.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 relative overflow-hidden">
        <div className="container relative z-10 filter blur-sm select-none pointer-events-none opacity-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Success Stories</h2>
            <p className="text-lg text-muted-foreground">Real results from our educational programs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="text-primary font-bold text-3xl mb-2">$2.5M</div>
              <div className="text-sm text-muted-foreground mb-4">First Online Asset Acquired</div>
              <p className="text-muted-foreground mb-4">"The courses gave me confidence to acquire my first content site. Worth every penny!"</p>
              <div className="font-semibold">— John Martinez</div>
              <div className="text-sm text-muted-foreground">Content Site Operator</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="text-primary font-bold text-3xl mb-2">$1.8M</div>
              <div className="text-sm text-muted-foreground mb-4">Business Sold Above Market</div>
              <p className="text-muted-foreground mb-4">"The seller masterclass helped me sell 40% above initial valuation."</p>
              <div className="font-semibold">— Sarah Chen</div>
              <div className="text-sm text-muted-foreground">Tech Entrepreneur</div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="text-primary font-bold text-3xl mb-2">12</div>
              <div className="text-sm text-muted-foreground mb-4">Micro‑SaaS Exits</div>
              <p className="text-muted-foreground mb-4">"The growth program was instrumental in optimizing metrics and preparing for successful micro‑SaaS exits."
              </p>
              <div className="font-semibold">— Mike Thompson</div>
              <div className="text-sm text-muted-foreground">SaaS Founder</div>
            </div>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-background/40 backdrop-blur-xl border border-white/20 p-10 md:p-16 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-center max-w-lg w-full relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Content
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-primary via-primary/90 to-primary/40 leading-none">
                COMING<br />SOON
              </h2>
              <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                We are gathering real success stories from our recent graduates.
                Stay tuned for inspiring transformations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Certified Program & Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-primary via-blue-600 to-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left: Program CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">
                <Award className="w-4 h-4" />
                Certified Program
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Unlock Your Potential with Our <span className="text-blue-200">Certified Experts</span> Program
              </h2>
              <p className="text-xl text-white/80 leading-relaxed max-w-xl">
                Join Europe's most rigorous business education program. Gain recognized certification, master the nuances of M&A, and join an elite network of high-performing operators and investors.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Official industry-recognized certification",
                  "Exclusive access to private deal flow",
                  "1-on-1 mentorship with senior advisors",
                  "Lifetime access to advanced operator tools"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary bg-slate-200 flex items-center justify-center text-primary font-bold overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold">500+ Graduates</div>
                  <div className="text-white/60">Across 15 countries</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-slate-900 relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MessageSquare className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Contact with Us</h3>
                <p className="text-slate-500 mb-8">Ready to take the next step? Our program advisors are here to help you choose the right path.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">How can we help?</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      placeholder="Tell us about your background and goals..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-slate-900"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Enroll or Ask Questions
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6 justify-between items-center">
                    <div className="flex gap-4">
                      <a href="https://www.linkedin.com/in/connect-capitals-41544339b/" target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href="https://www.instagram.com/connect_capitals?igsh=MWRscXBwN2c1aXZ0Zg==" target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a href="https://www.facebook.com/share/1C2nWre8yE/" target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                        <Facebook className="w-5 h-5" />
                      </a>
                    </div>
                  <div className="text-sm text-slate-400">
                    Response time: <span className="font-bold text-slate-600">Under 24h</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    );
  }
