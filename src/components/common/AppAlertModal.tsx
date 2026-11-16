import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';

export type AlertType = 'warning' | 'error' | 'success' | 'info' | 'loading';

export interface AppAlertModalProps {
  isOpen: boolean;
  type?: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

export const AppAlertModal: React.FC<AppAlertModalProps> = ({
  isOpen,
  type = 'warning',
  title,
  message,
  confirmText = '¡Entendido!',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (type === 'loading') return; // Cannot close while loading
    if (onClose) onClose();
    else if (onConfirm) onConfirm();
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'border-rose-500/60 shadow-[0_0_40px_rgba(244,63,94,0.3)]';
      case 'success':
        return 'border-emerald-400/60 shadow-[0_0_40px_rgba(52,211,153,0.3)]';
      case 'info':
      case 'loading':
        return 'border-indigo-400/60 shadow-[0_0_40px_rgba(129,140,248,0.3)]';
      case 'warning':
      default:
        return 'border-amber-400/60 shadow-[0_0_40px_rgba(251,191,36,0.3)]';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-8 h-8 text-rose-400 animate-pulse" />;
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />;
      case 'info':
        return <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />;
      case 'loading':
        return <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-sm bg-gradient-to-b from-[#171f33] via-[#0b1326] to-[#060e20] border-2 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden text-center ${getBorderColor()}`}
      >
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Close button if not loading */}
        {type !== 'loading' && onClose && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Hero Icon */}
        <div className="flex justify-center pt-2">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            {getIcon()}
          </div>
        </div>

        {/* Title and Message */}
        <div className="flex flex-col gap-1.5 px-2">
          <h3 className="text-lg font-black text-white font-['Outfit'] tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-[#c7c4d8] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Confirm Action Button */}
        {type !== 'loading' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleClose}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md ${
                type === 'error'
                  ? 'bg-rose-500 hover:bg-rose-400 text-white'
                  : type === 'success'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black'
              }`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
