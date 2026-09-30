import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    success: 'bg-emerald-950/40 border-emerald-800 text-emerald-300 icon-emerald-400',
    error: 'bg-rose-950/40 border-rose-800 text-rose-300 icon-rose-400',
    warning: 'bg-amber-950/40 border-amber-800 text-amber-300 icon-amber-400',
    info: 'bg-indigo-950/40 border-indigo-800 text-indigo-300 icon-indigo-400',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="opacity-90 leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
