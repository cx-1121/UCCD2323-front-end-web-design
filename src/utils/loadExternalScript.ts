/**
 * The third-party boundary (architecture §1, boundary 3).
 *
 * Vendor scripts are loaded only through here (FR-SOC-001), and only after
 * `ConsentProvider` reports `canLoadThirdParty` — this module deliberately does
 * *not* check consent itself, because a utility that silently no-ops would hide
 * the gate from the components that are supposed to enforce it.
 *
 * Three properties matter:
 *
 *  - **Idempotent per URL.** React 18 StrictMode mounts every component twice in
 *    development, and the share surface appears on more than one route. Without
 *    memoisation each of those would append another `<script>`.
 *  - **Time-boxed.** An adblocker does not fail a script request, it stalls it.
 *    Without a timeout the fallback UI would never render.
 *  - **Retryable after failure.** A rejected load is evicted from the cache so a
 *    later mount can try again, rather than being poisoned for the session.
 */

/** Ceiling before a vendor script is declared unavailable (NFR-003). */
export const SCRIPT_TIMEOUT_MS = 6000;

/** In-flight and settled loads, keyed by URL. */
const loads = new Map<string, Promise<void>>();

/** Finds an existing tag for this src, including one we did not create. */
function findExistingScript(src: string): HTMLScriptElement | null {
  const scripts = Array.from(document.querySelectorAll('script'));
  return scripts.find((script) => script.src === src) ?? null;
}

/**
 * Appends a vendor script and resolves once it has executed.
 *
 * @param src       Absolute HTTPS URL of the vendor script.
 * @param timeoutMs Override for the load ceiling; defaults to SCRIPT_TIMEOUT_MS.
 * @returns A promise shared by every caller for the same `src`.
 */
export function loadExternalScript(src: string, timeoutMs: number = SCRIPT_TIMEOUT_MS): Promise<void> {
  const inFlight = loads.get(src);
  if (inFlight) return inFlight;

  const load = new Promise<void>((resolve, reject) => {
    // A tag may already exist from a previous mount whose promise was evicted.
    // Re-appending would execute the vendor bundle twice.
    if (findExistingScript(src)?.dataset.loaded === 'true') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    // The vendors are third parties: send no referrer path and let SRI-less
    // loading at least be anonymous.
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

  // Evict on failure so a later mount can retry. The rejection is still
  // delivered to every current caller — this handler only manages the cache.
  load.catch(() => {
    loads.delete(src);
  });

  return load;
}

/**
 * Clears the memoisation table.
 *
 * Exported for tests only: module state persists across cases in a file, so
 * without this the "appends exactly one script" assertion would depend on test
 * ordering.
 */
export function resetLoadedScripts(): void {
  loads.clear();
}
