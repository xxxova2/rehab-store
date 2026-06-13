import pg from 'pg';

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

if (!DB_PASSWORD || !PROJECT_REF) {
  console.error('Missing SUPABASE_DB_PASSWORD and/or SUPABASE_PROJECT_REF env vars');
  process.exit(1);
}

async function main() {
  const pool = new pg.Pool({
    host: 'db.' + PROJECT_REF + '.supabase.co',
    port: 5432,
    user: 'postgres',
    password: DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query('CREATE POLICY "Public SELECT on products" ON products FOR SELECT USING (true)');
    console.log('RLS policy created for products SELECT');

    await client.query('CREATE POLICY "Public SELECT on inventory" ON inventory FOR SELECT USING (true)');
    console.log('RLS policy created for inventory SELECT');

    const { rows: policies } = await client.query(
      "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('products', 'inventory')"
    );
    console.log('\nActive policies:');
    policies.forEach((r: any) => console.log('  ' + r.tablename + ': ' + r.policyname));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
