import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.removeItem('tupartida_my_stickers');
      localStorage.removeItem('tupartida_guest_name');
      localStorage.removeItem('tupartida_marker');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#171f33] via-[#0b1326] to-[#060e20] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                ¡Epa! Algo se trabó en la mesa
              </h2>
              <p className="text-xs text-[#c7c4d8] mt-1 leading-relaxed">
                Ocurrió un error inesperado al renderizar la partida. Puedes recargar o reiniciar el almacenamiento temporal.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-[#060e20] p-3 rounded-xl border border-white/5 text-left overflow-x-auto max-h-32">
                <code className="text-[11px] text-rose-300 font-mono block">
                  {this.state.error.message || String(this.state.error)}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recargar Partida</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1 border border-white/5 transition-all"
                title="Limpiar datos guardados si hubo conflicto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar y Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
