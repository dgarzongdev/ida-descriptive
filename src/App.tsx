import React, { useState } from 'react';
import { CurrencyMode } from './types';
import { Header } from './components/Header';
import { DescriptiveAnalysisTab } from './components/tabs/DescriptiveAnalysisTab';
import { TrendAnalysisTab } from './components/tabs/TrendAnalysisTab';
import { ForecastingTab } from './components/tabs/ForecastingTab';
import { DataExplorerTab } from './components/tabs/DataExplorerTab';
import { Sparkles, BarChart3, TrendingUp, Database, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'descriptive' | 'trends' | 'forecasting' | 'data'>('descriptive');
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('COP_NOMINAL');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currencyMode={currencyMode}
        setCurrencyMode={setCurrencyMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'descriptive' && (
          <DescriptiveAnalysisTab currencyMode={currencyMode} />
        )}

        {activeTab === 'trends' && (
          <TrendAnalysisTab currencyMode={currencyMode} />
        )}

        {activeTab === 'forecasting' && (
          <ForecastingTab currencyMode={currencyMode} />
        )}

        {activeTab === 'data' && (
          <DataExplorerTab currencyMode={currencyMode} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-medium">
              Observatorio de la Industria Publicitaria en Colombia
            </span>
            <span className="text-slate-600">|</span>
            <span>Fuentes: Registros de Medición Gremios (1995–2025), DANE, Banco de la República</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>Modelos Econométricos 2030</span>
            <span className="text-slate-700">•</span>
            <span>Escenarios Base, Optimista y Pesimista</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
