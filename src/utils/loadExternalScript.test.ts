import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadExternalScript, resetLoadedScripts } from './loadExternalScript';

const SRC = 'https://platform.twitter.com/widgets.js';

/** Fires load or error on every script tag in the document. */
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
  it('appends exactly one script for two concurrent calls', async () => {
    const first = loadExternalScript(SRC);
    const second = loadExternalScript(SRC);

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

  it('rejects after the timeout when the script never loads', async () => {
    const load = loadExternalScript(SRC, 6000);

    await vi.advanceTimersByTimeAsync(6001);

    await expect(load).rejects.toThrow(/Timed out/);
    expect(scriptCount(SRC)).toBe(0);
  });

  it('allows a retry after a failure', async () => {
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
