export interface IStorageProvider {
  readJson<T>(key: string): Promise<T>;
  writeJson<T>(key: string, data: T): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
  deleteKey(key: string): Promise<void>;
  keyExists(key: string): Promise<boolean>;

  readBinary(key: string): Promise<{ buffer: Buffer; mimeType: string }>;
  writeBinary(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  deleteBinary(key: string): Promise<void>;
  listBinaryKeys(prefix: string): Promise<string[]>;
}
