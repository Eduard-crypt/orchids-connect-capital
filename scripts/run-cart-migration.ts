import { createClient } from '@libsql/client';

async function runMigration() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log('Creating products table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      description text,
      stripe_price_id text,
      price_amount integer NOT NULL,
      currency text DEFAULT 'usd' NOT NULL,
      image_url text,
      category text,
      is_active integer DEFAULT true NOT NULL,
      metadata text,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )
  `);

  console.log('Creating cart_orders table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS cart_orders (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id text,
      email text,
      status text DEFAULT 'pending' NOT NULL,
      total_amount integer NOT NULL,
      currency text DEFAULT 'usd' NOT NULL,
      stripe_checkout_session_id text,
      stripe_payment_intent_id text,
      stripe_customer_id text,
      cart_data text NOT NULL,
      metadata text,
      paid_at integer,
      created_at integer NOT NULL,
      updated_at integer NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE set null
    )
  `);

  console.log('Creating cart_order_items table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS cart_order_items (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      order_id integer NOT NULL,
      product_id text NOT NULL,
      quantity integer NOT NULL,
      unit_price integer NOT NULL,
      total_price integer NOT NULL,
      access_granted integer DEFAULT false NOT NULL,
      access_granted_at integer,
      created_at integer NOT NULL,
      FOREIGN KEY (order_id) REFERENCES cart_orders(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE restrict
    )
  `);

  console.log('Creating user_product_access table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_product_access (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id text NOT NULL,
      product_id text NOT NULL,
      order_id integer NOT NULL,
      granted_at integer NOT NULL,
      expires_at integer,
      created_at integer NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (order_id) REFERENCES cart_orders(id) ON UPDATE no action ON DELETE cascade
    )
  `);

  console.log('Creating indexes...');
  await client.execute(`CREATE INDEX IF NOT EXISTS products_stripe_price_id_idx ON products (stripe_price_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS products_category_idx ON products (category)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS products_is_active_idx ON products (is_active)`);
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS cart_orders_stripe_checkout_session_id_unique ON cart_orders (stripe_checkout_session_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS cart_orders_user_id_idx ON cart_orders (user_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS cart_orders_status_idx ON cart_orders (status)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS cart_orders_created_at_idx ON cart_orders (created_at)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS cart_order_items_order_id_idx ON cart_order_items (order_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS cart_order_items_product_id_idx ON cart_order_items (product_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS cart_order_items_access_granted_idx ON cart_order_items (access_granted)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS user_product_access_user_id_idx ON user_product_access (user_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS user_product_access_product_id_idx ON user_product_access (product_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS user_product_access_order_id_idx ON user_product_access (order_id)`);

  console.log('Seeding sample products...');
  const now = Date.now();
  await client.execute({
    sql: `INSERT OR IGNORE INTO products (id, name, description, price_amount, currency, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['p1', 'Basic Plan', 'Access to basic features', 2999, 'usd', 1, now, now]
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO products (id, name, description, price_amount, currency, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['p2', 'Pro Plan', 'Access to pro features', 9999, 'usd', 1, now, now]
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO products (id, name, description, price_amount, currency, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['p3', 'Enterprise Plan', 'Full access to all features', 29999, 'usd', 1, now, now]
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO products (id, name, description, price_amount, currency, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['p8', 'Premium Add-on', 'Premium add-on service', 4999, 'usd', 1, now, now]
  });

  console.log('Migration complete!');
  client.close();
}

runMigration().catch(console.error);
