import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_seed_01',
            name: 'Sarah Mitchell',
            email: 'sarah.mitchell@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_02',
            name: 'James Rodriguez',
            email: 'james.rodriguez@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_03',
            name: 'Emily Chen',
            email: 'emily.chen@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_04',
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_05',
            name: 'Jessica Taylor',
            email: 'jessica.taylor@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_06',
            name: 'David Wilson',
            email: 'david.wilson@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_07',
            name: 'Amanda Martinez',
            email: 'amanda.martinez@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_08',
            name: 'Robert Lee',
            email: 'robert.lee@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_09',
            name: 'Lisa Anderson',
            email: 'lisa.anderson@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user_seed_10',
            name: 'Christopher White',
            email: 'christopher.white@example.com',
            emailVerified: false,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    await db.insert(user).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});