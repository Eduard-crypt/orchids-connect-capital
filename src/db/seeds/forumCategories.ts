import { db } from '@/db';
import { forumCategories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Business Strategy',
            description: 'Discussions about business planning, growth strategies, and competitive positioning',
            createdAt: new Date().getTime(),
        },
        {
            name: 'Funding & Investment',
            description: 'Topics related to raising capital, investor relations, and investment strategies',
            createdAt: new Date().getTime(),
        },
        {
            name: 'Marketing',
            description: 'Marketing strategies, campaigns, branding, and customer acquisition',
            createdAt: new Date().getTime(),
        },
        {
            name: 'Sales',
            description: 'Sales techniques, processes, pipeline management, and closing deals',
            createdAt: new Date().getTime(),
        },
        {
            name: 'Technology',
            description: 'Technology trends, software tools, automation, and digital transformation',
            createdAt: new Date().getTime(),
        },
        {
            name: 'Legal & Compliance',
            description: 'Legal matters, compliance, contracts, and regulatory issues',
            createdAt: new Date().getTime(),
        },
    ];

    await db.insert(forumCategories).values(sampleCategories);
    
    console.log('✅ Forum categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});