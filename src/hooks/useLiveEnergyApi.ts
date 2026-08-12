import { useCallback, useEffect, useRef, useState } from 'react';
import { FALLBACK_SNAPSHOT, getEnergySnapshot } from '../api/energyApi';
import { isApiError, type ApiError, type LiveEnergySnapshot, type SnapshotSource } from '../api/types';

/**
 * React binding over the energy API (FR-API-006).
 *
 * State starts at the bundled fallback rather than `null`, so the Dashboard
 * renders a complete panel on its first frame and never shows a spinner-shaped
 * hole while the network settles (NFR-001). A failed fetch therefore needs no
 * special-casing in the component — the fallback is simply never replaced, and
 * the badge reports `fallback`.
 */
export function useLiveEnergyApi() {
  const [snapshot, setSnapshot] = useState<LiveEnergySnapshot>(FALLBACK_SNAPSHOT);
  const [source, setSource] = useState<SnapshotSource>('fallback');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Guards against retry storms (S5): the Refresh button is disabled while a
   * request is pending, but a ref is what actually enforces it — a double-click
   * landing inside the same React batch would otherwise pass the disabled check
   * twice and fire two request chains of three attempts each.
   */
  const inFlight = useRef(false);

  /** Prevents a setState after unmount when a slow request finally settles. */
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * @param force        Bypass the cache (Refresh control).
   * @param announceLoad Flip `isLoading` on entry. The initial mount passes
   *                     `false`: `isLoading` already starts `true`, so setting
   *                     it again would be a redundant synchronous setState
   *                     inside an effect — which React flags as a cascading
   *                     render, and which buys nothing.
   */
  const load = useCallback(async (force = false, announceLoad = true) => {
    if (inFlight.current) return;

    inFlight.current = true;
    if (announceLoad) setIsLoading(true);

    try {
      const result = await getEnergySnapshot(force);
      if (!isMounted.current) return;

      setSnapshot(result.snapshot);
      setSource(result.source);
      setError(null);
    } catch (caught) {
      if (!isMounted.current) return;

      // `http.ts` only ever rejects with an ApiError; anything else means a
      // defect in our own code rather than an upstream failure, and is worth
      // reporting distinctly instead of silently labelling it a network issue.
      const normalised: ApiError = isApiError(caught)
        ? caught
        : { kind: 'shape', status: 0, message: String(caught) };

      setError(normalised);
      setSource('fallback');
      console.warn(`[api] Live energy data unavailable (${normalised.kind}); using fallback.`);
    } finally {
      inFlight.current = false;
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // react-hooks/set-state-in-effect flags any effect that reaches a setState
    // through a called function, without distinguishing synchronous calls from
    // post-await ones. Here `load(false, false)` performs no synchronous state
    // update at all — `announceLoad: false` skips the only one, and everything
    // else happens after `await getEnergySnapshot()`. Fetching on mount is the
    // legitimate "subscribe to an external system" case the rule documents.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false, false);
  }, [load]);

  return {
    snapshot,
    source,
    isLoading,
    error,
    /** True whenever the figures on screen are not live upstream data. */
    isDegraded: source === 'fallback',
    refresh: () => load(true),
  };
}

export default useLiveEnergyApi;
