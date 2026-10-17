import React from 'react';
import { X, BookOpen, ShieldCheck, WifiOff, FileCheck, HelpCircle } from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Panduan Operator Fotokopi</h3>
              <p className="text-xs text-slate-400">
                Cara menggunakan ColorBW Print & panduan operasional harian
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Section 1 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              Alur Kerja Standar di Kasir/Operator Fotokopi
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 pl-2">
              <li>
                <strong>Tarik & lepas</strong> file PDF pelanggan ke kotak unggah (atau klik &ldquo;Coba
                Dokumen Sampel&rdquo; untuk demo).
              </li>
              <li>
                Sistem akan memindai spektrum warna setiap halaman menggunakan analisis kanal RGB
                secara otomatis.
              </li>
              <li>
                Periksa tab <strong>&ldquo;Perlu Diperiksa&rdquo;</strong> jika ada dokumen dengan
                stempel pudar atau bayangan foto monokrom. Anda dapat mengubah kategorinya dengan 1
                klik tombol <em>[Warna]</em> atau <em>[B/W]</em>.
              </li>
              <li>
                Klik <strong>&ldquo;Unduh Berwarna&rdquo;</strong> untuk mencetak di printer digital
                warna, dan <strong>&ldquo;Unduh Hitam Putih&rdquo;</strong> untuk dicetak di mesin
                fotokopi hitam putih cepat/ekonomis.
              </li>
              <li>
                Klik <strong>&ldquo;Salin Ringkasan&rdquo;</strong> untuk menyalin total halaman dan
                estimasi nota untuk dicatat di nota pembayaran kasir.
              </li>
            </ol>
          </div>

          {/* Section 2: Privacy */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privasi Dokumen 100% Terjaga</span>
            </div>
            <p className="text-emerald-800">
              Aplikasi ini <strong>TIDAK mengirim dokumen pelanggan ke internet</strong> atau server
              pihak ketiga mana pun. Seluruh proses pembacaan PDF, analisis piksel, dan pemisahan file
              berlangsung murni di memori RAM browser komputer Anda menggunakan teknologi PDF.js dan
              pdf-lib. Surat rahasia, ijazah, dan dokumen penting pelanggan Anda aman sepenuhnya.
            </p>
          </div>

          {/* Section 3: Offline Mode Guide */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <WifiOff className="w-4 h-4 text-slate-700" />
              <span>Penggunaan Sepenuhnya Offline di Komputer Fotokopi</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Seluruh pustaka pemrosesan (worker PDF.js, pdf-lib, jszip) telah dikemas secara lokal di
              dalam folder <code>/public</code> proyek ini. Anda dapat menjalankan aplikasi ini di
              laptop/PC kasir fotokopi tanpa perlu menyalakan modem internet:
            </p>
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px]">
              npm run build<br />
              npx serve dist -p 3000
            </div>
            <p className="text-slate-500 text-[11px]">
              Buka <code>http://localhost:3000</code> di Google Chrome komputer fotokopi Anda dan
              buat bookmark desktop.
            </p>
          </div>

          {/* Section 4: Tips for common issues */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Tips Mengatasi Masalah Dokumen Nyata:
            </h4>
            <p>
              • <strong>Kertas Scan Tua / Buram:</strong> Bila kertas fotokopi kotor kekuningan
              terbaca sebagai warna, buka <em>Pengaturan Deteksi</em> lalu naikkan{' '}
              <em>Toleransi Noise</em> ke angka 25.
            </p>
            <p>
              • <strong>Stempel Kecil / Tanda Tangan:</strong> Algoritma secara khusus telah disetel
              untuk menangkap stempel berukuran kecil (seperti stempel cap lunas/sah) yang memiliki
              kejenuhan warna tajam.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
