import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js';

let workerConfigured = false;

/**
 * Konfigurasi worker PDF.js yang adaptif untuk lingkungan web dan Electron desktop (file://).
 * Menjamin 100% pemrosesan lokal tanpa ketergantungan koneksi internet.
 */
export function configurePdfJsWorker(): void {
  if (workerConfigured) return;

  try {
    if (typeof window !== 'undefined') {
      // 1. Daftarkan worker langsung ke global scope (window/globalThis).
      // Ini memungkinkan PDF.js menggunakan _mainThreadWorkerMessageHandler secara instan
      // tanpa memicu kesalahan fake worker atau pemuatan script eksternal.
      const resolvedWorker = (pdfjsWorker as any)?.default || pdfjsWorker;
      (window as any).pdfjsWorker = resolvedWorker;
      (globalThis as any).pdfjsWorker = resolvedWorker;

      // 2. Tentukan workerSrc yang valid untuk lingkungan web maupun file:// Electron
      if (window.location.protocol === 'file:') {
        // Pada protokol file:// di Electron, window.location.origin bernilai "file://" tanpa path.
        // Oleh karena itu, kita harus menggunakan base path dari window.location.href (lokasi index.html).
        try {
          const currentUrl = window.location.href;
          const baseDirectory = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', baseDirectory).href;
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
        }
      } else {
        // Protokol http/https web standar
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', window.location.href).href;
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        }
      }
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }

    workerConfigured = true;
  } catch (err) {
    console.warn('Penyesuaian konfigurasi worker lanjutan:', err);
    try {
      const resolvedWorker = (pdfjsWorker as any)?.default || pdfjsWorker;
      (window as any).pdfjsWorker = resolvedWorker;
      (globalThis as any).pdfjsWorker = resolvedWorker;
    } catch {
      // fallback
    }
    workerConfigured = true;
  }
}

export { pdfjsLib };
