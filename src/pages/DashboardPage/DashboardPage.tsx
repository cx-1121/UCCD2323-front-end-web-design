import { useState } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useReveal } from '../../hooks/useReveal';
import { useCarbonLiveData } from '../../hooks/useCarbonLiveData';
import { useLiveEnergyApi } from '../../hooks/useLiveEnergyApi';
import type { EmitterRow, EnergyMixRow, SectorYear } from '../../api/types';
import styles from './DashboardPage.module.css';

/* ── Helpers ──────────────────────────────────────────────────────────── */

function formatTonnes(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(3)}`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} M`;
  return Math.round(value).toLocaleString();
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className={styles.sparkline}>
      {data.map((v, i) => (
        <div
          key={i}
          className={styles.sparkBar}
          style={{ height: `${((v - min) / range) * 100}%` }}
        />
      ))}
    </div>
  );
}

/* ── Donut chart (sector breakdown) ───────────────────────────────────── */

function SectorDonut({
  sectors,
  totalGt,
}: {
  sectors: { sector: string; share: number; color: string }[];
  /** Annual total the shares are percentages of — shown in the hole. */
  totalGt: number;
}) {
  const R = 60;
  const C = 2 * Math.PI * R;

  // Offsets are derived up front rather than accumulated inside the map
  // callback. Mutating a variable across renders inside JSX is flagged by
  // react-hooks/immutability and misreports arc positions if React ever
  // re-invokes the render without resetting the closure.
  const startOffsets = sectors.reduce<number[]>((acc, _sector, index) => {
    const previousArc = index === 0 ? 0 : acc[index - 1] + (sectors[index - 1].share / 100) * C;
    acc.push(previousArc);
    return acc;
  }, []);

  return (
    <div className={styles.donutWrap}>
      <svg className={styles.donutSvg} viewBox="0 0 160 160">
        {sectors.map((s, index) => {
          const dash = (s.share / 100) * C;
          const gap = C - dash;
          const current = startOffsets[index];
          return (
            <circle
              key={s.sector}
              cx="80" cy="80" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-current}
              strokeLinecap="butt"
              transform="rotate(-90 80 80)"
            >
              <title>{`${s.sector}: ${s.share}% of ${totalGt} Gt CO₂`}</title>
            </circle>
          );
        })}
        <text x="80" y="76" textAnchor="middle" className={styles.donutCenter}>{totalGt}</text>
        <text x="80" y="94" textAnchor="middle" className={styles.donutCenterUnit}>Gt CO₂ / yr</text>
      </svg>

      <div className={styles.legend}>
        {sectors.map((s) => (
          <span key={s.sector} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: s.color }} />
            {s.sector} {s.share}%
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Area chart (historical trend 2020–2025) ──────────────────────────── */

/** Rounds a max up to a clean axis ceiling so the top gridline has meaning. */
function axisCeiling(max: number): number {
  if (max <= 0) return 10;
  const step = 10;
  return Math.ceil(max / step) * step;
}

function TrendChart({ data }: { data: SectorYear[] }) {
  const W = 600;
  const H = 200;
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;
  const years = data.map((d) => d.year);

  // A single-year series would divide by zero; a flat line is the honest render.
  const xStep = years.length > 1 ? cw / (years.length - 1) : 0;

  /**
   * One distinct hue per sector, in stacked order (index 0 is the baseline).
   *
   * Layers are read off the first year's sector list so the chart follows
   * whatever the API returned, rather than a hardcoded fuel list that would
   * silently mismatch. Colours were validated as a six-slot categorical
   * palette in this adjacency order.
   */
  const layers = (data[0]?.sectors ?? []).map((sector, sectorIndex) => ({
    key: sector.key,
    label: sector.label,
    color: sector.color,
    values: data.map((year) => year.sectors[sectorIndex]?.value ?? 0),
  }));

  // Values arrive in megatonnes; the axis is gigatonnes.
  const maxY = axisCeiling(Math.max(...data.map((d) => d.totalGt), 0));
  const ticks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  // Cumulative tops per year, in gigatonnes to match the axis.
  const cumulative: number[][] = Array.from({ length: data.length }, () => []);
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    for (const layer of layers) {
      sum += layer.values[i] / 1000;
      cumulative[i].push(sum);
    }
  }

  const y = (val: number) => pad.top + ch - (val / maxY) * ch;
  const x = (idx: number) => pad.left + idx * xStep;

  const covidIndex = years.indexOf(2020);

  function areaPath(layerIdx: number): string {
    const top: string[] = [];
    const bottom: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const yTop = y(cumulative[i][layerIdx]);
      const yBot = layerIdx === 0 ? y(0) : y(cumulative[i][layerIdx - 1]);
      top.push(`${i === 0 ? 'M' : 'L'}${x(i)},${yTop}`);
      bottom.unshift(`L${x(i)},${yBot}`);
    }
    return top.join(' ') + ' ' + bottom.join(' ') + ' Z';
  }

  return (
    <div>
      <svg className={styles.areaChart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels — the top tick carries the unit so the scale is
            readable without hunting for the header subtext. */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={pad.left} x2={W - pad.right}
              y1={y(v)} y2={y(v)}
              stroke="var(--hairline)" strokeWidth="0.5"
            />
            <text
              x={pad.left - 6} y={y(v) + 3}
              textAnchor="end"
              fill="var(--ink-faint)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {v === maxY ? `${v} Gt` : Math.round(v)}
            </text>
          </g>
        ))}

        {/* Areas. The <title> gives every band a native hover tooltip naming
            the sector and its latest value — the bands themselves carry no text. */}
        {layers.map((layer, li) => (
          <path key={layer.key} d={areaPath(li)} fill={layer.color} opacity="0.85">
            <title>
              {`${layer.label}: ${(layer.values[layer.values.length - 1] / 1000).toFixed(2)} Gt in ${years[years.length - 1]}`}
            </title>
          </path>
        ))}

        {/* X-axis labels */}
        {years.map((yr, i) => (
          <text
            key={yr}
            x={x(i)} y={H - 6}
            textAnchor="middle"
            fill="var(--ink-faint)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {yr}
          </text>
        ))}

        {/* COVID annotation, anchored to whichever index 2020 actually is —
            the series start year moves with the data, so a hardcoded index
            would eventually point the label at the wrong year. Rendered only
            if 2020 is in range. */}
        {covidIndex >= 0 && (
          <>
            <line
              x1={x(covidIndex)} x2={x(covidIndex)}
              y1={y(data[covidIndex].totalGt)} y2={y(data[covidIndex].totalGt) - 10}
              stroke="var(--signal)" strokeWidth="1"
            />
            <text
              x={x(covidIndex) + 4} y={y(data[covidIndex].totalGt) - 13}
              textAnchor="start" fill="var(--signal)" fontSize="8" fontFamily="var(--font-mono)"
            >
              2020 COVID dip
            </text>
          </>
        )}
      </svg>

      {/* Legend — six stacked bands are unreadable without one. Top-of-stack
          first so the order matches what the eye meets top-down. */}
      <div className={styles.legend} role="list" aria-label="Emitting sectors">
        {[...layers].reverse().map((layer) => (
          <span key={layer.key} className={styles.legendItem} role="listitem">
            <span className={styles.legendDot} style={{ background: layer.color }} />
            {layer.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Live renewable conditions (jQuery REST, FR-API-006) ─────────────── */

/** Formats the snapshot timestamp; 0 marks the bundled fallback, never fetched. */
function formatFetchedAt(fetchedAt: number): string {
  if (fetchedAt === 0) return 'bundled data';
  return new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Renders live solar/wind conditions and Malaysia's renewable share, fetched
 * over jQuery from Open-Meteo and the World Bank.
 *
 * The panel always renders a complete set of figures: on any failure the
 * bundled fallback stays on screen and the badge switches to DEGRADED, so the
 * layout never collapses into an error state (FR-API-006).
 */
function LiveEnergyPanel() {
  const { snapshot, source, isLoading, error, isDegraded, refresh } = useLiveEnergyApi();

  const badgeLabel = isLoading ? 'FETCHING' : source === 'live' ? 'LIVE' : source === 'cache' ? 'CACHED' : 'DEGRADED';

  const badgeClass = isDegraded && !isLoading ? styles.liveBadgeDegraded : styles.liveBadgeOk;

  const trend = snapshot.renewableTrend;

  // `|| 1` is load-bearing, not defensive noise: a series where every reported
  // percent is 0 yields a max of 0, and `0 / 0` is NaN, which renders as
  // `height: NaN%` and silently collapses every bar.
  const trendMax = Math.max(...trend.map((p) => p.percent), 0) || 1;

  return (
    <div className={styles.chartShell}>
      <div className={styles.chartCore}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>Live renewable conditions — Kuala Lumpur</span>
          <div className={styles.liveControls}>
            <span className={`${styles.liveBadge} ${badgeClass}`} role="status">
              {badgeLabel}
            </span>
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={refresh}
              disabled={isLoading}
              aria-label="Refresh live energy data"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className={styles.liveGrid}>
          <div className={styles.liveTile}>
            <span className={styles.liveTileLabel}>Solar irradiance now</span>
            <span className={styles.liveTileValue}>
              {Math.round(snapshot.solar.currentIrradiance)}
              <span className={styles.liveTileUnit}>{snapshot.solar.unit}</span>
            </span>
            <span className={styles.liveTileFoot}>
              peak today {Math.round(snapshot.solar.peakIrradiance)}
            </span>
          </div>

          <div className={styles.liveTile}>
            <span className={styles.liveTileLabel}>Wind speed now</span>
            <span className={styles.liveTileValue}>
              {snapshot.wind.currentSpeed.toFixed(1)}
              <span className={styles.liveTileUnit}>{snapshot.wind.unit}</span>
            </span>
            <span className={styles.liveTileFoot}>
              peak today {snapshot.wind.peakSpeed.toFixed(1)}
            </span>
          </div>

          <div className={styles.liveTile}>
            <span className={styles.liveTileLabel}>Renewable share (MY)</span>
            <span className={styles.liveTileValue}>
              {snapshot.latestRenewableShare ? snapshot.latestRenewableShare.percent.toFixed(1) : '—'}
              <span className={styles.liveTileUnit}>%</span>
            </span>
            <span className={styles.liveTileFoot}>
              {snapshot.latestRenewableShare
                ? `of final consumption, ${snapshot.latestRenewableShare.year}`
                : 'no reported figure'}
            </span>
          </div>
        </div>

        {trend.length > 0 && (
          <div>
            <div className={styles.liveTrend} aria-label="Renewable share trend by year">
              {trend.map((point) => (
                <span
                  key={point.year}
                  className={styles.liveTrendBar}
                  style={{ height: `${(point.percent / trendMax) * 100}%` }}
                  title={`${point.year}: ${point.percent.toFixed(1)}%`}
                />
              ))}
            </div>
            {/* Bars without an axis are decoration. First and last year anchor
                the range; the caption names the measure. Per-bar values stay in
                the tooltips — labelling two dozen bars would be noise. */}
            <div className={styles.liveTrendAxis} aria-hidden="true">
              <span>{trend[0].year}</span>
              <span className={styles.liveTrendCaption}>renewable share, % by year</span>
              <span>{trend[trend.length - 1].year}</span>
            </div>
          </div>
        )}

        <p className={styles.liveFoot}>
          {isDegraded && error
            ? `Upstream unavailable (${error.kind}) — showing bundled reference figures.`
            : `Fetched via jQuery from Open-Meteo and the World Bank · ${formatFetchedAt(snapshot.fetchedAt)}`}
        </p>
      </div>
    </div>
  );
}

/* ── Top emitters bar chart ──────────────────────────────────────────── */

function EmittersChart({ data, year }: { data: EmitterRow[]; year: number }) {
  const [mode, setMode] = useState<'total' | 'perCapita'>('total');

  const sorted = [...data].sort((a, b) =>
    mode === 'total' ? b.total - a.total : b.perCapita - a.perCapita,
  );
  const maxVal = Math.max(...sorted.map((d) => (mode === 'total' ? d.total : d.perCapita)));

  return (
    <div>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleGroup}>
          <span className={styles.chartTitle}>Top emitters</span>
          {/* The unit changes with the toggle — without this line the reader
              has to infer what "14.0 t" means from the button state. */}
          <span className={styles.chartSubtext}>
            {mode === 'total' ? 'Gt CO₂e per year' : 'tonnes CO₂e per person per year'}
            {year > 0 ? ` · ${year}` : ''}
          </span>
        </div>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${mode === 'total' ? styles.toggleBtnActive : ''}`}
            onClick={() => setMode('total')}
          >
            Total
          </button>
          <button
            className={`${styles.toggleBtn} ${mode === 'perCapita' ? styles.toggleBtnActive : ''}`}
            onClick={() => setMode('perCapita')}
          >
            Per capita
          </button>
        </div>
      </div>

      <div className={styles.barList}>
        {sorted.map((d) => {
          const val = mode === 'total' ? d.total : d.perCapita;
          const pct = (val / maxVal) * 100;
          return (
            <div key={d.code} className={styles.barRow}>
              <div className={styles.barCountry}>
                <span className={styles.barCode}>{d.code}</span>
                <span className={styles.barName}>{d.name}</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.barValue}>
                {mode === 'total' ? `${val} Gt` : `${val} t`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Carbon budget ring ──────────────────────────────────────────────── */

function BudgetRing({ budget }: { budget: { total: number; used: number; remaining: number; yearsLeft: number } }) {
  const R = 62;
  const C = 2 * Math.PI * R;
  const usedPct = budget.used / budget.total;
  const usedDash = usedPct * C;
  const remainDash = (1 - usedPct) * C;

  return (
    <div className={styles.budgetWrap}>
      <svg className={styles.budgetRing} viewBox="0 0 160 160">
        {/* Used portion */}
        <circle
          cx="80" cy="80" r={R}
          fill="none"
          stroke="rgba(217,119,6,0.35)"
          strokeWidth="12"
          strokeDasharray={`${usedDash} ${C - usedDash}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
          transform="rotate(-90 80 80)"
          className={styles.budgetUsed}
        />
        {/* Remaining */}
        <circle
          cx="80" cy="80" r={R}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="12"
          strokeDasharray={`${remainDash} ${C - remainDash}`}
          strokeDashoffset={-usedDash}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          className={styles.budgetRemaining}
        />
        <text x="80" y="74" textAnchor="middle" className={styles.budgetYears}>
          ~{budget.yearsLeft}
        </text>
        <text x="80" y="92" textAnchor="middle" className={styles.budgetYearsLabel}>
          years left
        </text>
      </svg>
      {/* The two arcs are meaningless without naming them — amber is spent
          budget, green is what remains, with the actual quantities. */}
      <div className={styles.legend} aria-label="Budget breakdown">
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'rgba(217,119,6,0.55)' }} />
          Used {budget.used.toLocaleString()} Gt
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--signal)' }} />
          Remaining {budget.remaining.toLocaleString()} Gt
        </span>
      </div>
      <p className={styles.budgetCaption}>
        CO₂ budget to limit warming to 1.5°C at current rate
      </p>
    </div>
  );
}

/* ── Energy mix stacked bars ─────────────────────────────────────────── */

/** Segments narrower than this get a tooltip only — an inline % would overflow. */
const MIX_LABEL_MIN_PCT = 12;

function EnergyMixChart({ data, year }: { data: EnergyMixRow[]; year: number }) {
  return (
    <div>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleGroup}>
          <span className={styles.chartTitle}>Energy mix breakdown</span>
          {/* This series lags the emissions data by several years, so its own
              reference year is stated rather than inherited from the page. */}
          <span className={styles.chartSubtext}>
            % of electricity generation{year > 0 ? ` · ${year}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={styles.mixLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'rgba(12,26,19,0.25)' }} />
              Fossil
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#6366f1' }} />
              Nuclear
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--signal)' }} />
              Renewables
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'rgba(12,26,19,0.12)' }} />
              Other
            </span>
          </div>
          <span className={styles.flipHint} title="Click to flip for data interpretation">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
          </span>
        </div>
      </div>
      <div className={styles.mixGrid}>
        {data.map((d) => {
          const segments = [
            { className: styles.mixFossil, label: 'Fossil', value: d.fossil, darkText: true },
            { className: styles.mixNuclear, label: 'Nuclear', value: d.nuclear, darkText: false },
            { className: styles.mixRenewable, label: 'Renewables', value: d.renewables, darkText: false },
            // The three reported shares sum to 97–100%; the remainder is real
            // generation (non-renewable waste and other sources), so it gets a
            // segment instead of being normalised out of existence.
            { className: styles.mixOther, label: 'Other', value: d.other, darkText: true },
          ];

          return (
            <div key={d.country} className={styles.mixRow}>
              <span className={styles.mixCountry}>{d.country}</span>
              <div className={styles.mixTrack}>
                {segments.map((seg) => (
                  <div
                    key={seg.label}
                    className={seg.className}
                    style={{ width: `${seg.value}%` }}
                    title={`${d.country} — ${seg.label}: ${seg.value}%`}
                  >
                    {/* Inline % only where it fits; narrow slivers keep the
                        tooltip so no value is ever unreachable. */}
                    {seg.value >= MIX_LABEL_MIN_PCT && (
                      <span
                        className={`${styles.mixValue} ${seg.darkText ? styles.mixValueDark : ''}`}
                      >
                        {seg.value}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

function DashboardPage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
  const navHidden = useHideOnScroll(140);
  const {
    counter,
    kpis,
    sectorTrend,
    sectorBreakdown,
    dataYear,
    annualTotalGt,
    topEmitters,
    emittersYear,
    energyMix,
    mixYear,
    carbonBudget,
    isDegraded: carbonDegraded,
    isLoading: carbonLoading,
  } = useCarbonLiveData();

  useBodyBackground('#f7f8fa');

  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (label: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  /**
   * Descriptions only. The source line used to live here too, hardcoded — the
   * annual-CO₂ tile cited "IEA & GCP" while its number came from the World
   * Bank on a different basis (excluding land use), which is precisely why it
   * reads 39.6 rather than ~37. Provenance now travels with each value from
   * the hook, so a tile cannot cite a source it did not use.
   */
  const kpiExplanations: Record<string, string> = {
    'Annual global CO₂':
      'Total annual CO₂ emissions worldwide, excluding land use. Power generation and industry together account for over 60% of the total.',
    'Year-over-year change':
      'Annual growth rate of global emissions, derived from the same yearly totals the trend chart plots.',
    'Per capita average':
      'Global average CO₂ per person. Developed nations average 9–14 t, developing nations under 2.5 t. The world figure has been close to flat for a decade — totals rose because population did.',
    '1.5°C budget remaining':
      'Remaining carbon allowance to cap warming at 1.5°C with 50% probability — roughly 6–7 years at current rates.',
  };

  const kpiEntries = kpis.map((kpi) => ({
    ...kpi,
    direction: kpi.label === '1.5°C budget remaining' ? ('down' as const) : ('up' as const),
  }));

  const chartExplanations: Record<string, { desc: string; tag: string }> = {
    historical: {
      desc: 'Coal remains the largest single source of global carbon emissions (~40%), followed by oil and gas. A temporary drop occurred during the 2020 COVID lockdowns, but emissions rapidly rebounded in subsequent years.',
      tag: 'Primary Source: Coal & Oil (~70%)',
    },
    sector: {
      desc: 'Energy generation (electricity & heat) and industrial processes drive over 78% of total global emissions. Transportation accounts for 16.2%, while agriculture and buildings make up the remainder.',
      tag: 'Dominant: Energy Sector (73.2%)',
    },
    budget: {
      desc: 'The 1.5°C budget represents the total cumulative CO₂ humanity can emit to maintain a 50% chance of limiting warming to 1.5°C. At current rates (36.8 Gt/year), the remaining 250 Gt budget will be exhausted in ~6.8 years.',
      tag: 'Target: Paris Agreement 1.5°C',
    },
    energyMix: {
      desc: 'China and India rely heavily on fossil fuels for baseline power. In contrast, Germany and Brazil show high renewable integration, with Brazil reaching 71% clean energy share due to extensive hydropower.',
      tag: 'Leader: Brazil (71% Clean Power)',
    },
  };

  return (
    <main ref={pageRef} className={styles.page}>
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.bloom} />
      </div>
      <div className={styles.grain} aria-hidden="true" />

      <div
        className={navHidden ? `${styles.headerBar} ${styles.headerBarHidden}` : styles.headerBar}
        data-hidden={navHidden || undefined}
      >
        <HudHeader variant="static" />
      </div>

      <div className={styles.container}>
        {/* ---- Hero ---- */}
        <header className={styles.hero}>
          <span className={styles.eyebrow} data-reveal data-reveal-index="0">
            <span className={styles.liveIndicator} />
            Live tracking
          </span>
          <h1 className={styles.heroTitle} data-reveal data-reveal-index="1">
            Global carbon
            <span className={styles.heroAccent}> footprint</span>
          </h1>
          <p className={styles.heroLede} data-reveal data-reveal-index="2">
            Real-time global CO₂ emissions data — tracking the carbon pulse of human activity
            from energy, transport, industry and agriculture.
          </p>

          <div className={styles.counterRow} data-reveal data-reveal-index="3">
            <span className={styles.counterValue}>{formatTonnes(counter)}</span>
            <span className={styles.counterUnit}>billion tonnes CO₂ emitted this year</span>
          </div>
          <p className={styles.counterLabel} data-reveal data-reveal-index="3">
            {/* Names what this number actually is. It is a projection from the
                latest reported annual total, not a live measurement — and the
                total it extrapolates has a year attached. */}
            Projected from {dataYear} World Bank annual total ({annualTotalGt} Gt CO₂e, excl. land
            use)
          </p>
        </header>

        {/* ---- KPI tiles ---- */}
        <div className={styles.kpiGrid} data-reveal data-reveal-index="1">
          {kpiEntries.map((kpi) => {
            const isFlipped = flippedCards[kpi.label] || false;
            const explanation = kpiExplanations[kpi.label];
            return (
              <div
                key={kpi.label}
                className={styles.kpiTile}
                onClick={() => toggleFlip(kpi.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFlip(kpi.label);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${kpi.label} card. Click to flip for interpretation.`}
              >
                <div className={`${styles.kpiCardInner} ${isFlipped ? styles.flipped : ''}`}>
                  {/* Front Side */}
                  <div className={styles.kpiFront}>
                    <div className={styles.kpiHeaderRow}>
                      <p className={styles.kpiLabel}>{kpi.label}</p>
                      <span className={styles.flipHint} title="Click to flip for data interpretation">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                          <path d="M16 16h5v5"/>
                        </svg>
                      </span>
                    </div>
                    <p>
                      <span className={styles.kpiValue}>{kpi.value}</span>
                      <span className={styles.kpiUnit}>{kpi.unit}</span>
                    </p>
                    {kpi.label === 'Year-over-year change' && (
                      <span className={`${styles.kpiBadge} ${kpi.value > 0 ? styles.kpiBadgeUp : styles.kpiBadgeDown}`}>
                        {kpi.value > 0 ? '↑' : '↓'} {kpi.value > 0 ? '+' : ''}{kpi.value}%
                      </span>
                    )}
                    {/* No sparkline where no series exists. The budget tile
                        used to draw an invented decline; an absent chart is
                        more honest than a fabricated one. */}
                    {kpi.trend.length > 0 && <Sparkline data={kpi.trend} />}

                    {/* Range is derived, not typed in — the old hardcoded
                        "2020 – 2025" outlived the data it described and named a
                        year no source actually publishes. */}
                    <span className={styles.kpiTrendYears}>
                      {kpi.trendRange
                        ? `${kpi.trendRange[0]} – ${kpi.trendRange[1]} · ${kpi.provenance}`
                        : kpi.provenance}
                    </span>
                  </div>

                  {/* Back Side (Data Interpretation) */}
                  <div className={styles.kpiBack}>
                    <div className={styles.kpiHeaderRow}>
                      <p className={styles.kpiBackTitle}>Data Interpretation</p>
                      <span className={styles.flipHint} title="Click to flip back">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                          <path d="M16 16h5v5"/>
                        </svg>
                      </span>
                    </div>
                    <p className={styles.kpiExplanationText}>{explanation}</p>
                    <div className={styles.kpiBackTag}>
                      {/* The citation is the tile's own provenance, so it
                          cannot drift away from where the number came from. */}
                      <span>Source: {kpi.provenance}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- Live renewable conditions (real REST data over jQuery) ---- */}
        <section className={styles.section}>
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 className={styles.sectionTitle}>Live conditions</h2>
            <span className={styles.sectionMeta}>Open-Meteo · World Bank</span>
          </div>

          <div data-reveal data-reveal-index="1">
            <LiveEnergyPanel />
          </div>
        </section>

        {/* ---- Historical trend + Sector donut ---- */}
        <section className={styles.section}>
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 className={styles.sectionTitle}>Emissions overview</h2>
            {/* Range and provenance come from the data, not a typed-in string
                that silently goes stale the year the API updates. */}
            <span className={styles.sectionMeta}>
              {sectorTrend.length > 0
                ? `${sectorTrend[0].year} – ${sectorTrend[sectorTrend.length - 1].year} · World Bank`
                : 'World Bank'}
              {carbonDegraded && !carbonLoading ? ' · bundled' : ''}
            </span>
          </div>

          <div className={styles.chartRow} data-reveal data-reveal-index="1">
            {/* Historical trend card */}
            <div
              className={styles.chartShell}
              onClick={() => toggleFlip('historical')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip('historical');
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Historical trend chart. Click to flip for interpretation."
            >
              <div className={`${styles.chartCardInner} ${flippedCards['historical'] ? styles.flipped : ''}`}>
                <div className={styles.chartFront}>
                  <div className={styles.chartHeader}>
                    <div className={styles.chartTitleGroup}>
                      <span className={styles.chartTitle}>Emissions by sector</span>
                      <span className={styles.chartSubtext}>Gt CO₂e / year, excl. land use</span>
                    </div>
                    <span className={styles.flipHint} title="Click to flip for data interpretation">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </span>
                  </div>
                  <TrendChart data={sectorTrend} />
                </div>

                <div className={styles.chartBack}>
                  <div className={styles.chartHeader}>
                    <span className={styles.kpiBackTitle}>Data Interpretation</span>
                    <span className={styles.flipHint} title="Click to flip back">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </span>
                  </div>
                  <p className={styles.chartExplanationText}>{chartExplanations['historical'].desc}</p>
                  <div className={styles.kpiBackTag}>
                    <span>{chartExplanations['historical'].tag}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sector donut card */}
            <div
              className={styles.chartShell}
              onClick={() => toggleFlip('sector')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip('sector');
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="By sector donut chart. Click to flip for interpretation."
            >
              <div className={`${styles.chartCardInner} ${flippedCards['sector'] ? styles.flipped : ''}`}>
                <div className={styles.chartFront}>
                  <div className={styles.chartHeader}>
                    <div className={styles.chartTitleGroup}>
                      <span className={styles.chartTitle}>By sector</span>
                      <span className={styles.chartSubtext}>% of annual CO₂e · {dataYear}</span>
                    </div>
                    <span className={styles.flipHint} title="Click to flip for data interpretation">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </span>
                  </div>
                  <SectorDonut sectors={sectorBreakdown} totalGt={annualTotalGt} />
                </div>

                <div className={styles.chartBack}>
                  <div className={styles.chartHeader}>
                    <span className={styles.kpiBackTitle}>Data Interpretation</span>
                    <span className={styles.flipHint} title="Click to flip back">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </span>
                  </div>
                  <p className={styles.chartExplanationText}>{chartExplanations['sector'].desc}</p>
                  <div className={styles.kpiBackTag}>
                    <span>{chartExplanations['sector'].tag}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Top emitters + Carbon budget ---- */}
        <section className={styles.section}>
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 className={styles.sectionTitle}>Who emits the most</h2>
          </div>

          <div className={styles.chartRow} data-reveal data-reveal-index="1">
            {/* Top emitters card */}
            <div className={styles.chartShell}>
              <div className={styles.chartCore}>
                <EmittersChart data={topEmitters} year={emittersYear} />
              </div>
            </div>

            {/* 1.5°C carbon budget card */}
            <div
              className={styles.chartShell}
              onClick={() => toggleFlip('budget')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip('budget');
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="1.5°C carbon budget ring. Click to flip for interpretation."
            >
              <div className={`${styles.chartCardInner} ${flippedCards['budget'] ? styles.flipped : ''}`}>
                <div className={styles.chartFront}>
                  <div className={styles.chartHeader}>
                    <span className={styles.chartTitle}>1.5°C carbon budget</span>
                    <span className={styles.flipHint} title="Click to flip for data interpretation">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </span>
                  </div>
                  <BudgetRing budget={carbonBudget} />
                </div>

                <div className={styles.chartBack}>
                  <div className={styles.chartHeader}>
                    <span className={styles.kpiBackTitle}>Data Interpretation</span>
                    <span className={styles.flipHint} title="Click to flip back">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </span>
                  </div>
                  <p className={styles.chartExplanationText}>{chartExplanations['budget'].desc}</p>
                  <div className={styles.kpiBackTag}>
                    <span>{chartExplanations['budget'].tag}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Energy mix ---- */}
        <section className={styles.section}>
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 className={styles.sectionTitle}>Energy mix comparison</h2>
            <span className={styles.sectionMeta}>Top 5 countries</span>
          </div>

          <div
            className={styles.chartShell}
            data-reveal
            data-reveal-index="1"
            onClick={() => toggleFlip('energyMix')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFlip('energyMix');
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Energy mix comparison chart. Click to flip for interpretation."
          >
            <div className={`${styles.chartCardInner} ${flippedCards['energyMix'] ? styles.flipped : ''}`}>
              <div className={styles.chartFront}>
                <EnergyMixChart data={energyMix} year={mixYear} />
              </div>

              <div className={styles.chartBack}>
                <div className={styles.chartHeader}>
                  <span className={styles.kpiBackTitle}>Data Interpretation</span>
                  <span className={styles.flipHint} title="Click to flip back">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                      <path d="M16 16h5v5"/>
                    </svg>
                  </span>
                </div>
                <p className={styles.chartExplanationText}>{chartExplanations['energyMix'].desc}</p>
                <div className={styles.kpiBackTag}>
                  <span>{chartExplanations['energyMix'].tag}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Footer ---- */}
        <footer className={styles.footer} data-reveal data-reveal-index="0">
          <p>Green Tech Club</p>
          <p>Built for a grid that outlives us</p>
          <span className={styles.sourceTag}>
            Data sources: IEA · Global Carbon Project · IPCC AR6
          </span>
        </footer>
      </div>
    </main>
  );
}

export default DashboardPage;
