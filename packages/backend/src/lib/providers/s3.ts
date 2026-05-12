import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import type { IStorageProvider } from '../storage-provider.js';
import type { S3StorageSettings } from '../../types.js';

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as unknown as Uint8Array));
  }
  return Buffer.concat(chunks);
}

export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;
  private prefix: string;

  constructor(settings: S3StorageSettings) {
    this.bucket = settings.bucket;
    this.prefix = settings.prefix ? settings.prefix.replace(/\/?$/, '/') : '';

    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: settings.region || 'us-east-1',
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    };
    if (settings.endpoint) clientConfig.endpoint = settings.endpoint;

    this.client = new S3Client(clientConfig);
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async readJson<T>(key: string): Promise<T> {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(key) }));
    const body = await streamToBuffer(res.Body as NodeJS.ReadableStream);
    return JSON.parse(body.toString('utf-8')) as T;
  }

  async writeJson<T>(key: string, data: T): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.key(key),
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    }));
  }

  async listKeys(prefix: string): Promise<string[]> {
    const fullPrefix = this.key(prefix);
    const res = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: fullPrefix,
      Delimiter: '/',
    }));
    return (res.Contents ?? [])
      .map(obj => obj.Key?.slice(fullPrefix.length) ?? '')
      .filter(k => k.length > 0 && k.endsWith('.json'));
  }

  async deleteKey(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.key(key) }));
  }

  async keyExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.key(key) }));
      return true;
    } catch {
      return false;
    }
  }

  async readBinary(key: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(key) }));
    const buffer = await streamToBuffer(res.Body as NodeJS.ReadableStream);
    return { buffer, mimeType: res.ContentType ?? 'application/octet-stream' };
  }

  async writeBinary(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.key(key),
      Body: buffer,
      ContentType: mimeType,
    }));
  }

  async deleteBinary(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.key(key) }));
  }

  async listBinaryKeys(prefix: string): Promise<string[]> {
    const fullPrefix = this.key(prefix);
    const res = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: fullPrefix,
      Delimiter: '/',
    }));
    return (res.Contents ?? [])
      .map(obj => obj.Key?.slice(fullPrefix.length) ?? '')
      .filter(k => k.length > 0 && !k.endsWith('.json'));
  }
}
