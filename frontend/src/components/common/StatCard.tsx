import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  color?: 'brand' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'brand'
}) => {
  const colorMap = {
    brand: 'from-brand-500/20 to-brand-600/5 text-brand-400 border-brand-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden transition-all hover:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-tight">{title}</span>
        <div className={`p-2 rounded-lg bg-gradient-to-br border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {trend && (
          <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};
