import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export function getDataPath(...segments: string[]): string {
  return path.join(DATA_DIR, ...segments);
}

export async function readJson<T>(filePath: string): Promise<T> {
  const fullPath = path.resolve(DATA_DIR, filePath);
  // Prevent path traversal
  if (!fullPath.startsWith(DATA_DIR)) {
    throw new Error('Invalid file path');
  }
  const content = await readFile(fullPath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const fullPath = path.resolve(DATA_DIR, filePath);
  if (!fullPath.startsWith(DATA_DIR)) {
    throw new Error('Invalid file path');
  }
  await writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function listJsonFiles(dirPath: string): Promise<string[]> {
  const fullPath = path.resolve(DATA_DIR, dirPath);
  if (!fullPath.startsWith(DATA_DIR)) {
    throw new Error('Invalid directory path');
  }
  if (!existsSync(fullPath)) return [];
  const files = await readdir(fullPath);
  return files.filter(f => f.endsWith('.json'));
}

export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.resolve(DATA_DIR, filePath);
  if (!fullPath.startsWith(DATA_DIR)) {
    throw new Error('Invalid file path');
  }
  await unlink(fullPath);
}

export function fileExists(filePath: string): boolean {
  const fullPath = path.resolve(DATA_DIR, filePath);
  if (!fullPath.startsWith(DATA_DIR)) return false;
  return existsSync(fullPath);
}

export { DATA_DIR };

// ---- Per-user storage helpers (multi-user mode) ----

/**
 * Deterministically map an OIDC sub claim to a safe directory name.
 * SHA-256 hex gives a fixed-length, filesystem-safe identifier.
 */
export function subToUserId(sub: string): string {
  return createHash('sha256').update(sub).digest('hex');
}

/**
 * Build an absolute path rooted at data/users/{userId}/...
 * Path-traversal safe: throws if the result escapes DATA_DIR.
 */
export function getUserDataPath(sub: string, ...segments: string[]): string {
  const userId = subToUserId(sub);
  const fullPath = path.join(DATA_DIR, 'users', userId, ...segments);
  if (!fullPath.startsWith(DATA_DIR)) throw new Error('Invalid user path');
  return fullPath;
}

/**
 * Ensure a user's workspace directory exists and is seeded with a starter
 * resume. Idempotent — no-ops if the directory already exists.
 */
export async function initUserDir(sub: string): Promise<void> {
  const userId = subToUserId(sub);
  const userDir = path.join(DATA_DIR, 'users', userId);
  if (existsSync(userDir)) return;

  await mkdir(path.join(userDir, 'themes'), { recursive: true });
  await mkdir(path.join(userDir, 'uploads'), { recursive: true });

  const examplePath = path.join(DATA_DIR, 'resume.example.json');
  const content = await readFile(examplePath, 'utf-8');
  await writeFile(path.join(userDir, 'resume.json'), content, 'utf-8');
}
