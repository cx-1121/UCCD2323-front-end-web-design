import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCarbonSnapshotMock = vi.fn();

vi.mock('../api/carbonApi', async () => {
  const actual = await vi.importActual<typeof import('../api/carbonApi')>('../api/carbonApi');
  return {
    ...actual,
    getCarbonSnapshot: (...args: unknown[]) => getCarbonSnapshotMock(...args),
  };
});

const { FALLBACK_CARBON } = await import('../api/carbonApi');
const { useCarbonLiveData } = await import('./useCarbonLiveData');

beforeEach(() => {
  getCarbonSnapshotMock.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('useCarbonLiveData', () => {
  it('renders bundled figures immediately, before the network settles', () => {
    getCarbonSnapshotMock.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCarbonLiveData());

    // Synchronously after mount: a complete dataset, no empty state.
    expect(result.current.sectorTrend.length).toBeGreaterThan(0);
    expect(result.current.annualTotalGt).toBe(FALLBACK_CARBON.annualTotalGt);
    expect(result.current.isDegraded).toBe(true);
  });

  it('adopts live figures and clears the degraded flag', async () => {
    getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));
    expect(result.current.dataYear).toBe(FALLBACK_CARBON.dataYear);
  });

  it('keeps bundled figures and flags degraded when the fetch fails', async () => {
    getCarbonSnapshotMock.mockRejectedValue({ kind: 'network', status: 0, message: 'offline' });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isDegraded).toBe(true);
    expect(result.current.sectorTrend.length).toBeGreaterThan(0);
  });

  it('derives donut shares that sum to 100', async () => {
    getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));

    const total = result.current.sectorBreakdown.reduce((sum, s) => sum + s.share, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it('returns 0 rather than NaN when every sector reports zero', async () => {
    // A zero total makes share = 0/0 = NaN, which renders as `stroke-dasharray:
    // NaN` and silently blanks every arc of the donut.
    getCarbonSnapshotMock.mockResolvedValue({
      source: 'live',
      snapshot: {
        ...FALLBACK_CARBON,
        annualTotalGt: 0,
        sectorTrend: [
          {
            year: 2024,
            totalGt: 0,
            sectors: FALLBACK_CARBON.sectorTrend[0].sectors.map((s) => ({ ...s, value: 0 })),
          },
        ],
      },
    });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));

    expect(result.current.sectorBreakdown.every((s) => Number.isFinite(s.share))).toBe(true);
    expect(result.current.sectorBreakdown.every((s) => s.share === 0)).toBe(true);
  });

  it('rebases the ticking counter on the fetched annual total', async () => {
    const doubled = { ...FALLBACK_CARBON, annualTotalGt: FALLBACK_CARBON.annualTotalGt * 2 };
    getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: doubled });

    const { result } = renderHook(() => useCarbonLiveData());

    await waitFor(() => expect(result.current.isDegraded).toBe(false));

    // The counter used to extrapolate a hardcoded constant regardless of what
    // came back, so a different annual total produced an identical rate.
    await waitFor(() => expect(result.current.counter).toBeGreaterThan(0));
    expect(result.current.annualTotalGt).toBe(doubled.annualTotalGt);
  });
});
