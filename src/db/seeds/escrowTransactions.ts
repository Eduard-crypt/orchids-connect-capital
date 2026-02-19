import { db } from '@/db';
import { escrowTransactions } from '@/db/schema';

async function main() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    const generateWebhookSecret = () => {
        const chars = '0123456789abcdef';
        let secret = '';
        for (let i = 0; i < 64; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    };

    const sampleEscrowTransactions = [
        {
            listingId: 3,
            loiId: 3,
            buyerId: 'user_seed_04',
            sellerId: 'user_seed_03',
            status: 'funded',
            escrowAmount: 920000,
            escrowProvider: 'Escrow.com',
            escrowReferenceId: 'ESC-2024-00123',
            initiatedAt: sevenDaysAgo,
            fundedAt: fiveDaysAgo,
            migrationStartedAt: null,
            completedAt: null,
            releasedAt: null,
            webhookSecret: generateWebhookSecret(),
            notes: 'Funds received and verified. Ready for migration',
            createdAt: sevenDaysAgo,
            updatedAt: fiveDaysAgo,
        },
        {
            listingId: 4,
            loiId: null,
            buyerId: 'user_seed_05',
            sellerId: 'user_seed_04',
            status: 'in_migration',
            escrowAmount: 540000,
            escrowProvider: 'Acquire.com Escrow',
            escrowReferenceId: 'ESC-2024-00124',
            initiatedAt: twelveDaysAgo,
            fundedAt: tenDaysAgo,
            migrationStartedAt: eightDaysAgo,
            completedAt: null,
            releasedAt: null,
            webhookSecret: generateWebhookSecret(),
            notes: 'Migration in progress. Domain transfer completed.',
            createdAt: twelveDaysAgo,
            updatedAt: eightDaysAgo,
        }
    ];

    await db.insert(escrowTransactions).values(sampleEscrowTransactions);
    
    console.log('✅ Escrow transactions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});