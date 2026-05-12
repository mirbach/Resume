import { readJson } from './storage.js';
import type { AppSettings, StorageSettings } from '../types.js';
import type { IStorageProvider } from './storage-provider.js';
import { LocalStorageProvider } from './providers/local.js';
import { S3StorageProvider } from './providers/s3.js';
import { SharePointStorageProvider } from './providers/sharepoint.js';

let _cached: IStorageProvider | null = null;

function buildProvider(storage: StorageSettings | undefined): IStorageProvider {
  const type = storage?.provider ?? 'local';
  if (type === 's3' && storage?.s3?.bucket) {
    return new S3StorageProvider(storage.s3);
  }
  if (type === 'sharepoint' && storage?.sharepoint?.tenantId) {
    return new SharePointStorageProvider(storage.sharepoint);
  }
  return new LocalStorageProvider();
}

export async function getProvider(): Promise<IStorageProvider> {
  if (_cached) return _cached;
  const settings = await readJson<AppSettings>('settings.json').catch(() => null);
  _cached = buildProvider(settings?.storage);
  return _cached;
}

export function invalidateProvider(): void {
  _cached = null;
}

export async function ensureUserData(provider: IStorageProvider, sub: string): Promise<void> {
  const { subToUserId, readJson: readLocalJson } = await import('./storage.js');
  const userId = subToUserId(sub);
  const key = `users/${userId}/resume.json`;
  if (!(await provider.keyExists(key))) {
    const seed = await readLocalJson('resume.example.json');
    await provider.writeJson(key, seed);
  }
}
