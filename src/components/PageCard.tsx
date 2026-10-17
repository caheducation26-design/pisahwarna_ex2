import React from 'react';
import { Eye, Palette, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { ManualOverride, PageAnalysisResult, PageClassification } from '../types';

interface PageCardProps {
  page: PageAnalysisResult;
  isSelected: boolean;
  onToggleSelect: (pageNumber: number) => void;
  onSetOverride: (pageNumber: number, override: ManualOverride) => void;
  onPreview: (page: PageAnalysisResult) => void;
}

export const PageCard: React.FC<PageCardProps> = ({
  page,
  isSelected,
  onToggleSelect,
  onSetOverride,
  onPreview,
}) => {
  const isColor = page.classification === 'color';
  const isBw = page.classification === 'bw';
  const isReview = page.classification === 'review';

  const hasManualOverride = page.manualOverride !== 'auto';

  // Badge styles
  const badgeConfig = {
    color: {
      bg: 'bg-blue-600',
      text: 'text-white',
      label: 'BERWARNA',
      borderColor: 'border-blue-400',
    },
    bw: {
      bg: 'bg-slate-900',
      text: 'text-white',
      label: 'HITAM PUTIH',
      borderColor: 'border-slate-800',
    },
    review: {
      bg: 'bg-amber-500',
      text: 'text-slate-950 font-black',
      label: 'PERLU DIPERIKSA',
      borderColor: 'border-amber-400',
    },
  }[page.classification];

  return (
    <div
      className={`group relative bg-white rounded-xl border-2 transition-all flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : hasManualOverride
          ? 'border-indigo-300'
          : isColor
          ? 'border-blue-200 hover:border-blue-300'
          : isReview
          ? 'border-amber-300 hover:border-amber-400'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header Bar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(page.pageNumber)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
          />
          <span className="font-extrabold text-xs text-slate-800 font-mono">
            Hal. {page.pageNumber}
          </span>
        </label>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${badgeConfig.bg} ${badgeConfig.text}`}
        >
          {badgeConfig.label}
        </span>
      </div>

      {/* Thumbnail Area */}
      <div
        className="relative bg-slate-100 aspect-[1/1.38] overflow-hidden cursor-pointer flex items-center justify-center p-2"
        onClick={() => onPreview(page)}
      >
        <img
          src={page.thumbnailUrl}
          alt={`Halaman ${page.pageNumber}`}
          className="max-h-full max-w-full object-contain shadow-xs rounded bg-white transition-transform group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Hover inspect overlay */}
        <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-bold shadow-md">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Perbesar
          </span>
        </div>

        {/* Manual override badge indicator */}
        {hasManualOverride && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold shadow-xs">
            Koreksi Manual
          </div>
        )}
      </div>

      {/* Color stats details */}
      <div className="px-3 py-2 bg-white text-[11px] text-slate-600 border-t border-slate-100 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Proporsi Warna:</span>
          <span className="font-mono font-bold text-slate-800">{page.colorRatio}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Piksel / Delta Max:</span>
          <span className="font-mono text-slate-700">
            {page.colorPixelCount} px (Δ {page.maxDelta})
          </span>
        </div>
      </div>

      {/* Manual Category Override Controls */}
      <div className="p-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1 justify-between">
        <button
          type="button"
          onClick={() => onSetOverride(page.pageNumber, 'force_color')}
          className={`flex-1 py-1 px-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
            page.classification === 'color' && page.manualOverride === 'force_color'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
          }`}
          title="Paksa kategori menjadi Berwarna"
        >
          Warna
        </button>

        <button
          type="button"
          onClick={() => onSetOverride(page.pageNumber, 'force_bw')}
          className={`flex-1 py-1 px-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
            page.classification === 'bw' && page.manualOverride === 'force_bw'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
          title="Paksa kategori menjadi Hitam Putih"
        >
          B/W
        </button>

        {hasManualOverride && (
          <button
            type="button"
            onClick={() => onSetOverride(page.pageNumber, 'auto')}
            className="p-1 rounded bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
            title="Kembalikan ke deteksi otomatis"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
