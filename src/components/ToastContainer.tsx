import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-[#238774] shrink-0" />;
        let borderColor = 'border-[#B8ECE1]';
        let bgGlow = 'shadow-[#48C9B0]/15';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-[#D93D48] shrink-0" />;
          borderColor = 'border-[#FCD2D6]';
          bgGlow = 'shadow-[#FF5B65]/15';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-[#B87B00] shrink-0" />;
          borderColor = 'border-[#FDE199]';
          bgGlow = 'shadow-[#FFC83B]/15';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#FF5B65] shrink-0" />;
          borderColor = 'border-[#FDE2E4]';
          bgGlow = 'shadow-[#FF5B65]/15';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded-2xl p-4 shadow-xl ${bgGlow} border ${borderColor} flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 fade-in duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-[#3D271D] font-['Nunito',sans-serif]">{toast.title}</p>
                {toast.code && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#FFF0F1] text-[#FF5B65] font-black border border-[#FCD2D6]">
                    {toast.code}
                  </span>
                )}
              </div>
              {toast.message && (
                <p className="text-xs text-[#8C7065] mt-1 leading-relaxed font-medium">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-[#8C7065] hover:text-[#3D271D] hover:bg-[#FFF0F1] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
