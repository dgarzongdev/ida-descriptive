export interface RawAdRecord {
  year: number;
  tvRegional: number | null;
  revistas: number | null;
  pubExterior: number | null;
  prensa: number | null;
  radio: number | null;
  tvNacional: number | null;
  digital: number | null;
  totalInv: number;
  ipc: number; // percentage, e.g. 5.1
  trm: number; // average exchange rate COP/USD
  internetPenetration: number; // percentage, e.g. 82.3
  population: number; // DANE population
}

export type MediumKey = 
  | 'digital'
  | 'tvNacional'
  | 'radio'
  | 'pubExterior'
  | 'prensa'
  | 'tvRegional'
  | 'revistas';

export interface MediumMeta {
  key: MediumKey;
  label: string;
  shortLabel: string;
  color: string;
  gradient: string;
  category: 'digital' | 'broadcast' | 'print' | 'ooh';
  firstAvailableYear: number;
  description: string;
}

export interface ProcessedAdRecord extends RawAdRecord {
  // Computed fields
  totalInvCalculated: number;
  realTotalInv: number; // Constant 2025 COP
  totalInvUSD: number; // Millions of USD
  adSpendPerCapitaCOP: number;
  adSpendPerCapitaUSD: number;
  shares: Record<MediumKey, number>; // Percentage share of total that year
  realValues: Record<MediumKey, number | null>; // In 2025 constant COP
  usdValues: Record<MediumKey, number | null>; // In USD
  yoyGrowthTotal: number | null;
  yoyGrowthByMedium: Record<MediumKey, number | null>;
}

export type CurrencyMode = 'COP_NOMINAL' | 'COP_REAL_2025' | 'USD';

export type ForecastModelType = 'weighted_ols' | 'cagr' | 'exponential_decay' | 'macro_hybrid';

export type ScenarioType = 'base' | 'optimistic' | 'pessimistic' | 'custom';

export interface ForecastYearData {
  year: number;
  isForecast: boolean;
  values: Record<MediumKey, number>;
  total: number;
  shares: Record<MediumKey, number>;
  lowConfidenceTotal?: number;
  highConfidenceTotal?: number;
}

export interface MediumForecastSummary {
  key: MediumKey;
  label: string;
  val2025: number;
  val2030: number;
  cagr2025_2030: number;
  absChange: number;
  share2025: number;
  share2030: number;
  shareChangePp: number;
  status: 'explosive_growth' | 'moderate_growth' | 'resilient' | 'decline';
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (year: number) => number;
}
