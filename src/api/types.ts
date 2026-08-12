/**
 * Shared contracts for the network layer (architecture §6).
 *
 * `ApiError` is produced in exactly one place — `http.ts` — so that every
 * consumer downstream can branch on a single, closed set of failure kinds
 * instead of re-interpreting jQuery's `(jqXHR, textStatus, errorThrown)` triple
 * at each call site.
 */

export type ApiErrorKind =
  /** The request exceeded REQUEST_TIMEOUT_MS. */
  | 'timeout'
  /** No response reached us: offline, DNS failure, CORS rejection. */
  | 'network'
  /** Upstream answered 5xx. Retryable. */
  | 'server'
  /** Upstream answered 4xx. Not retryable — retrying a 404 just wastes time. */
  | 'client'
  /** A 200 whose body did not match the documented shape. */
  | 'shape'
  /** The request was cancelled by us. */
  | 'abort';

export interface ApiError {
  kind: ApiErrorKind;
  /** HTTP status, or 0 when no response was received. */
  status: number;
  message: string;
}

/** Narrowing helper — `catch` binds `unknown`, and this keeps casts out of components. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'status' in value &&
    'message' in value
  );
}

/** One year of the World Bank renewable-share series. */
export interface RenewableSharePoint {
  year: number;
  /** Renewable share of final energy consumption, percent. */
  percent: number;
}

/**
 * The Dashboard's live panel model.
 *
 * Deliberately flat and already unit-converted: components should render this
 * directly without knowing that solar and wind come from one upstream and the
 * renewable series from another.
 */
export interface LiveEnergySnapshot {
  solar: {
    /** Highest shortwave radiation forecast for today. */
    peakIrradiance: number;
    /** Radiation forecast for the current hour. */
    currentIrradiance: number;
    unit: string;
  };
  wind: {
    peakSpeed: number;
    currentSpeed: number;
    unit: string;
  };
  /** Most recent year with a reported figure, or null if the series was empty. */
  latestRenewableShare: RenewableSharePoint | null;
  /** Ascending by year, nulls dropped. */
  renewableTrend: RenewableSharePoint[];
  /** Epoch ms when this snapshot was assembled. */
  fetchedAt: number;
}

/** Where the rendered snapshot came from — drives the panel's status badge. */
export type SnapshotSource = 'live' | 'cache' | 'fallback';

/* ── Carbon dashboard (World Bank) ──────────────────────────────────────── */

/** One emitting sector's contribution in a single year. */
export interface SectorValue {
  /** Stable key matching the sector group definition. */
  key: string;
  label: string;
  color: string;
  /** Megatonnes CO₂e. */
  value: number;
}

/** A year of the stacked sector trend. */
export interface SectorYear {
  year: number;
  sectors: SectorValue[];
  /** Sum across sectors, in gigatonnes. */
  totalGt: number;
}

/** A single point in a yearly series. */
export interface YearValue {
  year: number;
  value: number;
}

export interface EmitterRow {
  /** Two-letter code shown in the bar list. */
  code: string;
  name: string;
  /** Gigatonnes CO₂e per year. */
  total: number;
  /** Tonnes CO₂e per person per year. */
  perCapita: number;
}

export interface EnergyMixRow {
  country: string;
  fossil: number;
  nuclear: number;
  renewables: number;
  /**
   * Unattributed remainder. The three World Bank shares sum to 97–100%, so a
   * bar stacked from them alone silently falls short of full width. Carrying
   * the gap explicitly is more honest than normalising it away.
   */
  other: number;
}

/**
 * Everything the three mock-backed dashboard sections need, from live data.
 *
 * Each block carries its own reference year: the World Bank publishes
 * emissions, electricity mix and population on different schedules, and a
 * single "as of" date across all three would be a lie about at least one.
 */
export interface CarbonSnapshot {
  /** Latest year present in the sector series. */
  dataYear: number;
  sectorTrend: SectorYear[];
  /** Annual total for `dataYear`, gigatonnes. */
  annualTotalGt: number;
  /**
   * World CO₂ per person, tonnes, by year.
   *
   * Fetched for the `WLD` aggregate inside the emitters request, which already
   * asks for this indicator — so the KPI row costs no extra round trip.
   */
  perCapitaTrend: YearValue[];
  emitters: EmitterRow[];
  emittersYear: number;
  energyMix: EnergyMixRow[];
  mixYear: number;
  fetchedAt: number;
}
