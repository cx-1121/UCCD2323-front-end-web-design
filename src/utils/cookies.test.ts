import { afterEach, describe, expect, it } from 'vitest';
import { getCookie, removeCookie, setCookie } from './cookies';

/** Clear all cookies between test cases. */
function clearAllCookies(): void {
  for (const entry of document.cookie.split('; ')) {
    const name = entry.split('=')[0];
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

describe('cookies', () => {
  afterEach(clearAllCookies);

  it('writes a value, reads it back, and removes it', () => {
    setCookie('k', 'v', { days: 1 });
    expect(getCookie('k')).toBe('v');

    removeCookie('k');
    expect(getCookie('k')).toBeNull();
  });

  it('returns null for a cookie that was never written', () => {
    expect(getCookie('never_written')).toBeNull();
  });

  it('percent-encodes values so separators cannot corrupt the jar', () => {
    setCookie('tricky', 'a;b=c d', { days: 1 });

    expect(getCookie('tricky')).toBe('a;b=c d');
  });

  it('keeps sibling cookies independent', () => {
    setCookie('first', '1', { days: 1 });
    setCookie('second', '2', { days: 1 });

    expect(getCookie('first')).toBe('1');
    expect(getCookie('second')).toBe('2');

    removeCookie('first');

    expect(getCookie('first')).toBeNull();
    expect(getCookie('second')).toBe('2');
  });

  it('does not match a cookie whose name is a prefix of another', () => {
    setCookie('consent_extra', 'no', { days: 1 });

    expect(getCookie('consent')).toBeNull();
  });

  it('writes a session cookie when no expiry is given', () => {
    setCookie('session_only', 'yes');

    expect(getCookie('session_only')).toBe('yes');
  });
});
