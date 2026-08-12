import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadExternalScript, resetLoadedScripts } from './loadExternalScript';

const SRC = 'https://platform.twitter.com/widgets.js';

/** Fires `load` on every script tag currently in the document. */
function settleScripts(event: 'load' | 'error'): void {
  document.querySelectorAll('script').forEach((script) => {
    script.dispatchEvent(new Event(event));
  });
}

function scriptCount(src: string): number {
  return Array.from(document.querySelectorAll('script')).filter((s) => s.src === src).length;
}

beforeEach(() => {
  resetLoadedScripts();
  document.querySelectorAll('script').forEach((s) => s.remove());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loadExternalScript', () => {
  it('AC-SOC-001: appends exactly one script for two concurrent calls', async () => {
    const first = loadExternalScript(SRC);
    const second = loadExternalScript(SRC);

    // React 18 StrictMode double-mounts, and the share surface appears on more
    // than one route — without memoisation each would append its own tag.
    expect(scriptCount(SRC)).toBe(1);

    settleScripts('load');
    await expect(Promise.all([first, second])).resolves.toBeDefined();
    expect(scriptCount(SRC)).toBe(1);
  });

  it('returns the identical promise for the same URL', () => {
    const a = loadExternalScript(SRC);
    const b = loadExternalScript(SRC);

    expect(a).toBe(b);

    settleScripts('load');
  });

  it('sets async, anonymous CORS, and a restrictive referrer policy', () => {
    void loadExternalScript(SRC);

    const script = Array.from(document.querySelectorAll('script')).find((s) => s.src === SRC);
    expect(script?.async).toBe(true);
    expect(script?.crossOrigin).toBe('anonymous');
    expect(script?.referrerPolicy).toBe('strict-origin-when-cross-origin');

    settleScripts('load');
  });

  it('rejects and removes the tag when the script errors', async () => {
    const load = loadExternalScript(SRC);

    settleScripts('error');

    await expect(load).rejects.toThrow(/Failed to load/);
    expect(scriptCount(SRC)).toBe(0);
  });

  it('NFR-003: rejects after the timeout when the script never settles', async () => {
    const load = loadExternalScript(SRC, 6000);

    // An adblocker does not error the request, it stalls it — without the
    // timeout the fallback UI would never render.
    await vi.advanceTimersByTimeAsync(6001);

    await expect(load).rejects.toThrow(/Timed out/);
    expect(scriptCount(SRC)).toBe(0);
  });

  it('allows a retry after a failure rather than poisoning the URL', async () => {
    const first = loadExternalScript(SRC);
    settleScripts('error');
    await expect(first).rejects.toThrow();

    const second = loadExternalScript(SRC);
    expect(second).not.toBe(first);
    expect(scriptCount(SRC)).toBe(1);

    settleScripts('load');
    await expect(second).resolves.toBeUndefined();
  });
});
