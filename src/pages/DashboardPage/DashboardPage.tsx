import { useState } from 'react';
import HudHeader from '../../components/HudHeader/HudHeader';
import { useBodyBackground } from '../../hooks/useBodyBackground';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useReveal } from '../../hooks/useReveal';
import { useCarbonLiveData } from '../../hooks/useCarbonLiveData';
import type { CountryEmission } from '../../data/carbonMockData';
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

function SectorDonut({ sectors }: { sectors: { sector: string; share: number; color: string }[] }) {
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className={styles.donutWrap}>
      <svg className={styles.donutSvg} viewBox="0 0 160 160">
        {sectors.map((s) => {
          const dash = (s.share / 100) * C;
          const gap = C - dash;
          const current = offset;
          offset += dash;
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
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" className={styles.donutCenter}>36.8</text>
        <text x="80" y="94" textAnchor="middle" className={styles.donutCenterUnit}>Gt CO₂</text>
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

function TrendChart({ data }: { data: { year: number; coal: number; oil: number; gas: number; cement: number; other: number; total: number }[] }) {
  const W = 600;
  const H = 200;
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;
  const maxY = 40;
  const years = data.map((d) => d.year);
  const xStep = cw / (years.length - 1);

  const layers: { key: string; color: string; values: number[] }[] = [
    { key: 'other',  color: '#a3a3a3', values: data.map((d) => d.other) },
    { key: 'cement', color: '#d97706', values: data.map((d) => d.cement) },
    { key: 'gas',    color: 'rgba(15,118,110,0.7)', values: data.map((d) => d.gas) },
    { key: 'oil',    color: 'rgba(12,26,19,0.35)', values: data.map((d) => d.oil) },
    { key: 'coal',   color: 'rgba(12,26,19,0.65)', values: data.map((d) => d.coal) },
  ];

  const cumulative: number[][] = Array.from({ length: data.length }, () => []);
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    for (const layer of layers) {
      sum += layer.values[i];
      cumulative[i].push(sum);
    }
  }

  const y = (val: number) => pad.top + ch - (val / maxY) * ch;
  const x = (idx: number) => pad.left + idx * xStep;

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
    <svg className={styles.areaChart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Y-axis labels */}
      {[0, 10, 20, 30, 40].map((v) => (
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
            {v}
          </text>
        </g>
      ))}

      {/* Areas */}
      {layers.map((layer, li) => (
        <path key={layer.key} d={areaPath(li)} fill={layer.color} opacity="0.85" />
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

      {/* COVID dip annotation */}
      <text x={x(0)} y={y(data[0].total) - 8} textAnchor="middle" fill="var(--signal)" fontSize="8" fontFamily="var(--font-mono)">
        COVID dip
      </text>
    </svg>
  );
}

/* ── Top emitters bar chart ──────────────────────────────────────────── */

function EmittersChart({ data }: { data: CountryEmission[] }) {
  const [mode, setMode] = useState<'total' | 'perCapita'>('total');

  const sorted = [...data].sort((a, b) =>
    mode === 'total' ? b.total - a.total : b.perCapita - a.perCapita,
  );
  const maxVal = Math.max(...sorted.map((d) => (mode === 'total' ? d.total : d.perCapita)));

  return (
    <div>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Top emitters</span>
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
      <p className={styles.budgetCaption}>
        CO₂ budget to limit warming to 1.5°C at current rate
      </p>
    </div>
  );
}

/* ── Energy mix stacked bars ─────────────────────────────────────────── */

function EnergyMixChart({ data }: { data: { country: string; fossil: number; nuclear: number; renewables: number }[] }) {
  return (
    <div>
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
      </div>
      <div className={styles.mixGrid}>
        {data.map((d) => (
          <div key={d.country} className={styles.mixRow}>
            <span className={styles.mixCountry}>{d.country}</span>
            <div className={styles.mixTrack}>
              <div className={styles.mixFossil} style={{ width: `${d.fossil}%` }} />
              <div className={styles.mixNuclear} style={{ width: `${d.nuclear}%` }} />
              <div className={styles.mixRenewable} style={{ width: `${d.renewables}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

function DashboardPage() {
  const pageRef = useReveal<HTMLElement>(styles.revealed);
  const navHidden = useHideOnScroll(140);
  const { counter, kpis, historicalTrend, sectorBreakdown, topEmitters, energyMix, carbonBudget } = useCarbonLiveData();

  useBodyBackground('#f7f8fa');

  const kpiEntries = [
    { ...kpis.annualGlobal, direction: 'up' as const },
    { ...kpis.yoyChange, direction: 'up' as const },
    { ...kpis.perCapita, direction: 'up' as const },
    { ...kpis.budgetLeft, direction: 'down' as const },
  ];

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
            Based on IEA &amp; Global Carbon Project data
          </p>
        </header>

        {/* ---- KPI tiles ---- */}
        <div className={styles.kpiGrid} data-reveal data-reveal-index="1">
          {kpiEntries.map((kpi) => (
            <div key={kpi.label} className={styles.kpiTile}>
              <div className={styles.kpiCore}>
                <p className={styles.kpiLabel}>{kpi.label}</p>
                <p>
                  <span className={styles.kpiValue}>{kpi.value}</span>
                  <span className={styles.kpiUnit}>{kpi.unit}</span>
                </p>
                {kpi.label === 'Year-over-year change' && (
                  <span className={`${styles.kpiBadge} ${kpi.value > 0 ? styles.kpiBadgeUp : styles.kpiBadgeDown}`}>
                    {kpi.value > 0 ? '↑' : '↓'} {kpi.value > 0 ? '+' : ''}{kpi.value}%
                  </span>
                )}
                <Sparkline data={kpi.trend} />
              </div>
            </div>
          ))}
        </div>

        {/* ---- Historical trend + Sector donut ---- */}
        <section className={styles.section}>
          <div className={styles.sectionHead} data-reveal data-reveal-index="0">
            <h2 className={styles.sectionTitle}>Emissions overview</h2>
            <span className={styles.sectionMeta}>2020 – 2025</span>
          </div>

          <div className={styles.chartRow} data-reveal data-reveal-index="1">
            <div className={styles.chartShell}>
              <div className={styles.chartCore}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Historical trend by fuel</span>
                  <span className={styles.chartSubtext}>Gt CO₂ / year</span>
                </div>
                <TrendChart data={historicalTrend} />
              </div>
            </div>

            <div className={styles.chartShell}>
              <div className={styles.chartCore}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>By sector</span>
                </div>
                <SectorDonut sectors={sectorBreakdown} />
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
            <div className={styles.chartShell}>
              <div className={styles.chartCore}>
                <EmittersChart data={topEmitters} />
              </div>
            </div>

            <div className={styles.chartShell}>
              <div className={styles.chartCore}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>1.5°C carbon budget</span>
                </div>
                <BudgetRing budget={carbonBudget} />
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

          <div className={styles.chartShell} data-reveal data-reveal-index="1">
            <div className={styles.chartCore}>
              <EnergyMixChart data={energyMix} />
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
