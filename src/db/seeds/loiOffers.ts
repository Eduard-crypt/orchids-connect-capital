import { db } from '@/db';
import { loiOffers } from '@/db/schema';

async function main() {
    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);
    
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    
    const twelveDaysAgo = new Date(now);
    twelveDaysAgo.setDate(now.getDate() - 12);
    
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 10);
    
    const eightDaysAgo = new Date(now);
    eightDaysAgo.setDate(now.getDate() - 8);
    
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const twentyDaysFromNow = new Date(now);
    twentyDaysFromNow.setDate(now.getDate() + 20);
    
    const twentyFiveDaysFromNow = new Date(now);
    twentyFiveDaysFromNow.setDate(now.getDate() + 25);

    const sampleLoiOffers = [
        {
            listingId: 1,
            buyerId: 'user_seed_02',
            sellerId: 'user_seed_01',
            status: 'draft',
            offerPrice: 1100000,
            cashAmount: 900000,
            earnoutAmount: 200000,
            earnoutTerms: 'Earnout based on 12 months revenue performance',
            dueDiligenceDays: 30,
            exclusivityDays: 45,
            conditions: JSON.stringify(['Complete financial audit', 'Code review', 'Customer retention verification']),
            expirationDate: thirtyDaysFromNow,
            pdfUrl: null,
            sentAt: null,
            respondedAt: null,
            responseNotes: null,
            createdAt: fiveDaysAgo,
            updatedAt: fiveDaysAgo,
        },
        {
            listingId: 2,
            buyerId: 'user_seed_03',
            sellerId: 'user_seed_02',
            status: 'sent',
            offerPrice: 2400000,
            cashAmount: 2000000,
            earnoutAmount: 400000,
            earnoutTerms: 'Earnout tied to maintaining 90% customer retention',
            dueDiligenceDays: 45,
            exclusivityDays: 60,
            conditions: JSON.stringify(['Supplier contract review', 'Inventory verification', 'Brand trademark transfer']),
            expirationDate: twentyDaysFromNow,
            pdfUrl: 'https://example.com/loi-fashion-store.pdf',
            sentAt: threeDaysAgo,
            respondedAt: null,
            responseNotes: null,
            createdAt: sevenDaysAgo,
            updatedAt: threeDaysAgo,
        },
        {
            listingId: 3,
            buyerId: 'user_seed_04',
            sellerId: 'user_seed_03',
            status: 'accepted',
            offerPrice: 920000,
            cashAmount: 920000,
            earnoutAmount: 0,
            earnoutTerms: null,
            dueDiligenceDays: 30,
            exclusivityDays: 45,
            conditions: JSON.stringify(['Traffic verification', 'Revenue verification', 'Content ownership verification']),
            expirationDate: twentyFiveDaysFromNow,
            pdfUrl: 'https://example.com/loi-content-network.pdf',
            sentAt: tenDaysAgo,
            respondedAt: eightDaysAgo,
            responseNotes: 'Accepted with minor adjustments to due diligence timeline',
            createdAt: twelveDaysAgo,
            updatedAt: eightDaysAgo,
        },
    ];

    await db.insert(loiOffers).values(sampleLoiOffers);
    
    console.log('✅ LOI Offers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});