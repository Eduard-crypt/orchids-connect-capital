import { db } from '@/db';
import { buyerProfiles } from '@/db/schema';

async function main() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const sampleBuyerProfiles = [
        {
            userId: 'user_seed_02',
            budgetMin: 800000,
            budgetMax: 2000000,
            industries: JSON.stringify(['SaaS', 'Apps', 'Content']),
            regions: JSON.stringify(['United States', 'Global']),
            proofOfFundsDocument: 'https://storage.optifirm.com/buyer/proof_funds_james.pdf',
            onboardingCompleted: true,
            createdAt: tenDaysAgo,
            updatedAt: tenDaysAgo,
        },
        {
            userId: 'user_seed_04',
            budgetMin: 300000,
            budgetMax: 1000000,
            industries: JSON.stringify(['eCom', 'Content']),
            regions: JSON.stringify(['United States', 'Canada']),
            proofOfFundsDocument: 'https://storage.optifirm.com/buyer/proof_funds_michael.pdf',
            onboardingCompleted: true,
            createdAt: eightDaysAgo,
            updatedAt: eightDaysAgo,
        },
        {
            userId: 'user_seed_06',
            budgetMin: 500000,
            budgetMax: 1500000,
            industries: JSON.stringify(['Content', 'SaaS']),
            regions: JSON.stringify(['Global']),
            proofOfFundsDocument: 'https://storage.optifirm.com/buyer/proof_funds_david.pdf',
            onboardingCompleted: true,
            createdAt: sixDaysAgo,
            updatedAt: sixDaysAgo,
        },
    ];

    await db.insert(buyerProfiles).values(sampleBuyerProfiles);
    
    console.log('✅ Buyer profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});