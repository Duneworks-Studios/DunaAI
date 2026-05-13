import { randomBytes, createHash } from "node:crypto";

const COOKIE = "duna_csrf";
const HEADER = "x-csrf-token";

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashCsrfToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export { COOKIE as CSRF_COOKIE_NAME, HEADER as CSRF_HEADER_NAME };
