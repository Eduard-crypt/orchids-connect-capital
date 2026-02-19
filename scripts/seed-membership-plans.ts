import { db } from '../src/db';
import { plans } from '../src/db/schema';

async function seedPlans() {
  console.log('Seeding TrustBridge membership plans...');

  try {
    const now = new Date();

    const membershipPlans = [
      {
        name: 'TrustBridge Starter Membership',
        slug: 'starter',
        description: 'Perfect for getting started',
        priceAmount: 5900, // $59.00 in cents
        currency: 'usd',
        billingInterval: 'month',
        stripePriceId: null,
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
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'TrustBridge Professional Membership',
        slug: 'professional',
        description: 'Most value for money',
        priceAmount: 7500, // $75.00 in cents
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
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'TrustBridge Enterprise Membership',
        slug: 'enterprise',
        description: 'For high-volume sellers',
        priceAmount: 8900, // $89.00 in cents
        currency: 'usd',
        billingInterval: 'month',
        stripePriceId: null,
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
          'Unlimited document storage'
        ]),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    ];

    // Insert plans
    for (const plan of membershipPlans) {
      await db.insert(plans).values(plan).onConflictDoNothing();
      console.log(`✓ Seeded: ${plan.name}`);
    }

    console.log('\n✅ All membership plans seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();