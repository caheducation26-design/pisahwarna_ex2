import React, { useState, useMemo } from 'react';
import {
  Filter,
  CheckSquare,
  Square,
  Layers,
  Palette,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ManualOverride, PageAnalysisResult, PageClassification } from '../types';
import { PageCard } from './PageCard';

interface PageGridProps {
  pages: PageAnalysisResult[];
  onSetOverride: (pageNumber: number, override: ManualOverride) => void;
  onBatchOverride: (pageNumbers: number[], override: ManualOverride) => void;
  onPreviewPage: (page: PageAnalysisResult) => void;
}

type FilterTab = 'all' | 'color' | 'bw' | 'review';

export const PageGrid: React.FC<PageGridProps> = ({
  pages,
  onSetOverride,
  onBatchOverride,
  onPreviewPage,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // Filtered pages based on active tab
  const filteredPages = useMemo(() => {
    switch (activeTab) {
      case 'color':
        return pages.filter((p) => p.classification === 'color');
      case 'bw':
        return pages.filter((p) => p.classification === 'bw');
      case 'review':
        return pages.filter((p) => p.classification === 'review');
      default:
        return pages;
    }
  }, [pages, activeTab]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: pages.length,
      color: pages.filter((p) => p.classification === 'color').length,
      bw: pages.filter((p) => p.classification === 'bw').length,
      review: pages.filter((p) => p.classification === 'review').length,
    };
  }, [pages]);

  const handleToggleSelect = (pageNumber: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    const visiblePageNumbers = filteredPages.map((p) => p.pageNumber);
    const allSelected = visiblePageNumbers.every((num) => selectedPages.has(num));

    if (allSelected) {
      // Deselect visible
      setSelectedPages((prev) => {
        const next = new Set(prev);
        visiblePageNumbers.forEach((num) => next.delete(num));
        return next;
      });
    } else {
      // Select all visible
      setSelectedPages((prev) => {
        const next = new Set(prev);
        visiblePageNumbers.forEach((num) => next.add(num));
        return next;
      });
    }
  };

  const handleBatchAction = (override: ManualOverride) => {
    if (selectedPages.size === 0) return;
    onBatchOverride(Array.from(selectedPages), override);
    setSelectedPages(new Set());
  };

  const isAllVisibleSelected =
    filteredPages.length > 0 &&
    filteredPages.every((p) => selectedPages.has(p.pageNumber));

  return (
    <div className="space-y-4">
      {/* Filter Tabs & Batch Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Semua Halaman</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono ${
                activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'color'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Berwarna</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono ${
                activeTab === 'color' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'
              }`}
            >
              {counts.color}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bw')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'bw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Hitam Putih</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono ${
                activeTab === 'bw' ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-800'
              }`}
            >
              {counts.bw}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Perlu Diperiksa</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono ${
                activeTab === 'review' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {counts.review}
            </span>
          </button>
        </div>

        {/* Batch Selection Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button
            type="button"
            onClick={handleSelectAllVisible}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isAllVisibleSelected ? (
              <>
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Batal Pilih Semua
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-slate-400" />
                Pilih Semua Tampil
              </>
            )}
          </button>

          {selectedPages.size > 0 && (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                ({selectedPages.size} dipilih):
              </span>
              <button
                type="button"
                onClick={() => handleBatchAction('force_color')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                Set Berwarna
              </button>
              <button
                type="button"
                onClick={() => handleBatchAction('force_bw')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
              >
                Set Hitam Putih
              </button>
              <button
                type="button"
                onClick={() => handleBatchAction('auto')}
                className="p-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="Reset pilihan ke otomatis"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Pages */}
      {filteredPages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">Tidak ada halaman pada kategori ini</h4>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan tab filter lain atau ubah pengaturan ambang deteksi warna.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredPages.map((page) => (
            <PageCard
              key={page.pageNumber}
              page={page}
              isSelected={selectedPages.has(page.pageNumber)}
              onToggleSelect={handleToggleSelect}
              onSetOverride={onSetOverride}
              onPreview={onPreviewPage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
