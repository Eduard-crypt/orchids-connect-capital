import { db } from '@/db';
import { forumComments, forumPosts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
    const sampleComments = [
        // Post 1: "Best platforms for SaaS due diligence?" - 4 comments
        {
            postId: 1,
            userId: 'user_seed_03',
            content: 'I highly recommend using ChartMogul or Baremetrics for analyzing your SaaS metrics. They give you a clear picture of MRR, churn, and LTV.',
            likesCount: 0,
            createdAt: new Date('2024-01-16T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-16T10:30:00Z').toISOString(),
        },
        {
            postId: 1,
            userId: 'user_seed_05',
            content: 'Have you looked into the tech stack? Make sure to audit their codebase quality and deployment practices.',
            likesCount: 0,
            createdAt: new Date('2024-01-16T14:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-16T14:20:00Z').toISOString(),
        },
        {
            postId: 1,
            userId: 'user_seed_07',
            content: 'Also check customer concentration risk. If 80% of revenue comes from 3 customers, that is a major red flag.',
            likesCount: 0,
            createdAt: new Date('2024-01-17T09:15:00Z').toISOString(),
            updatedAt: new Date('2024-01-17T09:15:00Z').toISOString(),
        },
        {
            postId: 1,
            userId: 'user_seed_09',
            content: 'Great advice here. I would add reviewing their customer support processes and satisfaction scores too.',
            likesCount: 0,
            createdAt: new Date('2024-01-17T16:45:00Z').toISOString(),
            updatedAt: new Date('2024-01-17T16:45:00Z').toISOString(),
        },

        // Post 2: "How to value an Amazon FBA business?" - 3 comments
        {
            postId: 2,
            userId: 'user_seed_04',
            content: 'FBA businesses typically sell for 2.5-4x annual profit. The multiple depends on brand strength and product diversity.',
            likesCount: 0,
            createdAt: new Date('2024-01-17T11:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-17T11:00:00Z').toISOString(),
        },
        {
            postId: 2,
            userId: 'user_seed_06',
            content: 'Do not forget to factor in inventory value. That should be added on top of the sale price.',
            likesCount: 0,
            createdAt: new Date('2024-01-18T08:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-18T08:30:00Z').toISOString(),
        },
        {
            postId: 2,
            userId: 'user_seed_08',
            content: 'Check for any IP issues or trademark disputes. These can kill a deal fast.',
            likesCount: 0,
            createdAt: new Date('2024-01-18T15:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-18T15:20:00Z').toISOString(),
        },

        // Post 3: "Red flags in financial statements?" - 2 comments
        {
            postId: 3,
            userId: 'user_seed_02',
            content: 'Watch out for inconsistent revenue recognition practices. That is often where sellers try to inflate numbers.',
            likesCount: 0,
            createdAt: new Date('2024-01-18T10:45:00Z').toISOString(),
            updatedAt: new Date('2024-01-18T10:45:00Z').toISOString(),
        },
        {
            postId: 3,
            userId: 'user_seed_05',
            content: 'Always verify bank statements match the P&L. I have seen too many doctored financial statements.',
            likesCount: 0,
            createdAt: new Date('2024-01-19T13:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-19T13:30:00Z').toISOString(),
        },

        // Post 4: "Negotiating earnouts effectively" - 3 comments
        {
            postId: 4,
            userId: 'user_seed_03',
            content: 'Keep earnouts simple with clear metrics. Revenue-based earnouts are easier to track than profit-based.',
            likesCount: 0,
            createdAt: new Date('2024-01-19T09:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-19T09:20:00Z').toISOString(),
        },
        {
            postId: 4,
            userId: 'user_seed_07',
            content: 'I recommend capping earnouts at 20-30% of total purchase price. Too much earnout means too much risk.',
            likesCount: 0,
            createdAt: new Date('2024-01-20T11:15:00Z').toISOString(),
            updatedAt: new Date('2024-01-20T11:15:00Z').toISOString(),
        },
        {
            postId: 4,
            userId: 'user_seed_09',
            content: 'Make sure you have operational control during the earnout period. Otherwise, targets become impossible.',
            likesCount: 0,
            createdAt: new Date('2024-01-20T14:40:00Z').toISOString(),
            updatedAt: new Date('2024-01-20T14:40:00Z').toISOString(),
        },

        // Post 5: "Content site traffic verification" - 2 comments
        {
            postId: 5,
            userId: 'user_seed_04',
            content: 'Always get direct Google Analytics access. Screenshots can be easily faked.',
            likesCount: 0,
            createdAt: new Date('2024-01-20T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-20T10:30:00Z').toISOString(),
        },
        {
            postId: 5,
            userId: 'user_seed_08',
            content: 'Check Google Search Console for any manual actions or penalties. These can tank traffic overnight.',
            likesCount: 0,
            createdAt: new Date('2024-01-21T09:45:00Z').toISOString(),
            updatedAt: new Date('2024-01-21T09:45:00Z').toISOString(),
        },

        // Post 6: "Working with brokers vs direct deals" - 1 comment
        {
            postId: 6,
            userId: 'user_seed_06',
            content: 'Brokers can smooth the process and handle difficult negotiations. Worth the commission for larger deals.',
            likesCount: 0,
            createdAt: new Date('2024-01-21T15:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-21T15:20:00Z').toISOString(),
        },

        // Post 7: "Post-acquisition integration checklist" - 4 comments
        {
            postId: 7,
            userId: 'user_seed_02',
            content: 'First 30 days are critical. Get all account access transferred and document everything.',
            likesCount: 0,
            createdAt: new Date('2024-01-22T08:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-22T08:30:00Z').toISOString(),
        },
        {
            postId: 7,
            userId: 'user_seed_05',
            content: 'Set up regular check-ins with the seller during transition. Their knowledge is invaluable.',
            likesCount: 0,
            createdAt: new Date('2024-01-22T11:45:00Z').toISOString(),
            updatedAt: new Date('2024-01-22T11:45:00Z').toISOString(),
        },
        {
            postId: 7,
            userId: 'user_seed_07',
            content: 'Do not change too much too fast. Maintain systems that work while you learn the business.',
            likesCount: 0,
            createdAt: new Date('2024-01-23T10:15:00Z').toISOString(),
            updatedAt: new Date('2024-01-23T10:15:00Z').toISOString(),
        },
        {
            postId: 7,
            userId: 'user_seed_09',
            content: 'Document all processes as you learn them. This becomes your operational manual going forward.',
            likesCount: 0,
            createdAt: new Date('2024-01-23T14:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-23T14:20:00Z').toISOString(),
        },

        // Post 8: "Legal considerations for cross-border deals" - 2 comments
        {
            postId: 8,
            userId: 'user_seed_03',
            content: 'Hire a lawyer familiar with international M&A. Tax implications can be complex.',
            likesCount: 0,
            createdAt: new Date('2024-01-23T09:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-23T09:30:00Z').toISOString(),
        },
        {
            postId: 8,
            userId: 'user_seed_06',
            content: 'Consider currency risk and how exchange rates might affect the deal structure.',
            likesCount: 0,
            createdAt: new Date('2024-01-24T12:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-24T12:00:00Z').toISOString(),
        },

        // Post 9: "Funding options for acquisitions" - 3 comments
        {
            postId: 9,
            userId: 'user_seed_04',
            content: 'SBA loans are great if you qualify. Low interest rates and long repayment terms.',
            likesCount: 0,
            createdAt: new Date('2024-01-24T10:45:00Z').toISOString(),
            updatedAt: new Date('2024-01-24T10:45:00Z').toISOString(),
        },
        {
            postId: 9,
            userId: 'user_seed_08',
            content: 'Seller financing can bridge the gap. Most sellers willing to finance 10-20% of the purchase price.',
            likesCount: 0,
            createdAt: new Date('2024-01-25T09:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-25T09:20:00Z').toISOString(),
        },
        {
            postId: 9,
            userId: 'user_seed_10',
            content: 'Look into earnouts as a financing tool. Reduces upfront capital needed while aligning incentives.',
            likesCount: 0,
            createdAt: new Date('2024-01-25T15:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-25T15:30:00Z').toISOString(),
        },

        // Post 10: "Dropshipping business evaluation" - 1 comment
        {
            postId: 10,
            userId: 'user_seed_05',
            content: 'Verify supplier relationships and backup suppliers. Single supplier dependency is risky.',
            likesCount: 0,
            createdAt: new Date('2024-01-25T11:15:00Z').toISOString(),
            updatedAt: new Date('2024-01-25T11:15:00Z').toISOString(),
        },

        // Post 13: "Building relationships with sellers" - 2 comments
        {
            postId: 13,
            userId: 'user_seed_02',
            content: 'Be transparent about your plans for the business. Sellers want to know their legacy is in good hands.',
            likesCount: 0,
            createdAt: new Date('2024-01-28T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-28T10:30:00Z').toISOString(),
        },
        {
            postId: 13,
            userId: 'user_seed_06',
            content: 'Ask about their journey building the business. Shows genuine interest beyond just the numbers.',
            likesCount: 0,
            createdAt: new Date('2024-01-28T14:45:00Z').toISOString(),
            updatedAt: new Date('2024-01-28T14:45:00Z').toISOString(),
        },

        // Post 14: "Common mistakes first-time buyers make" - 2 comments
        {
            postId: 14,
            userId: 'user_seed_03',
            content: 'Not budgeting for working capital is huge. You need cash to run the business after closing.',
            likesCount: 0,
            createdAt: new Date('2024-01-29T09:15:00Z').toISOString(),
            updatedAt: new Date('2024-01-29T09:15:00Z').toISOString(),
        },
        {
            postId: 14,
            userId: 'user_seed_07',
            content: 'Rushing through due diligence to beat competition. Better to walk away than buy a lemon.',
            likesCount: 0,
            createdAt: new Date('2024-01-29T13:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-29T13:30:00Z').toISOString(),
        },

        // Post 15: "Exit strategies and timing" - 1 comment
        {
            postId: 15,
            userId: 'user_seed_04',
            content: 'Plan your exit from day one. Every decision should consider how it affects future sale value.',
            likesCount: 0,
            createdAt: new Date('2024-01-30T11:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-30T11:00:00Z').toISOString(),
        },
    ];

    await db.insert(forumComments).values(sampleComments);

    const commentCounts = await db
        .select({
            postId: forumComments.postId,
            count: sql<number>`count(*)`,
        })
        .from(forumComments)
        .groupBy(forumComments.postId);

    for (const { postId, count } of commentCounts) {
        await db
            .update(forumPosts)
            .set({ commentsCount: Number(count) })
            .where(eq(forumPosts.id, postId));
    }

    console.log('✅ Forum comments seeder completed successfully');
    console.log(`   - Inserted ${sampleComments.length} comments`);
    console.log(`   - Updated commentsCount for ${commentCounts.length} posts`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});