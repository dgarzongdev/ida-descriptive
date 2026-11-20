import { MediumKey, ProcessedAdRecord, RegressionResult, ForecastYearData, MediumForecastSummary, ForecastModelType, ScenarioType } from '../types';
import { ALL_MEDIA_KEYS, MEDIA_METADATA } from '../data/advertisingData';

/**
 * Calculates Pearson correlation coefficient between two numeric series.
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Calculates Ordinary Least Squares (OLS) Linear Regression: y = slope * x + intercept
 */
export function calculateLinearRegression(points: { x: number; y: number }[]): RegressionResult {
  const n = points.length;
  if (n < 2) {
    const val = points[0]?.y ?? 0;
    return { slope: 0, intercept: val, rSquared: 0, predict: () => val };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    const pred = slope * p.x + intercept;
    ssTot += Math.pow(p.y - meanY, 2);
    ssRes += Math.pow(p.y - pred, 2);
  }
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));

  return {
    slope,
    intercept,
    rSquared,
    predict: (year: number) => Math.max(0, slope * year + intercept)
  };
}

/**
 * Calculates Compound Annual Growth Rate (CAGR)
 */
export function calculateCAGR(initialVal: number, finalVal: number, years: number): number {
  if (initialVal <= 0 || finalVal <= 0 || years <= 0) return 0;
  return Math.pow(finalVal / initialVal, 1 / years) - 1;
}

/**
 * Descriptive statistics summary for a given numeric array
 */
export function calculateSummaryStats(values: number[]) {
  if (values.length === 0) {
    return { mean: 0, min: 0, max: 0, stdDev: 0, count: 0 };
  }
  const count = values.length;
  const mean = values.reduce((acc, v) => acc + v, 0) / count;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return { mean, min, max, stdDev, count };
}

/**
 * Default annual baseline expected growth rates (2026-2030) calibrated by medium
 * based on structural trend, international benchmarks, and macroeconomic maturity.
 */
export const DEFAULT_BASE_GROWTH_RATES: Record<MediumKey, number> = {
  digital: 0.088,      // 8.8% annual nominal growth (reaching ~66-68% share)
  tvNacional: -0.012,  // -1.2% annual nominal adjustment (mature shift to connected TV/digital)
  radio: 0.015,       // +1.5% stable resilience, voice & podcast integration
  pubExterior: 0.085, // +8.5% strong DOOH digitalization momentum
  prensa: -0.045,     // -4.5% secular shift toward digital subscriptions
  tvRegional: 0.012,  // +1.2% regional institutional stability
  revistas: -0.095    // -9.5% continued print volume rationalization
};

export interface ForecastOptions {
  modelType: ForecastModelType;
  scenario: ScenarioType;
  customGrowthRates?: Partial<Record<MediumKey, number>>;
  optimismFactor?: number; // e.g. 1.05 or 0.95
}

/**
 * Generates forecast data for each year from 2026 up to 2030
 */
export function generateForecastData(
  historicalData: ProcessedAdRecord[],
  options: ForecastOptions
): {
  forecastYears: ForecastYearData[];
  fullSeries: ForecastYearData[];
  summaries: MediumForecastSummary[];
} {
  const lastHistorical = historicalData[historicalData.length - 1]; // 2025
  const year2025 = lastHistorical.year;

  // Multiplier based on scenario
  let scenarioMultiplier = 1.0;
  if (options.scenario === 'optimistic') {
    scenarioMultiplier = 1.08;
  } else if (options.scenario === 'pessimistic') {
    scenarioMultiplier = 0.92;
  }

  // Precompute models for each medium
  const mediumProjections: Record<MediumKey, (year: number) => number> = {} as any;

  ALL_MEDIA_KEYS.forEach(key => {
    const val2025 = lastHistorical[key] ?? 1000;

    if (options.scenario === 'custom' && options.customGrowthRates && options.customGrowthRates[key] !== undefined) {
      const g = options.customGrowthRates[key]!;
      mediumProjections[key] = (targetYear: number) => {
        const step = targetYear - year2025;
        return Math.max(100, val2025 * Math.pow(1 + g, step));
      };
      return;
    }

    if (options.modelType === 'cagr') {
      // 5-year historical CAGR (2020-2025 or 2019-2025)
      const refYear = 2021;
      const refRow = historicalData.find(d => d.year === refYear);
      let g = DEFAULT_BASE_GROWTH_RATES[key];

      if (refRow && refRow[key] && refRow[key]! > 0) {
        const cagrHist = calculateCAGR(refRow[key]!, val2025, year2025 - refYear);
        // Bound extremes so digital does not explode unrealistically and print doesn't go negative
        if (key === 'digital') {
          g = Math.min(0.12, Math.max(0.06, cagrHist * 0.7)); // Damping law of large numbers
        } else if (key === 'revistas') {
          g = Math.max(-0.15, Math.min(-0.05, cagrHist));
        } else if (key === 'prensa') {
          g = Math.max(-0.08, Math.min(-0.02, cagrHist));
        } else {
          g = Math.max(-0.05, Math.min(0.12, cagrHist * 0.8));
        }
      }

      g *= scenarioMultiplier;

      mediumProjections[key] = (targetYear: number) => {
        const step = targetYear - year2025;
        return Math.max(100, val2025 * Math.pow(1 + g, step));
      };
    } else if (options.modelType === 'weighted_ols') {
      // Linear regression on recent 8 years (2018-2025)
      const recentPoints = historicalData
        .filter(d => d.year >= 2018 && d[key] !== null && d[key] !== undefined)
        .map(d => ({ x: d.year, y: d[key]! }));

      const reg = calculateLinearRegression(recentPoints);

      mediumProjections[key] = (targetYear: number) => {
        let linearVal = reg.predict(targetYear);
        if (key === 'digital') {
          // Add dampening saturation
          const baseStep = targetYear - year2025;
          const dampedRate = 0.085 * scenarioMultiplier;
          linearVal = val2025 * Math.pow(1 + dampedRate, baseStep);
        } else if (key === 'revistas' || key === 'prensa') {
          // Prevent negative values
          linearVal = Math.max(key === 'revistas' ? 2500 : 120000, linearVal);
        }
        return Math.max(100, linearVal * (options.scenario === 'optimistic' ? 1.04 : options.scenario === 'pessimistic' ? 0.96 : 1.0));
      };
    } else if (options.modelType === 'exponential_decay') {
      // Exponential decay or growth
      let annualRate = DEFAULT_BASE_GROWTH_RATES[key] * scenarioMultiplier;
      mediumProjections[key] = (targetYear: number) => {
        const step = targetYear - year2025;
        return Math.max(50, val2025 * Math.exp(annualRate * step));
      };
    } else {
      // Macro Hybrid (Default calibrated econometric model)
      const baseG = DEFAULT_BASE_GROWTH_RATES[key] * scenarioMultiplier;
      mediumProjections[key] = (targetYear: number) => {
        const step = targetYear - year2025;
        // Mild gradual deceleration each year towards maturity
        let accum = val2025;
        for (let i = 1; i <= step; i++) {
          const yearRate = baseG * Math.pow(0.96, i - 1); // 4% deceleration per year
          accum *= (1 + yearRate);
        }
        return Math.max(key === 'revistas' ? 2000 : 50000, accum);
      };
    }
  });

  // Build full series (1995 to 2030)
  const fullSeries: ForecastYearData[] = [];

  // Historicals
  historicalData.forEach(row => {
    const values: Record<MediumKey, number> = {} as any;
    ALL_MEDIA_KEYS.forEach(k => {
      values[k] = row[k] ?? 0;
    });

    fullSeries.push({
      year: row.year,
      isForecast: false,
      values,
      total: row.totalInv,
      shares: { ...row.shares }
    });
  });

  // Forecasts 2026 to 2030
  const forecastYears: ForecastYearData[] = [];
  for (let yr = 2026; yr <= 2030; yr++) {
    const values: Record<MediumKey, number> = {} as any;
    let total = 0;

    ALL_MEDIA_KEYS.forEach(k => {
      const pred = Math.round(mediumProjections[k](yr) * 10) / 10;
      values[k] = pred;
      total += pred;
    });

    const shares: Record<MediumKey, number> = {} as any;
    ALL_MEDIA_KEYS.forEach(k => {
      shares[k] = (values[k] / total) * 100;
    });

    const forecastPoint: ForecastYearData = {
      year: yr,
      isForecast: true,
      values,
      total: Math.round(total * 10) / 10,
      shares,
      lowConfidenceTotal: Math.round(total * 0.94 * 10) / 10,
      highConfidenceTotal: Math.round(total * 1.06 * 10) / 10
    };

    forecastYears.push(forecastPoint);
    fullSeries.push(forecastPoint);
  }

  // Generate Summaries for 2025 vs 2030
  const point2025 = fullSeries.find(d => d.year === 2025)!;
  const point2030 = fullSeries.find(d => d.year === 2030)!;

  const summaries: MediumForecastSummary[] = ALL_MEDIA_KEYS.map(key => {
    const v25 = point2025.values[key];
    const v30 = point2030.values[key];
    const cagr = calculateCAGR(v25, v30, 5);
    const s25 = point2025.shares[key];
    const s30 = point2030.shares[key];

    let status: MediumForecastSummary['status'] = 'resilient';
    if (cagr > 0.06) status = 'explosive_growth';
    else if (cagr > 0.01) status = 'moderate_growth';
    else if (cagr < -0.01) status = 'decline';

    return {
      key,
      label: MEDIA_METADATA[key].shortLabel,
      val2025: v25,
      val2030: v30,
      cagr2025_2030: cagr,
      absChange: v30 - v25,
      share2025: s25,
      share2030: s30,
      shareChangePp: s30 - s25,
      status
    };
  });

  return {
    forecastYears,
    fullSeries,
    summaries
  };
}

/**
 * Format Colombian Pesos / currency with readable prefixes
 */
export function formatCurrencyCOP(value: number, includeSign = false): string {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const prefix = includeSign && value > 0 ? '+' : '';

  if (Math.abs(value) >= 1_000_000) {
    return `${prefix}$${(value / 1_000_000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Billones`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${prefix}$${(value / 1_000).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mil M`;
  }
  return `${prefix}$${value.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
}

export function formatUSD(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return '$0 USD';
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B USD`;
  }
  return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M USD`;
}

export function formatPercent(value: number, decimals = 1, includeSign = false): string {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}
