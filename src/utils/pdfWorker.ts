import * as pdfjsLib from 'pdfjs-dist';

// Configure worker locally to ensure full offline operation
let workerConfigured = false;

export function configurePdfJsWorker(): void {
  if (workerConfigured) return;

  try {
    // Prefer the locally bundled public worker (works completely offline)
    if (typeof window !== 'undefined') {
      const localWorkerUrl = `${window.location.origin}/pdf.worker.min.js`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl;
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
    workerConfigured = true;
  } catch (err) {
    console.warn('Gagal mengatur worker lokal, menggunakan fallback CDN:', err);
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    workerConfigured = true;
  }
}

export { pdfjsLib };
