import React from 'react';
import { Sliders, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenHelp,
  isProcessing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 flex items-center justify-center shrink-0">
              <img
                src="./logo_fahsort.jpg"
                alt="Logo Fahsort"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if relative path differs
                  (e.target as HTMLImageElement).src = '/logo_fahsort.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight font-sans">
                  Fahsort
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Pemisah PDF Berwarna & Hitam Putih
              </p>
            </div>
          </div>

          {/* Action buttons (Only Pengaturan Deteksi & Panduan with identical shape & styling) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenSettings}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Sesuaikan sensitivitas warna dan ambang batas"
            >
              <Sliders className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Pengaturan Deteksi</span>
            </button>

            <button
              type="button"
              onClick={onOpenHelp}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-xs transition-all cursor-pointer"
              title="Panduan penggunaan & instruksi operasional"
            >
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Panduan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
