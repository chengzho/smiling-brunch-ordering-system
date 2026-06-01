/**
 * deploy-xampp.mjs
 *
 * Copies frontend/dist/ output into the project root so Apache at
 * http://localhost/restaurant-ordering/ can serve the React app.
 *
 * Safe rules:
 *   - Only removes known generated frontend files from the root.
 *   - Never removes or overwrites backend/source folders.
 */

import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// frontend/dist  (build output)
const DIST = join(__dirname, '..', 'dist');
// project root   (XAMPP htdocs/restaurant-ordering/)
const ROOT = join(__dirname, '..', '..');

// Only these root-level items may be deleted between builds.
const REMOVABLE = new Set(['index.html', 'assets', 'images']);

// These are NEVER touched, no matter what appears in dist/.
const PROTECTED = new Set([
  'api',
  'bootstrap.php',
  'config',
  'database',
  'frontend',
  'helpers',
  'README.md',
  'services',
  '.gitignore',
  '.htaccess',
]);

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  for (const entry of await readdir(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else {
      await copyFile(s, d);
    }
  }
}

// ── 1. Verify dist/ exists ────────────────────────────────────────────────────
if (!existsSync(DIST)) {
  console.error('ERROR: frontend/dist/ not found. Run "npm run build:xampp" first.');
  process.exit(1);
}

const distEntries = await readdir(DIST, { withFileTypes: true });
const distNames = distEntries.map((e) => e.name);
console.log(`\ndist/ contains: ${distNames.join(', ')}`);

// Warn about anything unexpected so the operator can review.
const unexpected = distNames.filter((n) => !REMOVABLE.has(n));
if (unexpected.length > 0) {
  console.warn(`\nWARNING: Unexpected items in dist/: ${unexpected.join(', ')}`);
  console.warn('They will be copied but will NOT be auto-cleaned on the next run');
  console.warn('unless you add them to REMOVABLE in this script.\n');
}

// ── 2. Remove stale generated files from root ─────────────────────────────────
console.log('\nCleaning previous build output from project root…');
for (const name of REMOVABLE) {
  const target = join(ROOT, name);
  if (existsSync(target)) {
    await rm(target, { recursive: true, force: true });
    console.log(`  removed: ${name}`);
  }
}

// ── 3. Copy dist/ → project root ─────────────────────────────────────────────
console.log('\nCopying build output to project root…');
for (const entry of distEntries) {
  const name = entry.name;

  if (PROTECTED.has(name)) {
    console.warn(`  SKIPPED (protected): ${name}`);
    continue;
  }

  const src = join(DIST, name);
  const dest = join(ROOT, name);

  if (entry.isDirectory()) {
    await copyDir(src, dest);
  } else {
    await copyFile(src, dest);
  }
  console.log(`  copied:  ${name}`);
}

console.log('\nDeploy complete.');
console.log('Open: http://localhost/restaurant-ordering/\n');
