import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ANNUAL_EMISSIONS_GT,
  TONNES_PER_SECOND,
  historicalTrend,
  sectorBreakdown,
  topEmitters,
  energyMix,
  carbonBudget,
  kpiData,
} from '../data/carbonMockData';

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

export function useCarbonLiveData() {
  const basetonnes = (dayOfYear() / 365.25) * ANNUAL_EMISSIONS_GT * 1e9;
  const [counter, setCounter] = useState(basetonnes);
  const startTime = useRef(performance.now());
  const rafId = useRef(0);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTime.current) / 1000;
    setCounter(basetonnes + elapsed * TONNES_PER_SECOND);
    rafId.current = requestAnimationFrame(tick);
  }, [basetonnes]);

  useEffect(() => {
    startTime.current = performance.now();
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [tick]);

  return {
    counter,
    kpis: kpiData,
    historicalTrend,
    sectorBreakdown,
    topEmitters,
    energyMix,
    carbonBudget,
  };
}

export default useCarbonLiveData;
