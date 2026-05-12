import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { IStorageProvider } from '../storage-provider.js';
import { DATA_DIR } from '../storage.js';

function safePath(key: string): string {
  const full = path.resolve(DATA_DIR, key);
  if (!full.startsWith(DATA_DIR)) throw new Error('Invalid storage key');
  return full;
}

export class LocalStorageProvider implements IStorageProvider {
  async readJson<T>(key: string): Promise<T> {
    const full = safePath(key);
    const content = await readFile(full, 'utf-8');
    return JSON.parse(content) as T;
  }

  async writeJson<T>(key: string, data: T): Promise<void> {
    const full = safePath(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, JSON.stringify(data, null, 2), 'utf-8');
  }

  async listKeys(prefix: string): Promise<string[]> {
    const full = safePath(prefix);
    if (!full.startsWith(DATA_DIR)) throw new Error('Invalid storage key');
    if (!existsSync(full)) return [];
    const files = await readdir(full);
    return files.filter(f => f.endsWith('.json'));
  }

  async deleteKey(key: string): Promise<void> {
    const full = safePath(key);
    await unlink(full);
  }

  async keyExists(key: string): Promise<boolean> {
    try {
      const full = safePath(key);
      return existsSync(full);
    } catch {
      return false;
    }
  }

  async readBinary(key: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const full = safePath(key);
    const buffer = await readFile(full);
    const ext = path.extname(key).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return { buffer, mimeType: mimeMap[ext] ?? 'application/octet-stream' };
  }

  async writeBinary(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    void mimeType;
    const full = safePath(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, buffer);
  }

  async deleteBinary(key: string): Promise<void> {
    const full = safePath(key);
    await unlink(full);
  }

  async listBinaryKeys(prefix: string): Promise<string[]> {
    const full = safePath(prefix);
    if (!full.startsWith(DATA_DIR)) throw new Error('Invalid storage key');
    if (!existsSync(full)) return [];
    const files = await readdir(full);
    return files.filter(f => !f.endsWith('.json'));
  }
}
