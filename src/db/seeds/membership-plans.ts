import { db } from '@/db';
import { membershipPlans } from '@/db/schema';

async function seedMembershipPlans() {
  console.log('Seeding membership plans...');

  const plans = [
    {
      name: 'Starter',
      pricePerMonth: 9900, // $99 in cents
      maxListings: 3,
      escrowFeePercentage: 3.0,
      verificationSpeed: 'standard',
      supportResponseHours: 48,
      documentStorageGb: 5,
      featuredPlacement: false,
      analyticsAccess: false,
      whiteLabelOptions: false,
      dedicatedManager: false,
      features: JSON.stringify([
        'List up to 3 businesses',
        'Access to basic marketplace',
        'Standard verification process',
        'Email support (48hr response)',
        'Basic escrow services (3% fee)',
        'Document storage (5GB)',
      ]),
    },
    {
      name: 'Professional',
      pricePerMonth: 29900, // $299 in cents
      maxListings: 10,
      escrowFeePercentage: 2.0,
      verificationSpeed: 'priority',
      supportResponseHours: 12,
      documentStorageGb: 50,
      featuredPlacement: true,
      analyticsAccess: true,
      whiteLabelOptions: false,
      dedicatedManager: false,
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
    },
    {
      name: 'Enterprise',
      pricePerMonth: 79900, // $799 in cents
      maxListings: -1, // unlimited
      escrowFeePercentage: 1.5,
      verificationSpeed: 'instant',
      supportResponseHours: 0, // 24/7
      documentStorageGb: -1, // unlimited
      featuredPlacement: true,
      analyticsAccess: true,
      whiteLabelOptions: true,
      dedicatedManager: true,
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
    },
  ];

  for (const plan of plans) {
    await db.insert(membershipPlans).values(plan);
    console.log(`✓ Seeded plan: ${plan.name}`);
  }

  console.log('Membership plans seeded successfully!');
}

seedMembershipPlans()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding membership plans:', error);
    process.exit(1);
  });
