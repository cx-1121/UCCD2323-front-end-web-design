import { useEffect, useState } from 'react';
import { FALLBACK_CARBON, getCarbonSnapshot } from '../api/carbonApi';
import type { CarbonSnapshot, SnapshotSource } from '../api/types';

/**
 * The carbon snapshot as static figures — no ticking projection.
 *
 * `useCarbonLiveData` is the dashboard's hook and is right for the dashboard:
 * it runs a requestAnimationFrame loop that calls setState every frame so the
 * year-to-date counter moves on screen. That is a re-render per frame for as
 * long as the page is open, which a narrative page that merely *cites* the
 * figures must not pay. This reads the same cached snapshot and stops there.
 *
 * `source` is passed through rather than hidden: a page that shows a bundled
 * fallback while claiming to be live is lying about its own provenance, and
 * this project cites every figure it prints.
 */
export function useCarbonFigures() {
  const [snapshot, setSnapshot] = useState<CarbonSnapshot>(FALLBACK_CARBON);
  const [source, setSource] = useState<SnapshotSource>('fallback');

  useEffect(() => {
    let live = true;

    getCarbonSnapshot()
      .then((result) => {
        if (!live) return;
        setSnapshot(result.snapshot);
        setSource(result.source);
      })
      .catch((caught: unknown) => {
        // The bundled figures are already in state and are real World Bank
        // numbers; there is nothing to recover, only something to record.
        console.warn('[api] Carbon figures unavailable; using bundled values.', caught);
      });

    return () => {
      live = false;
    };
  }, []);

  return { snapshot, source };
}

export default useCarbonFigures;
