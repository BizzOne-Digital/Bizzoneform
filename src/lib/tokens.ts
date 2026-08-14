import { createHash, randomBytes } from "crypto";

export function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getTokenTtlDays(): number {
  const raw = process.env.CREDENTIALS_TOKEN_TTL_DAYS;
  const parsed = raw ? parseInt(raw, 10) : 14;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 14;
}

export function getTokenExpirationDate(from = new Date()): Date {
  const expires = new Date(from);
  expires.setDate(expires.getDate() + getTokenTtlDays());
  return expires;
}

export function buildCredentialsPublicUrl(token: string): string {
  const base = process.env.CREDENTIALS_PUBLIC_URL || "https://credentials.bizzonedigital.com";
  const url = new URL(base);
  url.searchParams.set("token", token);
  return url.toString();
}
