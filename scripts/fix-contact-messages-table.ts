import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function fixContactMessagesTable() {
  try {
    console.log('🔧 Fixing contact_messages table...');
    
    // Drop the existing table
    await db.run(sql`DROP TABLE IF EXISTS contact_messages`);
    console.log('✅ Dropped existing contact_messages table');
    
    // Create the table with proper structure
    await db.run(sql`
      CREATE TABLE contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        interest_type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('✅ Created new contact_messages table with proper defaults');
    
    // Create indexes
    await db.run(sql`CREATE INDEX contact_messages_status_idx ON contact_messages(status)`);
    await db.run(sql`CREATE INDEX contact_messages_created_at_idx ON contact_messages(created_at)`);
    await db.run(sql`CREATE INDEX contact_messages_interest_type_idx ON contact_messages(interest_type)`);
    console.log('✅ Created indexes');
    
    // Test insert
    await db.run(sql`
      INSERT INTO contact_messages (first_name, last_name, email, phone, interest_type, message, status)
      VALUES ('Test', 'User', 'test@example.com', '+1234567890', 'general', 'Test message', 'new')
    `);
    console.log('✅ Test insert successful');
    
    // Verify
    const result = await db.all(sql`SELECT * FROM contact_messages WHERE email = 'test@example.com'`);
    console.log('✅ Test record:', result);
    
    // Clean up test record
    await db.run(sql`DELETE FROM contact_messages WHERE email = 'test@example.com'`);
    console.log('✅ Cleaned up test record');
    
    console.log('✨ Contact messages table fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing contact_messages table:', error);
    throw error;
  }
}

fixContactMessagesTable()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
