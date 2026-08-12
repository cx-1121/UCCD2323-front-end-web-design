/**
 * The cookie boundary (architecture §1, boundary 1).
 *
 * `document.cookie` is a string-concatenation API with sharp edges: reading it
 * yields every cookie for the origin joined by `'; '`, writing it appends or
 * replaces one entry, and deletion is expressed as a write with an expiry in
 * the past. Names and values must be percent-encoded or a value containing
 * `;` or `=` silently corrupts the whole jar.
 *
 * Every `document.cookie` access in the app goes through this module
 * (FR-STO-002). Nothing here throws — a browser with cookies disabled reads as
 * "no cookie present", which is the correct interpretation anyway.
 */

/** Milliseconds in a day, for translating the `days` option into an expiry. */
const MS_PER_DAY = 86_400_000;

/** Seconds in a day, for the `Max-Age` attribute. */
const SECONDS_PER_DAY = 86_400;

/** Default scope: the whole site, so a decision made on /quiz applies on /about. */
const DEFAULT_PATH = '/';

/** Cross-site posture. `Lax` sends the cookie on top-level navigation only. */
const DEFAULT_SAME_SITE: SameSitePolicy = 'Lax';

export type SameSitePolicy = 'Strict' | 'Lax' | 'None';

export interface CookieOptions {
  /** Lifetime in days. Omitted or <= 0 produces a session cookie. */
  days?: number;
  /** URL scope. Defaults to `/`. */
  path?: string;
  /** Cross-site sending policy. Defaults to `Lax`. */
  sameSite?: SameSitePolicy;
  /**
   * Restrict to HTTPS. Defaults to auto — on when the page is already HTTPS.
   * Forcing `Secure` on a `http://localhost` dev server would make the cookie
   * silently unwritable, which is exactly the kind of "works in prod, broken in
   * dev" trap worth designing out.
   */
  secure?: boolean;
}

/**
 * Reads a single cookie by name.
 *
 * @returns The decoded value, or `null` when the cookie is absent or cookies
 *          are unavailable.
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

/**
 * Writes a cookie.
 *
 * Emits both `Expires` and `Max-Age`: `Max-Age` is authoritative in every
 * modern browser, while `Expires` keeps the intent legible in devtools and
 * covers the rare client that ignores `Max-Age`.
 */
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

    // SameSite=None is only honoured alongside Secure; browsers reject the pair
    // otherwise, which would drop the cookie entirely.
    if (secure || sameSite === 'None') {
      segments.push('secure');
    }

    document.cookie = segments.join('; ');
  } catch (error) {
    console.warn(`[cookies] Unable to write "${name}".`, error);
  }
}

/**
 * Deletes a cookie by expiring it in the past.
 *
 * The `path` must match the one used at write time — a mismatch creates a
 * second, differently-scoped cookie instead of removing the original.
 */
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
