import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "@/lib/env";

function deriveKey(): Buffer {
  const raw = env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("INTEGRATION_TOKEN_ENCRYPTION_KEY no configurada");
  }
  if (/^[A-Za-z0-9+/=]+$/.test(raw) && raw.length >= 43) {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  }
  return createHash("sha256").update(raw).digest();
}

/** Cifra texto con AES-256-GCM. Formato: base64(iv).base64(tag).base64(ciphertext) */
export function encryptSecret(plain: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  const key = deriveKey();
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Token cifrado inválido");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function encryptionConfigured(): boolean {
  return Boolean(env.INTEGRATION_TOKEN_ENCRYPTION_KEY);
}