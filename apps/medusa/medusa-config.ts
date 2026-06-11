import { defineConfig, loadEnv } from '@medusajs/framework/utils';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const databaseUrl = process.env.DATABASE_URL || 'postgres://rehab:rehab@localhost:5432/rehab';

export default defineConfig({
  projectConfig: {
    databaseUrl,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000,http://localhost:3000',
      authCors: process.env.AUTH_CORS || 'http://localhost:3000',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  admin: {
    disable: false,
    backendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
  },
});
