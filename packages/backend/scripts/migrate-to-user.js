#!/usr/bin/env node
/**
 * migrate-to-user.js
 *
 * One-off migration script: copies existing single-user data (resume.json,
 * themes/, uploads/) into a specific user's private workspace.
 *
 * Usage:
 *   node packages/backend/scripts/migrate-to-user.js <sub-claim>
 *
 * The <sub-claim> is the OIDC subject identifier from the user's id_token.
 * You can find it by decoding the id_token: the "sub" field in the JWT payload.
 *
 * Example:
 *   node packages/backend/scripts/migrate-to-user.js "auth0|64abc123"
 */

import { createHash } from 'crypto';
import { readdir, mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');

const sub = process.argv[2];
if (!sub) {
  console.error('Usage: node migrate-to-user.js <sub-claim>');
  process.exit(1);
}

const userId = createHash('sha256').update(sub).digest('hex');
const userDir = path.join(DATA_DIR, 'users', userId);

console.log(`Migrating to user directory: data/users/${userId}`);
console.log(`(sub: ${sub})\n`);

let migrated = 0;
let skipped = 0;

async function copy(src, dest, label) {
  if (!existsSync(src)) {
    console.log(`  skip  ${label} (not found)`);
    skipped++;
    return;
  }
  await copyFile(src, dest);
  console.log(`  ok    ${label}`);
  migrated++;
}

async function run() {
  // Create user directory structure
  await mkdir(path.join(userDir, 'themes'), { recursive: true });
  await mkdir(path.join(userDir, 'uploads'), { recursive: true });

  // Migrate resume.json
  await copy(
    path.join(DATA_DIR, 'resume.json'),
    path.join(userDir, 'resume.json'),
    'resume.json'
  );

  // Migrate personal themes (all except default — default stays global)
  const themesDir = path.join(DATA_DIR, 'themes');
  if (existsSync(themesDir)) {
    const themeFiles = (await readdir(themesDir)).filter(f => f.endsWith('.json') && f !== 'default.json');
    for (const file of themeFiles) {
      await copy(
        path.join(themesDir, file),
        path.join(userDir, 'themes', file),
        `themes/${file}`
      );
    }
    if (themeFiles.length === 0) {
      console.log('  skip  themes/ (only default.json found — stays global)');
    }
  } else {
    console.log('  skip  themes/ (directory not found)');
  }

  // Migrate uploads
  const uploadsDir = path.join(DATA_DIR, 'uploads');
  if (existsSync(uploadsDir)) {
    const uploadFiles = await readdir(uploadsDir);
    for (const file of uploadFiles) {
      await copy(
        path.join(uploadsDir, file),
        path.join(userDir, 'uploads', file),
        `uploads/${file}`
      );
    }
    if (uploadFiles.length === 0) {
      console.log('  skip  uploads/ (empty)');
    }
  } else {
    console.log('  skip  uploads/ (directory not found)');
  }

  console.log(`\nDone. ${migrated} file(s) migrated, ${skipped} skipped.`);
  console.log('\nNote: the original files are untouched. When auth is disabled,');
  console.log('the app still reads from data/resume.json (single-user mode).');
  console.log('You may delete them manually once you are satisfied with the migration.');
}

run().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
