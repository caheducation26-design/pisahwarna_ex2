import React from 'react';
import { Loader2, XCircle, Activity } from 'lucide-react';
import { ScanProgress } from '../types';

interface ScanningProgressProps {
  progress: ScanProgress;
  onCancel: () => void;
}

export const ScanningProgress: React.FC<ScanningProgressProps> = ({ progress, onCancel }) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base">
                Memindai Spektrum Warna Dokumen...
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {progress.percentage}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{progress.statusText}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <XCircle className="w-4 h-4 text-rose-600" />
          Batalkan Pemindaian
        </button>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-200 ease-out shadow-xs"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          Sedang memeriksa: Halaman {progress.currentPage} dari {progress.totalPages}
        </span>
        <span>
          Tersisa: {Math.max(0, progress.totalPages - progress.currentPage)} Halaman
        </span>
      </div>
    </div>
  );
};
