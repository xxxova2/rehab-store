// Run: NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-supabase.mjs
// Or set the vars in your .env and run with: npx dotenv -- node scripts/seed-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function seed() {
  // Load products
  const productsPath = resolve(__dirname, '..', 'src', 'data', 'products.json');
  const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

  console.log(`Seeding ${products.length} products...`);
  for (const p of products) {
    const { error } = await supabase.from('products').upsert(
      { id: p.id, slug: p.slug, data: p },
      { onConflict: 'id' }
    );
    if (error) {
      console.error(`  Failed to seed product ${p.slug}:`, error.message);
    } else {
      console.log(`  ✓ ${p.slug}`);
    }
  }

  // Load collections
  const collectionsPath = resolve(__dirname, '..', 'src', 'data', 'collections.json');
  const collections = JSON.parse(readFileSync(collectionsPath, 'utf-8'));

  console.log(`\nSeeding ${collections.length} collections...`);
  for (const c of collections) {
    const { error } = await supabase.from('collections').upsert(
      { id: c.id, slug: c.slug, data: c },
      { onConflict: 'id' }
    );
    if (error) {
      console.error(`  Failed to seed collection ${c.slug}:`, error.message);
    } else {
      console.log(`  ✓ ${c.slug}`);
    }
  }

  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: collectionCount } = await supabase.from('collections').select('*', { count: 'exact', head: true });

  console.log(`\nDone — ${productCount} products, ${collectionCount} collections in Supabase.`);
}

seed().catch(console.error);
