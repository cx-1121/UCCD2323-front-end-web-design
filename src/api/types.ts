/**
 * Shared types for the API layer.
 *
 * ApiError is created in http.ts so that every caller can handle
 * errors using a simple switch on the `kind` field.
 */

export type ApiErrorKind =
  /** Request timed out. */
  | 'timeout'
  /** No response - offline, DNS failure, or CORS rejection. */
  | 'network'
  /** Server error (5xx). Can retry. */
  | 'server'
  /** Client error (4xx). Don't retry. */
  | 'client'
  /** Got 200 but the response body was unexpected. */
  | 'shape'
  /** Request was cancelled. */
  | 'abort';

export interface ApiError {
  kind: ApiErrorKind;
  /** HTTP status, or 0 when no response was received. */
  status: number;
  message: string;
}

/** Type guard to check if a caught error is an ApiError. */
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
 * The Dashboard's live energy panel data model.
 * Already unit-converted so components can render it directly.
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

/** Where the rendered snapshot came from. */
export type SnapshotSource = 'live' | 'cache' | 'fallback';

/* ── Carbon dashboard (World Bank) ──────────────────────────────────────── */

/** One emitting sector's contribution in a single year. */
export interface SectorValue {
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
  /** Two-letter country code. */
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
  /** Unattributed remainder (100% minus the three named shares). */
  other: number;
}

/**
 * Everything the carbon dashboard sections need.
 * Each block carries its own reference year since the World Bank
 * publishes different indicators on different schedules.
 */
export interface CarbonSnapshot {
  /** Latest year present in the sector series. */
  dataYear: number;
  sectorTrend: SectorYear[];
  /** Annual total for `dataYear`, gigatonnes. */
  annualTotalGt: number;
  /** World CO₂ per person, tonnes, by year. */
  perCapitaTrend: YearValue[];
  emitters: EmitterRow[];
  emittersYear: number;
  energyMix: EnergyMixRow[];
  mixYear: number;
  fetchedAt: number;
}
