#!/usr/bin/env node
// Stamps a content hash onto every local asset reference so browsers fetch a
// fresh copy whenever the code actually changes — and keep using their cache
// when it does not.
//
// Covers three places a stale file can hide:
//   1. <link href="css/styles.css">      in web/index.html
//   2. <script src="js/app.js">          in web/index.html
//   3. relative ES module specifiers     in web/js/**/*.js
//
// (3) matters because the browser resolves `import './helpers.js'` on its own,
// so versioning only the entry script still leaves the rest of the module
// graph cached.
//
// Usage:
//   node scripts/cache-bust.mjs          stamp files in place
//   node scripts/cache-bust.mjs --check  exit 1 if stamps are out of date (CI)

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webDir = path.join(rootDir, 'web');
const checkOnly = process.argv.includes('--check');

const HASH_LENGTH = 10;
// Any existing ?v=… on a local asset reference. Stripped before hashing so the
// hash depends on real content only and stays stable across repeated runs.
const VERSION_PARAM = /\?v=[^"'\s)]*/g;

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return [fullPath];
  }));
  return files.flat();
}

function stripVersions(source) {
  return source.replace(VERSION_PARAM, '');
}

function stampHtml(source, hash) {
  // href="css/styles.css" / src="js/app.js" → …?v=<hash>
  return source.replace(
    /(\b(?:href|src)=")((?:css|js)\/[^"?]+\.(?:css|js))"/g,
    (_match, attr, assetPath) => `${attr}${assetPath}?v=${hash}"`
  );
}

function stampJs(source, hash) {
  // from './helpers.js'  and  import('./real-provider.js')
  return source.replace(
    /(\bfrom\s*'|\bimport\s*\(\s*')(\.{1,2}\/[^']+\.m?js)'/g,
    (_match, prefix, modulePath) => `${prefix}${modulePath}?v=${hash}'`
  );
}

const allFiles = await collectFiles(webDir);
const assetFiles = allFiles.filter((file) => /\.(css|js|mjs)$/.test(file));
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));

// Hash the unstamped content of every CSS/JS asset. One shared hash keeps the
// module graph consistent: a change anywhere invalidates every reference, which
// is what we want for a small app with no bundler.
const hasher = crypto.createHash('sha256');
for (const file of assetFiles.sort()) {
  const source = await fs.readFile(file, 'utf8');
  hasher.update(path.relative(rootDir, file));
  hasher.update(stripVersions(source));
}
const hash = hasher.digest('hex').slice(0, HASH_LENGTH);

const stale = [];
for (const file of [...htmlFiles, ...assetFiles]) {
  const original = await fs.readFile(file, 'utf8');
  const bare = stripVersions(original);
  const stamped = file.endsWith('.html') ? stampHtml(bare, hash) : stampJs(bare, hash);
  if (stamped === original) continue;

  stale.push(path.relative(rootDir, file));
  if (!checkOnly) await fs.writeFile(file, stamped);
}

if (checkOnly) {
  if (stale.length) {
    console.error(`Cache-bust stamps are out of date (expected v=${hash}):`);
    stale.forEach((file) => console.error(`  - ${file}`));
    console.error('Run: npm run cache-bust');
    process.exit(1);
  }
  console.log(`Cache-bust stamps are up to date (v=${hash}).`);
} else {
  console.log(stale.length
    ? `Stamped v=${hash} on ${stale.length} file${stale.length === 1 ? '' : 's'}.`
    : `Already stamped with v=${hash}; nothing to do.`);
}

