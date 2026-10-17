import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Palette, FileText, RotateCcw } from 'lucide-react';
import { ManualOverride, PageAnalysisResult } from '../types';

interface PagePreviewModalProps {
  page: PageAnalysisResult | null;
  totalPages: number;
  onClose: () => void;
  onSetOverride: (pageNumber: number, override: ManualOverride) => void;
  onNavigate: (step: number) => void;
}

export const PagePreviewModal: React.FC<PagePreviewModalProps> = ({
  page,
  totalPages,
  onClose,
  onSetOverride,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  if (!page) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base bg-slate-800 px-2.5 py-1 rounded-lg">
              Halaman {page.pageNumber} / {totalPages}
            </span>

            <span
              className={`px-2.5 py-1 rounded-md text-xs font-black tracking-wider ${
                page.classification === 'color'
                  ? 'bg-blue-600 text-white'
                  : page.classification === 'bw'
                  ? 'bg-slate-700 text-white'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {page.classification === 'color'
                ? 'BERWARNA'
                : page.classification === 'bw'
                ? 'HITAM PUTIH'
                : 'PERLU DIPERIKSA'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              disabled={page.pageNumber <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Halaman Sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              disabled={page.pageNumber >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Halaman Berikutnya (Panah Kanan)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white transition-colors cursor-pointer ml-1"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Image Viewer */}
        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center min-h-[300px]">
          <img
            src={page.thumbnailUrl}
            alt={`Pratinjau Halaman ${page.pageNumber}`}
            className="max-h-[62vh] max-w-full object-contain shadow-xl rounded-lg bg-white border border-slate-200"
          />
        </div>

        {/* Modal Footer with Diagnostics & Override Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Analisis Piksel:</span>
              <span className="font-mono text-slate-900 font-bold">{page.colorRatio}% warna</span>
              <span>•</span>
              <span className="font-mono text-slate-700">{page.colorPixelCount} piksel berwarna</span>
              <span>•</span>
              <span className="font-mono text-slate-700">Maks Δ RGB: {page.maxDelta}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deteksi otomatis:{' '}
              <strong className="text-slate-600 uppercase font-sans">
                {page.detectedClassification}
              </strong>
              {page.manualOverride !== 'auto' && (
                <span className="ml-1 text-indigo-600 font-bold">
                  (Disesuaikan manual oleh operator)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onSetOverride(page.pageNumber, 'force_color')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page.classification === 'color'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Tetapkan Berwarna
            </button>

            <button
              type="button"
              onClick={() => onSetOverride(page.pageNumber, 'force_bw')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page.classification === 'bw'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Tetapkan Hitam Putih
            </button>

            {page.manualOverride !== 'auto' && (
              <button
                type="button"
                onClick={() => onSetOverride(page.pageNumber, 'auto')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Kembalikan klasifikasi ke deteksi otomatis"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
