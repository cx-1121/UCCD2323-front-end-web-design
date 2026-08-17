import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useReveal } from '../../hooks/useReveal';
import { useCarbonLiveData } from '../../hooks/useCarbonLiveData';
import { useLiveEnergyApi } from '../../hooks/useLiveEnergyApi';
import type { EmitterRow, EnergyMixRow, SectorYear } from '../../api/types';
import { safeSession } from '../../utils/storage';
import { DASHBOARD_EMITTERS_MODE_KEY } from '../../utils/storageKeys';
import styles from './DashboardPage.module.css';

/**
 * DASHBOARD — the data chapter.
 *
 * An OPERATE surface, and the one page on this site where restraint is the
 * right answer. The reader came to read numbers; the ground is pinned to the
 * ladder's `sky` stop rather than travelling it, because a chart that reads
 * differently at two scroll positions is a chart that cannot be trusted.
 *
 * THE COMPOSITION IS AN ARGUMENT, NOT A GRID. The page used to be a hero, four
 * KPI cards, and five chart panels laid out as equals — which is to say it had
 * no primary reading, and the reader had to assemble the point themselves. It
 * now opens on the verdict and descends through the evidence:
 *
 *   the verdict     what the 1.5C budget has left, at the rate we are spending it
 *   what spends it  the trend, and the sector that dominates it
 *   who spends it   the emitters, on two rankings that disagree
 *   what they run on the electricity mix, five grids side by side
 *   what replaces it live renewable conditions — the counter-argument in progress
 *
 * EVERY FIGURE IN PROSE IS DERIVED. Six panels used to hide a "Data
 * Interpretation" panel on a 3D flip side, and the prose on those backs had
 * hardcoded figures that no longer matched the live values rendered inches
 * away: a budget note citing 36.8 Gt/yr and ~6.8 years beside a ring drawing
 * neither, a "Brazil (71% Clean Power)" tag beside a live mix, a footer
 * crediting three bodies the page does not fetch. The flip is gone — it hid
 * the chart to show the chart's own explanation — and every number in the
 * notes below is computed from the same value its chart renders.
 */

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
    <div className={styles.sparkline} aria-hidden="true">
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

/**
 * The page's one container.
 *
 * A chart genuinely earns an enclosure — it is a self-contained reading and
 * needs its own ground to separate the plot from the page. It earns exactly
 * one. `note` is the panel's interpretation, set beneath the plot where it can
 * be read alongside the thing it interprets, searched, and printed.
 */
function Panel({
  title,
  meta,
  controls,
  note,
  className,
  children,
}: {
  title: string;
  meta?: ReactNode;
  controls?: ReactNode;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      <header className={styles.panelHead}>
        <div className={styles.panelTitleGroup}>
          <h3 className={styles.panelTitle}>{title}</h3>
          {meta && <p className={styles.panelMeta}>{meta}</p>}
        </div>
        {controls}
      </header>

      <div className={styles.panelBody}>{children}</div>

      {note && <p className={styles.panelNote}>{note}</p>}
    </section>
  );
}

/* ── The verdict: the 1.5°C budget, spent against the live rate ───────── */

/**
 * A linear budget, not a ring.
 *
 * The quantity is one-dimensional — how much of an allowance is gone — and a
 * ring makes the reader decode an arc to recover it, with no natural place for
 * "you are here". A bar puts spent and remaining on one axis at true
 * proportion, and the boundary between them IS the reading.
 *
 * The spent portion is hatched as well as inked, so the split survives without
 * colour. Both quantities are labelled; neither state is carried by hue alone.
 */
function BudgetBar({
  budget,
  annualGt,
  yearsLeft,
}: {
  budget: { total: number; used: number; remaining: number };
  annualGt: number;
  yearsLeft: number;
}) {
  const usedPct = budget.total > 0 ? (budget.used / budget.total) * 100 : 0;

  return (
    <div className={styles.budget}>
      <p className={styles.budgetYears} data-figure>
        <span className={styles.budgetYearsValue}>{yearsLeft}</span>
        <span className={styles.budgetYearsUnit}>years left</span>
      </p>

      <div
        className={styles.budgetTrack}
        role="img"
        aria-label={`${budget.used} of ${budget.total} gigatonnes spent, ${budget.remaining} remaining`}
      >
        <span className={styles.budgetUsed} style={{ width: `${usedPct}%` }} />
        <span className={styles.budgetRemaining} />
      </div>

      <p className={styles.budgetScale}>
        <span className={styles.budgetSpentLabel}>
          {budget.used.toLocaleString()} Gt spent
        </span>
        <span className={styles.budgetLeftLabel}>
          {budget.remaining.toLocaleString()} Gt of {budget.total.toLocaleString()} Gt left
        </span>
      </p>

      {/* Every figure in this sentence is the same value the bar draws. The
          years figure is divided out of the live annual total rather than read
          from the bundled constant beside it, which was computed against a
          rate the page no longer reports. */}
      <p className={styles.budgetRate}>
        At <strong>{annualGt} Gt</strong> a year, the {budget.remaining} Gt still unspent of
        the {budget.total.toLocaleString()} Gt allowance for a 50% chance of holding warming
        to 1.5°C runs out in about <strong>{yearsLeft} years</strong>.
      </p>
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

/* ── Area chart (historical trend) ────────────────────────────────────── */

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
      {/* The plot keeps a legible minimum width and scrolls inside its own
          container rather than scaling down with the viewport. SVG text scales
          with the viewBox, so a 600-unit chart squeezed into a 305px phone
          panel was rendering its axis labels at about 4.6 real pixels. */}
      <div className={styles.plotScroll}>
        <svg className={styles.areaChart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels — the top tick carries the unit so the scale is
            readable without hunting for the header subtext. */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={pad.left} x2={W - pad.right}
              y1={y(v)} y2={y(v)}
              stroke="var(--rule)" strokeWidth="0.5"
            />
            <text
              x={pad.left - 6} y={y(v) + 3}
              textAnchor="end"
              fill="var(--ink-faint)"
              fontSize="11"
              fontFamily="var(--typed)"
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
            fontSize="12"
            fontFamily="var(--typed)"
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
              stroke="var(--accent-ink)" strokeWidth="1"
            />
            <text
              x={x(covidIndex) + 4} y={y(data[covidIndex].totalGt) - 13}
              textAnchor="start" fill="var(--accent-ink)" fontSize="10" fontFamily="var(--typed)"
            >
              2020 COVID dip
            </text>
          </>
        )}
        </svg>
      </div>

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
    <Panel
      title="Live renewable conditions — Kuala Lumpur"
      meta={
        isDegraded && error
          ? `Upstream unavailable (${error.kind}) — showing bundled reference figures.`
          : `Open-Meteo · World Bank, over jQuery · ${formatFetchedAt(snapshot.fetchedAt)}`
      }
      controls={
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
            {isLoading ? 'Fetching…' : 'Refresh'}
          </button>
        </div>
      }
    >
      <div className={styles.liveGrid}>
        <div className={styles.liveTile}>
          <span className={styles.liveTileLabel}>Solar irradiance now</span>
          <span className={styles.liveTileValue} data-figure>
            {Math.round(snapshot.solar.currentIrradiance)}
            <span className={styles.liveTileUnit}>{snapshot.solar.unit}</span>
          </span>
          <span className={styles.liveTileFoot}>
            peak today {Math.round(snapshot.solar.peakIrradiance)}
          </span>
        </div>

        <div className={styles.liveTile}>
          <span className={styles.liveTileLabel}>Wind speed now</span>
          <span className={styles.liveTileValue} data-figure>
            {snapshot.wind.currentSpeed.toFixed(1)}
            <span className={styles.liveTileUnit}>{snapshot.wind.unit}</span>
          </span>
          <span className={styles.liveTileFoot}>
            peak today {snapshot.wind.peakSpeed.toFixed(1)}
          </span>
        </div>

        <div className={styles.liveTile}>
          <span className={styles.liveTileLabel}>Renewable share (MY)</span>
          <span className={styles.liveTileValue} data-figure>
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
        <div className={styles.liveTrendBlock}>
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
    </Panel>
  );
}

/* ── Top emitters bar chart ──────────────────────────────────────────── */

type EmittersMode = 'total' | 'perCapita';

/**
 * Reads the remembered unit back. sessionStorage is user-writable, so the
 * stored string is checked against the two legal values rather than trusted —
 * a hand-edited entry falls back to the default instead of putting the chart
 * into a state neither branch below handles.
 */
function readStoredMode(): EmittersMode {
  const stored = safeSession.get(DASHBOARD_EMITTERS_MODE_KEY);
  return stored === 'perCapita' || stored === 'total' ? stored : 'total';
}

function EmittersChart({ data, year }: { data: EmitterRow[]; year: number }) {
  /* Per-tab, so the reader who was comparing per-capita figures finds them
     still selected on their way back — and a fresh tab starts on totals. */
  const [mode, setMode] = useState<EmittersMode>(readStoredMode);

  useEffect(() => {
    safeSession.set(DASHBOARD_EMITTERS_MODE_KEY, mode);
  }, [mode]);

  const sorted = [...data].sort((a, b) =>
    mode === 'total' ? b.total - a.total : b.perCapita - a.perCapita,
  );
  const maxVal = Math.max(...sorted.map((d) => (mode === 'total' ? d.total : d.perCapita)));

  /* The page's own observation, computed rather than asserted: the two
     rankings put different economies on top, and that disagreement is the
     reason this chart has a toggle at all. */
  const leaderByTotal = [...data].sort((a, b) => b.total - a.total)[0];
  const leaderPerHead = [...data].sort((a, b) => b.perCapita - a.perCapita)[0];

  return (
    <Panel
      title="Top emitters"
      meta={
        <>
          {mode === 'total' ? 'Gt CO₂e per year' : 'tonnes CO₂e per person per year'}
          {year > 0 ? ` · ${year}` : ''}
        </>
      }
      controls={
        <div className={styles.toggleGroup} role="group" aria-label="Emitter unit">
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === 'total' ? styles.toggleBtnActive : ''}`}
            aria-pressed={mode === 'total'}
            onClick={() => setMode('total')}
          >
            Total
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === 'perCapita' ? styles.toggleBtnActive : ''}`}
            aria-pressed={mode === 'perCapita'}
            onClick={() => setMode('perCapita')}
          >
            Per capita
          </button>
        </div>
      }
      note={
        leaderByTotal && leaderPerHead && leaderByTotal.code !== leaderPerHead.code ? (
          <>
            The two rankings disagree, and the disagreement is the argument:{' '}
            {leaderByTotal.name} emits the most in total, {leaderPerHead.name} the most
            per person.
          </>
        ) : undefined
      }
    >
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
                {/* Scaled, not widened: ten rows transitioning `width` would
                    relayout the panel on every frame. See the stylesheet for
                    why this carries no transition at all. */}
                <div
                  className={styles.barFill}
                  style={{ '--fill': pct / 100 } as CSSProperties}
                />
              </div>
              <span className={styles.barValue} data-figure>
                {mode === 'total' ? `${val} Gt` : `${val} t`}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── Energy mix stacked bars ─────────────────────────────────────────── */

/** Segments narrower than this get a tooltip only — an inline % would overflow. */
const MIX_LABEL_MIN_PCT = 12;

function EnergyMixChart({ data, year }: { data: EnergyMixRow[]; year: number }) {
  const cleanest = [...data].sort((a, b) => b.renewables - a.renewables)[0];
  const mostFossil = [...data].sort((a, b) => b.fossil - a.fossil)[0];

  return (
    <Panel
      title="Energy mix comparison"
      /* This series lags the emissions data by several years, so its own
         reference year is stated rather than inherited from the page. */
      meta={<>% of electricity generation{year > 0 ? ` · ${year}` : ''}</>}
      controls={
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.keyFossil}`} />
            Fossil
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.keyNuclear}`} />
            Nuclear
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.keyRenew}`} />
            Renewables
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.keyOther}`} />
            Other
          </span>
        </div>
      }
      note={
        cleanest && mostFossil ? (
          <>
            Same physics, different choices: {cleanest.country} runs {cleanest.renewables}% of
            its generation on renewables while {mostFossil.country} runs {mostFossil.fossil}% on
            fossil fuel. The shares do not always reach 100% — the unattributed remainder is
            carried rather than normalised away.
          </>
        ) : undefined
      }
    >
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
                        data-figure
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
    </Panel>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

/**
 * Notes for the four readings.
 *
 * Definitions only. Every one of these used to carry figures typed in beside
 * the live value they were meant to describe — "roughly 6–7 years at current
 * rates", "developed nations average 9–14 t" — which is how prose and chart
 * come to contradict each other. Anything quantitative now lives where it can
 * be derived, and nothing here restates a number the row already renders.
 */
const READING_NOTES: Record<string, string> = {
  'Annual global CO₂': 'Everything released worldwide in a year, excluding land use.',
  'Year-over-year change': 'Against the previous year, off the same totals the trend plots.',
  'Per capita average': 'The world average per head — close to flat for a decade, while the total rose because population did.',
  '1.5°C budget remaining': 'What is left for a 50% chance of holding warming to 1.5°C.',
};

function DashboardPage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
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

  useBodyBackground('#eef3f4');

  /**
   * Years of budget left at the rate the page actually reports.
   *
   * `carbonBudget.yearsLeft` is a bundled constant divided out of a rate this
   * page no longer shows, so it disagreed with its own remaining figure the
   * moment the World Bank total moved. Derived here from the two numbers the
   * reader can see, and rounded to one place because a budget estimate carrying
   * three is false precision.
   */
  const yearsLeft =
    annualTotalGt > 0 ? Number((carbonBudget.remaining / annualTotalGt).toFixed(1)) : 0;

  /* The largest single source in the latest year, for the donut's note. */
  const topSector = [...sectorBreakdown].sort((a, b) => b.share - a.share)[0];

  const firstYear = sectorTrend[0];
  const lastYear = sectorTrend[sectorTrend.length - 1];
  const hasCovid = sectorTrend.some((point) => point.year === 2020);

  const provenance = carbonDegraded && !carbonLoading ? 'World Bank · bundled' : 'World Bank';

  return (
    <main ref={pageRef} className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      {/* No wrapper: HudHeader parks itself on scroll, so a second
          hide-on-scroll layer around it was two mechanisms for one behaviour. */}
      <HudHeader />

      <div className={styles.container}>
        {/* ==============================================================
            THE VERDICT.

            No entrance choreography above the fold. This is an Operate
            surface: the reader arrived to read a number, and a page that
            animates itself in before showing it is making them wait for
            something they did not ask to watch.
            ============================================================== */}
        <header className={styles.verdict}>
          <div className={styles.verdictMain}>
            <h1 className={styles.verdictTitle}>
              The carbon budget, and what is spending it
            </h1>

            <BudgetBar
              budget={carbonBudget}
              annualGt={annualTotalGt}
              yearsLeft={yearsLeft}
            />

            {/* The ticking projection, in the one place it means something:
                directly under the allowance it is drawing down. It led the
                page as a hero number for a while, which gave the weakest
                figure here — an extrapolation, not a measurement — the most
                prominent position on a page of reported statistics. */}
            <div className={styles.counter}>
              <p className={styles.counterRow}>
                <span className={styles.counterValue} data-figure>{formatTonnes(counter)}</span>
                <span className={styles.counterUnit}>billion tonnes CO₂ emitted this year</span>
              </p>
              <p className={styles.counterLabel}>
                Projected from {dataYear} World Bank annual total ({annualTotalGt} Gt CO₂e, excl.
                land use)
              </p>
            </div>
          </div>

          {/* The four readings, as a register rather than four equal cards.
              They are context for the budget above them, and a card each said
              they were four independent findings. */}
          <div className={styles.readings}>
            <h2 className={styles.readingsHead}>Headline figures</h2>
            <dl className={styles.readingList}>
              {kpis.map((kpi) => (
                <div key={kpi.label} className={styles.reading}>
                  <dt className={styles.readingLabel}>{kpi.label}</dt>
                  <dd className={styles.readingValueRow}>
                    <span className={styles.readingValue} data-figure>{kpi.value}</span>
                    <span className={styles.readingUnit}>{kpi.unit}</span>
                    {/* No sparkline where no series exists. The budget row
                        used to draw an invented decline; an absent chart is
                        more honest than a fabricated one. */}
                    {kpi.trend.length > 0 && <Sparkline data={kpi.trend} />}
                  </dd>
                  <dd className={styles.readingNote}>{READING_NOTES[kpi.label]}</dd>
                  <dd className={styles.readingSource}>
                    {kpi.trendRange
                      ? `${kpi.trendRange[0]}–${kpi.trendRange[1]} · ${kpi.provenance}`
                      : kpi.provenance}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* ==============================================================
            WHAT IS SPENDING IT.
            ============================================================== */}
        <section className={styles.section} aria-labelledby="spend-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="spend-heading" className={styles.sectionTitle}>
              What is spending it
            </h2>
            {/* Range and provenance come from the data, not a typed-in string
                that silently goes stale the year the API updates. */}
            <span className={styles.sectionMeta}>
              {sectorTrend.length > 0
                ? `${sectorTrend[0].year} – ${sectorTrend[sectorTrend.length - 1].year} · ${provenance}`
                : provenance}
            </span>
          </div>

          <div className={styles.split} data-reveal data-reveal-index="1">
            <Panel
              title="Emissions by sector"
              meta="Gt CO₂e / year, excl. land use"
              className={styles.splitLead}
              note={
                firstYear && lastYear ? (
                  <>
                    {/* Rounded at the point of use. `totalGt` is summed from
                        megatonnes and carries full float precision, which read
                        as "36.29252341543446 Gt" in the sentence. */}
                    From {firstYear.totalGt.toFixed(1)} Gt in {firstYear.year} to{' '}
                    {lastYear.totalGt.toFixed(1)} Gt in {lastYear.year}.
                    {hasCovid
                      ? ' The notch at 2020 is the COVID lockdowns; the series resumed climbing the year after.'
                      : ''}
                  </>
                ) : undefined
              }
            >
              <TrendChart data={sectorTrend} />
            </Panel>

            <Panel
              title="By sector"
              meta={`% of annual CO₂e · ${dataYear}`}
              note={
                topSector ? (
                  <>
                    {topSector.sector} is the largest single source at {topSector.share}% of the{' '}
                    {annualTotalGt} Gt total.
                  </>
                ) : undefined
              }
            >
              <SectorDonut sectors={sectorBreakdown} totalGt={annualTotalGt} />
            </Panel>
          </div>
        </section>

        {/* ==============================================================
            WHO IS SPENDING IT.
            ============================================================== */}
        <section className={styles.section} aria-labelledby="emitters-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="emitters-heading" className={styles.sectionTitle}>
              Who is spending it
            </h2>
            <span className={styles.sectionMeta}>{provenance}</span>
          </div>

          <div data-reveal data-reveal-index="1">
            <EmittersChart data={topEmitters} year={emittersYear} />
          </div>
        </section>

        {/* ==============================================================
            WHAT THEY RUN ON.
            ============================================================== */}
        <section className={styles.section} aria-labelledby="mix-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="mix-heading" className={styles.sectionTitle}>
              What they run on
            </h2>
            <span className={styles.sectionMeta}>Five grids · {provenance}</span>
          </div>

          <div data-reveal data-reveal-index="1">
            <EnergyMixChart data={energyMix} year={mixYear} />
          </div>
        </section>

        {/* ==============================================================
            WHAT REPLACES IT. The one panel that is not about the bill —
            it is the counter-argument, measured where the club stands.
            ============================================================== */}
        <section className={styles.section} aria-labelledby="live-heading">
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 id="live-heading" className={styles.sectionTitle}>
              Live conditions
            </h2>
            <span className={styles.sectionMeta}>Fetched now, not reported annually</span>
          </div>

          <div data-reveal data-reveal-index="1">
            <LiveEnergyPanel />
          </div>
        </section>

        <footer className={styles.footer} data-reveal data-reveal-index="0">
          <p>Green Tech Club</p>
          <p>Built for a grid that outlives us</p>
          {/* The upstreams this page actually reads. It used to credit the IEA,
              the Global Carbon Project and IPCC AR6 — two of which it never
              queries — which is the same defect the KPI provenance line was
              fixed for: a surface cannot cite a source it did not use. */}
          <span className={styles.sourceTag}>
            Sources: World Bank · Open-Meteo · IPCC AR6 for the 1.5°C budget
          </span>
        </footer>
      </div>
    </main>
  );
}

export default DashboardPage;
