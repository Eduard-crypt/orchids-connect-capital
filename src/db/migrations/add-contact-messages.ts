import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function migrateContactMessages() {
  try {
    console.log('Creating contact_messages table...');
    
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        interest_type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS contact_messages_interest_type_idx ON contact_messages(interest_type)`);
    
    console.log('✅ contact_messages table created successfully!');
  } catch (error) {
    console.error('Error creating contact_messages table:', error);
    throw error;
  }
}

migrateContactMessages();
