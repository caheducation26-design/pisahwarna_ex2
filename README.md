# ColorBW Print — Sistem Pemisah PDF Berwarna & Hitam Putih untuk Usaha Fotokopi

**ColorBW Print** adalah aplikasi web profesional yang dirancang khusus untuk mempermudah operator dan kasir fotokopi/percetakan dalam memilah serta memisahkan halaman PDF berwarna dan hitam putih secara otomatis.

Aplikasi ini beroperasi **100% di browser lokal** (Client-side), **tanpa API AI**, **tanpa biaya langganan**, dan **tanpa mengirim dokumen pelanggan ke internet/server eksternal**.

---

## 📋 Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Algoritma Deteksi Warna](#algoritma-deteksi-warna)
3. [Arsitektur & Struktur Direktori](#arsitektur--struktur-direktori)
4. [Teknologi & Dependensi](#teknologi--dependensi)
5. [Panduan Instalasi & Menjalankan](#panduan-instalasi--menjalankan)
6. [Panduan Mode Offline Penuh (Tanpa Internet)](#panduan-mode-offline-penuh-tanpa-internet)
7. [Skenario Pengujian Sistem (12 Kasus Uji)](#skenario-pengujian-sistem-12-kasus-uji)
8. [Panduan Penggunaan untuk Operator Pemula](#panduan-penggunaan-untuk-operator-pemula)

---

## 🌟 Fitur Utama

- **Pemisahan Halaman Nyata Menggunakan `pdf-lib`**:
  Halaman keluaran diekstrak langsung dari berkas asli sehingga format vektor, font tersemat, ketajaman teks, dimensi (A4, F4, Folio, Legal), dan orientasi halaman dipertahankan 100% tanpa kompresi atau screenshot.
- **Deteksi Warna Berbasis Matriks Piksel RGB**:
  Bukan sekadar membaca metadata, melainkan memindai kanvas piksel per piksel untuk menghitung deviasi kroma ($\Delta = \max(R,G,B) - \min(R,G,B)$) dan rasio luas warna terhadap halaman.
- **Filter Artefak Kertas Scan & Monokrom**:
  Mampu membedakan dokumen hasil scan dengan kertas kuning/buram dan foto monokrom (abu-abu) agar tidak keliru dianggap halaman berwarna.
- **Kategori "Perlu Diperiksa" (Review)**:
  Memberikan peringatan khusus pada halaman yang berada di zona ambang batas (seperti stempel pudar atau pensil) agar operator dapat memverifikasi dalam 1 klik.
- **Koreksi Manual & Aksi Massal (Batch Override)**:
  Operator dapat dengan mudah mengubah kategori halaman menjadi *Berwarna* atau *Hitam Putih* secara individual maupun massal.
- **Kalkulator Estimasi Biaya & Nota Fotokopi**:
  Mendukung tarif kustom per lembar (Warna & B/W), mode cetak Simplex (1 sisi) / Duplex (bolak-balik), dan tombol *Salin Ringkasan* untuk nota transaksi atau WhatsApp pelanggan.
- **Pengepakan Ekspor Fleksibel**:
  Unduh PDF Berwarna, Unduh PDF Hitam Putih, atau Unduh Kedua File sekaligus dalam format berkas ZIP lengkap dengan file laporan `ringkasan_pekerjaan.txt`.
- **Generator Dokumen Uji Coba Bawaan (Built-in Demo)**:
  Tersedia tombol satu-klik untuk langsung membuat berkas PDF sampel 6 halaman campuran (Surat Kontrak B/W, Grafik Warna, Tabel Grayscale, Surat Berstempel Biru/Merah, dan Brosur Warna).

---

## 🔬 Algoritma Deteksi Warna

Algoritma analisis piksel pada `src/utils/colorDetector.ts` bekerja dengan langkah:
1. **Perenderan Kanvas**: Halaman PDF dirender ke `HTMLCanvasElement` dengan lebar analisis optimal (~600px).
2. **Ekstraksi Byte RGBA**: Mengambil `ctx.getImageData()` ke typed array `Uint8ClampedArray`.
3. **Penyaringan Latar Belakang & Noise**:
   - Melewati piksel transparan ($A < 30$).
   - Melewati kertas putih bersih ($R \ge 250, G \ge 250, B \ge 250$).
   - Menghitung deviasi kroma: $\Delta = \max(R,G,B) - \min(R,G,B)$.
   - Mengabaikan kekuningan kertas scan ($L > 195 \text{ dan } \Delta \le \text{noiseTolerance}$).
   - Mengabaikan noise bayangan hitam monokrom ($L < 45 \text{ dan } \Delta \le 14$).
4. **Perhitungan Rasio**:
   $$\text{Color Ratio} = \left(\frac{\text{Piksel Berwarna}}{\text{Total Piksel Halaman}}\right) \times 100\%$$
5. **Klasifikasi**:
   - **BERWARNA**: Jika rasio $\ge \text{minColorProportion}$ (standar: 0.08%) ATAU terdeteksi klaster pekat stempel resmi ($\ge 150 \text{ px}$ dengan $\Delta \ge 48$).
   - **PERLU DIPERIKSA**: Jika berada pada zona ambang batas ($0.45 \times \text{minColorProportion}$).
   - **HITAM PUTIH**: Jika deviasi kroma murni abu-abu/monokrom.

---

## 📁 Arsitektur & Struktur Direktori

```text
/
├── public/
│   └── pdf.worker.min.js          # Worker PDF.js versi offline lokal
├── src/
│   ├── components/
│   │   ├── ExportToolbar.tsx      # Bilah aksi ekspor PDF warna & B/W
│   │   ├── HelpGuideModal.tsx     # Panduan operator fotokopi & mode offline
│   │   ├── JobSummaryCard.tsx     # Ringkasan pekerjaan, daftar hal & kalkulator biaya
│   │   ├── Navbar.tsx             # Header navigasi & status lokal
│   │   ├── PageCard.tsx           # Kartu thumbnail, indikator delta, & toggle manual
│   │   ├── PageGrid.tsx           # Filter tab (Semua, Warna, B/W, Periksa) & batch action
│   │   ├── PagePreviewModal.tsx   # Lightbox pratinjau perbesaran & navigasi panah
│   │   ├── ScanningProgress.tsx   # Bilah progres pemindaian real-time & tombol batal
│   │   ├── SettingsModal.tsx      # Modal kalibrasi sensitivitas & toleransi noise
│   │   └── UploadArea.tsx         # Area drag-and-drop & pemilih file
│   ├── utils/
│   │   ├── colorDetector.ts       # Logika matematika analisis piksel RGB
│   │   ├── pdfExporter.ts         # Ekstraksi halaman asli via pdf-lib & arsip ZIP
│   │   ├── pdfWorker.ts           # Inisialisasi & fallback PDF.js worker
│   │   └── samplePdfGenerator.ts  # Pembuat PDF sampel uji coba 6 halaman
│   ├── App.tsx                    # Komponen utama & state management
│   ├── index.css                  # Konfigurasi Tailwind CSS v4 & font
│   ├── main.tsx                   # Entry point aplikasi React
│   └── types.ts                   # Definisi tipe TypeScript
├── index.html                     # Entry point HTML & SEO metadata
├── metadata.json                  # Metadata aplikasi AI Studio
├── package.json                   # Konfigurasi dependensi proyek
├── tsconfig.json                  # Konfigurasi TypeScript
├── vite.config.ts                 # Konfigurasi Vite bundler
└── README.md                      # Dokumentasi teknis & panduan lengkap
```

---

## ⚙️ Teknologi & Dependensi

| Pustaka | Versi | Fungsi |
|---|---|---|
| **React** | `^19.0.1` | Antarmuka pengguna reaktif |
| **TypeScript** | `^7.0.2` | Pengetikan tipe aman & pencegahan bug |
| **Vite** | `^8.3.0` | Bundler super cepat & dev server |
| **Tailwind CSS** | `^4.3.3` | Desain antarmuka modern & bersih |
| **pdfjs-dist** | `^3.11.174` | Pembacaan & rendering halaman PDF ke kanvas |
| **pdf-lib** | `^1.17.9` | Manipulasi PDF & ekstraksi halaman vektor asli |
| **jszip** | `^3.10.1` | Pengemasan file ZIP hasil pemisahan |
| **lucide-react**| `^0.546.0` | Ikon antarmuka profesional |

---

## 🚀 Panduan Instalasi & Menjalankan

### Persyaratan Sistem:
- Node.js versi 18 ke atas
- NPM atau PNPM / Bun
- Browser desktop modern (Google Chrome, Microsoft Edge, Mozilla Firefox)

### 1. Memasang Dependensi:
```bash
npm install
```

### 2. Menjalankan di Lingkungan Pengembangan (Development):
```bash
npm run dev
```
Buka browser di alamat: `http://localhost:3000`

### 3. Membangun Versi Produksi (Production Build):
```bash
npm run build
```
Hasil build akan tersedia di folder `dist/` dan siap disajikan oleh web server statis mana pun (Nginx, Apache, Caddy, Vercel, Netlify, atau Cloudflare Pages).

---

## 🔌 Panduan Mode Offline Penuh (Tanpa Internet)

Untuk usaha fotokopi yang komputernya tidak terhubung ke jaringan internet:
1. Jalankan `npm run build` pada komputer yang memiliki koneksi internet.
2. Salin seluruh isi folder `dist/` ke flashdisk.
3. Tempelkan ke komputer kasir fotokopi.
4. Jalankan server lokal sederhana, misalnya:
   ```bash
   npx serve dist -p 3000
   ```
   Atau pasang extension browser seperti *Web Server for Chrome*.
5. Seluruh pustaka, termasuk worker PDF.js di `/public/pdf.worker.min.js`, bekerja secara mandiri tanpa memerlukan CDN eksternal.

---

## 🧪 Skenario Pengujian Sistem (12 Kasus Uji)

| # | Kasus Uji | Karakteristik Dokumen | Hasil yang Diharapkan |
|---|---|---|---|
| 1 | **Seluruh Halaman Berwarna** | Dokumen majalah / presentasi Canva full color | 100% halaman masuk kategori Berwarna. Tombol Unduh B/W dinonaktifkan secara otomatis. |
| 2 | **Seluruh Halaman Hitam Putih** | Skripsi / buku teks hitam putih tanpa gambar | 100% halaman masuk kategori Hitam Putih. Tombol Unduh Berwarna dinonaktifkan secara otomatis. |
| 3 | **Dokumen Campuran** | Laporan tahunan dengan teks biasa dan grafik warna selang-seling | Halaman terpisah presisi sesuai urutan asli dokumen (misal hal 2, 4 warna; hal 1, 3, 5 hitam putih). |
| 4 | **Hasil Scan Kertas Buram** | Scan ijazah/KTP dengan latar belakang kertas kekuningan | Toleransi noise menyaring warna kertas sehingga tetap diklasifikasikan sebagai Hitam Putih. |
| 5 | **Logo / Stempel Warna Kecil** | Surat perjanjian formal dengan 1 stempel basah biru/merah | Algoritma klaster delta tinggi mendeteksi stempel tersebut dan menandai halaman sebagai Berwarna. |
| 6 | **Halaman Abu-abu (Grayscale)** | Dokumen dengan tabel arsiran abu-abu atau foto monokrom | Kanal RGB memiliki nilai seimbang ($R \approx G \approx B$), terdeteksi akurat sebagai Hitam Putih. |
| 7 | **Dokumen 1 Halaman** | Formulir pendaftaran tunggal | Pemindaian selesai instan, tombol ekspor kategori yang sesuai aktif. |
| 8 | **PDF Terkunci Sandi (Encrypted)** | File PDF yang memiliki password dari pemilik | Menampilkan pesan ramah: *"File PDF ini terkunci kata sandi. Silakan buka kunci file sebelum memindai."* |
| 9 | **Dokumen Berukuran Besar (100+ Hal)** | Buku manual tebal | Canvas dan objek memori dibersihkan per halaman, antarmuka tidak freeze berkat penjadwalan asinkron. |
| 10| **Koreksi Manual Operator** | Operator mengubah kategori halaman tertentu via tombol `[Warna]` / `[B/W]` | Klasifikasi manual diprioritaskan saat penyusunan PDF keluaran dan penghitungan biaya. |
| 11| **Ekspor Kedua Kategori (ZIP)** | Operator mengklik "Unduh Kedua File (ZIP)" | Menghasilkan file ZIP berisi `dokumen_berwarna.pdf`, `dokumen_hitam_putih.pdf`, dan `ringkasan_pekerjaan.txt`. |
| 12| **Kategori Kosong** | Dokumen tidak memiliki halaman pada salah satu kategori | Tombol unduh kategori terkait dinonaktifkan dengan pesan penjelasan yang transparan. |

---

## 👨‍💼 Panduan Penggunaan untuk Operator Pemula

1. **Memuat File**: Klik area kotak unggah atau tarik file PDF pelanggan ke dalam aplikasi. Anda juga bisa mencoba dengan menekan tombol **"Coba Dokumen Sampel"**.
2. **Meninjau Halaman**: Lihat pratinjau halaman yang dihasilkan. Jika ada halaman berstatus warna kuning **"PERLU DIPERIKSA"**, klik tombol **"Perbesar"** untuk memeriksa.
3. **Mengubah Kategori**: Cukup klik tombol `[Warna]` atau `[B/W]` pada kartu halaman terkait untuk mengubah tujuan cetak.
4. **Mencetak Dokumen**:
   - Klik **"Unduh Berwarna"** lalu kirim file ke printer warna.
   - Klik **"Unduh Hitam Putih"** lalu kirim file ke mesin fotokopi hitam putih berkecepatan tinggi.
5. **Membuat Nota**: Klik **"Salin Ringkasan"** untuk menempel rincian halaman dan estimasi biaya ke catatan nota kasir atau pesan WhatsApp pelanggan.
