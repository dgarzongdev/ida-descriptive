import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Sparkles,
  Sliders,
  TrendingUp,
  RotateCcw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown
} from 'lucide-react';
import { CurrencyMode, MediumKey, ForecastModelType, ScenarioType } from '../../types';
import { PROCESSED_DATA, MEDIA_METADATA, ALL_MEDIA_KEYS } from '../../data/advertisingData';
import {
  generateForecastData,
  DEFAULT_BASE_GROWTH_RATES,
  formatCurrencyCOP,
  formatUSD,
  formatPercent
} from '../../utils/statistics';

interface ForecastingTabProps {
  currencyMode: CurrencyMode;
}

export const ForecastingTab: React.FC<ForecastingTabProps> = ({ currencyMode }) => {
  const [modelType, setModelType] = useState<ForecastModelType>('macro_hybrid');
  const [scenario, setScenario] = useState<ScenarioType>('base');
  const [selectedMediumView, setSelectedMediumView] = useState<'total' | MediumKey>('total');
  
  // Custom annual growth rates state for the custom simulator
  const [customRates, setCustomRates] = useState<Record<MediumKey, number>>({
    ...DEFAULT_BASE_GROWTH_RATES
  });

  const handleCustomRateChange = (key: MediumKey, newRate: number) => {
    setCustomRates(prev => ({ ...prev, [key]: newRate }));
    if (scenario !== 'custom') {
      setScenario('custom');
    }
  };

  const resetCustomRates = () => {
    setCustomRates({ ...DEFAULT_BASE_GROWTH_RATES });
    setScenario('base');
  };

  // Generate projections dynamically
  const forecastResults = useMemo(() => {
    return generateForecastData(PROCESSED_DATA, {
      modelType,
      scenario,
      customGrowthRates: customRates
    });
  }, [modelType, scenario, customRates]);

  const { forecastYears, fullSeries, summaries } = forecastResults;

  // Formatting helper
  const formatVal = (valCOP: number) => {
    if (currencyMode === 'USD') {
      // Use recent TRM average (~4,050)
      return formatUSD(valCOP / 4052.86);
    }
    return formatCurrencyCOP(valCOP);
  };

  // Find 2025 and 2030 points
  const p2025 = fullSeries.find(d => d.year === 2025)!;
  const p2030 = fullSeries.find(d => d.year === 2030)!;

  const totalCAGR = Math.pow(p2030.total / p2025.total, 1 / 5) - 1;
  const totalAbsGrowth = p2030.total - p2025.total;

  // Chart data preparation
  const chartData = fullSeries.map(d => {
    const isForecast = d.year >= 2026;
    const item: any = {
      year: d.year,
      isForecast,
      totalHistoric: !isForecast ? (currencyMode === 'USD' ? d.total / 4052 : d.total) : null,
      totalForecast: isForecast || d.year === 2025 ? (currencyMode === 'USD' ? d.total / 4052 : d.total) : null,
      lowConfidence: isForecast ? (currencyMode === 'USD' ? (d.lowConfidenceTotal || d.total) / 4052 : d.lowConfidenceTotal) : null,
      highConfidence: isForecast ? (currencyMode === 'USD' ? (d.highConfidenceTotal || d.total) / 4052 : d.highConfidenceTotal) : null,
      totalRaw: d.total
    };

    ALL_MEDIA_KEYS.forEach(k => {
      const v = d.values[k];
      const displayV = currencyMode === 'USD' ? v / 4052 : v;
      if (!isForecast) {
        item[`${k}_hist`] = displayV;
      }
      if (isForecast || d.year === 2025) {
        item[`${k}_fc`] = displayV;
      }
      item[k] = displayV;
      item[`${k}_raw`] = v;
    });

    return item;
  });

  // Pie chart data for 2025 vs 2030 comparison
  const pie2025Data = ALL_MEDIA_KEYS.map(k => ({
    name: MEDIA_METADATA[k].shortLabel,
    value: p2025.values[k],
    share: p2025.shares[k],
    color: MEDIA_METADATA[k].color
  })).sort((a, b) => b.value - a.value);

  const pie2030Data = ALL_MEDIA_KEYS.map(k => ({
    name: MEDIA_METADATA[k].shortLabel,
    value: p2030.values[k],
    share: p2030.shares[k],
    color: MEDIA_METADATA[k].color
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Top Banner & Scenario / Model Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Motor Econométrico de Pronóstico 2026 – 2030
              </span>
              <span className="text-xs text-slate-400">Horizonte a 5 Años</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Proyección de Inversión Publicitaria por Medio hacia 2030
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Modelos predictivos que integran la saturación digital, el rebalanceo de la televisión hacia plataformas conectadas y la expansión de la publicidad exterior digital (DOOH).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Mercado Total 2030</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono">
                {formatVal(p2030.total)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                vs {formatVal(p2025.total)} (2025)
              </div>
            </div>
            <div className="h-9 w-px bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">CAGR 2025-2030</div>
              <div className="text-lg font-extrabold text-cyan-400 font-mono">
                {formatPercent(totalCAGR * 100, 1, true)} anual
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                +{formatVal(totalAbsGrowth)} neto
              </div>
            </div>
          </div>
        </div>

        {/* Model & Scenario Selectors */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Metodología de Modelación Econométrica:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setModelType('macro_hybrid')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  modelType === 'macro_hybrid'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Modelo híbrido calibrado con amortiguación de saturación"
              >
                Híbrido Calibrado
              </button>
              <button
                onClick={() => setModelType('weighted_ols')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  modelType === 'weighted_ols'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Regresión lineal ordinaria sobre tendencia reciente (2018-2025)"
              >
                Regresión OLS
              </button>
              <button
                onClick={() => setModelType('cagr')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  modelType === 'cagr'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Tasa de crecimiento anual compuesta reciente (2021-2025)"
              >
                CAGR Reciente
              </button>
              <button
                onClick={() => setModelType('exponential_decay')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  modelType === 'exponential_decay'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Curva exponencial continua"
              >
                Exponencial
              </button>
            </div>
          </div>

          {/* Scenario Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Escenario Macroeconómico de Pronóstico:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setScenario('base')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  scenario === 'base'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Base (Inercial)
              </button>
              <button
                onClick={() => setScenario('optimistic')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  scenario === 'optimistic'
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Mayor dinamismo del consumo privado y aceleración publicitaria (+8%)"
              >
                Optimista (+8%)
              </button>
              <button
                onClick={() => setScenario('pessimistic')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  scenario === 'pessimistic'
                    ? 'bg-rose-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Ajuste corporativo y presiones inflacionarias (-8%)"
              >
                Pesimista (-8%)
              </button>
              <button
                onClick={() => setScenario('custom')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                  scenario === 'custom'
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="Ajuste personalizado con controles deslizantes por medio"
              >
                Simulador ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Custom Simulator Sliders (conditionally expanded if scenario === 'custom') */}
        {scenario === 'custom' && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-amber-500/30 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Simulador Personalizado: Defina la Tasa Anual Esperada por Medio (2026–2030)
                </h4>
              </div>
              <button
                onClick={resetCustomRates}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium underline"
              >
                <RotateCcw className="w-3 h-3" />
                Restablecer a valores base
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {ALL_MEDIA_KEYS.map(key => {
                const meta = MEDIA_METADATA[key];
                const rate = customRates[key] ?? 0;
                return (
                  <div key={key} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 font-medium">{meta.shortLabel}</span>
                      <span className={`font-mono font-bold ${rate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(rate * 100, 1, true)}/año
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-0.15"
                      max="0.25"
                      step="0.005"
                      value={rate}
                      onChange={(e) => handleCustomRateChange(key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Forecast Chart: 1995 to 2030 */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Trayectoria y Proyección al 2030: {selectedMediumView === 'total' ? 'Mercado Publicitario Total' : MEDIA_METADATA[selectedMediumView].label}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                2026–2030 Estimado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Línea continua: datos consolidados (1995–2025). Línea discontinua con zona sombreada: proyección econométrica (2026–2030).
            </p>
          </div>

          {/* Medium view selector */}
          <div className="flex items-center gap-2 self-start">
            <span className="text-xs text-slate-400 font-medium">Medio:</span>
            <select
              value={selectedMediumView}
              onChange={(e) => setSelectedMediumView(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="total">⭐ Total Mercado</option>
              {ALL_MEDIA_KEYS.map(k => (
                <option key={k} value={k}>
                  {MEDIA_METADATA[k].shortLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => {
                  if (currencyMode === 'USD') return `$${Math.round(v)}M`;
                  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}B`;
                  if (v >= 1000) return `$${Math.round(v / 1000)}k`;
                  return `$${v}`;
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const yr = Number(label);
                  const isFc = yr >= 2026;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-950/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[220px]">
                      <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1">
                        <span className="text-white">Año {yr}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${isFc ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          {isFc ? 'Pronóstico' : 'Histórico'}
                        </span>
                      </div>
                      <div className="text-cyan-400 font-mono font-bold flex justify-between">
                        <span>Total Mercado:</span>
                        <span>{formatVal(item.totalRaw)}</span>
                      </div>
                      {selectedMediumView !== 'total' && (
                        <div className="font-mono flex justify-between" style={{ color: MEDIA_METADATA[selectedMediumView].color }}>
                          <span>{MEDIA_METADATA[selectedMediumView].shortLabel}:</span>
                          <span>{formatVal(item[`${selectedMediumView}_raw`])}</span>
                        </div>
                      )}
                      {isFc && selectedMediumView === 'total' && item.lowConfidence && item.highConfidence && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                          Rango Intervalo: {formatVal(item.lowConfidence * (currencyMode === 'USD' ? 4052 : 1))} – {formatVal(item.highConfidence * (currencyMode === 'USD' ? 4052 : 1))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              
              {/* Vertical line marking transition to forecast */}
              <ReferenceLine
                x={2025}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: 'Inicio Proyección 2026',
                  fill: '#10b981',
                  fontSize: 11,
                  position: 'top'
                }}
              />

              {/* Confidence Band for Total */}
              {selectedMediumView === 'total' && (
                <Area
                  type="monotone"
                  dataKey="highConfidence"
                  stroke="none"
                  fill="url(#bandGrad)"
                  name="Intervalo de Confianza"
                />
              )}

              {/* Rendering based on Total or Specific Medium */}
              {selectedMediumView === 'total' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="totalHistoric"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 2.5, fill: '#3b82f6' }}
                    name="Histórico Consolidado"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalForecast"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    dot={{ r: 4, fill: '#10b981' }}
                    name="Pronóstico 2026-2030"
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey={`${selectedMediumView}_hist`}
                    stroke={MEDIA_METADATA[selectedMediumView].color}
                    strokeWidth={3}
                    dot={{ r: 2.5, fill: MEDIA_METADATA[selectedMediumView].color }}
                    name="Histórico"
                  />
                  <Line
                    type="monotone"
                    dataKey={`${selectedMediumView}_fc`}
                    stroke={MEDIA_METADATA[selectedMediumView].color}
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    dot={{ r: 4, fill: MEDIA_METADATA[selectedMediumView].color }}
                    name="Pronóstico 2026-2030"
                  />
                </>
              )}
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: '11px' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Forecast Matrix Table (2025 to 2030) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Matriz de Pronóstico por Medio: 2026 – 2030
            </h3>
            <p className="text-xs text-slate-400">
              Valores proyectados año a año, tasa compuesta esperada (CAGR) y cuota proyectada en el año 2030.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Escenario: {scenario.toUpperCase()} | Modelo: {modelType.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-3">Medio Publicitario</th>
                <th className="py-3 px-2 text-right">2025 (Cierre)</th>
                <th className="py-3 px-2 text-right bg-emerald-950/20 text-emerald-300">2026 (P)</th>
                <th className="py-3 px-2 text-right bg-emerald-950/20 text-emerald-300">2027 (P)</th>
                <th className="py-3 px-2 text-right bg-emerald-950/20 text-emerald-300">2028 (P)</th>
                <th className="py-3 px-2 text-right bg-emerald-950/20 text-emerald-300">2029 (P)</th>
                <th className="py-3 px-2 text-right bg-emerald-900/30 text-emerald-400 font-bold">2030 (P)</th>
                <th className="py-3 px-2 text-right">CAGR 25-30</th>
                <th className="py-3 px-2 text-right">Cuota 2025</th>
                <th className="py-3 px-2 text-right text-cyan-300 font-bold">Cuota 2030</th>
                <th className="py-3 px-2 text-right">Cambio Cuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {summaries.map(item => {
                const meta = MEDIA_METADATA[item.key];
                const y26 = forecastYears.find(d => d.year === 2026)?.values[item.key] ?? 0;
                const y27 = forecastYears.find(d => d.year === 2027)?.values[item.key] ?? 0;
                const y28 = forecastYears.find(d => d.year === 2028)?.values[item.key] ?? 0;
                const y29 = forecastYears.find(d => d.year === 2029)?.values[item.key] ?? 0;

                return (
                  <tr key={item.key} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      {meta.shortLabel}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300">
                      {formatVal(item.val2025)}
                    </td>
                    <td className="py-3 px-2 text-right bg-emerald-950/10 text-emerald-200">
                      {formatVal(y26)}
                    </td>
                    <td className="py-3 px-2 text-right bg-emerald-950/10 text-emerald-200">
                      {formatVal(y27)}
                    </td>
                    <td className="py-3 px-2 text-right bg-emerald-950/10 text-emerald-200">
                      {formatVal(y28)}
                    </td>
                    <td className="py-3 px-2 text-right bg-emerald-950/10 text-emerald-200">
                      {formatVal(y29)}
                    </td>
                    <td className="py-3 px-2 text-right bg-emerald-900/20 text-emerald-400 font-bold">
                      {formatVal(item.val2030)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-bold ${item.cagr2025_2030 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(item.cagr2025_2030 * 100, 1, true)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-slate-400">
                      {item.share2025.toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-right text-cyan-300 font-bold">
                      {item.share2030.toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={item.shareChangePp >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatPercent(item.shareChangePp, 1, true)} pp
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Total Mercado Row */}
              <tr className="bg-slate-950 font-bold text-white border-t-2 border-slate-700">
                <td className="py-3 px-3 font-sans">⭐ TOTAL MERCADO</td>
                <td className="py-3 px-2 text-right text-slate-200">{formatVal(p2025.total)}</td>
                <td className="py-3 px-2 text-right bg-emerald-950/30 text-emerald-300">
                  {formatVal(forecastYears.find(d => d.year === 2026)?.total ?? 0)}
                </td>
                <td className="py-3 px-2 text-right bg-emerald-950/30 text-emerald-300">
                  {formatVal(forecastYears.find(d => d.year === 2027)?.total ?? 0)}
                </td>
                <td className="py-3 px-2 text-right bg-emerald-950/30 text-emerald-300">
                  {formatVal(forecastYears.find(d => d.year === 2028)?.total ?? 0)}
                </td>
                <td className="py-3 px-2 text-right bg-emerald-950/30 text-emerald-300">
                  {formatVal(forecastYears.find(d => d.year === 2029)?.total ?? 0)}
                </td>
                <td className="py-3 px-2 text-right bg-emerald-900/40 text-emerald-300">
                  {formatVal(p2030.total)}
                </td>
                <td className="py-3 px-2 text-right text-cyan-400">
                  {formatPercent(totalCAGR * 100, 1, true)}
                </td>
                <td className="py-3 px-2 text-right text-slate-300">100.0%</td>
                <td className="py-3 px-2 text-right text-cyan-300">100.0%</td>
                <td className="py-3 px-2 text-right text-slate-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Structural Shift: Share 2025 vs Share 2030 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Share 2025 */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Participación Cierre 2025 (Histórico)
              </h4>
              <span className="text-xs text-slate-400 font-mono">{formatVal(p2025.total)}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Estructura real observada con Digital liderando con 59,7% y TV Nacional con 17,7%.
            </p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie2025Data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pie2025Data.map(entry => (
                    <Cell key={`cell-25-${entry.name}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any, item: any) => [`${item.payload.share.toFixed(1)}% (${formatVal(item.payload.value)})`, item.payload.name]}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">2025</span>
              <span className="text-sm font-extrabold text-cyan-400 font-mono">100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            {pie2025Data.slice(0, 4).map(d => (
              <div key={d.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}:
                </span>
                <span className="font-bold">{d.share.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share 2030 */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Participación Pronosticada 2030 (Proyección)
              </h4>
              <span className="text-xs text-emerald-400 font-mono">{formatVal(p2030.total)}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Proyección al 2030 donde Digital alcanza ~66%-69% del pastel total y Exterior (DOOH) escala a ~7%.
            </p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie2030Data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pie2030Data.map(entry => (
                    <Cell key={`cell-30-${entry.name}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any, item: any) => [`${item.payload.share.toFixed(1)}% (${formatVal(item.payload.value)})`, item.payload.name]}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">2030</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            {pie2030Data.slice(0, 4).map(d => (
              <div key={d.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}:
                </span>
                <span className="font-bold text-emerald-400">{d.share.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Insights & Conclusions for 2030 */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="pb-4 border-b border-slate-800 mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Conclusiones Estratégicas para la Industria Publicitaria hacia 2030
          </h3>
          <p className="text-xs text-slate-400">
            Interpretación econométrica de los resultados de pronóstico para anunciantes, agencias de medios y operadores de telecomunicaciones en Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300 leading-relaxed">
          
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Digitalización & Meseta de Adopción
            </div>
            <p>
              Digital continuará siendo el principal motor del crecimiento (superando los <strong className="text-white">$4,5 billones COP</strong> en 2030). No obstante, su tasa de crecimiento interanual convergerá desde los ritmos históricos de +20% hacia un rango de entre <strong className="text-white">7% y 10% anual</strong>, debido a la saturación de penetración de smartphones e internet (ya en 82,3%).
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              2. Resiliencia de OOH / DOOH y Radio
            </div>
            <p>
              La <strong className="text-white">Publicidad Exterior (OOH)</strong> registrará el segundo mayor dinamismo (CAGR proyectado de ~7-9%), impulsada por la digitalización de pantallas (DOOH) y programática exterior. Por su parte, la <strong className="text-white">Radio</strong> mantendrá su posición de anclaje cultural y movilidad urbana con presupuestos estables sobre los $580 mil millones COP.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              3. Convergencia TV Conectada y Prensa Nicho
            </div>
            <p>
              La <strong className="text-white">TV Abierta Tradicional</strong> enfrentará una ligera contracción nominal (-1% a -2% anual) mientras migra presupuestos a CTV (Connected TV) y streaming híbrido con anuncios. La <strong className="text-white">Prensa y Revistas impresas</strong> consolidarán su rol de nicho prémium e institucional con una cuota combinada inferior al 3,5% del mercado publicitario total en 2030.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
