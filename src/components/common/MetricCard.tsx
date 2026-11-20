import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  badge?: string;
  tooltip?: string;
  accentColor?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  badge,
  tooltip,
  accentColor = 'indigo'
}) => {
  const colorStyles = {
    indigo: 'from-indigo-500/10 to-indigo-900/5 border-indigo-500/20 text-indigo-400',
    cyan: 'from-cyan-500/10 to-cyan-900/5 border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/10 to-emerald-900/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-amber-900/5 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-rose-900/5 border-rose-500/20 text-rose-400',
    purple: 'from-purple-500/10 to-purple-900/5 border-purple-500/20 text-purple-400'
  };

  return (
    <div className="relative rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all group overflow-hidden">
      {/* Glow accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colorStyles[accentColor]} blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {title}
            </span>
            {tooltip && (
              <span title={tooltip} className="cursor-help text-slate-500 hover:text-slate-300">
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          {badge && (
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-slate-800 text-slate-300 rounded border border-slate-700">
              {badge}
            </span>
          )}
        </div>

        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          {value}
        </div>

        <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
          {change && (
            <div className={`flex items-center font-medium ${
              change.isNeutral 
                ? 'text-slate-400' 
                : change.isPositive 
                  ? 'text-emerald-400' 
                  : 'text-rose-400'
            }`}>
              {change.isNeutral ? (
                <Minus className="w-3.5 h-3.5 mr-1" />
              ) : change.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              <span>{change.value}</span>
              {change.label && <span className="ml-1 text-slate-500">{change.label}</span>}
            </div>
          )}

          {subtitle && (
            <span className="text-slate-400 text-[11px] truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
