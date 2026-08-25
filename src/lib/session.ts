/**
 * DEV-ONLY session mock. There is no backend, so "auth" here is a plain,
 * unsigned, non-HttpOnly cookie set from the client at the moment login or
 * registration succeeds. `src/proxy.ts` reads it to gate `/app` and
 * `/onboarding`.
 *
 * Production replacement: server-set HttpOnly/Secure/signed session cookies
 * via `cookies()` from `next/headers`, as documented in Next's own
 * authentication guide (`app/guides/authentication#stateless-sessions`).
 * Swap the cookie helpers below for real ones; `proxy.ts`'s matcher and
 * redirect logic do not need to change.
 */

const DEV_SESSION_COOKIE = "stayo_dev_session";
const PREVIEW_COOKIE = "stayo_preview";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function hasCookie(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((row) => row.startsWith(`${name}=`));
}

export function setDevSession() {
  setCookie(DEV_SESSION_COOKIE, "1");
}

export function setPreviewSession() {
  setCookie(PREVIEW_COOKIE, "1");
}

export function clearSession() {
  deleteCookie(DEV_SESSION_COOKIE);
  deleteCookie(PREVIEW_COOKIE);
}

export function hasDevSession(): boolean {
  return hasCookie(DEV_SESSION_COOKIE);
}

export function hasPreviewSession(): boolean {
  return hasCookie(PREVIEW_COOKIE);
}
