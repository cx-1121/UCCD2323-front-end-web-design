/**
 * Cookie utility functions.
 *
 * All cookie access in the app goes through this module.
 * Names and values are percent-encoded to prevent corruption.
 */

/** Milliseconds in a day. */
const MS_PER_DAY = 86_400_000;

/** Seconds in a day. */
const SECONDS_PER_DAY = 86_400;

/** Default path scope. */
const DEFAULT_PATH = '/';

/** Default cross-site policy. */
const DEFAULT_SAME_SITE: SameSitePolicy = 'Lax';

export type SameSitePolicy = 'Strict' | 'Lax' | 'None';

export interface CookieOptions {
  /** Lifetime in days. Omitted or <= 0 produces a session cookie. */
  days?: number;
  /** URL scope. Defaults to `/`. */
  path?: string;
  /** Cross-site sending policy. Defaults to `Lax`. */
  sameSite?: SameSitePolicy;
  /** Restrict to HTTPS. Defaults to auto-detect based on current protocol. */
  secure?: boolean;
}

/**
 * Reads a single cookie by name.
 * Returns the decoded value, or null if not found.
 */
export function getCookie(name: string): string | null {
  try {
    const jar = document.cookie;
    if (!jar) return null;

    const target = `${encodeURIComponent(name)}=`;

    for (const entry of jar.split('; ')) {
      if (entry.startsWith(target)) {
        return decodeURIComponent(entry.slice(target.length));
      }
    }

    return null;
  } catch (error) {
    console.warn(`[cookies] Unable to read "${name}".`, error);
    return null;
  }
}

/** Writes a cookie with optional expiry and security settings. */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    days,
    path = DEFAULT_PATH,
    sameSite = DEFAULT_SAME_SITE,
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
  } = options;

  try {
    const segments = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`, `path=${path}`];

    if (typeof days === 'number' && days > 0) {
      segments.push(`expires=${new Date(Date.now() + days * MS_PER_DAY).toUTCString()}`);
      segments.push(`max-age=${Math.floor(days * SECONDS_PER_DAY)}`);
    }

    segments.push(`samesite=${sameSite}`);

    if (secure || sameSite === 'None') {
      segments.push('secure');
    }

    document.cookie = segments.join('; ');
  } catch (error) {
    console.warn(`[cookies] Unable to write "${name}".`, error);
  }
}

/** Deletes a cookie by setting its expiry to the past. */
export function removeCookie(name: string, path: string = DEFAULT_PATH): void {
  try {
    document.cookie = [
      `${encodeURIComponent(name)}=`,
      `path=${path}`,
      'expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'max-age=0',
    ].join('; ');
  } catch (error) {
    console.warn(`[cookies] Unable to remove "${name}".`, error);
  }
}
