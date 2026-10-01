# TimeMark Pro (Web-Based)

Aplikasi kamera dan stempel watermark **TimeMark Pro** berbasis web modern dengan antarmuka komponen **Shadcn UI**, Tailwind CSS, dan HTML5 Canvas 2D engine untuk kebutuhan dokumentasi proyek, survei geodesi, inspeksi lapangan, audit ISO/K3, dan presensi kerja.

---

## 🌟 Fitur Utama

### 1. 🕒 Manual & Live Timestamp (Waktu & Tanggal)
- **Mode Otomatis (Live)**: Waktu berjalan real-time detik demi detik secara otomatis.
- **Mode Manual**: Bebas mengatur tanggal (`YYYY-MM-DD`) dan waktu (`HH:mm:ss`) secara manual sesuai kebutuhan dokumentasi.
- **Tombol Pintas**: "Set Waktu Sekarang", "+1 Jam", "-1 Jam".
- **Zona Waktu Fleksibel**: Pilihan WIB (UTC+7), WITA (UTC+8), WIT (UTC+9), UTC, dan Lokal.
- **Format Tanggal**: `01 Oktober 2026`, `01/10/2026`, `2026-10-01`, `10/01/2026`.
- **Format Jam**: 24 Jam (`14:30:00`) dan 12 Jam (`02:30:00 PM`).
- **Opsi Tampilan**: Toggle tampilkan detik, nama hari dalam Bahasa Indonesia, dan label timezone.

### 2. 📍 Lokasi & Alamat Lengkap (Location)
- **Deteksi Otomatis GPS**: Mengambil koordinat perangkat dan melakukan *reverse geocoding* via OpenStreetMap Nominatim.
- **Edit Manual Bebas**: Nama tempat / proyek / landmark, alamat lengkap, kota, dan negara.
- **Preset Lokasi Cepat Indonesia**:
  - DKI Jakarta (Bundaran HI)
  - IKN Nusantara (Titik Nol KIPP)
  - Surabaya (Tunjungan)
  - Bandung (Gedung Sate)
  - Bali (Pantai Kuta)

### 3. 🌐 Koordinat GPS & Elevasi (Coordinate)
- **Dua Format Koordinat**:
  - Desimal: `-6.175392, 106.827153`
  - DMS (Derajat Menit Detik): `6°10'31.4"S 106°49'37.8"E`
- **Data Elevasi / Ketinggian**: Dalam satuan meter di atas permukaan laut (dpl).
- **Akurasi GPS**: Estimasi presisi sinyal GPS (± meter).
- **Switch Aktif/Nonaktif**: Pilih apakah koordinat ingin dicantumkan pada watermark atau tidak.

### 4. 🌤️ Cuaca & Lingkungan Real-Time (Weather)
- **Auto-Fetch Cuaca**: Mengambil suhu, kondisi, dan kelembapan live berdasarkan koordinat GPS melalui Open-Meteo API (tanpa perlu API key).
- **Input Manual & Slider**:
  - Pilihan kondisi: Cerah (☀️), Cerah Berawan (⛅), Berawan (☁️), Hujan (🌧️), Hujan Petir (⛈️), Berkabut (🌫️), Berangin (💨).
  - Slider Suhu Udara (-10°C s.d. 50°C).
  - Slider Kelembapan Udara (0% s.d. 100%).
  - Kecepatan Angin & Indeks Kualitas Udara (AQI).

### 5. 📋 Info Proyek & Lencana Verifikasi (Metadata & Audit)
- Nama Proyek / Kegiatan.
- Nama Petugas / Pengawas / Surveyor / Karyawan.
- Catatan Temuan Lapangan.
- Lencana Verifikasi Resmi:
  - `✓ GPS VERIFIED`
  - `★ SAFETY FIRST`
  - `● ISO AUDIT`
  - `TIMEMARK PRO`
  - Kustom Teks Lencana Sendiri.

### 6. 🎨 6 Pilihan Template Watermark (Style)
1. **Classic Timemark**: Format khas aplikasi TimeMark dengan jam besar tajam, aksen bar neon, tanggal, lokasi, dan koordinat.
2. **Engineering Stamp**: Format stempel resmi ganda khas dokumen gambar teknik & konstruksi sipil.
3. **Surveyor HUD**: Pill transparan modern dengan font monospaced digital untuk survei pemetaan.
4. **Modern Card**: Kartu *frosted glassmorphism* transparan elegan dengan tag cuaca dan lokasi.
5. **Presensi / HR**: Format absensi check-in karyawan dengan lencana terverifikasi.
6. **Minimal 2-Line**: Watermark ramping 2 baris untuk dokumentasi minimalis.

### 7. 📸 Kamera Langsung & Unggah Foto
- **Kamera Langsung**: Ambil foto langsung melalui webcam laptop atau kamera smartphone (depan & belakang) lengkap dengan live HUD watermark viewfinder.
- **Unggah Foto & Baca EXIF**: Unggah foto dari galeri/folder; jika foto memiliki metadata EXIF, tanggal asli dan koordinat GPS foto akan otomatis terdeteksi dan diisikan!
- **Preset Skenario Contoh**: 4 skenario siap pakai (Konstruksi, Survei Geodesi, Presensi Kantor, Konservasi Alam).

### 8. 💾 Ekspor Foto Kualitas HD
- Merender watermark langsung ke resolusi asli foto (hingga 4K / 12MP) tanpa buram.
- Pilihan format: **JPEG** (dengan slider kualitas 85%-100%), **PNG** (lossless), **WebP**.
- Salin langsung ke Clipboard (*Copy to Clipboard*).
- Bagikan via Web Share API pada perangkat mobile.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:5173/`.

2. **Build untuk Produksi**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🛠️ Teknologi yang Digunakan
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS dengan Dark Theme Palet Slate & Glassmorphism
- **Komponen UI**: Shadcn UI (Radix UI primitives: Tabs, Switch, Slider, Dialog, Select, Label, Button, Input)
- **Ikon**: Lucide React
- **Ekstraksi EXIF**: `exifr` (membaca GPS & datetime asli foto)
- **API Geocoding & Cuaca**: OpenStreetMap Nominatim & Open-Meteo API
- **Rendering Engine**: HTML5 Canvas 2D
