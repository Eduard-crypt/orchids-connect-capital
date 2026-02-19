import { db } from '@/db';
import { migrationChecklistTasks } from '@/db/schema';

async function main() {
    const now = new Date();
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const sampleTasks = [
        {
            checklistId: 1,
            taskName: 'Transfer domain ownership',
            taskCategory: 'domain',
            taskDescription: 'Transfer domain ownership from seller to buyer including registrar access',
            status: 'complete',
            buyerConfirmed: true,
            sellerConfirmed: true,
            buyerConfirmedAt: sixDaysAgo,
            sellerConfirmedAt: sixDaysAgo,
            notes: 'Domain transferred successfully to buyer\'s registrar account',
            completedAt: sixDaysAgo,
            createdAt: eightDaysAgo,
            updatedAt: sixDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Update DNS records',
            taskCategory: 'domain',
            taskDescription: 'Update DNS records to point to new hosting infrastructure',
            status: 'in_progress',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            notes: 'DNS propagation in progress',
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: threeDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Migrate hosting account',
            taskCategory: 'hosting',
            taskDescription: 'Migrate hosting including all files and databases',
            status: 'in_progress',
            buyerConfirmed: false,
            sellerConfirmed: true,
            buyerConfirmedAt: null,
            sellerConfirmedAt: fourDaysAgo,
            notes: 'Files migrated, database migration pending',
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: fourDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Transfer server access credentials',
            taskCategory: 'hosting',
            taskDescription: 'Transfer all server access credentials',
            status: 'pending',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            notes: null,
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: eightDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Transfer codebase and repositories',
            taskCategory: 'code',
            taskDescription: 'Transfer GitHub repositories and deployment configurations',
            status: 'pending',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            notes: null,
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: eightDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Transfer payment processor accounts',
            taskCategory: 'payments',
            taskDescription: 'Transfer Stripe and in-app purchase accounts',
            status: 'pending',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            notes: null,
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: eightDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Transfer advertising accounts',
            taskCategory: 'ads',
            taskDescription: 'Transfer Google Ads and Facebook Ads accounts',
            status: 'pending',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            notes: null,
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: eightDaysAgo,
        },
        {
            checklistId: 1,
            taskName: 'Transfer inventory and supplier relationships',
            taskCategory: 'inventory',
            taskDescription: 'Not applicable for mobile app business',
            status: 'pending',
            buyerConfirmed: false,
            sellerConfirmed: false,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            notes: 'N/A - Mobile app business has no physical inventory',
            completedAt: null,
            createdAt: eightDaysAgo,
            updatedAt: eightDaysAgo,
        },
    ];

    await db.insert(migrationChecklistTasks).values(sampleTasks);
    
    console.log('✅ Migration checklist tasks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});