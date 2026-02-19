import { db } from '@/db';
import { promoCodes } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function addES108Promo() {
  try {
    console.log('Creating promo_codes table if not exists...');
    
    // Create the table if it doesn't exist
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS "promo_codes" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "code" text NOT NULL UNIQUE,
        "type" text NOT NULL,
        "value" integer NOT NULL,
        "description" text NOT NULL,
        "active" integer DEFAULT 1 NOT NULL,
        "start_date" integer,
        "end_date" integer,
        "max_uses" integer,
        "used_count" integer DEFAULT 0 NOT NULL,
        "min_order_value" integer,
        "created_at" integer NOT NULL,
        "updated_at" integer NOT NULL
      )
    `);

    // Create indexes
    await db.run(sql`CREATE INDEX IF NOT EXISTS "promo_codes_code_idx" ON "promo_codes" ("code")`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS "promo_codes_active_idx" ON "promo_codes" ("active")`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS "promo_codes_type_idx" ON "promo_codes" ("type")`);

    console.log('Creating cart_promo_codes table if not exists...');
    
    // Create cart_promo_codes table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS "cart_promo_codes" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" text NOT NULL UNIQUE,
        "promo_code_id" integer NOT NULL,
        "cart_total" integer NOT NULL,
        "discount_amount" integer NOT NULL,
        "final_total" integer NOT NULL,
        "applied_at" integer NOT NULL,
        "created_at" integer NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade,
        FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE cascade
      )
    `);

    await db.run(sql`CREATE INDEX IF NOT EXISTS "cart_promo_codes_user_id_idx" ON "cart_promo_codes" ("user_id")`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS "cart_promo_codes_promo_code_id_idx" ON "cart_promo_codes" ("promo_code_id")`);

    console.log('Adding ES108 promo code...');
    
    await db.insert(promoCodes).values({
      code: 'ES108',
      type: 'percentage',
      value: 100,
      description: '100% discount - Your order is now free!',
      active: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usedCount: 0,
      minOrderValue: null,
    }).onConflictDoNothing();

    console.log('✅ ES108 promo code added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding promo code:', error);
    process.exit(1);
  }
}

addES108Promo();