import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'purple';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendType = 'up',
  color = 'emerald',
}) => {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20 icon-bg-emerald-500/20',
    indigo: 'from-indigo-500/10 to-blue-500/5 text-indigo-400 border-indigo-500/20 icon-bg-indigo-500/20',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20 icon-bg-amber-500/20',
    rose: 'from-rose-500/10 to-pink-500/5 text-rose-400 border-rose-500/20 icon-bg-rose-500/20',
    cyan: 'from-cyan-500/10 to-sky-500/5 text-cyan-400 border-cyan-500/20 icon-bg-cyan-500/20',
    purple: 'from-purple-500/10 to-violet-500/5 text-purple-400 border-purple-500/20 icon-bg-purple-500/20',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all hover:scale-[1.01] ${colorMap[color] || colorMap.emerald}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</h3>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
          {trend && (
            <div className="mt-3 flex items-center text-xs gap-1 font-medium">
              <span className={trendType === 'up' ? 'text-emerald-400' : trendType === 'down' ? 'text-rose-400' : 'text-slate-400'}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
};
