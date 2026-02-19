import { db } from '@/db';
import { migrationChecklists } from '@/db/schema';

async function main() {
    const now = new Date();
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const sampleMigrationChecklists = [
        {
            escrowId: 2,
            listingId: 4,
            buyerId: 'user_seed_05',
            sellerId: 'user_seed_04',
            status: 'in_progress',
            completedAt: null,
            createdAt: eightDaysAgo.getTime(),
            updatedAt: twoDaysAgo.getTime(),
        }
    ];

    await db.insert(migrationChecklists).values(sampleMigrationChecklists);
    
    console.log('✅ Migration checklists seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});