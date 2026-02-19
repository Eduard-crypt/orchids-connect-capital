import { db } from '@/db';
import { plans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function seedPlans() {
  console.log('🌱 Seeding plans...');

  const plansData = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for individuals getting started in the marketplace',
      priceAmount: 5900, // $59.00
      currency: 'usd',
      billingInterval: 'month',
      stripePriceId: null, // Will be set when Stripe is configured
      maxListings: 3,
      escrowFeePercentage: 3.0,
      features: JSON.stringify([
        'List up to 3 businesses',
        'Access to basic marketplace',
        'Standard verification process',
        'Email support (48hr response)',
        'Basic escrow services (3% fee)',
        'Document storage (5GB)'
      ]),
      isActive: true
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'Most popular plan for serious sellers',
      priceAmount: 7500, // $75.00
      currency: 'usd',
      billingInterval: 'month',
      stripePriceId: null,
      maxListings: 10,
      escrowFeePercentage: 2.0,
      features: JSON.stringify([
        'List up to 10 businesses',
        'Full marketplace access',
        'Priority verification (24hr)',
        'Priority support (12hr response)',
        'Premium escrow services (2% fee)',
        'Advanced analytics & insights',
        'Featured listing placement',
        'Document storage (50GB)'
      ]),
      isActive: true
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For brokers and agencies with high volume',
      priceAmount: 8900, // $89.00
      currency: 'usd',
      billingInterval: 'month',
      stripePriceId: null,
      maxListings: 999999, // Unlimited
      escrowFeePercentage: 1.5,
      features: JSON.stringify([
        'Unlimited business listings',
        'Premium marketplace access',
        'Instant verification',
        '24/7 dedicated support',
        'VIP escrow services (1.5% fee)',
        'White-label options',
        'Top-tier listing placement',
        'Dedicated account manager',
        'Unlimited document storage'
      ]),
      isActive: true
    },
    {
      name: 'LinkedIn Post Generator',
      slug: 'linkedin-post-generator',
      description: 'Create engaging, professional LinkedIn posts that drive engagement and grow your network',
      priceAmount: 2900, // $29.00
      currency: 'usd',
      billingInterval: 'month',
      stripePriceId: null,
      maxListings: 50,
      escrowFeePercentage: 2.5,
      features: JSON.stringify([
        'Engagement Optimization',
        'Hashtag Suggestions',
        'Post Scheduling',
        'Analytics Tracking'
      ]),
      isActive: true
    }
  ];

  for (const planData of plansData) {
    // Check if plan already exists
    const existing = await db.select().from(plans).where(eq(plans.slug, planData.slug)).limit(1);
    
    if (existing.length === 0) {
      await db.insert(plans).values(planData);
      console.log(`✅ Created plan: ${planData.name}`);
    } else {
      console.log(`⏭️  Plan already exists: ${planData.name}`);
    }
  }

  console.log('✅ Plans seeding completed!');
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedPlans()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}