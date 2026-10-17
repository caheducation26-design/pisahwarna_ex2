import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, X, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface UploadAreaProps {
  currentFile: File | null;
  onFileSelected: (file: File) => void;
  onClearFile: () => void;
  onLoadSample: () => void;
  isProcessing: boolean;
  totalPageCount: number | null;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  currentFile,
  onFileSelected,
  onClearFile,
  onLoadSample,
  isProcessing,
  totalPageCount,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndProcessFile = (file: File) => {
    setDragError(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setDragError('Format file tidak didukung. Mohon masukkan dokumen berformat PDF.');
      return;
    }
    if (file.size === 0) {
      setDragError('File PDF kosong (0 byte). Silakan periksa kembali file Anda.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setDragError(
        'Ukuran file melebihi batas 200 MB. Disarankan membagi dokumen untuk menjaga stabilitas memori browser.'
      );
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isProcessing}
      />

      {/* If file is already selected */}
      {currentFile ? (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
                    {currentFile.name}
                  </h3>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    PDF Siap
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Ukuran: {formatFileSize(currentFile.size)}</span>
                  <span>•</span>
                  <span>
                    {totalPageCount !== null
                      ? `${totalPageCount} Halaman Total`
                      : 'Membaca struktur halaman...'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
                Ganti File
              </button>
              <button
                type="button"
                onClick={onClearFile}
                disabled={isProcessing}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                title="Hapus dan bersihkan dokumen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty upload state with drag & drop */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[1.005]'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                isDragging ? 'scale-110 bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <UploadCloud className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
              Tarik & Lepas File PDF ke Sini
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              atau klik di area ini untuk memilih dokumen PDF dari komputer Anda
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all pointer-events-none"
              >
                Pilih Dokumen PDF
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadSample();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                Coba Sampel Demo
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Privasi Terjaga: Dokumen diproses 100% di browser tanpa diunggah ke internet</span>
            </div>
          </div>
        </div>
      )}

      {/* Error message if any */}
      {dragError && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2">
          <X className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
};
