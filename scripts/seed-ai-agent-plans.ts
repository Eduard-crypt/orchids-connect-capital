import { db } from '../src/db';
import { plans } from '../src/db/schema';

const aiAgentPlans = [
  {
    name: 'ChatGPT Pro Assistant',
    slug: 'chatgpt-assistant',
    description: 'AI agent rental subscription',
    priceAmount: 19900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['GPT-4 Powered', 'Context Memory', 'Multi-language Support', 'API Integration']),
    isActive: true,
  },
  {
    name: 'Claude Enterprise Agent',
    slug: 'claude-agent',
    description: 'AI agent rental subscription',
    priceAmount: 17900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Advanced Reasoning', 'Document Analysis', 'Code Generation', 'Safety Focused']),
    isActive: true,
  },
  {
    name: 'Market Intelligence Agent',
    slug: 'market-intelligence',
    description: 'AI agent rental subscription',
    priceAmount: 14900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Competitor Benchmarking', 'Trend Forecasting', 'Sentiment Analysis', 'Real-time Reports']),
    isActive: true,
  },
  {
    name: '24/7 Support Agent',
    slug: 'customer-support',
    description: 'AI agent rental subscription',
    priceAmount: 9900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Instant Response', 'Multi-Channel', 'Issue Resolution', 'CRM Integration']),
    isActive: true,
  },
  {
    name: 'Content Creation Agent',
    slug: 'content-generation',
    description: 'AI agent rental subscription',
    priceAmount: 12900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['SEO Optimization', 'Tone Control', 'Batch Processing', '50+ Languages']),
    isActive: true,
  },
  {
    name: 'AI Code Assistant',
    slug: 'code-assistant',
    description: 'AI agent rental subscription',
    priceAmount: 15900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Code Completion', 'Bug Detection', 'Refactoring Tools', 'Multi-Language']),
    isActive: true,
  },
  {
    name: 'Data Analytics Agent',
    slug: 'data-analytics',
    description: 'AI agent rental subscription',
    priceAmount: 18900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Data Visualization', 'Predictive Models', 'Automated Reports', 'BI Integration']),
    isActive: true,
  },
  {
    name: 'Email Automation Agent',
    slug: 'email-automation',
    description: 'AI agent rental subscription',
    priceAmount: 11900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Smart Scheduling', 'Personalization', 'A/B Testing', 'Analytics Dashboard']),
    isActive: true,
  },
  {
    name: 'Social Media Manager',
    slug: 'social-media-manager',
    description: 'AI agent rental subscription',
    priceAmount: 13900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Multi-Platform', 'Content Calendar', 'Engagement Tracking', 'Hashtag Optimization']),
    isActive: true,
  },
  {
    name: 'Research Assistant Agent',
    slug: 'research-assistant',
    description: 'AI agent rental subscription',
    priceAmount: 16900,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Document Analysis', 'Citation Management', 'Fact Checking', 'Summary Generation']),
    isActive: true,
  },
  {
    name: 'AI Sales Assistant',
    slug: 'sales-assistant',
    description: 'AI agent rental subscription',
    priceAmount: 15500,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Lead Scoring', 'Sales Forecasting', 'Pipeline Management', 'Automated Outreach']),
    isActive: true,
  },
  {
    name: 'HR Recruitment Agent',
    slug: 'hr-recruitment',
    description: 'AI agent rental subscription',
    priceAmount: 14500,
    currency: 'usd',
    billingInterval: 'month',
    maxListings: 0,
    escrowFeePercentage: 0.0,
    features: JSON.stringify(['Resume Screening', 'Talent Matching', 'Interview Automation', 'Onboarding Support']),
    isActive: true,
  },
];

async function seedAIAgentPlans() {
  console.log('🤖 Seeding AI Agent plans...\n');

  try {
    for (const plan of aiAgentPlans) {
      // Check if plan already exists
      const existing = await db.query.plans.findFirst({
        where: (plans, { eq }) => eq(plans.slug, plan.slug),
      });

      if (existing) {
        console.log(`⏭️  Plan "${plan.name}" already exists, skipping...`);
        continue;
      }

      // Insert plan
      await db.insert(plans).values({
        ...plan,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created plan: ${plan.name} - $${plan.priceAmount / 100}/month`);
    }

    console.log('\n✨ AI Agent plans seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding AI Agent plans:', error);
    process.exit(1);
  }
}

seedAIAgentPlans();
