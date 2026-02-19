import { db } from '@/db';
import { promoCodes } from '@/db/schema';

/**
 * Seed promo codes for testing
 */
export async function seedPromoCodes() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const promoCodesToSeed = [
    {
      code: 'ES108',
      type: 'percentage',
      value: 100,
      description: '100% discount - Your order is now free!',
      active: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usedCount: 0,
      minOrderValue: null,
    },
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      description: '10% off your order',
      active: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usedCount: 0,
      minOrderValue: null,
    },
    {
      code: 'SAVE50',
      type: 'fixed',
      value: 5000, // $50.00 in cents
      description: '$50 off orders over $200',
      active: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usedCount: 0,
      minOrderValue: 20000, // $200.00 in cents
    },
    {
      code: 'EXPIRED25',
      type: 'percentage',
      value: 25,
      description: '25% off (expired)',
      active: true,
      startDate: null,
      endDate: yesterday,
      maxUses: null,
      usedCount: 0,
      minOrderValue: null,
    },
    {
      code: 'LIMITED5',
      type: 'percentage',
      value: 5,
      description: '5% off (limited uses - exhausted)',
      active: true,
      startDate: null,
      endDate: null,
      maxUses: 1,
      usedCount: 1,
      minOrderValue: null,
    },
    {
      code: 'VIP100',
      type: 'fixed',
      value: 10000, // $100.00 in cents
      description: '$100 off orders over $500',
      active: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usedCount: 0,
      minOrderValue: 50000, // $500.00 in cents
    },
  ];

  console.log('Seeding promo codes...');

  for (const promoCode of promoCodesToSeed) {
    await db
      .insert(promoCodes)
      .values(promoCode)
      .onConflictDoNothing();
  }

  console.log('✅ Promo codes seeded successfully!');
}

// Run if executed directly
if (import.meta.main) {
  seedPromoCodes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error seeding promo codes:', error);
      process.exit(1);
    });
}