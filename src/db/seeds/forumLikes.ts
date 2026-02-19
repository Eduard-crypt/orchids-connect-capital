import { db } from '@/db';
import { forumLikes, forumPosts, forumComments } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
    // Fetch post authors to avoid self-likes
    const posts = await db.select({ id: sql<number>`id`, userId: sql<string>`user_id` }).from(forumPosts);
    const postAuthors = new Map(posts.map(p => [p.id, p.userId]));

    // Fetch comment authors to avoid self-likes
    const comments = await db.select({ id: sql<number>`id`, userId: sql<string>`user_id` }).from(forumComments);
    const commentAuthors = new Map(comments.map(c => [c.id, c.userId]));

    const users = ['user_seed_01', 'user_seed_02', 'user_seed_03', 'user_seed_04', 'user_seed_05', 
                   'user_seed_06', 'user_seed_07', 'user_seed_08', 'user_seed_09', 'user_seed_10'];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const getRandomDate = () => {
        const diff = now.getTime() - thirtyDaysAgo.getTime();
        return new Date(thirtyDaysAgo.getTime() + Math.random() * diff).toISOString();
    };

    // Generate 50 post likes with varied distribution
    const postLikes = [];
    const usedPostUserCombos = new Set<string>();

    // Distribution: posts 1-6 get 5 likes, posts 7-12 get 3 likes, posts 13-16 get 2 likes, posts 17-18 get 1 like
    const postLikeDistribution = [
        { postId: 1, count: 5 }, { postId: 2, count: 5 }, { postId: 3, count: 5 },
        { postId: 4, count: 5 }, { postId: 5, count: 5 }, { postId: 6, count: 5 },
        { postId: 7, count: 3 }, { postId: 8, count: 3 }, { postId: 9, count: 3 },
        { postId: 10, count: 3 }, { postId: 11, count: 3 }, { postId: 12, count: 3 },
        { postId: 13, count: 2 }, { postId: 14, count: 2 }, { postId: 15, count: 2 },
        { postId: 16, count: 2 }, { postId: 17, count: 1 }, { postId: 18, count: 1 }
    ];

    for (const { postId, count } of postLikeDistribution) {
        const postAuthor = postAuthors.get(postId);
        const availableUsers = users.filter(u => u !== postAuthor);
        
        let likesAdded = 0;
        let attempts = 0;
        while (likesAdded < count && attempts < 50) {
            attempts++;
            const userId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            const combo = `post_${postId}_${userId}`;
            
            if (!usedPostUserCombos.has(combo)) {
                usedPostUserCombos.add(combo);
                postLikes.push({
                    postId,
                    commentId: null,
                    userId,
                    createdAt: getRandomDate()
                });
                likesAdded++;
            }
        }
    }

    // Generate 30 comment likes with varied distribution
    const commentLikes = [];
    const usedCommentUserCombos = new Set<string>();

    // Distribution: 15 comments get 2 likes each (30 total)
    const commentsWithLikes = [1, 2, 3, 5, 7, 10, 12, 15, 18, 20, 23, 26, 30, 33, 38];

    for (const commentId of commentsWithLikes) {
        const commentAuthor = commentAuthors.get(commentId);
        const availableUsers = users.filter(u => u !== commentAuthor);
        
        let likesAdded = 0;
        let attempts = 0;
        while (likesAdded < 2 && attempts < 50) {
            attempts++;
            const userId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            const combo = `comment_${commentId}_${userId}`;
            
            if (!usedCommentUserCombos.has(combo)) {
                usedCommentUserCombos.add(combo);
                commentLikes.push({
                    postId: null,
                    commentId,
                    userId,
                    createdAt: getRandomDate()
                });
                likesAdded++;
            }
        }
    }

    // Insert all likes
    const allLikes = [...postLikes, ...commentLikes];
    await db.insert(forumLikes).values(allLikes);

    // Update post likes counts
    for (const postId of Array.from(new Set(postLikes.map(l => l.postId)))) {
        if (postId) {
            const likeCount = postLikes.filter(l => l.postId === postId).length;
            await db.update(forumPosts)
                .set({ likesCount: likeCount })
                .where(eq(forumPosts.id, postId));
        }
    }

    // Update comment likes counts
    for (const commentId of Array.from(new Set(commentLikes.map(l => l.commentId)))) {
        if (commentId) {
            const likeCount = commentLikes.filter(l => l.commentId === commentId).length;
            await db.update(forumComments)
                .set({ likesCount: likeCount })
                .where(eq(forumComments.id, commentId));
        }
    }

    console.log('✅ Forum likes seeder completed successfully');
    console.log(`   - Generated ${postLikes.length} post likes`);
    console.log(`   - Generated ${commentLikes.length} comment likes`);
    console.log(`   - Updated likes counts for posts and comments`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});