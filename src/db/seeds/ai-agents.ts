import { db } from '..';
import { aiAgents } from '../schema';

const agents = [
  {
    name: "ChatGPT Pro Assistant",
    description: "Advanced conversational AI powered by OpenAI's GPT-4. Perfect for customer interactions, content creation, and intelligent automation.",
    startingPrice: "$199/month",
    features: JSON.stringify(["GPT-4 Powered", "Context Memory", "Multi-language Support", "API Integration"]),
    category: "conversational-ai",
    badge: "Most Popular",
    iconName: "MessageSquare",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-cha-448a8680-20251031191104.jpg"
  },
  {
    name: "Claude Enterprise Agent",
    description: "Anthropic's Claude AI for complex reasoning, analysis, and ethical decision-making. Ideal for research and strategic planning.",
    startingPrice: "$179/month",
    features: JSON.stringify(["Advanced Reasoning", "Document Analysis", "Code Generation", "Safety Focused"]),
    category: "enterprise-ai",
    badge: "Enterprise Choice",
    iconName: "Brain",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-cla-d8b5b2d9-20251031191103.jpg"
  },
  {
    name: "Market Intelligence Agent",
    description: "Analyze market trends, competitor performance, and industry insights with AI-powered data analysis and predictive modeling.",
    startingPrice: "$149/month",
    features: JSON.stringify(["Competitor Benchmarking", "Trend Forecasting", "Sentiment Analysis", "Real-time Reports"]),
    category: "market-intelligence",
    badge: "Best for Growth",
    iconName: "TrendingUp",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-mar-3f832537-20251031191104.jpg"
  },
  {
    name: "24/7 Support Agent",
    description: "Provide instant customer service, answer FAQs, resolve issues, and manage tickets with intelligent automation.",
    startingPrice: "$99/month",
    features: JSON.stringify(["Instant Response", "Multi-Channel", "Issue Resolution", "CRM Integration"]),
    category: "customer-support",
    badge: "Best Value",
    iconName: "Users",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-24--208d2bfa-20251031191105.jpg"
  },
  {
    name: "Content Creation Agent",
    description: "Generate high-quality content including articles, social media posts, marketing copy, and SEO-optimized content at scale.",
    startingPrice: "$129/month",
    features: JSON.stringify(["SEO Optimization", "Tone Control", "Batch Processing", "50+ Languages"]),
    category: "content-generation",
    badge: "Content Pro",
    iconName: "Zap",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--31617187-20251031191104.jpg"
  },
  {
    name: "AI Code Assistant",
    description: "Accelerate development with intelligent code completion, debugging, refactoring, and documentation generation.",
    startingPrice: "$159/month",
    features: JSON.stringify(["Code Completion", "Bug Detection", "Refactoring Tools", "Multi-Language"]),
    category: "development",
    badge: "Developer Favorite",
    iconName: "Code",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--b1164dc1-20251031191104.jpg"
  },
  {
    name: "Data Analytics Agent",
    description: "Transform raw data into actionable insights with automated analysis, visualization, and predictive analytics.",
    startingPrice: "$189/month",
    features: JSON.stringify(["Data Visualization", "Predictive Models", "Automated Reports", "BI Integration"]),
    category: "analytics",
    badge: "Analytics Pro",
    iconName: "BarChart",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-dat-d1aef919-20251031191104.jpg"
  },
  {
    name: "Email Automation Agent",
    description: "Automate email campaigns, personalize messages, optimize send times, and track engagement with AI-driven insights.",
    startingPrice: "$119/month",
    features: JSON.stringify(["Smart Scheduling", "Personalization", "A/B Testing", "Analytics Dashboard"]),
    category: "marketing",
    badge: "Marketing Essential",
    iconName: "Mail",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ema-b6ad8cb8-20251031191104.jpg"
  },
  {
    name: "Social Media Manager",
    description: "Manage all social platforms, create engaging posts, schedule content, and analyze performance metrics automatically.",
    startingPrice: "$139/month",
    features: JSON.stringify(["Multi-Platform", "Content Calendar", "Engagement Tracking", "Hashtag Optimization"]),
    category: "social-media",
    badge: "Social Pro",
    iconName: "Share2",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-soc-85da3a71-20251031191104.jpg"
  },
  {
    name: "Research Assistant Agent",
    description: "Conduct comprehensive research, summarize documents, extract key insights, and compile reports with AI precision.",
    startingPrice: "$169/month",
    features: JSON.stringify(["Document Analysis", "Citation Management", "Fact Checking", "Summary Generation"]),
    category: "research",
    badge: "Research Pro",
    iconName: "Search",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-res-379fd90c-20251031191105.jpg"
  },
  {
    name: "AI Sales Assistant",
    description: "Boost sales with intelligent lead qualification, automated follow-ups, CRM management, and personalized sales strategies.",
    startingPrice: "$155/month",
    features: JSON.stringify(["Lead Scoring", "Sales Forecasting", "Pipeline Management", "Automated Outreach"]),
    category: "sales",
    badge: "Sales Booster",
    iconName: "DollarSign",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--11c8c992-20251031201212.jpg"
  },
  {
    name: "HR Recruitment Agent",
    description: "Streamline hiring with AI-powered candidate screening, interview scheduling, talent matching, and onboarding automation.",
    startingPrice: "$145/month",
    features: JSON.stringify(["Resume Screening", "Talent Matching", "Interview Automation", "Onboarding Support"]),
    category: "hr",
    badge: "HR Essential",
    iconName: "UserCheck",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/b0c6a439-7565-478d-a477-073be722c2fa/generated_images/professional-digital-illustration-of-ai--597f0015-20251031201212.jpg"
  }
];

export async function seedAIAgents() {
  try {
    console.log('Seeding AI agents...');
    
    // Insert all agents
    const inserted = await db.insert(aiAgents).values(agents).returning();
    
    console.log(`✅ Successfully seeded ${inserted.length} AI agents`);
    return inserted;
  } catch (error) {
    console.error('❌ Error seeding AI agents:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAIAgents()
    .then(() => {
      console.log('Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
