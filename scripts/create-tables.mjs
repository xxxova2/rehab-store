import pg from 'pg';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

// Extract project ref from Supabase URL (e.g. https://xxx.supabase.co → xxx)
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

async function tryDirect(poolConfig) {
  const pool = new pg.Pool(poolConfig);
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as ok');
    console.log('Connected!', result.rows);
    await client.release();
    await pool.end();
    return true;
  } catch(e) {
    console.log('Connection failed:', e.message);
    try { await pool.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log('=== Trying direct DB connections ===');

  // Try 1: Direct SSL connection
  const directConfig = {
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: serviceKey,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  };
  console.log('\n--- Direct connection (postgres / service-key) ---');
  let ok = await tryDirect(directConfig);

  if (!ok) {
    // Try 2: Pooler with service key as password
    const poolerConfig = {
      host: 'aws-0-eu-west-1.pooler.supabase.com',
      port: 5432,
      user: `postgres.${projectRef}`,
      password: serviceKey,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    };
    console.log('\n--- Pooler (service-key) ---');
    ok = await tryDirect(poolerConfig);
  }
  
  if (!ok) {
    console.log('\nCould not connect directly. Run the SQL via Supabase Dashboard → SQL Editor.');
    console.log('See apps/web/supabase-schema.sql for the full schema.');
  }
}
main();
