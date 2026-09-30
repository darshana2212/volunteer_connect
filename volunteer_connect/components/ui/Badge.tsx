import React from 'react';

interface BadgeProps {
  variant?: 'pending' | 'approved' | 'selected' | 'rejected' | 'active' | 'completed' | 'cancelled' | 'default' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    selected: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    active: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    default: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[variant] || styles.default} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {children}
    </span>
  );
};
