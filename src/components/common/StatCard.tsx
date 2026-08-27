import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'cyan' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  trendPositive,
  color = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-200',
      gradient: 'from-blue-600 to-blue-700'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-200',
      gradient: 'from-emerald-600 to-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-200',
      gradient: 'from-amber-600 to-amber-700'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-200',
      gradient: 'from-indigo-600 to-indigo-700'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-200',
      gradient: 'from-rose-600 to-rose-700'
    },
    cyan: {
      bg: 'bg-cyan-50 text-cyan-600',
      border: 'hover:border-cyan-200',
      gradient: 'from-cyan-600 to-cyan-700'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-200',
      gradient: 'from-purple-600 to-purple-700'
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 ' + colorMap.border : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMap.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {trend}
            </span>
          )}
          {subtext && <span className="text-slate-500 font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
