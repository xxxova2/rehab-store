/**
 * Material Web loader.
 * Side-effect import that registers all M3 web components.
 * Call once in the root layout.
 */
export async function loadMaterialWeb() {
  if (typeof window === 'undefined') return;
  await import('@material/web/all.js');
}
