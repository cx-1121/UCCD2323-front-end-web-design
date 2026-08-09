export interface YearlyEmission {
  year: number;
  coal: number;
  oil: number;
  gas: number;
  cement: number;
  other: number;
  total: number;
}

export interface CountryEmission {
  code: string;
  name: string;
  total: number;
  perCapita: number;
  population: number;
}

export interface SectorShare {
  sector: string;
  share: number;
  color: string;
}

export interface EnergyMixEntry {
  country: string;
  fossil: number;
  nuclear: number;
  renewables: number;
}

export interface CarbonBudget {
  total: number;
  used: number;
  remaining: number;
  yearsLeft: number;
}

export const ANNUAL_EMISSIONS_GT = 36.8;
export const TONNES_PER_SECOND = ANNUAL_EMISSIONS_GT * 1e9 / (365.25 * 24 * 3600);

export const historicalTrend: YearlyEmission[] = [
  { year: 2020, coal: 14.1, oil: 10.6, gas: 7.4, cement: 1.5, other: 0.6, total: 34.2 },
  { year: 2021, coal: 15.0, oil: 11.0, gas: 7.7, cement: 1.6, other: 0.6, total: 35.9 },
  { year: 2022, coal: 15.1, oil: 11.2, gas: 7.8, cement: 1.6, other: 0.6, total: 36.3 },
  { year: 2023, coal: 15.2, oil: 11.3, gas: 7.9, cement: 1.6, other: 0.6, total: 36.6 },
  { year: 2024, coal: 15.3, oil: 11.3, gas: 8.0, cement: 1.6, other: 0.6, total: 36.8 },
  { year: 2025, coal: 15.4, oil: 11.4, gas: 8.1, cement: 1.6, other: 0.6, total: 37.1 },
];

export const sectorBreakdown: SectorShare[] = [
  { sector: 'Energy',      share: 73.2, color: 'var(--signal)' },
  { sector: 'Transport',   share: 16.2, color: 'var(--signal-teal)' },
  { sector: 'Industry',    share: 5.2,  color: '#6366f1' },
  { sector: 'Agriculture', share: 3.0,  color: 'var(--signal-lime)' },
  { sector: 'Buildings',   share: 2.4,  color: '#d97706' },
];

export const topEmitters: CountryEmission[] = [
  { code: 'CN', name: 'China',        total: 11.4,  perCapita: 8.0,  population: 1425 },
  { code: 'US', name: 'United States', total: 4.7,   perCapita: 14.0, population: 336 },
  { code: 'IN', name: 'India',         total: 2.9,   perCapita: 2.0,  population: 1428 },
  { code: 'EU', name: 'EU-27',         total: 2.5,   perCapita: 5.6,  population: 448 },
  { code: 'RU', name: 'Russia',        total: 1.8,   perCapita: 12.5, population: 144 },
  { code: 'JP', name: 'Japan',         total: 1.0,   perCapita: 8.5,  population: 125 },
  { code: 'IR', name: 'Iran',          total: 0.75,  perCapita: 8.8,  population: 88 },
  { code: 'KR', name: 'South Korea',   total: 0.62,  perCapita: 12.0, population: 52 },
  { code: 'SA', name: 'Saudi Arabia',  total: 0.59,  perCapita: 16.6, population: 36 },
  { code: 'ID', name: 'Indonesia',     total: 0.62,  perCapita: 2.3,  population: 275 },
];

export const energyMix: EnergyMixEntry[] = [
  { country: 'China',   fossil: 87, nuclear: 5,  renewables: 8 },
  { country: 'USA',     fossil: 79, nuclear: 8,  renewables: 13 },
  { country: 'India',   fossil: 91, nuclear: 1,  renewables: 8 },
  { country: 'Germany', fossil: 70, nuclear: 6,  renewables: 24 },
  { country: 'Brazil',  fossil: 28, nuclear: 1,  renewables: 71 },
];

export const carbonBudget: CarbonBudget = {
  total: 1750,
  used: 1500,
  remaining: 250,
  yearsLeft: 7,
};

export const kpiData = {
  annualGlobal: { value: 36.8, unit: 'Gt', label: 'Annual global CO₂', trend: [34.2, 35.9, 36.3, 36.6, 36.8, 37.1] },
  yoyChange:    { value: 1.1, unit: '%', label: 'Year-over-year change', trend: [-5.2, 5.0, 1.1, 0.8, 0.5, 0.8] },
  perCapita:    { value: 4.7, unit: 't/person', label: 'Per capita average', trend: [4.3, 4.5, 4.6, 4.6, 4.7, 4.7] },
  budgetLeft:   { value: 250, unit: 'Gt', label: '1.5°C budget remaining', trend: [400, 363, 327, 290, 254, 250] },
};
