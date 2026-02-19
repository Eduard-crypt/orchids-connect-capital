import { db } from '@/db';
import { verificationDocuments } from '@/db/schema';

async function main() {
    const sampleDocuments = [
        {
            userId: 'user_seed_01',
            documentType: 'id_document',
            fileName: 'drivers_license.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_7k9m2x4n6p8q/drivers_license.pdf',
            fileSize: 2456789,
            uploadedAt: new Date('2024-12-15T10:30:00Z').getTime(),
            createdAt: new Date('2024-12-15T10:30:00Z').getTime(),
            updatedAt: new Date('2024-12-15T10:30:00Z').getTime(),
        },
        {
            userId: 'user_seed_02',
            documentType: 'proof_of_funds',
            fileName: 'bank_statement_q4.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_5h3j8l2m9n4p/bank_statement_q4.pdf',
            fileSize: 1875432,
            uploadedAt: new Date('2024-12-18T14:45:00Z').getTime(),
            createdAt: new Date('2024-12-18T14:45:00Z').getTime(),
            updatedAt: new Date('2024-12-18T14:45:00Z').getTime(),
        },
        {
            userId: 'user_seed_03',
            documentType: 'id_document',
            fileName: 'passport_scan.jpg',
            fileUrl: 'https://storage.optifirm.com/verification/doc_9x7c5v3b1n8m/passport_scan.jpg',
            fileSize: 3245678,
            uploadedAt: new Date('2024-12-20T09:15:00Z').getTime(),
            createdAt: new Date('2024-12-20T09:15:00Z').getTime(),
            updatedAt: new Date('2024-12-20T09:15:00Z').getTime(),
        },
        {
            userId: 'user_seed_03',
            documentType: 'proof_of_funds',
            fileName: 'proof_of_funds_2024.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_2k4m6n8p0q3r/proof_of_funds_2024.pdf',
            fileSize: 2987654,
            uploadedAt: new Date('2024-12-20T09:20:00Z').getTime(),
            createdAt: new Date('2024-12-20T09:20:00Z').getTime(),
            updatedAt: new Date('2024-12-20T09:20:00Z').getTime(),
        },
        {
            userId: 'user_seed_04',
            documentType: 'id_document',
            fileName: 'national_id_card.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_4p7q9r2s5t8v/national_id_card.pdf',
            fileSize: 1654321,
            uploadedAt: new Date('2024-12-22T16:30:00Z').getTime(),
            createdAt: new Date('2024-12-22T16:30:00Z').getTime(),
            updatedAt: new Date('2024-12-22T16:30:00Z').getTime(),
        },
        {
            userId: 'user_seed_05',
            documentType: 'id_document',
            fileName: 'drivers_license_front_back.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_8m1n3p5q7r9s/drivers_license_front_back.pdf',
            fileSize: 3876543,
            uploadedAt: new Date('2024-12-25T11:00:00Z').getTime(),
            createdAt: new Date('2024-12-25T11:00:00Z').getTime(),
            updatedAt: new Date('2024-12-25T11:00:00Z').getTime(),
        },
        {
            userId: 'user_seed_05',
            documentType: 'proof_of_funds',
            fileName: 'investment_portfolio_statement.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_6t9v2x4z7a3b/investment_portfolio_statement.pdf',
            fileSize: 4532109,
            uploadedAt: new Date('2024-12-25T11:15:00Z').getTime(),
            createdAt: new Date('2024-12-25T11:15:00Z').getTime(),
            updatedAt: new Date('2024-12-25T11:15:00Z').getTime(),
        },
        {
            userId: 'user_seed_06',
            documentType: 'proof_of_funds',
            fileName: 'bank_verification_letter.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_3c5d7f9h2j4k/bank_verification_letter.pdf',
            fileSize: 987654,
            uploadedAt: new Date('2024-12-28T13:20:00Z').getTime(),
            createdAt: new Date('2024-12-28T13:20:00Z').getTime(),
            updatedAt: new Date('2024-12-28T13:20:00Z').getTime(),
        },
        {
            userId: 'user_seed_07',
            documentType: 'id_document',
            fileName: 'passport_photo_page.jpg',
            fileUrl: 'https://storage.optifirm.com/verification/doc_1m4n7p0q3r6s/passport_photo_page.jpg',
            fileSize: 2765432,
            uploadedAt: new Date('2024-12-30T08:45:00Z').getTime(),
            createdAt: new Date('2024-12-30T08:45:00Z').getTime(),
            updatedAt: new Date('2024-12-30T08:45:00Z').getTime(),
        },
        {
            userId: 'user_seed_08',
            documentType: 'proof_of_funds',
            fileName: 'brokerage_account_statement.pdf',
            fileUrl: 'https://storage.optifirm.com/verification/doc_5s8t1v4x7z0a/brokerage_account_statement.pdf',
            fileSize: 3456789,
            uploadedAt: new Date('2025-01-02T15:10:00Z').getTime(),
            createdAt: new Date('2025-01-02T15:10:00Z').getTime(),
            updatedAt: new Date('2025-01-02T15:10:00Z').getTime(),
        },
    ];

    await db.insert(verificationDocuments).values(sampleDocuments);
    
    console.log('✅ Verification documents seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});