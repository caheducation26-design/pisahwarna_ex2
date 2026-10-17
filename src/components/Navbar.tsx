import React from 'react';
import { Printer, Sliders, HelpCircle, ShieldCheck, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onLoadSample: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenHelp,
  onLoadSample,
  isProcessing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Printer className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight font-sans">
                  ColorBW <span className="text-blue-600">Print</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Pemisah PDF Berwarna & Hitam Putih Khusus Usaha Fotokopi
              </p>
            </div>
          </div>

          {/* Privacy & Feature Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Lokal di Browser
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              Analisis Piksel Nyata (Tanpa AI)
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLoadSample}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Muat dokumen uji coba fotokopi dengan halaman berwarna dan monokrom"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse hidden sm:inline-block"></span>
              Coba Dokumen Sampel
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Sesuaikan sensitivitas warna dan ambang batas"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Pengaturan Deteksi</span>
            </button>

            <button
              type="button"
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              title="Panduan penggunaan & instruksi mode offline"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Panduan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
