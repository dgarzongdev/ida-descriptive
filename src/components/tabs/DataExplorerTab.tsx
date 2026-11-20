import React, { useState, useMemo } from 'react';
import { Download, Search, Filter, ArrowUpDown, FileSpreadsheet, Check, RefreshCw } from 'lucide-react';
import { CurrencyMode, MediumKey } from '../../types';
import { PROCESSED_DATA, MEDIA_METADATA, ALL_MEDIA_KEYS } from '../../data/advertisingData';
import { generateForecastData, formatCurrencyCOP, formatUSD } from '../../utils/statistics';

interface DataExplorerTabProps {
  currencyMode: CurrencyMode;
}

export const DataExplorerTab: React.FC<DataExplorerTabProps> = ({ currencyMode }) => {
  const [includeForecast, setIncludeForecast] = useState<boolean>(true);
  const [sortField, setSortField] = useState<string>('year');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default descending (newest first)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Generate projection rows
  const forecast = useMemo(() => {
    return generateForecastData(PROCESSED_DATA, {
      modelType: 'macro_hybrid',
      scenario: 'base'
    });
  }, []);

  // Combined dataset
  const combinedRows = useMemo(() => {
    const historical = PROCESSED_DATA.map(d => ({
      year: d.year,
      isForecast: false,
      tvRegional: d.tvRegional,
      revistas: d.revistas,
      pubExterior: d.pubExterior,
      prensa: d.prensa,
      radio: d.radio,
      tvNacional: d.tvNacional,
      digital: d.digital,
      totalInv: d.totalInv,
      totalInvUSD: d.totalInvUSD,
      realTotalInv: d.realTotalInv,
      ipc: d.ipc,
      trm: d.trm,
      internetPenetration: d.internetPenetration,
      population: d.population
    }));

    if (!includeForecast) return historical;

    const projections = forecast.forecastYears.map(f => ({
      year: f.year,
      isForecast: true,
      tvRegional: f.values.tvRegional,
      revistas: f.values.revistas,
      pubExterior: f.values.pubExterior,
      prensa: f.values.prensa,
      radio: f.values.radio,
      tvNacional: f.values.tvNacional,
      digital: f.values.digital,
      totalInv: f.total,
      totalInvUSD: f.total / 4052.86,
      realTotalInv: f.total, // At 2025 base
      ipc: 4.0, // baseline assumption
      trm: 4100.0,
      internetPenetration: Math.min(92.0, 82.3 + (f.year - 2025) * 1.5),
      population: Math.round(53368000 + (f.year - 2025) * 450000)
    }));

    return [...historical, ...projections];
  }, [includeForecast, forecast]);

  // Filter & Sort
  const processedRows = useMemo(() => {
    let filtered = combinedRows.filter(r => {
      if (!searchQuery) return true;
      return r.year.toString().includes(searchQuery);
    });

    filtered.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA === null || valA === undefined) valA = -99999999;
      if (valB === null || valB === undefined) valB = -99999999;

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [combinedRows, searchQuery, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const formatTableCell = (val: number | null | undefined, trm: number) => {
    if (val === null || val === undefined) return <span className="text-slate-600">—</span>;
    if (currencyMode === 'USD') {
      return formatUSD(val / trm);
    }
    return formatCurrencyCOP(val);
  };

  // Export to CSV
  const handleDownloadCSV = () => {
    const headers = [
      'AÑO',
      'TIPO',
      'TV REG Y LOCAL',
      'REVISTAS',
      'PUB EXTERIOR',
      'PRENSA',
      'RADIO',
      'TV NACIONAL',
      'DIGITAL',
      'TOTAL_INV_COP',
      'TOTAL_INV_USD',
      'IPC_PERCENT',
      'TRM_PROMEDIO',
      'PENETRACION_INTERNET_PERCENT',
      'POBLACION_DANE'
    ];

    const rows = combinedRows.map(r => [
      r.year,
      r.isForecast ? 'PRONOSTICO' : 'HISTORICO',
      r.tvRegional ?? '',
      r.revistas ?? '',
      r.pubExterior ?? '',
      r.prensa ?? '',
      r.radio ?? '',
      r.tvNacional ?? '',
      r.digital ?? '',
      r.totalInv.toFixed(1),
      r.totalInvUSD.toFixed(1),
      r.ipc,
      r.trm,
      r.internetPenetration,
      r.population
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inversion_publicitaria_colombia_1995_2030.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Controller Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            Explorador de Registros y Descarga de Datos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Base tabular completa con opciones de ordenamiento, búsqueda, inclusión de pronósticos a 2030 y exportación en CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Include Projections Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={includeForecast}
              onChange={(e) => setIncludeForecast(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500 w-4 h-4"
            />
            <span>Incluir Pronósticos (2026–2030)</span>
          </label>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar año..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36"
            />
          </div>

          {/* Download CSV Button */}
          <button
            onClick={handleDownloadCSV}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                ¡Descargado!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <th
                  onClick={() => handleSort('year')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Año
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Estado</th>
                <th
                  onClick={() => handleSort('totalInv')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors text-cyan-300 font-bold"
                >
                  <div className="flex items-center justify-end gap-1">
                    Total Inversión
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('digital')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Digital
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tvNacional')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    TV Nacional
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('radio')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Radio
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pubExterior')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Pub Exterior
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('prensa')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Prensa
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tvRegional')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    TV Regional
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revistas')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Revistas
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">IPC (%)</th>
                <th className="py-3 px-3 text-right">TRM (COP)</th>
                <th className="py-3 px-3 text-right">Internet (%)</th>
                <th className="py-3 px-3 text-right">Población</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {processedRows.map(row => (
                <tr
                  key={row.year}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    row.isForecast ? 'bg-emerald-950/10 text-emerald-200' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-white font-sans">{row.year}</td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        row.isForecast
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {row.isForecast ? 'Pronóstico' : 'Histórico'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-300">
                    {formatTableCell(row.totalInv, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-400">
                    {formatTableCell(row.digital, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-300">
                    {formatTableCell(row.tvNacional, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300">
                    {formatTableCell(row.radio, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-300">
                    {formatTableCell(row.pubExterior, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-purple-300">
                    {formatTableCell(row.prensa, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-pink-300">
                    {formatTableCell(row.tvRegional, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-300">
                    {formatTableCell(row.revistas, row.trm)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-sans">
                    {row.ipc}%
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-sans">
                    ${row.trm.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-sans">
                    {row.internetPenetration}%
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-sans">
                    {row.population.toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {processedRows.length} registros</span>
          <span>Valores monetarios expresados según la unidad activa en la barra superior</span>
        </div>
      </div>

    </div>
  );
};
