import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Database, DollarSign, Calendar, Layers } from 'lucide-react';
import { CurrencyMode } from '../types';

interface HeaderProps {
  activeTab: 'descriptive' | 'trends' | 'forecasting' | 'data';
  setActiveTab: (tab: 'descriptive' | 'trends' | 'forecasting' | 'data') => void;
  currencyMode: CurrencyMode;
  setCurrencyMode: (mode: CurrencyMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currencyMode,
  setCurrencyMode
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Observatorio Publicitario Colombia
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  1995 – 2030
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Análisis descriptivo, tendencias macroeconómicas y proyecciones econométricas por medio
              </p>
            </div>
          </div>

          {/* Unit / Currency Selector */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start md:self-auto shadow-inner">
            <span className="text-xs text-slate-400 px-2.5 font-medium flex items-center gap-1.5 hidden sm:flex">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Unidad:
            </span>

            <button
              onClick={() => setCurrencyMode('COP_NOMINAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currencyMode === 'COP_NOMINAL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Pesos colombianos nominales corrientes de cada año"
            >
              COP Nominal
            </button>

            <button
              onClick={() => setCurrencyMode('COP_REAL_2025')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currencyMode === 'COP_REAL_2025'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Pesos constantes ajustados por IPC acumulado (Poder adquisitivo Base 2025)"
            >
              COP Real (Base 2025)
            </button>

            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currencyMode === 'USD'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Dólares convertidos a la TRM promedio anual"
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('descriptive')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'descriptive'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            1. Análisis Descriptivo
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'trends'
                ? 'border-indigo-400 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            2. Análisis de Tendencias & Macro
          </button>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap relative ${
              activeTab === 'forecasting'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            3. Pronósticos & Proyecciones 2030
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Proyección
            </span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-purple-400 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            4. Explorador & Descarga
          </button>
        </div>
      </div>
    </header>
  );
};
