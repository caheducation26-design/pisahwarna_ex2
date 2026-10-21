import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Check,
  Calculator,
  AlertTriangle,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import { PageAnalysisResult, PrintPricing } from '../types';

interface JobSummaryCardProps {
  filename: string;
  pages: PageAnalysisResult[];
  pricing: PrintPricing;
  onUpdatePricing: (pricing: PrintPricing) => void;
}

export const JobSummaryCard: React.FC<JobSummaryCardProps> = ({
  filename,
  pages,
  pricing,
  onUpdatePricing,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCostSettings, setShowCostSettings] = useState(false);

  const totalPages = pages.length;
  const colorPages = pages.filter((p) => p.classification === 'color');
  const bwPages = pages.filter((p) => p.classification === 'bw');
  const reviewPages = pages.filter((p) => p.classification === 'review');

  const colorPageNumbers = colorPages.map((p) => p.pageNumber);
  const bwPageNumbers = bwPages.map((p) => p.pageNumber);
  const reviewPageNumbers = reviewPages.map((p) => p.pageNumber);

  // Helper to format ranges e.g. "1-3, 5, 7-10"
  const formatPageRanges = (numbers: number[]): string => {
    if (numbers.length === 0) return '-';
    if (numbers.length <= 8) return numbers.join(', ');

    const ranges: string[] = [];
    let start = numbers[0];
    let prev = start;

    for (let i = 1; i <= numbers.length; i++) {
      const current = numbers[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        if (start === prev) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${prev}`);
        }
        start = current;
        prev = current;
      }
    }
    return ranges.join(', ');
  };

  // Cost calculation
  // In simplex: 1 page = 1 physical sheet
  // In duplex: roughly ceil(pages / 2) physical sheets
  const colorSheets =
    pricing.duplexMode === 'simplex'
      ? colorPages.length
      : Math.ceil(colorPages.length / 2);

  const bwSheets =
    pricing.duplexMode === 'simplex'
      ? bwPages.length
      : Math.ceil(bwPages.length / 2);

  const estimatedColorCost = colorPages.length * pricing.colorPerPage;
  const estimatedBwCost = bwPages.length * pricing.bwPerPage;
  const totalEstimatedCost = estimatedColorCost + estimatedBwCost;

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const generateSummaryText = (): string => {
    return `=== RINGKASAN PEKERJAAN FOTOKOPI (Fahsort) ===
Dokumen: ${filename}
Total Halaman: ${totalPages} Halaman

[1] HALAMAN BERWARNA: ${colorPages.length} Halaman
Urutan Halaman: ${formatPageRanges(colorPageNumbers)}
Estimasi Biaya (@ ${formatRupiah(pricing.colorPerPage)}): ${formatRupiah(estimatedColorCost)}

[2] HALAMAN HITAM PUTIH (B/W): ${bwPages.length} Halaman
Urutan Halaman: ${formatPageRanges(bwPageNumbers)}
Estimasi Biaya (@ ${formatRupiah(pricing.bwPerPage)}): ${formatRupiah(estimatedBwCost)}

${
  reviewPages.length > 0
    ? `[!] PERLU DIPERIKSA MANUAL: ${reviewPages.length} Halaman (${formatPageRanges(
        reviewPageNumbers
      )})\n`
    : ''
}Mode Cetak: ${pricing.duplexMode === 'simplex' ? '1 Sisi (Simplex)' : 'Bolak-Balik (Duplex)'}
TOTAL ESTIMASI BIAYA CETAK: ${formatRupiah(totalEstimatedCost)}
*Catatan: Perhitungan ini merupakan estimasi awal berdasarkan tarif per halaman yang ditentukan operator.`;
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Ringkasan Pekerjaan Fotokopi
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-md">
              File: <span className="font-semibold text-slate-700">{filename}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCostSettings(!showCostSettings)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-slate-600" />
            {showCostSettings ? 'Sembunyikan Tarif' : 'Atur Tarif & Estimasi Biaya'}
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Tersalin ke Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Salin Ringkasan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-5">
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Halaman
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {totalPages}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Dokumen asli</span>
        </div>

        <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-200">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Berwarna
          </span>
          <span className="text-2xl font-black text-blue-800 font-mono">
            {colorPages.length}
          </span>
          <span className="text-[11px] text-blue-600 font-medium block mt-0.5 truncate">
            Hal: {formatPageRanges(colorPageNumbers)}
          </span>
        </div>

        <div className="bg-slate-100 rounded-xl p-3.5 border border-slate-300">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            Hitam Putih
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {bwPages.length}
          </span>
          <span className="text-[11px] text-slate-600 font-medium block mt-0.5 truncate">
            Hal: {formatPageRanges(bwPageNumbers)}
          </span>
        </div>

        <div
          className={`rounded-xl p-3.5 border transition-all ${
            reviewPages.length > 0
              ? 'bg-amber-50 border-amber-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
            {reviewPages.length > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
            Perlu Diperiksa
          </span>
          <span
            className={`text-2xl font-black font-mono ${
              reviewPages.length > 0 ? 'text-amber-700' : 'text-slate-400'
            }`}
          >
            {reviewPages.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
            {reviewPages.length > 0
              ? `Hal: ${formatPageRanges(reviewPageNumbers)}`
              : 'Semua terklasifikasi'}
          </span>
        </div>
      </div>

      {/* Optional Pricing & Cost Estimation Section */}
      {showCostSettings && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 mb-2 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Pengaturan Tarif & Estimasi Biaya Fotokopi
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tarif Cetak Berwarna / Lembar
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={pricing.colorPerPage}
                  onChange={(e) =>
                    onUpdatePricing({
                      ...pricing,
                      colorPerPage: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tarif Cetak Hitam Putih / Lembar
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={pricing.bwPerPage}
                  onChange={(e) =>
                    onUpdatePricing({
                      ...pricing,
                      bwPerPage: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Metode Pencetakan
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onUpdatePricing({ ...pricing, duplexMode: 'simplex' })}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    pricing.duplexMode === 'simplex'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  1 Sisi (Simplex)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdatePricing({ ...pricing, duplexMode: 'duplex' })}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    pricing.duplexMode === 'duplex'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  2 Sisi (Duplex)
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 text-slate-600">
              <div>
                Warna: {colorPages.length} hal × {formatRupiah(pricing.colorPerPage)} ={' '}
                <span className="font-bold text-slate-800">{formatRupiah(estimatedColorCost)}</span>
              </div>
              <div>
                Hitam Putih: {bwPages.length} hal × {formatRupiah(pricing.bwPerPage)} ={' '}
                <span className="font-bold text-slate-800">{formatRupiah(estimatedBwCost)}</span>
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="text-slate-500 block text-[11px]">Total Estimasi Biaya Cetak</span>
              <span className="text-lg font-extrabold text-blue-700">
                {formatRupiah(totalEstimatedCost)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>
              <strong>Asumsi Perhitungan:</strong> Angka di atas merupakan estimasi awal. Pada cetak
              dua sisi (duplex), pemisahan fisik lembar bergantung pada apakah halaman warna dan hitam
              putih berada pada lembar kertas yang sama atau dicetak di dua printer terpisah.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
