#!/usr/bin/env tsx
/**
 * asset-fetch.ts
 *
 * Phase 1 helper. Pulls CC0 GLB garment models and HDR environments
 * from Sketchfab (filter: CC0) and Khronos sample assets, normalizes
 * file names, and writes a manifest.
 *
 * Phase 0 ships the manifest schema only; live fetch in Phase 1.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'apps/web/public/models');
const manifestPath = join(outDir, 'manifest.json');

interface AssetEntry {
  id: string;
  slug: string;
  title: string;
  category: 'dress' | 'top' | 'bottom' | 'knitwear' | 'outerwear' | 'accessory';
  source: 'sketchfab' | 'khronos' | 'polyhaven' | 'custom';
  license: 'CC0' | 'CC-BY';
  sourceUrl: string;
  glbPath: string;
  sizeKb: number;
  colorZones: string[];
  /** For try-on: anchor bone names in the GLB */
  anchors?: string[];
}

const PHASE1_PLANNED_ASSETS: AssetEntry[] = [
  {
    id: 'rehab-dress-01',
    slug: 'soft-tailoring-dress',
    title: 'Soft Tailoring Dress',
    category: 'dress',
    source: 'khronos',
    license: 'CC0',
    sourceUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models',
    glbPath: '/models/soft-tailoring-dress.glb',
    sizeKb: 0,
    colorZones: ['fabric_primary', 'trim'],
  },
  {
    id: 'rehab-knit-01',
    slug: 'rehab-sweater',
    title: 'Rehab Sweater',
    category: 'knitwear',
    source: 'sketchfab',
    license: 'CC0',
    sourceUrl: 'https://sketchfab.com/',
    glbPath: '/models/rehab-sweater.glb',
    sizeKb: 0,
    colorZones: ['body', 'cuff', 'collar'],
  },
];

function main() {
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  writeFileSync(
    manifestPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), assets: PHASE1_PLANNED_ASSETS }, null, 2),
    'utf8',
  );
  console.log(`✓ Manifest written to ${manifestPath}`);
  console.log(`  ${PHASE1_PLANNED_ASSETS.length} assets planned for Phase 1.`);
}

main();
