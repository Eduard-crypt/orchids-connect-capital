import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function getTestSession() {
  try {
    const result = await db.all(sql`SELECT token, user_id FROM session LIMIT 1`);
    if (result.length > 0) {
      console.log('Test Session Token:', result[0].token);
      console.log('User ID:', result[0].user_id);
    } else {
      console.log('No sessions found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getTestSession();
