import React, { useRef, useState } from 'react';
import { TimemarkState, LayerId } from '@/types/timemark';
import { Header } from '@/components/Header';
import { PhotoPreview } from '@/components/PhotoPreview';
import { EditorPanels } from '@/components/EditorPanels';
import { LayerSidebar } from '@/components/LayerSidebar';
import { CameraCaptureModal } from '@/components/CameraCaptureModal';
import { SamplePhotoModal } from '@/components/SamplePhotoModal';
import { ExportModal } from '@/components/ExportModal';
import { extractExifFromBlob } from '@/lib/exifReader';
import { reverseGeocode, fetchWeatherData } from '@/lib/geoService';
import { CheckCircle2 } from 'lucide-react';

// Exact layer layout matching the user's reference image
const REFERENCE_LAYERS: TimemarkState['layers'] = {
  minimap: {
    id: 'minimap',
    name: 'Peta Mini (Maps)',
    category: 'visual',
    enabled: true,
    x: 2,
    y: 3,
    fontSize: 12,
    textColor: '#1e293b',
    bgStyle: 'none',
    bgOpacity: 100,
    width: 180,
    height: 145,
  },
  logo: {
    id: 'logo',
    name: 'Logo Perusahaan (MAI)',
    category: 'visual',
    enabled: true,
    x: 3,
    y: 49,
    fontSize: 16,
    textColor: '#2563eb',
    bgStyle: 'none',
    bgOpacity: 100,
    width: 92,
    height: 92,
  },
  accentBar: {
    id: 'accentBar',
    name: 'Bar Vertikal Merah',
    category: 'visual',
    enabled: true,
    x: 2.2,
    y: 70,
    fontSize: 14,
    textColor: '#dc2626',
    bgStyle: 'none',
    bgOpacity: 100,
    accentColor: '#dc2626',
    width: 6,
    height: 110,
  },
  timestamp: {
    id: 'timestamp',
    name: 'Waktu & Tanggal',
    category: 'content',
    enabled: true,
    x: 4.5,
    y: 70,
    fontSize: 24,
    textColor: '#ffffff',
    bgStyle: 'none',
    bgOpacity: 0,
  },
  location: {
    id: 'location',
    name: 'Alamat & Lokasi',
    category: 'content',
    enabled: true,
    x: 4.5,
    y: 76,
    fontSize: 20,
    textColor: '#ffffff',
    bgStyle: 'none',
    bgOpacity: 0,
  },
  coordinate: {
    id: 'coordinate',
    name: 'Koordinat GPS',
    category: 'content',
    enabled: true,
    x: 4.5,
    y: 86.5,
    fontSize: 18,
    textColor: '#ffffff',
    bgStyle: 'none',
    bgOpacity: 0,
  },
  photoCode: {
    id: 'photoCode',
    name: 'Kode Foto (Photo Code)',
    category: 'security',
    enabled: true,
    x: 4.5,
    y: 93.5,
    fontSize: 16,
    textColor: '#ffffff',
    bgStyle: 'none',
    bgOpacity: 0,
  },
  branding: {
    id: 'branding',
    name: 'Watermark Timemark',
    category: 'visual',
    enabled: true,
    x: 86,
    y: 91,
    fontSize: 14,
    textColor: '#ffffff',
    bgStyle: 'none',
    bgOpacity: 0,
  },
  verticalWatermark: {
    id: 'verticalWatermark',
    name: 'Watermark Tepi Vertikal',
    category: 'security',
    enabled: true,
    x: 97.6,
    y: 18,
    fontSize: 15,
    textColor: '#ffffff',
    bgStyle: 'none',
    bgOpacity: 0,
  },
  weather: {
    id: 'weather',
    name: 'Cuaca & Suhu',
    category: 'content',
    enabled: false,
    x: 52,
    y: 77,
    fontSize: 15,
    textColor: '#f59e0b',
    bgStyle: 'glass-dark',
    bgOpacity: 75,
  },
  metadata: {
    id: 'metadata',
    name: 'Catatan & Proyek',
    category: 'content',
    enabled: false,
    x: 4,
    y: 4,
    fontSize: 15,
    textColor: '#ffffff',
    bgStyle: 'glass-dark',
    bgOpacity: 75,
  },
};

const INITIAL_STATE: TimemarkState = {
  timestamp: {
    mode: 'manual',
    customDate: '2026-10-01',
    customTime: '14:34:00',
    timezone: 'WIB',
    dateFormat: 'DAY_DD_MON_YYYY',
    timeFormat: '24h',
    showDayOfWeek: true,
    showSeconds: false,
    showTimezone: false,
  },
  location: {
    placeName: '',
    address: 'Jalan Letnan Jenderal MT Haryono, South Jakarta, Jakarta',
    city: 'South Jakarta',
    country: 'Indonesia',
    showPlaceName: false,
    showAddress: true,
    showCity: true,
    isManuallyEdited: true,
  },
  coordinate: {
    enabled: true,
    latitude: -6.243186,
    longitude: 106.848920,
    altitude: 18,
    accuracy: 4,
    format: 'decimal',
    showAltitude: false,
    showAccuracy: false,
  },
  weather: {
    enabled: false,
    condition: 'partly_cloudy',
    temperature: 31,
    humidity: 72,
    windSpeed: '12 km/h',
    airQuality: 'AQI 35 (Baik)',
    showTemperature: true,
    showHumidity: true,
    showAirQuality: true,
  },
  metadata: {
    projectName: 'Pertemuan Rapat Kerja AKHLAK',
    authorName: 'Fattah Herawanto',
    notes: 'Pembahasan progres implementasi proyek lapangan.',
    badgeType: 'none',
    customBadgeText: 'TIMEMARK VERIFIED',
  },
  minimap: {
    streetName: 'JALAN TEBET BARAT',
    style: 'apple-maps',
    showRadarCone: true,
    showPin: true,
  },
  logo: {
    type: 'circular_badge',
    text: 'MAI',
    primaryColor: '#2563eb',
    secondaryColor: '#dc2626',
    size: 92,
  },
  photoCode: {
    code: '3DCCRBEMM2TE9U',
    showShieldIcon: true,
    showPrefix: true,
  },
  branding: {
    prefix: 'Photo by',
    brandName: 'Time',
    brandSuffix: 'mark',
    suffixColor: '#facc15',
  },
  verticalWatermark: {
    text: '© 3DCCRBEMM2TE9U Timemark Verified',
  },
  layers: REFERENCE_LAYERS,
  selectedLayerId: null,
  globalFontFamily: 'Plus Jakarta Sans',
  globalScale: 1.0,
  theme: 'light',
};

export function App() {
  const [state, setState] = useState<TimemarkState>(INITIAL_STATE);
  const [photoSrc, setPhotoSrc] = useState<string>('/samples/meeting_timemark.jpg');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Toggle single layer
  const handleToggleLayer = (id: LayerId, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      layers: {
        ...prev.layers,
        [id]: {
          ...prev.layers[id],
          enabled,
        },
      },
    }));
  };

  // Select layer
  const handleSelectLayer = (id: LayerId | null) => {
    setState((prev) => ({
      ...prev,
      selectedLayerId: id === null || prev.selectedLayerId === id ? null : id,
    }));
  };

  // Update position of a specific layer
  const handleUpdateLayerPosition = (id: LayerId, x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      layers: {
        ...prev.layers,
        [id]: {
          ...prev.layers[id],
          x,
          y,
        },
      },
    }));
  };

  // Reset layer positions
  const handleResetPositions = () => {
    setState((prev) => ({
      ...prev,
      layers: REFERENCE_LAYERS,
    }));
    setNotification('Posisi semua layer berhasil dikembalikan ke posisi awal.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Apply reference photo layout 1-click
  const handleApplyReferenceLayout = () => {
    setState((prev) => ({
      ...prev,
      timestamp: {
        ...prev.timestamp,
        mode: 'manual',
        customDate: '2026-10-01',
        customTime: '14:34:00',
        dateFormat: 'DAY_DD_MON_YYYY',
        timeFormat: '24h',
        showSeconds: false,
      },
      location: {
        ...prev.location,
        address: 'Jalan Letnan Jenderal MT Haryono, South Jakarta, Jakarta',
        showPlaceName: false,
        showAddress: true,
      },
      coordinate: {
        ...prev.coordinate,
        latitude: -6.243186,
        longitude: 106.848920,
        format: 'decimal',
      },
      minimap: {
        streetName: 'JALAN TEBET BARAT',
        style: 'apple-maps',
        showRadarCone: true,
        showPin: true,
      },
      logo: {
        type: 'circular_badge',
        text: 'MAI',
        primaryColor: '#2563eb',
        secondaryColor: '#dc2626',
        size: 92,
      },
      photoCode: {
        code: '3DCCRBEMM2TE9U',
        showShieldIcon: true,
        showPrefix: true,
      },
      verticalWatermark: {
        text: '© 3DCCRBEMM2TE9U Timemark Verified',
      },
      layers: REFERENCE_LAYERS,
    }));
    setPhotoSrc('/samples/meeting_timemark.jpg');
    setNotification('Layout dan konten disesuaikan seperti foto contoh!');
    setTimeout(() => setNotification(null), 3500);
  };

  // Process uploaded file
  const processImageFile = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          setPhotoSrc(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Check EXIF
      const exif = await extractExifFromBlob(file);
      if (exif.hasExif) {
        let msg = 'Foto berhasil dimuat!';

        if (exif.date) {
          const d = exif.date;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          const ss = String(d.getSeconds()).padStart(2, '0');

          setState((prev) => ({
            ...prev,
            timestamp: {
              ...prev.timestamp,
              mode: 'manual',
              customDate: `${y}-${m}-${day}`,
              customTime: `${hh}:${mm}:${ss}`,
            },
          }));
          msg += ` Waktu EXIF asli (${day}/${m}/${y} ${hh}:${mm}) terdeteksi.`;
        }

        if (exif.latitude !== undefined && exif.longitude !== undefined) {
          setState((prev) => ({
            ...prev,
            coordinate: {
              ...prev.coordinate,
              latitude: exif.latitude!,
              longitude: exif.longitude!,
              altitude: exif.altitude ? Math.round(exif.altitude) : prev.coordinate.altitude,
            },
          }));

          const geo = await reverseGeocode(exif.latitude, exif.longitude);
          setState((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              placeName: geo.placeName,
              address: geo.address,
              city: geo.city,
              country: geo.country,
              isManuallyEdited: false,
            },
            minimap: {
              ...prev.minimap,
              streetName: geo.placeName,
            },
          }));
          msg += ` Lokasi GPS foto (${geo.city}) berhasil diterapkan.`;

          const weather = await fetchWeatherData(exif.latitude, exif.longitude);
          setState((prev) => ({
            ...prev,
            weather: {
              ...prev.weather,
              condition: weather.condition,
              temperature: weather.temperature,
              humidity: weather.humidity,
            },
          }));
        }

        setNotification(msg);
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification('Foto berhasil dimuat. Siap diberi watermark!');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleCapturePhoto = (dataUrl: string) => {
    setPhotoSrc(dataUrl);
    setNotification('Foto kamera berhasil diambil!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectSamplePreset = (
    dataUrl: string,
    sampleData?: Partial<TimemarkState>
  ) => {
    setPhotoSrc(dataUrl);
    if (sampleData) {
      setState((prev) => ({
        ...prev,
        ...sampleData,
      }));
    }
    setNotification('Preset contoh berhasil dimuat!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-sky-500/20">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <Header
        onOpenLiveCamera={() => setIsCameraOpen(true)}
        onUploadPhoto={() => fileInputRef.current?.click()}
        onSelectSample={() => setIsSampleModalOpen(true)}
        onReset={() => setState(INITIAL_STATE)}
        onExport={() => setIsExportModalOpen(true)}
        isExporting={false}
        isLiveTime={state.timestamp.mode === 'live'}
      />

      {/* Notification Toast Banner */}
      {notification && (
        <div className="mx-auto mt-3 max-w-2xl px-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-sky-300 p-3 text-xs text-sky-900 shadow-md">
            <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Main 3-Column Workspace Layout */}
      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col lg:flex-row gap-4 p-3 sm:p-5 lg:p-6">
        {/* Left Column: Dedicated Layer Sidebar with On/Off Toggles */}
        <LayerSidebar
          state={state}
          onToggleLayer={handleToggleLayer}
          onSelectLayer={handleSelectLayer}
          onResetPositions={handleResetPositions}
          onApplyReferenceLayout={handleApplyReferenceLayout}
        />

        {/* Center Column: Photo Preview Canvas with direct interactive dragging */}
        <section className="flex-1 flex flex-col min-w-0">
          <PhotoPreview
            imageSrc={photoSrc}
            state={state}
            onUpdateLayerPosition={handleUpdateLayerPosition}
            onSelectLayer={handleSelectLayer}
            onResetPositions={handleResetPositions}
            onDropPhoto={processImageFile}
            canvasRef={canvasRef}
          />
        </section>

        {/* Right Column: Detail Content & Styling Editor Panels */}
        <section className="w-full lg:w-[360px] shrink-0 flex flex-col">
          <EditorPanels state={state} onChange={setState} />
        </section>
      </main>

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
        state={state}
      />

      {/* Preset Samples Modal */}
      <SamplePhotoModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectPhoto={handleSelectSamplePreset}
      />

      {/* Export & Download HD Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvas={canvasRef.current}
      />
    </div>
  );
}

export default App;
