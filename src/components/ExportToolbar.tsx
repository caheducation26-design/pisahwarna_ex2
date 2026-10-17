import React from 'react';
import { Download, Archive, RotateCcw, Loader2, Palette, FileText } from 'lucide-react';

interface ExportToolbarProps {
  colorCount: number;
  bwCount: number;
  isExporting: boolean;
  exportStage: string | null;
  onExportColor: () => void;
  onExportBw: () => void;
  onExportBoth: () => void;
  onRescan: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  colorCount,
  bwCount,
  isExporting,
  exportStage,
  onExportColor,
  onExportBw,
  onExportBoth,
  onRescan,
}) => {
  const hasColor = colorCount > 0;
  const hasBw = bwCount > 0;
  const hasAny = hasColor || hasBw;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status indicator / info */}
        <div>
          <h4 className="font-extrabold text-slate-900 text-base">Ekspor PDF Hasil Pemisahan</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen diekstrak langsung dari file asli. Format vektor, font, ukuran, dan orientasi
            tetap terjaga 100%.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Download Color Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={onExportColor}
              disabled={!hasColor || isExporting}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hasColor && !isExporting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Unduh Berwarna ({colorCount})</span>
            </button>
            {!hasColor && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg text-center">
                Tidak ada halaman yang terdeteksi berwarna dalam dokumen ini.
              </div>
            )}
          </div>

          {/* Download B/W Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={onExportBw}
              disabled={!hasBw || isExporting}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hasBw && !isExporting
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Unduh Hitam Putih ({bwCount})</span>
            </button>
            {!hasBw && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg text-center">
                Tidak ada halaman yang terdeteksi hitam putih dalam dokumen ini.
              </div>
            )}
          </div>

          {/* Download Both ZIP Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={onExportBoth}
              disabled={!hasAny || isExporting}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hasAny && !isExporting
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title="Unduh kedua file sekaligus dalam satu berkas arsip ZIP"
            >
              <Archive className="w-4 h-4" />
              <span>Unduh Kedua File (ZIP)</span>
            </button>
          </div>

          {/* Rescan Button */}
          <button
            type="button"
            onClick={onRescan}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Pindai ulang seluruh halaman dokumen"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Pindai Ulang</span>
          </button>
        </div>
      </div>

      {/* Exporting progress banner */}
      {isExporting && (
        <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs sm:text-sm text-blue-800 animate-fadeIn">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span className="font-medium">
            {exportStage || 'Menyusun dan mengekstrak halaman PDF asli...'}
          </span>
        </div>
      )}
    </div>
  );
};
