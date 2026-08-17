/**
 * Loads third-party scripts (e.g. Twitter/X embed widget).
 *
 * Features:
 * - Only loads each script once (even with React StrictMode double-mounts)
 * - Times out after 6 seconds if the script never loads
 * - Allows retry after failure
 */

/** Timeout before a script is considered unavailable (6 seconds). */
export const SCRIPT_TIMEOUT_MS = 6000;

/** Tracks in-flight and completed script loads by URL. */
const loads = new Map<string, Promise<void>>();

/** Finds an existing script tag for this src. */
function findExistingScript(src: string): HTMLScriptElement | null {
  const scripts = Array.from(document.querySelectorAll('script'));
  return scripts.find((script) => script.src === src) ?? null;
}

/**
 * Appends a vendor script and resolves once it has executed.
 * Returns the same promise for duplicate calls with the same URL.
 */
export function loadExternalScript(src: string, timeoutMs: number = SCRIPT_TIMEOUT_MS): Promise<void> {
  const inFlight = loads.get(src);
  if (inFlight) return inFlight;

  const load = new Promise<void>((resolve, reject) => {
    // Check if the script was already loaded in a previous mount
    if (findExistingScript(src)?.dataset.loaded === 'true') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'strict-origin-when-cross-origin';

    const timer = window.setTimeout(() => {
      script.remove();
      reject(new Error(`Timed out loading ${src} after ${timeoutMs} ms.`));
    }, timeoutMs);

    script.addEventListener('load', () => {
      window.clearTimeout(timer);
      script.dataset.loaded = 'true';
      resolve();
    });

    script.addEventListener('error', () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error(`Failed to load ${src}.`));
    });

    document.head.appendChild(script);
  });

  loads.set(src, load);

  // Remove from cache on failure so we can retry later
  load.catch(() => {
    loads.delete(src);
  });

  return load;
}

/** Clears the script cache (used in tests). */
export function resetLoadedScripts(): void {
  loads.clear();
}
