import { readFile, writeFile, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
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
