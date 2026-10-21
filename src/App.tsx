/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { configurePdfJsWorker, pdfjsLib } from './utils/pdfWorker';
import {
  DEFAULT_DETECTION_SETTINGS,
  analyzeCanvasPixels,
  getEffectiveClassification,
} from './utils/colorDetector';
import {
  downloadSeparatedPdf,
  downloadBothAsZip,
} from './utils/pdfExporter';
import { generateSampleTestPdf } from './utils/samplePdfGenerator';
import {
  DetectionSettings,
  ManualOverride,
  PageAnalysisResult,
  PrintPricing,
  ProcessingStatus,
  ScanProgress,
} from './types';

import { Navbar } from './components/Navbar';
import { UploadArea } from './components/UploadArea';
import { ScanningProgress } from './components/ScanningProgress';
import { JobSummaryCard } from './components/JobSummaryCard';
import { ExportToolbar } from './components/ExportToolbar';
import { PageGrid } from './components/PageGrid';
import { PagePreviewModal } from './components/PagePreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { AlertCircle, ShieldAlert, Sparkles, Printer, FileText } from 'lucide-react';

export default function App() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageAnalysisResult[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    currentPage: 0,
    totalPages: 0,
    percentage: 0,
    statusText: '',
  });
  const [exportStage, setExportStage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings & Pricing state (with localStorage persistence)
  const [settings, setSettings] = useState<DetectionSettings>(() => {
    try {
      const saved = localStorage.getItem('colorbw_detection_settings');
      return saved ? JSON.parse(saved) : DEFAULT_DETECTION_SETTINGS;
    } catch {
      return DEFAULT_DETECTION_SETTINGS;
    }
  });

  const [pricing, setPricing] = useState<PrintPricing>(() => {
    try {
      const saved = localStorage.getItem('colorbw_print_pricing');
      return saved
        ? JSON.parse(saved)
        : { colorPerPage: 1500, bwPerPage: 300, duplexMode: 'simplex' };
    } catch {
      return { colorPerPage: 1500, bwPerPage: 300, duplexMode: 'simplex' };
    }
  });

  // Modal states
  const [previewPage, setPreviewPage] = useState<PageAnalysisResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Cancellation ref for scanning
  const cancelScanRef = useRef<boolean>(false);

  // Initialize PDF worker on mount
  useEffect(() => {
    configurePdfJsWorker();
  }, []);

  // Save settings on update
  const handleUpdateSettings = (newSettings: DetectionSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('colorbw_detection_settings', JSON.stringify(newSettings));
    } catch (err) {
      console.warn('Gagal menyimpan pengaturan ke localStorage:', err);
    }
  };

  const handleUpdatePricing = (newPricing: PrintPricing) => {
    setPricing(newPricing);
    try {
      localStorage.setItem('colorbw_print_pricing', JSON.stringify(newPricing));
    } catch (err) {
      console.warn('Gagal menyimpan tarif ke localStorage:', err);
    }
  };

  // Clear current document and reset state
  const handleClearFile = useCallback(() => {
    cancelScanRef.current = true;
    setCurrentFile(null);
    setFileBuffer(null);
    setPages([]);
    setStatus('idle');
    setErrorMessage(null);
    setPreviewPage(null);
  }, []);

  // Process and scan PDF pages
  const processAndScanPdf = async (buffer: ArrayBuffer, fileObj: File) => {
    setErrorMessage(null);
    setStatus('loading_pdf');
    cancelScanRef.current = false;

    try {
      configurePdfJsWorker();

      // Configure local offline cmaps & fonts
      let cMapUrl = 'cmaps/';
      let standardFontDataUrl = 'standard_fonts/';
      if (typeof window !== 'undefined') {
        if (window.location.protocol === 'file:') {
          const baseHref = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
          cMapUrl = new URL('cmaps/', baseHref).href;
          standardFontDataUrl = new URL('standard_fonts/', baseHref).href;
        } else {
          try {
            cMapUrl = new URL('cmaps/', window.location.href).href;
            standardFontDataUrl = new URL('standard_fonts/', window.location.href).href;
          } catch {
            cMapUrl = '/cmaps/';
            standardFontDataUrl = '/standard_fonts/';
          }
        }
      }

      // Read document with PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        cMapUrl,
        cMapPacked: true,
        standardFontDataUrl,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      if (numPages === 0) {
        throw new Error('Dokumen PDF tidak memiliki halaman.');
      }

      setStatus('scanning');
      const scannedResults: PageAnalysisResult[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (cancelScanRef.current) {
          console.log('Pemindaian dibatalkan oleh operator.');
          break;
        }

        const percentage = Math.round(((pageNum - 1) / numPages) * 100);
        setScanProgress({
          currentPage: pageNum,
          totalPages: numPages,
          percentage,
          statusText: `Menganalisis matriks piksel halaman ${pageNum} dari ${numPages}...`,
        });

        // Yield to allow React to render the progress bar
        await new Promise((resolve) => setTimeout(resolve, 8));

        const page = await pdf.getPage(pageNum);

        // Optimal analysis resolution: target width around 600px
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const targetWidth = 600;
        const scale = Math.min(1.5, Math.max(0.4, targetWidth / unscaledViewport.width));
        const viewport = page.getViewport({ scale });

        // Offscreen canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('Gagal menginisialisasi canvas grafis untuk analisis.');
        }

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        // Perform pixel color analysis
        const analysis = analyzeCanvasPixels(canvas, settings);

        // Generate crisp thumbnail
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Clean up
        page.cleanup();

        scannedResults.push({
          pageNumber: pageNum,
          classification: analysis.detectedClassification,
          detectedClassification: analysis.detectedClassification,
          manualOverride: 'auto',
          colorPixelCount: analysis.colorPixelCount,
          totalPixels: analysis.totalPixels,
          contentPixels: analysis.contentPixels,
          colorRatio: analysis.colorRatio,
          colorContentRatio: analysis.colorContentRatio,
          maxDelta: analysis.maxDelta,
          thumbnailUrl,
          width: unscaledViewport.width,
          height: unscaledViewport.height,
          aspectRatio: Number((unscaledViewport.width / unscaledViewport.height).toFixed(2)),
        });
      }

      if (cancelScanRef.current && scannedResults.length === 0) {
        setStatus('idle');
        return;
      }

      setPages(scannedResults);
      setStatus('completed');
      setScanProgress({
        currentPage: numPages,
        totalPages: numPages,
        percentage: 100,
        statusText: 'Pemindaian selesai! Seluruh halaman berhasil dianalisis.',
      });
    } catch (err: unknown) {
      console.error('Error saat membaca PDF:', err);
      setStatus('error');
      const errObj = err as { name?: string; message?: string };
      if (errObj.name === 'PasswordException') {
        setErrorMessage(
          'File PDF ini terkunci kata sandi (Password Protected). Silakan buka kunci file sebelum memindai.'
        );
      } else if (errObj.message?.includes('Invalid PDF structure')) {
        setErrorMessage(
          'Struktur file PDF tidak valid atau mengalami kerusakan data. Mohon gunakan file PDF yang masih utuh.'
        );
      } else {
        setErrorMessage(
          `Gagal memproses file PDF: ${errObj.message || 'Terjadi kesalahan sistem yang tidak diketahui.'}`
        );
      }
    }
  };

  const handleFileSelected = async (file: File) => {
    try {
      setCurrentFile(file);
      const buffer = await file.arrayBuffer();
      setFileBuffer(buffer);
      await processAndScanPdf(buffer, file);
    } catch (err) {
      console.error('Gagal membaca file array buffer:', err);
      setErrorMessage('Gagal membaca data file. Pastikan dokumen tidak terkunci oleh aplikasi lain.');
      setStatus('error');
    }
  };

  const handleCancelScan = () => {
    cancelScanRef.current = true;
    if (pages.length > 0) {
      setStatus('completed');
    } else {
      setStatus('idle');
    }
  };

  const handleRescan = async () => {
    if (!fileBuffer || !currentFile) return;
    await processAndScanPdf(fileBuffer, currentFile);
  };

  const handleLoadSample = async () => {
    try {
      setStatus('loading_pdf');
      const sampleBytes = await generateSampleTestPdf();
      const sampleBlob = new Blob([sampleBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const sampleFile = new File([sampleBlob], 'dokumen_uji_fotokopi_campuran.pdf', {
        type: 'application/pdf',
      });
      await handleFileSelected(sampleFile);
    } catch (err) {
      console.error('Gagal membuat dokumen sampel:', err);
      setErrorMessage('Gagal membuat dokumen sampel. Silakan coba lagi.');
      setStatus('error');
    }
  };

  // Manual classification overrides
  const handleSetOverride = (pageNumber: number, override: ManualOverride) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== pageNumber) return page;
        const newEffective = getEffectiveClassification(page.detectedClassification, override);
        const updated = {
          ...page,
          manualOverride: override,
          classification: newEffective,
        };
        // Update modal state if open
        if (previewPage?.pageNumber === pageNumber) {
          setPreviewPage(updated);
        }
        return updated;
      })
    );
  };

  const handleBatchOverride = (pageNumbers: number[], override: ManualOverride) => {
    const targetSet = new Set(pageNumbers);
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (!targetSet.has(page.pageNumber)) return page;
        const newEffective = getEffectiveClassification(page.detectedClassification, override);
        return {
          ...page,
          manualOverride: override,
          classification: newEffective,
        };
      })
    );
  };

  // Exports
  const handleExportColor = async () => {
    if (!fileBuffer || !currentFile) return;
    const colorIndices = pages
      .filter((p) => p.classification === 'color')
      .map((p) => p.pageNumber - 1); // 0-indexed for pdf-lib

    if (colorIndices.length === 0) return;

    try {
      setStatus('exporting');
      setExportStage('Mengekstrak halaman berwarna dalam format vektor asli...');
      await downloadSeparatedPdf(fileBuffer, colorIndices, currentFile.name, 'berwarna');
    } catch (err) {
      console.error('Gagal mengekspor PDF berwarna:', err);
      alert('Terjadi kendala saat menyusun PDF berwarna: ' + (err as Error).message);
    } finally {
      setStatus('completed');
      setExportStage(null);
    }
  };

  const handleExportBw = async () => {
    if (!fileBuffer || !currentFile) return;
    const bwIndices = pages
      .filter((p) => p.classification === 'bw')
      .map((p) => p.pageNumber - 1); // 0-indexed for pdf-lib

    if (bwIndices.length === 0) return;

    try {
      setStatus('exporting');
      setExportStage('Mengekstrak halaman hitam putih dalam format vektor asli...');
      await downloadSeparatedPdf(fileBuffer, bwIndices, currentFile.name, 'hitam_putih');
    } catch (err) {
      console.error('Gagal mengekspor PDF hitam putih:', err);
      alert('Terjadi kendala saat menyusun PDF hitam putih: ' + (err as Error).message);
    } finally {
      setStatus('completed');
      setExportStage(null);
    }
  };

  const handleExportBoth = async () => {
    if (!fileBuffer || !currentFile) return;
    const colorIndices = pages
      .filter((p) => p.classification === 'color')
      .map((p) => p.pageNumber - 1);

    const bwIndices = pages
      .filter((p) => p.classification === 'bw')
      .map((p) => p.pageNumber - 1);

    try {
      setStatus('exporting');
      setExportStage('Mengemas kedua dokumen PDF dan laporan ringkasan ke dalam berkas ZIP...');

      const summaryText = `LAPORAN PEMISAHAN DOKUMEN FOTOKOPI (ColorBW Print)
Nama File Asli: ${currentFile.name}
Total Halaman: ${pages.length} Halaman
- Halaman Berwarna (${colorIndices.length} hal): ${colorIndices.map((i) => i + 1).join(', ') || '-'}
- Halaman Hitam Putih (${bwIndices.length} hal): ${bwIndices.map((i) => i + 1).join(', ') || '-'}
Waktu Ekspor: ${new Date().toLocaleString('id-ID')}
Diproses 100% aman di browser tanpa server luar.`;

      await downloadBothAsZip(
        fileBuffer,
        currentFile.name,
        colorIndices,
        bwIndices,
        summaryText
      );
    } catch (err) {
      console.error('Gagal membuat arsip ZIP:', err);
      alert('Terjadi kesalahan saat membuat file ZIP: ' + (err as Error).message);
    } finally {
      setStatus('completed');
      setExportStage(null);
    }
  };

  // Preview modal navigation
  const handlePreviewNavigate = (step: number) => {
    if (!previewPage) return;
    const nextNum = previewPage.pageNumber + step;
    const target = pages.find((p) => p.pageNumber === nextNum);
    if (target) {
      setPreviewPage(target);
    }
  };

  const colorCount = pages.filter((p) => p.classification === 'color').length;
  const bwCount = pages.filter((p) => p.classification === 'bw').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Navigation Bar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onLoadSample={handleLoadSample}
        isProcessing={status === 'scanning' || status === 'loading_pdf' || status === 'exporting'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Banner when no file is uploaded */}
        {!currentFile && status === 'idle' && (
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Solusi Cerdas Usaha Fotokopi & Percetakan Digital
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                Pisahkan Halaman PDF Berwarna & Hitam Putih Secara Otomatis
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Hemat waktu operator fotokopi tanpa perlu memilah manual satu per satu. Sistem
                menganalisis spektrum piksel RGB setiap halaman, mendeteksi stempel atau grafik warna,
                dan membagi dokumen menjadi dua PDF berkualitas tinggi siap cetak.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Coba Dokumen Demo Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
                >
                  Pelajari Cara Kerja
                </button>
              </div>
            </div>

            {/* Decorative background visual */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden lg:flex items-center justify-center">
              <Printer className="w-80 h-80 text-white" />
            </div>
          </div>
        )}

        {/* Upload Zone */}
        <UploadArea
          currentFile={currentFile}
          onFileSelected={handleFileSelected}
          onClearFile={handleClearFile}
          onLoadSample={handleLoadSample}
          isProcessing={status === 'scanning' || status === 'loading_pdf'}
          totalPageCount={pages.length > 0 ? pages.length : null}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-bold">Terjadi Kesalahan</h5>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Scanning in Progress */}
        {status === 'scanning' && (
          <ScanningProgress progress={scanProgress} onCancel={handleCancelScan} />
        )}

        {/* Loading PDF spinner */}
        {status === 'loading_pdf' && (
          <div className="bg-white rounded-2xl border border-blue-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <FileText className="w-6 h-6 animate-spin text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Membuka Dokumen PDF...</h4>
            <p className="text-xs text-slate-500 mt-1">
              Menyiapkan worker grafis dan memverifikasi struktur file.
            </p>
          </div>
        )}

        {/* Results Section when scanning is completed */}
        {pages.length > 0 && (
          <div className="space-y-6">
            {/* Job Summary Card */}
            <JobSummaryCard
              filename={currentFile?.name || 'dokumen.pdf'}
              pages={pages}
              pricing={pricing}
              onUpdatePricing={handleUpdatePricing}
            />

            {/* Export Toolbar */}
            <ExportToolbar
              colorCount={colorCount}
              bwCount={bwCount}
              isExporting={status === 'exporting'}
              exportStage={exportStage}
              onExportColor={handleExportColor}
              onExportBw={handleExportBw}
              onExportBoth={handleExportBoth}
              onRescan={handleRescan}
            />

            {/* Grid of Pages with Filters & Controls */}
            <PageGrid
              pages={pages}
              onSetOverride={handleSetOverride}
              onBatchOverride={handleBatchOverride}
              onPreviewPage={(p) => setPreviewPage(p)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">ColorBW Print</span>
            <span>•</span>
            <span>Aplikasi Pemilah Dokumen Fotokopi Profesional</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Panduan Operator
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Kalibrasi Warna
            </button>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">100% Offline & Aman</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PagePreviewModal
        page={previewPage}
        totalPages={pages.length}
        onClose={() => setPreviewPage(null)}
        onSetOverride={handleSetOverride}
        onNavigate={handlePreviewNavigate}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onSave={handleUpdateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
