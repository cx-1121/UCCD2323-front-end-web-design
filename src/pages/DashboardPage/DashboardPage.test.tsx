import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getEnergySnapshotMock = vi.fn();
const getCarbonSnapshotMock = vi.fn();

vi.mock('../../api/energyApi', async () => {
  const actual = await vi.importActual<typeof import('../../api/energyApi')>('../../api/energyApi');
  return {
    ...actual,
    getEnergySnapshot: (...args: unknown[]) => getEnergySnapshotMock(...args),
  };
});

// Without this the page issues real World Bank requests during the suite:
// slow, network-dependent, and silently exercising the fallback path instead
// of whatever the test meant to assert.
vi.mock('../../api/carbonApi', async () => {
  const actual = await vi.importActual<typeof import('../../api/carbonApi')>('../../api/carbonApi');
  return {
    ...actual,
    getCarbonSnapshot: (...args: unknown[]) => getCarbonSnapshotMock(...args),
  };
});

const { FALLBACK_CARBON } = await import('../../api/carbonApi');

const DashboardPage = (await import('./DashboardPage')).default;

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  getEnergySnapshotMock.mockReset();
  getCarbonSnapshotMock.mockReset();
  getCarbonSnapshotMock.mockResolvedValue({ source: 'live', snapshot: FALLBACK_CARBON });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('DashboardPage live panel', () => {
  it('AC-API-006: renders bundled figures and a DEGRADED badge when every request fails', async () => {
    getEnergySnapshotMock.mockRejectedValue({
      kind: 'network',
      status: 0,
      message: 'offline',
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('DEGRADED')).toBeInTheDocument();
    });

    // The panel still shows a complete set of numbers — never an empty or
    // broken tile.
    expect(screen.getByText('Solar irradiance now')).toBeInTheDocument();
    expect(screen.getByText('Wind speed now')).toBeInTheDocument();
    expect(screen.getByText(/showing bundled reference figures/i)).toBeInTheDocument();
  });

  it('renders live values and a LIVE badge on success', async () => {
    getEnergySnapshotMock.mockResolvedValue({
      source: 'live',
      snapshot: {
        solar: { peakIrradiance: 900, currentIrradiance: 412, unit: 'W/m²' },
        wind: { peakSpeed: 11.2, currentSpeed: 7.4, unit: 'km/h' },
        latestRenewableShare: { year: 2021, percent: 4.9 },
        renewableTrend: [{ year: 2021, percent: 4.9 }],
        fetchedAt: Date.now(),
      },
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    expect(screen.getByText('412')).toBeInTheDocument();
    expect(screen.getByText('7.4')).toBeInTheDocument();
    expect(screen.queryByText('DEGRADED')).not.toBeInTheDocument();
  });

  it('renders finite bar heights when every reported percent is zero', async () => {
    getEnergySnapshotMock.mockResolvedValue({
      source: 'live',
      snapshot: {
        solar: { peakIrradiance: 0, currentIrradiance: 0, unit: 'W/m²' },
        wind: { peakSpeed: 0, currentSpeed: 0, unit: 'km/h' },
        latestRenewableShare: { year: 2021, percent: 0 },
        renewableTrend: [
          { year: 2020, percent: 0 },
          { year: 2021, percent: 0 },
        ],
        fetchedAt: Date.now(),
      },
    });

    const { container } = renderDashboard();

    await waitFor(() => expect(screen.getByText('LIVE')).toBeInTheDocument());

    // A max of 0 makes percent/max NaN, which renders as `height: NaN%` and
    // silently collapses the chart.
    const bars = container.querySelectorAll('[class*="liveTrendBar"]');
    expect(bars.length).toBe(2);
    bars.forEach((bar) => {
      expect((bar as HTMLElement).style.height).not.toContain('NaN');
    });
  });

  it('labels every carbon chart with the reference year its data came from', async () => {
    getEnergySnapshotMock.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    // The three series publish on different schedules, so a single page-level
    // "as of" date would misstate at least one of them.
    await waitFor(() => {
      expect(screen.getByText(/% of annual CO₂e · 2024/)).toBeInTheDocument();
    });
    expect(screen.getByText(/% of electricity generation · 2021/)).toBeInTheDocument();
    expect(screen.getByText(/Gt CO₂e per year · 2024/)).toBeInTheDocument();
  });

  it('names the ticking counter as a projection, not a measurement', async () => {
    getEnergySnapshotMock.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Projected from 2024 World Bank annual total/)).toBeInTheDocument();
    });
  });

  it('keeps the headline tile and the donut total in agreement', async () => {
    getEnergySnapshotMock.mockReturnValue(new Promise(() => {}));

    const { container } = renderDashboard();

    // Both read 39.6 from the same fetched figure; the tile used to be a
    // separate hardcoded 36.8 that visibly contradicted the donut beside it.
    await waitFor(() => {
      const donutCentre = container.querySelector('[class*="donutCenter"]');
      expect(donutCentre?.textContent).toBe(String(FALLBACK_CARBON.annualTotalGt));
    });
    expect(screen.getAllByText(String(FALLBACK_CARBON.annualTotalGt)).length).toBeGreaterThan(1);
  });

  it('falls back to bundled carbon figures when the World Bank is unreachable', async () => {
    getEnergySnapshotMock.mockReturnValue(new Promise(() => {}));
    getCarbonSnapshotMock.mockRejectedValue({ kind: 'network', status: 0, message: 'offline' });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/· bundled/)).toBeInTheDocument();
    });
    // The charts still render a complete set of figures rather than collapsing.
    expect(screen.getByText('Emissions by sector')).toBeInTheDocument();
    const legend = screen.getByRole('list', { name: 'Emitting sectors' });
    expect(legend.children).toHaveLength(FALLBACK_CARBON.sectorTrend[0].sectors.length);
  });

  it('never blocks first paint on the network (NFR-001)', () => {
    // A promise that never settles stands in for a hanging upstream.
    getEnergySnapshotMock.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    // Synchronously after mount, before any await: the panel is fully rendered.
    expect(screen.getByText('Solar irradiance now')).toBeInTheDocument();
    expect(screen.getByText('Live conditions')).toBeInTheDocument();
  });
});
