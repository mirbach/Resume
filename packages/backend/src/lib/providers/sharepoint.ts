import type { IStorageProvider } from '../storage-provider.js';
import type { SharePointStorageSettings } from '../../types.js';

interface TokenCache {
  token: string;
  expiresAt: number;
}

interface GraphItem {
  id: string;
  name: string;
  file?: { mimeType: string };
  '@microsoft.graph.downloadUrl'?: string;
}

export class SharePointStorageProvider implements IStorageProvider {
  private settings: SharePointStorageSettings;
  private tokenCache: TokenCache | null = null;
  private siteId: string | null = null;
  private driveId: string | null = null;

  constructor(settings: SharePointStorageSettings) {
    this.settings = settings;
  }

  private async getToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt - Date.now() > 60_000) {
      return this.tokenCache.token;
    }
    const url = `https://login.microsoftonline.com/${this.settings.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.settings.clientId,
      client_secret: this.settings.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    });
    const res = await fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!res.ok) throw new Error(`SharePoint auth failed: ${res.status} ${await res.text()}`);
    const json = await res.json() as { access_token: string; expires_in: number };
    this.tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
    return this.tokenCache.token;
  }

  private async graphFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken();
    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...init?.headers },
    });
    return res;
  }

  private async getSiteId(): Promise<string> {
    if (this.siteId) return this.siteId;
    const url = new URL(this.settings.siteUrl);
    const hostname = url.hostname;
    const sitePath = url.pathname.replace(/^\//, '');
    const res = await this.graphFetch(`/sites/${hostname}:/${sitePath}`);
    if (!res.ok) throw new Error(`Failed to resolve SharePoint site: ${res.status}`);
    const json = await res.json() as { id: string };
    this.siteId = json.id;
    return this.siteId;
  }

  private async getDriveId(): Promise<string> {
    if (this.driveId) return this.driveId;
    const siteId = await this.getSiteId();
    const res = await this.graphFetch(`/sites/${siteId}/drives`);
    if (!res.ok) throw new Error(`Failed to list SharePoint drives: ${res.status}`);
    const json = await res.json() as { value: Array<{ id: string; name: string }> };
    const drive = json.value.find(d => d.name === this.settings.driveName);
    if (!drive) throw new Error(`Drive "${this.settings.driveName}" not found`);
    this.driveId = drive.id;
    return this.driveId;
  }

  private itemPath(key: string): string {
    const base = this.settings.folderPath ? this.settings.folderPath.replace(/\/?$/, '/') : '';
    return `${base}${key}`;
  }

  private async itemUrl(key: string): Promise<string> {
    const driveId = await this.getDriveId();
    const p = this.itemPath(key);
    return `/drives/${driveId}/root:/${p}:`;
  }

  async readJson<T>(key: string): Promise<T> {
    const url = await this.itemUrl(key);
    const res = await this.graphFetch(`${url}/content`);
    if (!res.ok) throw new Error(`SharePoint read failed: ${res.status}`);
    return res.json() as Promise<T>;
  }

  async writeJson<T>(key: string, data: T): Promise<void> {
    const url = await this.itemUrl(key);
    const res = await this.graphFetch(`${url}/content`, {
      method: 'PUT',
      body: JSON.stringify(data, null, 2),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`SharePoint write failed: ${res.status}`);
  }

  async listKeys(prefix: string): Promise<string[]> {
    const driveId = await this.getDriveId();
    const folderBase = this.settings.folderPath ? this.settings.folderPath.replace(/\/?$/, '/') : '';
    const folderPath = `${folderBase}${prefix}`.replace(/\/$/, '');
    const res = await this.graphFetch(`/drives/${driveId}/root:/${folderPath}:/children`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`SharePoint list failed: ${res.status}`);
    const json = await res.json() as { value: GraphItem[] };
    return json.value
      .filter(item => item.file && item.name.endsWith('.json'))
      .map(item => item.name);
  }

  async deleteKey(key: string): Promise<void> {
    const url = await this.itemUrl(key);
    const infoRes = await this.graphFetch(url);
    if (!infoRes.ok) throw new Error(`SharePoint item not found: ${infoRes.status}`);
    const item = await infoRes.json() as GraphItem;
    const driveId = await this.getDriveId();
    const delRes = await this.graphFetch(`/drives/${driveId}/items/${item.id}`, { method: 'DELETE' });
    if (!delRes.ok && delRes.status !== 204) throw new Error(`SharePoint delete failed: ${delRes.status}`);
  }

  async keyExists(key: string): Promise<boolean> {
    try {
      const url = await this.itemUrl(key);
      const res = await this.graphFetch(url);
      return res.ok;
    } catch {
      return false;
    }
  }

  async readBinary(key: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const url = await this.itemUrl(key);
    const infoRes = await this.graphFetch(url);
    if (!infoRes.ok) throw new Error(`SharePoint item not found: ${infoRes.status}`);
    const item = await infoRes.json() as GraphItem;

    const contentRes = await this.graphFetch(`${url}/content`);
    if (!contentRes.ok) throw new Error(`SharePoint binary read failed: ${contentRes.status}`);
    const arrayBuffer = await contentRes.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: item.file?.mimeType ?? 'application/octet-stream',
    };
  }

  async writeBinary(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    const url = await this.itemUrl(key);
    const res = await this.graphFetch(`${url}/content`, {
      method: 'PUT',
      body: buffer as unknown as BodyInit,
      headers: { 'Content-Type': mimeType },
    });
    if (!res.ok) throw new Error(`SharePoint binary write failed: ${res.status}`);
  }

  async deleteBinary(key: string): Promise<void> {
    return this.deleteKey(key);
  }

  async listBinaryKeys(prefix: string): Promise<string[]> {
    const driveId = await this.getDriveId();
    const folderBase = this.settings.folderPath ? this.settings.folderPath.replace(/\/?$/, '/') : '';
    const folderPath = `${folderBase}${prefix}`.replace(/\/$/, '');
    const res = await this.graphFetch(`/drives/${driveId}/root:/${folderPath}:/children`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`SharePoint list failed: ${res.status}`);
    const json = await res.json() as { value: GraphItem[] };
    return json.value
      .filter(item => item.file && !item.name.endsWith('.json'))
      .map(item => item.name);
  }
}
