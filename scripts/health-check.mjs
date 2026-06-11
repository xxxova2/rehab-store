#!/usr/bin/env node
/**
 * Local Medusa /health probe. Used as part of Phase 0 verification.
 * Usage:  node scripts/health-check.mjs
 */
import { request } from 'node:http';

const URL = process.env.MEDUSA_URL ?? 'http://localhost:9000/health';

function get(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, { method: 'GET', timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end();
  });
}

try {
  const r = await get(URL);
  if (r.status === 200) {
    console.log(`✓ Medusa healthy: ${URL}`);
    process.exit(0);
  }
  console.error(`✗ Medusa returned ${r.status}: ${r.body}`);
  process.exit(1);
} catch (e) {
  console.error(`✗ Medusa not reachable at ${URL}: ${e.message}`);
  process.exit(1);
}
