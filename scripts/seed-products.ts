import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const productData = require('../apps/web/src/data/products.json') as any[];

const DB_PASSWORD = 'WHFK9IODw3q4r7yp';
const PROJECT_REF = 'jvaiokjgntecfhfamesm';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YWlva2pnbnRlY2ZoZmFtZXNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEwMTY1MSwiZXhwIjoyMDk2Njc3NjUxfQ.HCDUECP1_3YLtJe9T-7_Z9MQEWND2BqVZOTXwStv71I';

async function main() {
  console.log('=== Step 1: Create tables & seed data ===\n');

  const pool = new pg.Pool({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        product_id TEXT PRIMARY KEY REFERENCES products(id),
        stock JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);
    console.log('✓ inventory table created');

    await client.query('DELETE FROM inventory');
    await client.query('DELETE FROM products');
    console.log('✓ cleared existing data');

    const items = productData as any[];
    for (const p of items) {
      await client.query(
        'INSERT INTO products (id, slug, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [p.id, p.slug, JSON.stringify(p)]
      );
    }
    console.log(`✓ seeded ${items.length} products`);

    for (const p of items) {
      const stockMap: Record<string, number> = {};
      for (const size of (p.sizes ?? [])) {
        stockMap[size] = 10;
      }
      await client.query(
        'INSERT INTO inventory (product_id, stock) VALUES ($1, $2) ON CONFLICT (product_id) DO NOTHING',
        [p.id, JSON.stringify(stockMap)]
      );
    }
    console.log(`✓ seeded ${items.length} inventory records`);

    const { rows: seeded } = await client.query('SELECT id, slug FROM products ORDER BY slug');
    console.log('\nProducts in database:');
    seeded.forEach(r => console.log(`  ${r.id.padEnd(30)} ${r.slug}`));

    const { rows: inv } = await client.query('SELECT product_id, stock FROM inventory');
    console.log('\nInventory records:', inv.length);
    inv.forEach(r => console.log(`  ${r.product_id.padEnd(30)} ${JSON.stringify(r.stock)}`));

  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n=== Step 2: Verify via Supabase REST API ===\n');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  
  const { data: restData, error } = await supabase.from('products').select('id, slug');
  if (error) {
    console.log('REST API error:', error.message);
  } else {
    console.log(`REST API: ${restData.length} products accessible`);
    restData.forEach(r => console.log(`  ${r.slug}`));
  }
}

main().catch(console.error);
