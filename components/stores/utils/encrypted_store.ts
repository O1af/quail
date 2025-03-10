"use client";
import { StateStorage } from "zustand/middleware";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-key-32-chars-security123";

// Encryption/decryption helpers
export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(data: string): string {
  const buf = Buffer.from(data, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}

const isClient = typeof window !== "undefined";

// Original encrypted local storage implementation
export const encryptedStorage: StateStorage = {
  getItem: (name: string) => {
    if (!isClient) return null;
    try {
      const encrypted = localStorage.getItem(name);
      return encrypted ? decrypt(encrypted) : null;
    } catch (e) {
      console.error("Decryption failed:", e);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (!isClient) return;
    try {
      localStorage.setItem(name, encrypt(value));
    } catch (e) {
      console.error("Encryption failed:", e);
    }
  },
  removeItem: (name: string) => {
    if (!isClient) return;
    localStorage.removeItem(name);
  },
};
