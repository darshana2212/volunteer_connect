import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  color?: 'emerald' | 'indigo' | 'amber';
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showPercentage = true,
  color = 'emerald',
  height = 'md',
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    emerald: 'bg-emerald-500 shadow-emerald-500/50',
    indigo: 'bg-indigo-500 shadow-indigo-500/50',
    amber: 'bg-amber-500 shadow-amber-500/50',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="font-medium text-slate-400">
          ${current.toLocaleString()} / ${total.toLocaleString()}
        </span>
        {showPercentage && (
          <span className="font-bold text-slate-300">{percentage}%</span>
        )}
      </div>
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
