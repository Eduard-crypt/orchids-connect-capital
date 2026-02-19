"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Play, CheckCircle, Clock, BookOpen, Award, Lock, ChevronDown, ChevronUp, Download } from 'lucide-react';
import Link from 'next/link';

export default function CoursePage() {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');

  const courseData = {
    title: 'Business Buyer Fundamentals',
    subtitle: 'Master the complete process of buying and operating online businesses',
    level: 'Beginner',
    rating: 4.8,
    students: 12453,
    duration: '8 weeks',
    lessons: 40,
    price: '€199',
    instructor: {
      name: 'Michael Roberts',
      title: 'M&A Expert & Serial Entrepreneur',
      bio: 'Over 15 years of experience in business acquisitions with $50M+ in transactions. Former investment banker turned entrepreneur.',
      avatar: '👨‍💼'
    },
    chapters: [
      {
        id: 1,
        title: 'Introduction to Business Buying',
        duration: '45 min',
        lessons: [
          { id: 1, title: 'Why Buy an Existing Business?', duration: '8:32', type: 'video', locked: false },
          { id: 2, title: 'Types of Online Businesses', duration: '12:15', type: 'video', locked: false },
          { id: 3, title: 'Your Buyer Profile Assessment', duration: '15:20', type: 'video', locked: false },
          { id: 4, title: 'Setting Your Budget & Goals', duration: '9:45', type: 'video', locked: false }
        ]
      },
      {
        id: 2,
        title: 'Finding the Right Business',
        duration: '1.5 hrs',
        lessons: [
          { id: 5, title: 'Where to Find Businesses for Sale', duration: '10:22', type: 'video', locked: true },
          { id: 6, title: 'Analyzing Business Listings', duration: '18:40', type: 'video', locked: true },
          { id: 7, title: 'Red Flags to Watch For', duration: '14:30', type: 'video', locked: true },
          { id: 8, title: 'Creating Your Watchlist', duration: '8:15', type: 'video', locked: true },
          { id: 9, title: 'Initial Outreach Templates', duration: '12:00', type: 'pdf', locked: true }
        ]
      },
      {
        id: 3,
        title: 'Business Valuation Basics',
        duration: '2 hrs',
        lessons: [
          { id: 10, title: 'Understanding Business Metrics', duration: '16:45', type: 'video', locked: true },
          { id: 11, title: 'Revenue vs Profit Analysis', duration: '13:20', type: 'video', locked: true },
          { id: 12, title: 'Multiple-Based Valuation', duration: '19:30', type: 'video', locked: true },
          { id: 13, title: 'SaaS Valuation Special Topics', duration: '22:15', type: 'video', locked: true },
          { id: 14, title: 'E-commerce Valuation Methods', duration: '18:40', type: 'video', locked: true },
          { id: 15, title: 'Valuation Calculator Tool', duration: '15 min', type: 'tool', locked: true }
        ]
      },
      {
        id: 4,
        title: 'Due Diligence Process',
        duration: '2.5 hrs',
        lessons: [
          { id: 16, title: 'Due Diligence Checklist Overview', duration: '12:30', type: 'video', locked: true },
          { id: 17, title: 'Financial Due Diligence', duration: '25:45', type: 'video', locked: true },
          { id: 18, title: 'Technical Due Diligence', duration: '20:15', type: 'video', locked: true },
          { id: 19, title: 'Legal & Compliance Review', duration: '18:30', type: 'video', locked: true },
          { id: 20, title: 'Operational Due Diligence', duration: '22:00', type: 'video', locked: true },
          { id: 21, title: 'Due Diligence Template Pack', duration: '30 min', type: 'pdf', locked: true }
        ]
      },
      {
        id: 5,
        title: 'Negotiation & Deal Structure',
        duration: '1.8 hrs',
        lessons: [
          { id: 22, title: 'Making Your First Offer', duration: '14:20', type: 'video', locked: true },
          { id: 23, title: 'Negotiation Psychology', duration: '16:45', type: 'video', locked: true },
          { id: 24, title: 'Asset vs Stock Purchase', duration: '12:30', type: 'video', locked: true },
          { id: 25, title: 'Earnouts & Seller Financing', duration: '18:15', type: 'video', locked: true },
          { id: 26, title: 'LOI & Purchase Agreement Basics', duration: '20:30', type: 'video', locked: true }
        ]
      },
      {
        id: 6,
        title: 'Financing Your Acquisition',
        duration: '1.2 hrs',
        lessons: [
          { id: 27, title: 'Self-Funding Strategies', duration: '11:20', type: 'video', locked: true },
          { id: 28, title: 'SBA Loans for Business Buyers', duration: '19:40', type: 'video', locked: true },
          { id: 29, title: 'Investor & Partner Funding', duration: '15:30', type: 'video', locked: true },
          { id: 30, title: 'Seller Financing Deep Dive', duration: '14:50', type: 'video', locked: true }
        ]
      },
      {
        id: 7,
        title: 'Closing the Deal',
        duration: '1.5 hrs',
        lessons: [
          { id: 31, title: 'Escrow Process Explained', duration: '13:25', type: 'video', locked: true },
          { id: 32, title: 'Final Inspections & Walkthrough', duration: '16:30', type: 'video', locked: true },
          { id: 33, title: 'Asset Transfer Checklist', duration: '12:15', type: 'video', locked: true },
          { id: 34, title: 'Working with Brokers & Lawyers', duration: '18:40', type: 'video', locked: true },
          { id: 35, title: 'Closing Day Checklist', duration: '10:00', type: 'pdf', locked: true }
        ]
      },
      {
        id: 8,
        title: 'Post-Acquisition Success',
        duration: '2 hrs',
        lessons: [
          { id: 36, title: 'First 30 Days Action Plan', duration: '17:30', type: 'video', locked: true },
          { id: 37, title: 'Team & Vendor Transitions', duration: '14:45', type: 'video', locked: true },
          { id: 38, title: 'Operational Improvements', duration: '20:15', type: 'video', locked: true },
          { id: 39, title: 'Growth & Scaling Strategies', duration: '22:30', type: 'video', locked: true },
          { id: 40, title: 'Case Study: Complete Acquisition', duration: '25:00', type: 'video', locked: true }
        ]
      }
    ]
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'pdf': return <Download className="w-4 h-4" />;
      case 'tool': return <BookOpen className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12"
      >
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <Link href="/educational-center" className="text-primary hover:underline mb-4 inline-block">
              ← Back to Courses
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4"
                >
                  {courseData.level}
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4">{courseData.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">{courseData.subtitle}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="font-semibold">{courseData.rating}</span>
                    <span className="text-muted-foreground">({courseData.students.toLocaleString()} students)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{courseData.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    <span>{courseData.lessons} lessons</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-card border-2 border-border rounded-2xl p-6 shadow-xl sticky top-24"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-6 flex items-center justify-center">
                    <Play className="w-16 h-16 text-primary" />
                  </div>

                  <div className="text-4xl font-bold text-primary mb-6">{courseData.price}</div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg mb-4"
                  >
                    Enroll Now
                  </motion.button>

                  <div className="text-center text-sm text-muted-foreground mb-4">
                    30-day money-back guarantee
                  </div>

                  <div className="space-y-3 text-sm border-t border-border pt-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span>Community access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span>Expert Q&A support</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-4 border-b border-border mb-8">
              {(['overview', 'curriculum', 'instructor'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-3 font-semibold capitalize transition-all ${
                    selectedTab === tab
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-4">What You'll Learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Identify and evaluate profitable online businesses',
                      'Perform comprehensive due diligence',
                      'Master business valuation techniques',
                      'Negotiate favorable deal terms',
                      'Structure financing and payment terms',
                      'Navigate legal and compliance requirements',
                      'Execute smooth asset transfers',
                      'Implement post-acquisition strategies'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">Course Description</h2>
                  <div className="prose max-w-none text-muted-foreground space-y-4">
                    <p>
                      This comprehensive course takes you through every step of buying an online business, from initial research to successful acquisition and beyond. Whether you're looking to purchase a SaaS product, e-commerce store, content site, or digital agency, this course provides the framework and tools you need.
                    </p>
                    <p>
                      Learn from real-world case studies, downloadable templates, and proven methodologies used by professional business buyers and M&A advisors. By the end of this course, you'll have the confidence and knowledge to identify, evaluate, negotiate, and close your first business acquisition.
                    </p>
                    <p>
                      The course includes practical exercises, valuation calculators, due diligence checklists, and contract templates that you can use immediately in your acquisition journey.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">Who This Course Is For</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Aspiring entrepreneurs seeking profitable businesses',
                      'Investors looking for alternative assets',
                      'Business professionals wanting to become owners',
                      'Freelancers ready to scale their income',
                      'Corporate employees exploring entrepreneurship',
                      'Anyone interested in online business acquisitions'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                        <span className="text-primary text-xl shrink-0">→</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'curriculum' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl font-bold mb-6">Course Curriculum</h2>
                <div className="space-y-4">
                  {courseData.chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                            {chapter.id}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-lg">{chapter.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {chapter.lessons.length} lessons • {chapter.duration}
                            </p>
                          </div>
                        </div>
                        {expandedChapter === chapter.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {expandedChapter === chapter.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-4 space-y-2">
                            {chapter.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 hover:bg-secondary/30 rounded-lg transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-primary">{getIconForType(lesson.type)}</div>
                                  <span className={lesson.locked ? 'text-muted-foreground' : ''}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                                  {lesson.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'instructor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl font-bold mb-6">Your Instructor</h2>
                <div className="bg-card border border-border rounded-2xl p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-5xl shrink-0">
                      {courseData.instructor.avatar}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{courseData.instructor.name}</h3>
                      <p className="text-primary font-semibold mb-4">{courseData.instructor.title}</p>
                      <p className="text-muted-foreground">{courseData.instructor.bio}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">15+</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">$50M+</div>
                      <div className="text-sm text-muted-foreground">Deals Closed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">25K+</div>
                      <div className="text-sm text-muted-foreground">Students Taught</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of successful business buyers and take the first step toward owning a profitable online business
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl"
            >
              Enroll Now for {courseData.price}
            </motion.button>
            <p className="text-sm mt-4 opacity-75">30-day money-back guarantee • Lifetime access</p>
          </div>
        </div>
      </section>
    </div>
  );
}
