/**
 * Direct seeder for TrustBridge membership plans
 * Run with: bun run scripts/seed-trustbridge-plans.ts
 */

import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function seedPlans() {
  console.log('🌱 Seeding TrustBridge membership plans...');

  const plans = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for getting started',
      priceAmount: 5900,
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
      isActive: 1,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'Most value for money',
      priceAmount: 7500,
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
      isActive: 1,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For high-volume sellers',
      priceAmount: 8900,
      currency: 'usd',
      billingInterval: 'month',
      maxListings: 999999,
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
      isActive: 1,
    },
  ];

  try {
    // Create plans table if it doesn't exist
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price_amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'usd',
        billing_interval TEXT NOT NULL DEFAULT 'month',
        stripe_price_id TEXT,
        max_listings INTEGER NOT NULL,
        escrow_fee_percentage REAL NOT NULL,
        features TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    console.log('✓ Plans table ready');

    for (const plan of plans) {
      try {
        const now = Date.now();
        await db.run(sql`
          INSERT INTO plans (name, slug, description, price_amount, currency, billing_interval, max_listings, escrow_fee_percentage, features, is_active, created_at, updated_at) 
          VALUES (${plan.name}, ${plan.slug}, ${plan.description}, ${plan.priceAmount}, ${plan.currency}, ${plan.billingInterval}, ${plan.maxListings}, ${plan.escrowFeePercentage}, ${plan.features}, ${plan.isActive}, ${now}, ${now})
        `);
        console.log(`✓ Created plan: ${plan.name} ($${plan.priceAmount / 100}/month)`);
      } catch (err: any) {
        if (err.message?.includes('UNIQUE constraint failed')) {
          console.log(`✓ Plan "${plan.name}" already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ TrustBridge plans seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });