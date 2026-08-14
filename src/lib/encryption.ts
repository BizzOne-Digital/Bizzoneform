import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export interface EncryptedValue {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
}

function getKeyVersion(): string {
  return process.env.CREDENTIALS_ACTIVE_KEY_VERSION || "v1";
}

function getEncryptionKey(version?: string): Buffer {
  const v = version || getKeyVersion();
  const envName = `CREDENTIALS_ENCRYPTION_KEY_${v.toUpperCase()}`;
  const keyBase64 = process.env[envName];
  if (!keyBase64) throw new Error(`${envName} is not configured`);
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32) {
    throw new Error(`${envName} must be a base64-encoded 32-byte key`);
  }
  return key;
}

export function encryptValue(plaintext: string, keyVersion?: string): EncryptedValue {
  const version = keyVersion || getKeyVersion();
  const key = getEncryptionKey(version);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: version,
  };
}

export function decryptValue(encrypted: EncryptedValue): string {
  const key = getEncryptionKey(encrypted.keyVersion);
  const iv = Buffer.from(encrypted.iv, "base64");
  const authTag = Buffer.from(encrypted.authTag, "base64");
  const ciphertext = Buffer.from(encrypted.ciphertext, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function encryptOptional(value: string | null | undefined): EncryptedValue | null {
  if (!value || !value.trim()) return null;
  return encryptValue(value.trim());
}
