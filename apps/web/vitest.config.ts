import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@rehab/types': resolve(__dirname, '../../packages/types/src'),
      '@/*': resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
});
