import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates an in-memory realistic test PDF with mixed pages:
 * - Page 1: Pure Black & White legal contract text
 * - Page 2: Color financial report with vibrant charts & colored bars
 * - Page 3: Monochrome / Grayscale report with scan-like grayscale boxes
 * - Page 4: Official letter with a small colored blue "LUNAS" stamp and red signature
 * - Page 5: Pure Black & White table and ledger
 * - Page 6: Full color promotional flyer
 */
export async function generateSampleTestPdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4 width in pt
  const pageHeight = 841.89; // A4 height in pt

  // ==========================================
  // PAGE 1: Hitam Putih (Surat Perjanjian Fotokopi)
  // ==========================================
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  page1.drawText('SURAT PERJANJIAN KERJASAMA PENGADAAN FOTOKOPI', {
    x: 60,
    y: 770,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  page1.drawText('Nomor: 042/SPK/FOTO-COPY/X/2026', {
    x: 60,
    y: 752,
    size: 10,
    font: timesRoman,
    color: rgb(0.1, 0.1, 0.1),
  });
  // Divider line (monochrome black)
  page1.drawLine({
    start: { x: 60, y: 742 },
    end: { x: 535, y: 742 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  const p1Lines = [
    'Pada hari ini, Jumat tanggal enam belas bulan Oktober tahun dua ribu dua puluh enam,',
    'kami yang bertanda tangan di bawah ini:',
    '',
    '1. Nama : H. Sudirman, S.E. (Selaku Pemilik Usaha Fotokopi Mitra Bersama)',
    '2. Nama : Drs. Bambang Prakoso (Selaku Kepala Bagian Tata Usaha)',
    '',
    'Dengan ini sepakat mengikatkan diri dalam perjanjian jasa penggandaan dokumen dan fotokopi',
    'dengan ketentuan bahwa seluruh dokumen teks resmi diproses menggunakan tarif standar',
    'hitam putih (B/W) sebesar Rp 300 per halaman, sedangkan lembar bergambar berwarna',
    'akan dipisahkan untuk dihitung dengan tarif lembar berwarna Rp 1.500 per halaman.',
    '',
    'Pasal 1: Ketentuan Pemilahan Dokumen',
    'Pihak Pertama berkewajiban memilah secara teliti halaman berwarna dan hitam putih',
    'sebelum proses cetak massal agar efisiensi biaya dapat tercapai secara maksimal.',
    '',
    'Pasal 2: Kerahasiaan Dokumen Pelanggan',
    'Pihak Pertama menjamin dokumen tidak akan diunggah ke server pihak ketiga mana pun',
    'dan seluruh pemrosesan berlangsung aman 100% di browser lokal komputer kasir.',
  ];

  let p1Y = 700;
  for (const line of p1Lines) {
    if (line.startsWith('Pasal')) {
      page1.drawText(line, {
        x: 60,
        y: p1Y,
        size: 11,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
    } else {
      page1.drawText(line, {
        x: 60,
        y: p1Y,
        size: 10,
        font: timesRoman,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
    p1Y -= 20;
  }

  // ==========================================
  // PAGE 2: Berwarna (Laporan Grafik Penjualan)
  // ==========================================
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
  // Colorful header bar
  page2.drawRectangle({
    x: 0,
    y: 790,
    width: pageWidth,
    height: 52,
    color: rgb(0.08, 0.38, 0.74), // Royal Blue
  });
  page2.drawText('LAPORAN GRAFIK STATISTIK PERCETAKAN 2026', {
    x: 50,
    y: 808,
    size: 14,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page2.drawText('Rekapitulasi Volume Cetak Bulanan (Kategori Warna vs Monokrom)', {
    x: 50,
    y: 755,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Draw colorful bar chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
  const colorHeights = [110, 145, 130, 180, 160, 210];
  const bwHeights = [180, 210, 240, 260, 230, 290];

  const chartStartX = 80;
  const chartBaseY = 460;

  // Chart baseline
  page2.drawLine({
    start: { x: 60, y: chartBaseY },
    end: { x: 520, y: chartBaseY },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });

  for (let i = 0; i < months.length; i++) {
    const x = chartStartX + i * 72;
    // B/W bar (dark slate)
    page2.drawRectangle({
      x: x,
      y: chartBaseY,
      width: 24,
      height: bwHeights[i] * 0.7,
      color: rgb(0.3, 0.35, 0.4),
    });
    // Color bar (vibrant emerald green)
    page2.drawRectangle({
      x: x + 28,
      y: chartBaseY,
      width: 24,
      height: colorHeights[i] * 0.7,
      color: rgb(0.05, 0.7, 0.4),
    });
    // Month label
    page2.drawText(months[i], {
      x: x + 15,
      y: chartBaseY - 18,
      size: 9,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Legend
  page2.drawRectangle({
    x: 140,
    y: 640,
    width: 14,
    height: 14,
    color: rgb(0.3, 0.35, 0.4),
  });
  page2.drawText('Hitam Putih (Rim/Bulan)', {
    x: 160,
    y: 642,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
  });

  page2.drawRectangle({
    x: 320,
    y: 640,
    width: 14,
    height: 14,
    color: rgb(0.05, 0.7, 0.4),
  });
  page2.drawText('Cetak Berwarna (Rim/Bulan)', {
    x: 340,
    y: 642,
    size: 10,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Callout warning badge (vibrant orange/amber)
  page2.drawRectangle({
    x: 60,
    y: 350,
    width: 475,
    height: 60,
    color: rgb(1, 0.94, 0.85),
    borderColor: rgb(0.95, 0.55, 0.1),
    borderWidth: 1.5,
  });
  page2.drawText('CATATAN KHUSUS OPERATOR FOTOKOPI:', {
    x: 75,
    y: 388,
    size: 10,
    font: helveticaBold,
    color: rgb(0.8, 0.35, 0.05),
  });
  page2.drawText('Halaman ini wajib dicetak pada mesin Digital Press Warna untuk menjaga ketajaman grafik.', {
    x: 75,
    y: 368,
    size: 9,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // ==========================================
  // PAGE 3: Monokrom Abu-abu / Dokumen Scan Simpel (B/W)
  // ==========================================
  const page3 = pdfDoc.addPage([pageWidth, pageHeight]);
  page3.drawText('REKAPITULASI INVENTARIS MESIN FOTOKOPI (GRAYSCALE)', {
    x: 60,
    y: 770,
    size: 12,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page3.drawText('Contoh dokumen dengan bayangan abu-abu (tidak mengandung kanal warna RGB)', {
    x: 60,
    y: 752,
    size: 9,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Gray table header
  page3.drawRectangle({
    x: 60,
    y: 700,
    width: 475,
    height: 25,
    color: rgb(0.88, 0.88, 0.88),
  });
  page3.drawText('KODE', { x: 70, y: 708, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
  page3.drawText('TIPE MESIN', { x: 130, y: 708, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
  page3.drawText('KAPASITAS (CPM)', { x: 280, y: 708, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
  page3.drawText('STATUS', { x: 420, y: 708, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });

  const rows = [
    ['MF-01', 'Canon imageRUNNER ADVANCE C5540i', '40 Lembar/Menit', 'Aktif'],
    ['MF-02', 'Fuji Xerox DocuCentre-IV C3370', '35 Lembar/Menit', 'Servis Berkala'],
    ['MF-03', 'Konica Minolta bizhub 454e (Mono)', '45 Lembar/Menit', 'Aktif'],
    ['MF-04', 'Epson WorkForce Enterprise AM-C6000', '60 Lembar/Menit', 'Aktif'],
    ['MF-05', 'Kyocera TASKalfa 5003i', '50 Lembar/Menit', 'Siaga Cadangan'],
  ];

  let rowY = 675;
  rows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      page3.drawRectangle({
        x: 60,
        y: rowY - 4,
        width: 475,
        height: 20,
        color: rgb(0.96, 0.96, 0.96),
      });
    }
    page3.drawText(r[0], { x: 70, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    page3.drawText(r[1], { x: 130, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    page3.drawText(r[2], { x: 280, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    page3.drawText(r[3], { x: 420, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    rowY -= 24;
  });

  // ==========================================
  // PAGE 4: Berwarna (Surat Resmi dengan Stempel Biru & Tanda Tangan Merah)
  // (Testing small colored element detection)
  // ==========================================
  const page4 = pdfDoc.addPage([pageWidth, pageHeight]);
  page4.drawText('KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET DAN TEKNOLOGI', {
    x: 95,
    y: 775,
    size: 11,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  page4.drawText('LEMBAGA PENGEMBANGAN TEKNOLOGI INFORMASI KAMPUS', {
    x: 115,
    y: 760,
    size: 10,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  page4.drawLine({
    start: { x: 60, y: 748 },
    end: { x: 535, y: 748 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  page4.drawText('SURAT KETERANGAN VERIFIKASI DOKUMEN CETAK', {
    x: 140,
    y: 705,
    size: 11,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  const p4Lines = [
    'Menerangkan bahwa dokumen cetak panduan praktikum mahasiswa telah diperiksa',
    'dan disetujui untuk diperbanyak di unit fotokopi kampus.',
    'Segala bentuk keaslian dokumen dibuktikan dengan cap basah dan paraf resmi di bawah ini.',
  ];

  let p4Y = 665;
  p4Lines.forEach((l) => {
    page4.drawText(l, { x: 60, y: p4Y, size: 10, font: timesRoman, color: rgb(0.1, 0.1, 0.1) });
    p4Y -= 20;
  });

  // VIBRANT BLUE OFFICIAL STAMP (KOTAK CAP BASAH)
  // Testing: The page text is black, but this stamp has saturated cyan/blue ink!
  page4.drawRectangle({
    x: 340,
    y: 470,
    width: 145,
    height: 65,
    borderColor: rgb(0.05, 0.35, 0.85), // Vivid Blue stamp
    borderWidth: 2,
    color: rgb(0.95, 0.97, 1.0),
  });
  page4.drawText('TELAH DIVERIFIKASI', {
    x: 355,
    y: 512,
    size: 9,
    font: helveticaBold,
    color: rgb(0.05, 0.35, 0.85),
  });
  page4.drawText('STATUS : LUNAS / SAH', {
    x: 352,
    y: 495,
    size: 10,
    font: helveticaBold,
    color: rgb(0.85, 0.1, 0.1), // Bright Red inner text!
  });
  page4.drawText('Unit Percetakan Kampus', {
    x: 358,
    y: 480,
    size: 8,
    font: helvetica,
    color: rgb(0.05, 0.35, 0.85),
  });

  // ==========================================
  // PAGE 5: Hitam Putih (Daftar Nilai & Tabel Angka)
  // ==========================================
  const page5 = pdfDoc.addPage([pageWidth, pageHeight]);
  page5.drawText('LAMPIRAN TABEL KONTROL KUALITAS KERTAS', {
    x: 60,
    y: 770,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  page5.drawText('Halaman monokrom hitam putih teks & garis tabel standar fotokopi.', {
    x: 60,
    y: 750,
    size: 9,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  let tblY = 710;
  for (let r = 0; r < 12; r++) {
    page5.drawLine({
      start: { x: 60, y: tblY },
      end: { x: 535, y: tblY },
      thickness: 0.75,
      color: rgb(0, 0, 0),
    });
    page5.drawText(`Sample Lot #${1000 + r}`, {
      x: 70,
      y: tblY - 14,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    page5.drawText(`Gramatur: 75 gsm - Kecerahan: 98%`, {
      x: 200,
      y: tblY - 14,
      size: 9,
      font: helvetica,
      color: rgb(0.1, 0.1, 0.1),
    });
    page5.drawText(`Lolos QC Percetakan`, {
      x: 420,
      y: tblY - 14,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    tblY -= 24;
  }

  // ==========================================
  // PAGE 6: Berwarna (Brosur Promosi Percetakan Digital)
  // ==========================================
  const page6 = pdfDoc.addPage([pageWidth, pageHeight]);
  // Colorful top banner
  page6.drawRectangle({
    x: 0,
    y: 700,
    width: pageWidth,
    height: 142,
    color: rgb(0.92, 0.22, 0.38), // Crimson Rose Pink
  });
  page6.drawText('PROMO SPESIAL PERCETAKAN & JILID SKRIPSI', {
    x: 45,
    y: 785,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page6.drawText('Pemisahan Otomatis Berwarna & Hitam Putih — Lebih Hemat & Cepat!', {
    x: 45,
    y: 755,
    size: 11,
    font: helvetica,
    color: rgb(1, 0.9, 0.95),
  });

  // 3 Colorful feature cards
  const cardColors = [
    rgb(0.1, 0.55, 0.9), // Azure Blue
    rgb(0.05, 0.7, 0.4), // Jade Green
    rgb(0.95, 0.6, 0.05), // Sunset Orange
  ];
  const cardTitles = ['CETAK KILAT 24 JAM', 'JILID HARDCOVER', 'HEMAT HINGGA 40%'];
  const cardDesc = [
    'Mesin mutakhir tanpa antre',
    'Hasil rapi emboss emas/perak',
    'Pisah halaman warna otomatis',
  ];

  for (let c = 0; c < 3; c++) {
    const cardY = 530 - c * 90;
    page6.drawRectangle({
      x: 60,
      y: cardY,
      width: 475,
      height: 72,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: cardColors[c],
      borderWidth: 2,
    });
    page6.drawRectangle({
      x: 60,
      y: cardY,
      width: 12,
      height: 72,
      color: cardColors[c],
    });
    page6.drawText(cardTitles[c], {
      x: 88,
      y: cardY + 45,
      size: 12,
      font: helveticaBold,
      color: cardColors[c],
    });
    page6.drawText(cardDesc[c], {
      x: 88,
      y: cardY + 22,
      size: 10,
      font: helvetica,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await pdfDoc.save();
}
