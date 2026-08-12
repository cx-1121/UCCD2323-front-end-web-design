/**
 * Bundled figures with no World Bank equivalent.
 *
 * Emissions totals, sector splits, top emitters and the electricity mix all
 * come from the live API now (`src/api/carbonApi.ts`), and their bundled
 * fallbacks live beside that client as `FALLBACK_CARBON`. The stale copies
 * that used to sit here were deleted rather than left in place: an unused
 * `topEmitters` export next to a live one is an import waiting to happen, and
 * the resulting page would show 2023 mock numbers with a "World Bank" label.
 *
 * What remains are the two blocks the World Bank does not publish as an
 * indicator series.
 */

export interface CarbonBudget {
  total: number;
  used: number;
  remaining: number;
  yearsLeft: number;
}

/**
 * Remaining 1.5°C carbon budget.
 *
 * Sourced from IPCC AR6 assessments, which are periodic reports rather than a
 * queryable indicator — there is no World Bank series for this.
 */
export const carbonBudget: CarbonBudget = {
  total: 1750,
  used: 1500,
  remaining: 250,
  yearsLeft: 7,
};

/**
 * KPI tile definitions.
 *
 * `annualGlobal.value` is overridden at render time with the fetched total —
 * the number here is only a placeholder for the first frame. The `trend`
 * arrays drive the sparklines and remain bundled: they are 2020–2025 shapes,
 * labelled as such in the UI.
 */
export const kpiData = {
  annualGlobal: { value: 36.8, unit: 'Gt', label: 'Annual global CO₂', trend: [34.2, 35.9, 36.3, 36.6, 36.8, 37.1] },
  yoyChange:    { value: 1.1, unit: '%', label: 'Year-over-year change', trend: [-5.2, 5.0, 1.1, 0.8, 0.5, 0.8] },
  perCapita:    { value: 4.7, unit: 't/person', label: 'Per capita average', trend: [4.3, 4.5, 4.6, 4.6, 4.7, 4.7] },
  budgetLeft:   { value: 250, unit: 'Gt', label: '1.5°C budget remaining', trend: [400, 363, 327, 290, 254, 250] },
};
