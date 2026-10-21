import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Triggers a file download in the browser/Electron without server intervention.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 4000);
}

/**
 * Extracts specified pages from the source PDF ArrayBuffer and returns a new PDF Blob.
 * Preserves vector fonts, original resolution, page dimensions, and orientations.
 * Halaman selalu diurutkan dari terkecil ke terbesar (ascending order).
 * @param srcBytes Raw ArrayBuffer of original PDF
 * @param pageIndices 0-based array of page indices to extract
 */
export async function createExtractedPdfBlob(
  srcBytes: ArrayBuffer,
  pageIndices: number[]
): Promise<Blob> {
  if (pageIndices.length === 0) {
    throw new Error('Tidak ada halaman yang dipilih untuk diekspor.');
  }

  // Wajib mengurutkan halaman dari nomor terkecil ke terbesar
  const sortedIndices = Array.from(new Set(pageIndices)).sort((a, b) => a - b);

  // Buat salinan buffer yang aman agar terhindar dari detached ArrayBuffer
  const bufferCopy = srcBytes.slice(0);
  const safeBytes = new Uint8Array(bufferCopy);

  // Load the original document
  const srcDoc = await PDFDocument.load(safeBytes, {
    ignoreEncryption: false,
    updateMetadata: false,
  });

  // Create a brand new PDF document
  const newDoc = await PDFDocument.create();

  // Copy specified pages in their strictly ascending order
  const copiedPages = await newDoc.copyPages(srcDoc, sortedIndices);
  copiedPages.forEach((page) => {
    newDoc.addPage(page);
  });

  const pdfBytes = await newDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Generates and downloads a separated PDF (Color or Black & White)
 * Disusun berurutan dari halaman terkecil ke terbesar.
 */
export async function downloadSeparatedPdf(
  srcBytes: ArrayBuffer,
  pageIndices: number[],
  baseFilename: string,
  suffix: 'berwarna' | 'hitam_putih'
): Promise<void> {
  const blob = await createExtractedPdfBlob(srcBytes, pageIndices);
  const cleanBaseName = baseFilename.replace(/\.pdf$/i, '');
  const targetFilename = `${cleanBaseName}_${suffix}.pdf`;
  downloadBlob(blob, targetFilename);
}

/**
 * Exports both Color and Black & White PDFs packaged inside a single ZIP archive,
 * including a text job summary for the photocopy operator.
 */
export async function downloadBothAsZip(
  srcBytes: ArrayBuffer,
  baseFilename: string,
  colorIndices: number[],
  bwIndices: number[],
  jobSummaryText: string
): Promise<void> {
  const zip = new JSZip();
  const cleanBaseName = baseFilename.replace(/\.pdf$/i, '');

  if (colorIndices.length > 0) {
    const colorBlob = await createExtractedPdfBlob(srcBytes, colorIndices);
    zip.file(`${cleanBaseName}_berwarna.pdf`, colorBlob);
  }

  if (bwIndices.length > 0) {
    const bwBlob = await createExtractedPdfBlob(srcBytes, bwIndices);
    zip.file(`${cleanBaseName}_hitam_putih.pdf`, bwBlob);
  }

  // Add job summary text report
  zip.file(`ringkasan_pekerjaan_${cleanBaseName}.txt`, jobSummaryText);

  const zipContent = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipContent, `${cleanBaseName}_hasil_pemisahan.zip`);
}
