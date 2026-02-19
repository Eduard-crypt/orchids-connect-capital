/**
 * TrustBridge Membership Plans Seeder
 * Creates the three membership tiers: Starter, Professional, Enterprise
 */

import { db } from '@/db';
import { plans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function seedTrustBridgePlans() {
  console.log('🌱 Seeding TrustBridge membership plans...');

  const trustBridgePlans = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for getting started',
      priceAmount: 5900, // $59.00 in cents
      currency: 'usd',
      billingInterval: 'month',
      maxListings: 3,
      escrowFeePercentage: 3.0,
      features: JSON.stringify([
        'List up to 3 businesses',
        'Access to basic marketplace',
        'Standard verification process',
        'Email support (48hr response)',
        'Basic escrow services (3% fee)',
        'Document storage (5GB)',
      ]),
      isActive: true,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'Most value for money',
      priceAmount: 7500, // $75.00 in cents
      currency: 'usd',
      billingInterval: 'month',
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
        'Document storage (50GB)',
      ]),
      isActive: true,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For high-volume sellers',
      priceAmount: 8900, // $89.00 in cents
      currency: 'usd',
      billingInterval: 'month',
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
        'Unlimited document storage',
      ]),
      isActive: true,
    },
  ];

  for (const plan of trustBridgePlans) {
    // Check if plan already exists
    const existing = await db
      .select()
      .from(plans)
      .where(eq(plans.slug, plan.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`✓ Plan "${plan.name}" already exists, skipping...`);
      continue;
    }

    // Insert new plan
    await db.insert(plans).values(plan);
    console.log(`✓ Created plan: ${plan.name} ($${plan.priceAmount / 100}/month)`);
  }

  console.log('✅ TrustBridge plans seeded successfully!');
}

// Run seeder if called directly
if (require.main === module) {
  seedTrustBridgePlans()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding plans:', error);
      process.exit(1);
    });
}
