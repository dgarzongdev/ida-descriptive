import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles, 
  Award,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { CurrencyMode, MediumKey } from '../../types';
import { PROCESSED_DATA, MEDIA_METADATA, ALL_MEDIA_KEYS } from '../../data/advertisingData';
import { formatCurrencyCOP, formatUSD, formatPercent, calculateSummaryStats, calculateCAGR } from '../../utils/statistics';
import { MetricCard } from '../common/MetricCard';

interface DescriptiveAnalysisTabProps {
  currencyMode: CurrencyMode;
}

export const DescriptiveAnalysisTab: React.FC<DescriptiveAnalysisTabProps> = ({ currencyMode }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const currentRecord = PROCESSED_DATA.find(d => d.year === selectedYear) || PROCESSED_DATA[PROCESSED_DATA.length - 1];
  const prevRecord = PROCESSED_DATA.find(d => d.year === selectedYear - 1);
  const record2025 = PROCESSED_DATA[PROCESSED_DATA.length - 1];

  // Helper to format values based on currencyMode
  const formatValue = (valCOP: number | null) => {
    if (valCOP === null || valCOP === undefined) return 'N/D';
    if (currencyMode === 'USD') {
      const usd = valCOP / currentRecord.trm;
      return formatUSD(usd);
    }
    if (currencyMode === 'COP_REAL_2025') {
      // Find real multiplier for current year
      const realVal = currentRecord.realValues;
      // or compute directly
      return formatCurrencyCOP(valCOP * (currentRecord.realTotalInv / currentRecord.totalInv));
    }
    return formatCurrencyCOP(valCOP);
  };

  const getDisplayTotal = (record: typeof currentRecord) => {
    if (currencyMode === 'USD') return formatUSD(record.totalInvUSD);
    if (currencyMode === 'COP_REAL_2025') return formatCurrencyCOP(record.realTotalInv);
    return formatCurrencyCOP(record.totalInv);
  };

  // Find leading medium in selected year
  let topMediumKey: MediumKey = 'tvNacional';
  let topMediumVal = 0;
  ALL_MEDIA_KEYS.forEach(k => {
    const val = currentRecord[k];
    if (val !== null && val > topMediumVal) {
      topMediumVal = val;
      topMediumKey = k;
    }
  });

  // Prepare Pie / Donut Chart Data
  const pieData = ALL_MEDIA_KEYS
    .map(key => {
      const val = currentRecord[key];
      if (val === null || val <= 0) return null;
      let displayNum = val;
      if (currencyMode === 'USD') displayNum = val / currentRecord.trm;
      else if (currencyMode === 'COP_REAL_2025') displayNum = currentRecord.realValues[key] ?? val;

      return {
        key,
        name: MEDIA_METADATA[key].shortLabel,
        value: displayNum,
        rawCOP: val,
        share: currentRecord.shares[key],
        color: MEDIA_METADATA[key].color
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => b.value - a.value);

  // Stacked Area Data (100% distribution across years)
  const shareEvolutionData = PROCESSED_DATA.map(d => {
    const item: any = { year: d.year };
    ALL_MEDIA_KEYS.forEach(k => {
      item[k] = Math.round((d.shares[k] || 0) * 10) / 10;
    });
    return item;
  });

  // Calculate descriptive summary table for all media (1995-2025)
  const mediaSummaryTable = ALL_MEDIA_KEYS.map(key => {
    const meta = MEDIA_METADATA[key];
    const validRecords = PROCESSED_DATA.filter(d => d[key] !== null && d[key] !== undefined && d[key]! > 0);
    const values = validRecords.map(d => d[key]!);
    const stats = calculateSummaryStats(values);

    // Peak year and peak value
    let peakYear = validRecords[0]?.year || 1995;
    let peakValue = 0;
    validRecords.forEach(d => {
      if (d[key]! > peakValue) {
        peakValue = d[key]!;
        peakYear = d.year;
      }
    });

    const firstRecord = validRecords[0];
    const initialYear = firstRecord ? firstRecord.year : 1995;
    const initialVal = firstRecord ? firstRecord[key]! : 0;
    const val2025 = record2025[key] || 0;
    const share2025 = record2025.shares[key] || 0;

    // 10-year CAGR (2015-2025)
    const rec2015 = PROCESSED_DATA.find(d => d.year === 2015);
    const val2015 = rec2015 && rec2015[key] ? rec2015[key]! : null;
    const cagr10 = val2015 ? calculateCAGR(val2015, val2025, 10) : null;

    // 5-year CAGR (2020-2025)
    const rec2020 = PROCESSED_DATA.find(d => d.year === 2020);
    const val2020 = rec2020 && rec2020[key] ? rec2020[key]! : null;
    const cagr5 = val2020 ? calculateCAGR(val2020, val2025, 5) : null;

    return {
      meta,
      key,
      initialYear,
      initialVal,
      val2025,
      peakYear,
      peakValue,
      share2025,
      mean: stats.mean,
      stdDev: stats.stdDev,
      cagr10,
      cagr5
    };
  }).sort((a, b) => b.val2025 - a.val2025);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Year Controller */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Visualización Histórica Descriptiva
              </span>
              <span className="text-xs text-slate-400">
                Base: 31 Años de Inversión (1995 - 2025)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Estructura y Composición del Mercado Publicitario en Colombia
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Seleccione cualquier año para inspeccionar la cuota de mercado por medio publicitario, variaciones interanuales y métricas macroeconómicas contextuales.
            </p>
          </div>

          {/* Interactive Year Selector */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Año Analizado:
              </span>
              <span className="text-base font-extrabold text-cyan-400 font-mono">
                {selectedYear}
              </span>
            </div>
            <input
              type="range"
              min="1995"
              max="2025"
              step="1"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1995</span>
              <span>2005</span>
              <span>2015</span>
              <span className="text-cyan-400 font-bold">2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={`Inversión Total (${selectedYear})`}
          value={getDisplayTotal(currentRecord)}
          subtitle={
            currencyMode === 'USD' 
              ? `A TRM promedio: $${currentRecord.trm.toLocaleString('es-CO')} COP` 
              : `Total de medios analizados`
          }
          change={currentRecord.yoyGrowthTotal !== null ? {
            value: formatPercent(Math.abs(currentRecord.yoyGrowthTotal), 1),
            isPositive: currentRecord.yoyGrowthTotal >= 0,
            label: `vs ${selectedYear - 1}`
          } : undefined}
          accentColor="indigo"
          icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
        />

        <MetricCard
          title={`Cuota Digital (${selectedYear})`}
          value={formatPercent(currentRecord.shares.digital || 0, 1)}
          subtitle={
            currentRecord.digital 
              ? `${formatValue(currentRecord.digital)} invertidos` 
              : 'Digital aún no reportado'
          }
          change={currentRecord.shares.digital > 0 && prevRecord && prevRecord.shares.digital ? {
            value: `${(currentRecord.shares.digital - prevRecord.shares.digital).toFixed(1)} pp`,
            isPositive: currentRecord.shares.digital >= prevRecord.shares.digital,
            label: 'cambio cuota'
          } : undefined}
          accentColor="cyan"
          icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
        />

        <MetricCard
          title={`Medio Hegemónico (${selectedYear})`}
          value={MEDIA_METADATA[topMediumKey].shortLabel}
          subtitle={`Cuota: ${formatPercent(currentRecord.shares[topMediumKey], 1)} (${formatValue(topMediumVal)})`}
          badge={`Top #1`}
          accentColor="emerald"
          icon={<Award className="w-5 h-5 text-emerald-400" />}
        />

        <MetricCard
          title={`Gasto Per Cápita (${selectedYear})`}
          value={
            currencyMode === 'USD' 
              ? `$${currentRecord.adSpendPerCapitaUSD.toFixed(1)} USD / hab`
              : `$${Math.round(currentRecord.adSpendPerCapitaCOP).toLocaleString('es-CO')} COP / hab`
          }
          subtitle={`Población DANE: ${(currentRecord.population / 1_000_000).toFixed(1)}M hab`}
          change={{
            value: `IPC: ${currentRecord.ipc}%`,
            isPositive: true,
            isNeutral: true,
            label: `inflación`
          }}
          accentColor="purple"
          icon={<Users className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Visual Section: Share of Voice Over Time + Composition of Selected Year */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 100% Stacked Area Chart (30 Years Evolution) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Evolución de la Cuota de Mercado (%) (1995 – 2025)
              </h3>
              <span className="text-xs text-slate-400 font-mono">100% Stacked</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Observe la transición estructural: desde el duopolio TV y Prensa en los 90s/2000s hasta el dominio de Digital (+59% en 2025).
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shareEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {ALL_MEDIA_KEYS.map(key => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={MEDIA_METADATA[key].color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={MEDIA_METADATA[key].color} stopOpacity={0.5} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
                        <div className="font-bold text-white mb-1.5 pb-1 border-b border-slate-800 flex justify-between">
                          <span>Año: {label}</span>
                          <span className="text-cyan-400">Total: 100%</span>
                        </div>
                        <div className="space-y-1">
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {MEDIA_METADATA[entry.dataKey as MediumKey]?.shortLabel || entry.dataKey}:
                              </span>
                              <span className="font-mono font-semibold text-slate-200">
                                {entry.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                {ALL_MEDIA_KEYS.map(key => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={MEDIA_METADATA[key].color}
                    fill={`url(#grad-${key})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800 text-[11px]">
            {ALL_MEDIA_KEYS.map(k => (
              <div key={k} className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MEDIA_METADATA[k].color }} />
                <span className="text-slate-300">{MEDIA_METADATA[k].shortLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart (Breakdown for selected year) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                Distribución en {selectedYear}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {getDisplayTotal(currentRecord)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Desglose porcentual y valor monetario en el año seleccionado.
            </p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${formatValue(item.payload.rawCOP)} (${item.payload.share.toFixed(1)}%)`,
                    item.payload.name
                  ]}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Total {selectedYear}</span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5">{getDisplayTotal(currentRecord)}</span>
            </div>
          </div>

          {/* List of items in selected year */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 max-h-44 overflow-y-auto pr-1">
            {pieData.map(item => (
              <div key={item.key} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">{formatValue(item.rawCOP)}</span>
                  <span className="font-bold text-white w-12 text-right">{item.share.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Detail Breakdown Table for Selected Year */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Detalle Comparativo por Medio en {selectedYear}
            </h3>
            <p className="text-xs text-slate-400">
              Inversión nominal, equivalente en moneda seleccionada y variación interanual respecto a {selectedYear - 1}.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Mostrando {pieData.length} medios activos en {selectedYear}
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-3">Medio Publicitario</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">Inversión Reportada</th>
                <th className="py-3 px-3 text-right">Cuota de Mercado</th>
                <th className="py-3 px-3 text-right">Crecimiento YoY</th>
                <th className="py-3 px-3 text-right">Aporte al Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ALL_MEDIA_KEYS.map(key => {
                const meta = MEDIA_METADATA[key];
                const rawVal = currentRecord[key];
                const share = currentRecord.shares[key];
                const yoy = currentRecord.yoyGrowthByMedium[key];

                if (rawVal === null || rawVal === undefined) {
                  return (
                    <tr key={key} className="text-slate-500 opacity-60">
                      <td className="py-2.5 px-3 flex items-center gap-2 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        {meta.label}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[10px]">{meta.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono italic">No medido en {selectedYear}</td>
                      <td className="py-2.5 px-3 text-right font-mono">0.0%</td>
                      <td className="py-2.5 px-3 text-right font-mono">—</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">—</td>
                    </tr>
                  );
                }

                return (
                  <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      {meta.label}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        meta.category === 'digital' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        meta.category === 'broadcast' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        meta.category === 'ooh' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {meta.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                      {formatValue(rawVal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-cyan-300">
                      {share.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {yoy !== null ? (
                        <span className={`font-semibold ${yoy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {yoy >= 0 ? '+' : ''}{yoy.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Primer año</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="w-24 ml-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, share)}%`, backgroundColor: meta.color }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multiannual Statistical Summary Table (1995-2025) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Tabla Resumen Estadístico Multianual (1995 – 2025)
          </h3>
          <p className="text-xs text-slate-400">
            Comportamiento a lo largo de 31 años de registro histórico: valor pico, promedio histórico, tasas compuestas (CAGR 5 y 10 años) y participación actual 2025.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-3">Medio</th>
                <th className="py-3 px-3">Inicio Medición</th>
                <th className="py-3 px-3 text-right">Cierre 2025</th>
                <th className="py-3 px-3 text-right">Cuota 2025</th>
                <th className="py-3 px-3 text-right">Pico Histórico (Año / Monto)</th>
                <th className="py-3 px-3 text-right">Promedio Anual</th>
                <th className="py-3 px-3 text-right">CAGR 10A (2015-2025)</th>
                <th className="py-3 px-3 text-right">CAGR 5A (2020-2025)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {mediaSummaryTable.map(item => (
                <tr key={item.key} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.meta.color }} />
                    {item.meta.label}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-400">
                    {item.initialYear} ({formatValue(item.initialVal)})
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white">
                    {formatValue(item.val2025)}
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-300 font-bold">
                    {item.share2025.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300">
                    <span className="text-slate-400 mr-1.5 font-sans text-[11px]">{item.peakYear}:</span>
                    {formatValue(item.peakValue)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatValue(item.mean)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.cagr10 !== null ? (
                      <span className={item.cagr10 >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {formatPercent(item.cagr10 * 100, 1, true)}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-sans">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.cagr5 !== null ? (
                      <span className={item.cagr5 >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {formatPercent(item.cagr5 * 100, 1, true)}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-sans">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
