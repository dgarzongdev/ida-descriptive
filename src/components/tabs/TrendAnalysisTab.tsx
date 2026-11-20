import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Layers,
  ArrowUpDown,
  Compass,
  CheckSquare,
  Square,
  Globe,
  DollarSign,
  Flame,
  AlertCircle
} from 'lucide-react';
import { CurrencyMode, MediumKey } from '../../types';
import { PROCESSED_DATA, MEDIA_METADATA, ALL_MEDIA_KEYS, MILESTONES } from '../../data/advertisingData';
import { formatCurrencyCOP, formatUSD, formatPercent, calculateCorrelation, calculateLinearRegression } from '../../utils/statistics';

interface TrendAnalysisTabProps {
  currencyMode: CurrencyMode;
}

export const TrendAnalysisTab: React.FC<TrendAnalysisTabProps> = ({ currencyMode }) => {
  // Multi-select for media lines
  const [selectedMedia, setSelectedMedia] = useState<Record<MediumKey, boolean>>({
    digital: true,
    tvNacional: true,
    radio: true,
    pubExterior: true,
    prensa: true,
    tvRegional: false,
    revistas: false
  });

  const [scaleType, setScaleType] = useState<'linear' | 'log'>('linear');
  const [macroTab, setMacroTab] = useState<'internet' | 'trm' | 'ipc' | 'perCapita'>('internet');

  const toggleMedia = (key: MediumKey) => {
    setSelectedMedia(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = (select: boolean) => {
    const updated: any = {};
    ALL_MEDIA_KEYS.forEach(k => {
      updated[k] = select;
    });
    setSelectedMedia(updated);
  };

  // Helper to format values for charts and tooltips
  const formatValForDisplay = (valCOP: number | null, year?: number) => {
    if (valCOP === null || valCOP === undefined) return 'N/D';
    if (currencyMode === 'USD') {
      const rec = PROCESSED_DATA.find(d => d.year === year);
      const trm = rec ? rec.trm : 4052;
      return formatUSD(valCOP / trm);
    }
    if (currencyMode === 'COP_REAL_2025' && year) {
      const rec = PROCESSED_DATA.find(d => d.year === year);
      const mult = rec ? rec.realTotalInv / rec.totalInv : 1;
      return formatCurrencyCOP(valCOP * mult);
    }
    return formatCurrencyCOP(valCOP);
  };

  // Prepare Trend Data for Recharts
  const historicalTrendData = PROCESSED_DATA.map(d => {
    const item: any = {
      year: d.year,
      totalInv: currencyMode === 'USD' ? d.totalInvUSD : currencyMode === 'COP_REAL_2025' ? d.realTotalInv : d.totalInv,
      totalInvNominal: d.totalInv,
      totalInvReal: d.realTotalInv,
      ipc: d.ipc,
      trm: d.trm,
      internetPenetration: d.internetPenetration,
      adSpendPerCapitaCOP: d.adSpendPerCapitaCOP,
      adSpendPerCapitaUSD: d.adSpendPerCapitaUSD
    };

    ALL_MEDIA_KEYS.forEach(k => {
      const val = d[k];
      if (val !== null && val !== undefined) {
        if (currencyMode === 'USD') item[k] = val / d.trm;
        else if (currencyMode === 'COP_REAL_2025') item[k] = d.realValues[k];
        else item[k] = val;
      } else {
        item[k] = null;
      }
    });

    return item;
  });

  // Calculate correlation for Digital vs Internet
  const digitalYears = PROCESSED_DATA.filter(d => d.digital !== null && d.digital !== undefined);
  const digitalInvArray = digitalYears.map(d => d.digital!);
  const internetArray = digitalYears.map(d => d.internetPenetration);
  const corrDigitalInternet = calculateCorrelation(internetArray, digitalInvArray);
  const r2DigitalInternet = Math.pow(corrDigitalInternet, 2);

  // Correlation for Total Inv vs TRM
  const totalInvArray = PROCESSED_DATA.map(d => d.totalInv);
  const trmArray = PROCESSED_DATA.map(d => d.trm);
  const corrTotalTRM = calculateCorrelation(trmArray, totalInvArray);

  // Correlation for YoY Growth vs IPC
  const validYoY = PROCESSED_DATA.filter(d => d.yoyGrowthTotal !== null);
  const yoyGrowthArray = validYoY.map(d => d.yoyGrowthTotal!);
  const ipcArray = validYoY.map(d => d.ipc);
  const corrGrowthIPC = calculateCorrelation(ipcArray, yoyGrowthArray);

  // Scatter plot points for Digital vs Internet
  const scatterDigitalInternet = digitalYears.map(d => ({
    x: d.internetPenetration,
    y: currencyMode === 'USD' ? d.digital! / d.trm : d.digital!,
    year: d.year,
    rawDigital: d.digital!
  }));

  // Nominal vs Real Comparison Data
  const nominalVsRealData = PROCESSED_DATA.map(d => ({
    year: d.year,
    nominal: d.totalInv,
    real: d.realTotalInv,
    inflationAccum: d.realTotalInv / d.totalInv
  }));

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Evolución & Dinámica de Variables
              </span>
              <span className="text-xs text-slate-400">1995 – 2025</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Análisis de Tendencias Históricas y Factores Macroeconómicos
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Explore el crecimiento diferencial de los medios, el efecto erosivo de la inflación sobre la inversión real y la alta correlación con el despliegue de Internet y el tipo de cambio (TRM).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => selectAll(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Marcar Todos
            </button>
            <button
              onClick={() => selectAll(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
            >
              Desmarcar
            </button>
          </div>
        </div>

        {/* Media Selector Toggles */}
        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
          {ALL_MEDIA_KEYS.map(key => {
            const isSelected = selectedMedia[key];
            const meta = MEDIA_METADATA[key];
            return (
              <button
                key={key}
                onClick={() => toggleMedia(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-slate-600 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:text-slate-400'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    backgroundColor: isSelected ? meta.color : '#475569',
                    boxShadow: isSelected ? `0 0 8px ${meta.color}60` : 'none'
                  }}
                />
                <span>{meta.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Media Evolution Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Trayectoria Histórica por Medio ({currencyMode === 'USD' ? 'USD Millones' : currencyMode === 'COP_REAL_2025' ? 'COP Constantes 2025' : 'COP Millones Nominales'})
            </h3>
            <p className="text-xs text-slate-400">
              Visualice las curvas simultáneas para identificar aceleraciones, estancamientos y puntos de inflexión estructurales.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start">
            <span className="text-[11px] text-slate-400 px-2">Escala:</span>
            <button
              onClick={() => setScaleType('linear')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                scaleType === 'linear' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lineal
            </button>
            <button
              onClick={() => setScaleType('log')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                scaleType === 'log' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Escala logarítmica para comparar proporciones relativas de crecimiento"
            >
              Logarítmica
            </button>
          </div>
        </div>

        <div className="h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                scale={scaleType === 'log' ? 'log' : 'auto'}
                domain={scaleType === 'log' ? [1000, 'auto'] : [0, 'auto']}
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
                  return (
                    <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
                      <div className="font-bold text-white mb-2 pb-1 border-b border-slate-800 flex justify-between">
                        <span>Año: {label}</span>
                        <span className="text-cyan-400 font-mono">
                          Total: {formatValForDisplay(payload[0]?.payload?.totalInvNominal, label as number)}
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {payload.map((entry: any) => {
                          if (entry.value === null || entry.value === undefined) return null;
                          return (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {MEDIA_METADATA[entry.dataKey as MediumKey]?.shortLabel || entry.dataKey}:
                              </span>
                              <span className="font-mono font-semibold text-slate-100">
                                {currencyMode === 'USD' 
                                  ? formatUSD(entry.value) 
                                  : formatCurrencyCOP(entry.value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 mr-2">
                    {MEDIA_METADATA[val as MediumKey]?.shortLabel || val}
                  </span>
                )}
              />
              {ALL_MEDIA_KEYS.map(key => {
                if (!selectedMedia[key]) return null;
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={MEDIA_METADATA[key].color}
                    strokeWidth={key === 'digital' || key === 'tvNacional' ? 3 : 2}
                    dot={{ r: 2, fill: MEDIA_METADATA[key].color }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep-Dive Row: Nominal vs Real Spend + Macroeconomic Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Nominal vs Real Ad Spend */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                Inversión Nominal vs. Inversión Real (Poder Adquisitivo)
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                IPC Acumulado
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              En pesos corrientes (nominal), el mercado creció de $254 mil M en 1995 a $5,13 billones en 2025 (+1.918%). Sin embargo, en pesos constantes de 2025 (descontando inflación), el volumen real aumentó un 143%, reflejando el poder de compra real de los anunciantes.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nominalVsRealData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="nominalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}B`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-white border-b border-slate-800 pb-1">Año {label}</div>
                        <div className="text-cyan-400 font-mono">
                          Real (Base 2025): {formatCurrencyCOP(d.real)}
                        </div>
                        <div className="text-rose-400 font-mono">
                          Nominal Corriente: {formatCurrencyCOP(d.nominal)}
                        </div>
                        <div className="text-slate-400 text-[11px] pt-1">
                          Factor Deflactor: {(d.real / d.nominal).toFixed(2)}x
                        </div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="real" name="Inversión Real (Base 2025)" stroke="#06b6d4" strokeWidth={2} fill="url(#realGrad)" />
                <Area type="monotone" dataKey="nominal" name="Inversión Nominal" stroke="#f43f5e" strokeWidth={2} fill="url(#nominalGrad)" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            💡 <strong className="text-slate-200">Hallazgo clave:</strong> En los años 2021-2023, la alta inflación (hasta 13,1% en 2022) provocó que el crecimiento nominal aparente (+12,8%) fuera en realidad neutro o ligeramente negativo en términos reales de inventario publicitario.
          </div>
        </div>

        {/* Macro Correlations & Scatter Plots */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Matriz de Relación con Variables Macro
              </h3>
              
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setMacroTab('internet')}
                  className={`px-2 py-1 rounded font-medium ${macroTab === 'internet' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Digital vs Internet
                </button>
                <button
                  onClick={() => setMacroTab('trm')}
                  className={`px-2 py-1 rounded font-medium ${macroTab === 'trm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Total vs TRM
                </button>
                <button
                  onClick={() => setMacroTab('perCapita')}
                  className={`px-2 py-1 rounded font-medium ${macroTab === 'perCapita' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Per Cápita
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {macroTab === 'internet' && `Correlación Pearson r = ${corrDigitalInternet.toFixed(3)} (R² = ${(r2DigitalInternet * 100).toFixed(1)}%). El crecimiento de pauta digital sigue casi perfectamente la expansión del acceso a internet.`}
              {macroTab === 'trm' && `Correlación Pearson r = ${corrTotalTRM.toFixed(3)}. A mayor tasa de cambio COP/USD, el valor en pesos nominales del inventario global (en especial ad-tech internacional) escala proporcionalmente.`}
              {macroTab === 'perCapita' && `Gasto publicitario per cápita: de $7.030 COP ($7.70 USD) en 1995 a $96.310 COP ($23.76 USD) por habitante en 2025.`}
            </p>
          </div>

          <div className="h-72 w-full">
            {macroTab === 'internet' && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Penetración Internet"
                    unit="%"
                    domain={[20, 85]}
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Inversión Digital"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}B`}
                  />
                  <ZAxis range={[60, 60]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-cyan-400">Año {pt.year}</div>
                          <div>Penetración Internet: <span className="font-mono font-bold text-white">{pt.x}%</span></div>
                          <div>Inversión Digital: <span className="font-mono font-bold text-emerald-400">{formatCurrencyCOP(pt.rawDigital)}</span></div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Digital vs Internet" data={scatterDigitalInternet} fill="#06b6d4" />
                </ScatterChart>
              </ResponsiveContainer>
            )}

            {macroTab === 'trm' && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#3b82f6"
                    tick={{ fill: '#93c5fd', fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}B`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    tick={{ fill: '#6ee7b7', fontSize: 11 }}
                    domain={[800, 4800]}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-white">Año {label}</div>
                          <div className="text-blue-400">Inversión Total: {formatCurrencyCOP(d.totalInvNominal)}</div>
                          <div className="text-emerald-400">TRM Promedio: ${d.trm.toLocaleString('es-CO')} COP/USD</div>
                        </div>
                      );
                    }}
                  />
                  <Bar yAxisId="left" dataKey="totalInvNominal" name="Inversión Total" fill="#3b82f6" opacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="trm" name="TRM Promedio" stroke="#10b981" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {macroTab === 'perCapita' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#a855f7"
                    tick={{ fill: '#d8b4fe', fontSize: 11 }}
                    tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#38bdf8"
                    tick={{ fill: '#7dd3fc', fontSize: 11 }}
                    unit="M"
                    domain={[30, 56]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-white">Año {label}</div>
                          <div className="text-purple-400">Gasto Per Cápita: ${Math.round(d.adSpendPerCapitaCOP).toLocaleString('es-CO')} COP / hab</div>
                          <div className="text-cyan-400">Gasto USD Per Cápita: ${d.adSpendPerCapitaUSD.toFixed(1)} USD / hab</div>
                        </div>
                      );
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="adSpendPerCapitaCOP" name="Gasto Per Cápita COP" stroke="#a855f7" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            📊 <strong className="text-slate-200">Interpretación:</strong> La madurez del consumidor colombiano digitalizado ha multiplicado por más de 3x el valor publicitario que las marcas invierten por cada individuo en dólares constantes.
          </div>
        </div>
      </div>

      {/* Historical Milestones & Inflection Points */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="pb-4 border-b border-slate-800 mb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            Línea de Tiempo: Hitos y Transformaciones Estructurales de la Pauta en Colombia
          </h3>
          <p className="text-xs text-slate-400">
            Eventos gremiales, tecnológicos y de choque económico que moldearon las trayectorias de las variables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MILESTONES.map((item, idx) => (
            <div
              key={item.year}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-extrabold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                    {item.year}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    item.category === 'shock' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    item.category === 'regulatory' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {item.category === 'shock' ? 'Choque' : item.category === 'regulatory' ? 'Medición' : 'Mercado'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm mb-1 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-300 italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {item.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
