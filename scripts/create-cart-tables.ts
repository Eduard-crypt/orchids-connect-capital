import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function createTables() {
  console.log('Creating missing tables...');

  try {
    // Create plans table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price_amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'usd',
        billing_interval TEXT NOT NULL DEFAULT 'month',
        stripe_price_id TEXT,
        max_listings INTEGER NOT NULL,
        escrow_fee_percentage REAL NOT NULL,
        features TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    console.log('✓ Created plans table');

    // Create cart_items table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
        session_id TEXT,
        plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(user_id, plan_id)
      )
    `);
    console.log('✓ Created cart_items table');

    // Create orders table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
        status TEXT NOT NULL DEFAULT 'pending',
        total_amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'usd',
        payment_provider TEXT NOT NULL DEFAULT 'stripe',
        stripe_checkout_session_id TEXT UNIQUE,
        stripe_customer_id TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    console.log('✓ Created orders table');

    // Create payments table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        provider TEXT NOT NULL DEFAULT 'stripe',
        stripe_payment_intent_id TEXT UNIQUE,
        status TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'usd',
        payment_method_type TEXT,
        raw_response TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    console.log('✓ Created payments table');

    // Create indexes
    await db.run(sql`CREATE INDEX IF NOT EXISTS plans_slug_idx ON plans(slug)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS plans_is_active_idx ON plans(is_active)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON cart_items(user_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS cart_items_plan_id_idx ON cart_items(plan_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id)`);
    console.log('✓ Created indexes');

    console.log('\n✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();
