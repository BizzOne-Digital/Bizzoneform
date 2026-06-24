import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "bizzone-fallback-secret-change-in-prod"
);

export async function createSession(): Promise<string> {
  return new SignJWT({ auth: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const jar = await cookies();
    const token = jar.get("bz_auth")?.value;
    if (!token) return false;
    await jwtVerify(token, secret);
    return true;
  } catch { return false; }
}