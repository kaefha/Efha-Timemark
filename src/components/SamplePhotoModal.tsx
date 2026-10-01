import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { createSamplePhoto } from '@/lib/sampleImages';
import { TimemarkState } from '@/types/timemark';
import { HardHat, Compass, Briefcase, Mountain } from 'lucide-react';

interface SamplePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (dataUrl: string, sampleData?: Partial<TimemarkState>) => void;
}

export const SamplePhotoModal: React.FC<SamplePhotoModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
}) => {
  const samples = [
    {
      id: 'construction',
      title: 'Proyek Konstruksi & Sipil',
      subtitle: 'Inspeksi Cor Plat Lantai & Struktur Bangunan',
      icon: HardHat,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      data: {
        location: {
          placeName: 'Proyek MRT Bundaran HI Fase 2',
          address: 'Jl. M.H. Thamrin No. 1, Menteng, Jakarta Pusat',
          city: 'Jakarta Pusat',
          country: 'Indonesia',
          showPlaceName: true,
          showAddress: true,
          showCity: true,
          isManuallyEdited: false,
        },
        coordinate: {
          enabled: true,
          latitude: -6.195000,
          longitude: 106.823000,
          altitude: 18,
          accuracy: 4,
          format: 'dms' as const,
          showAltitude: true,
          showAccuracy: true,
        },
        metadata: {
          projectName: 'Pembangunan Stasiun MRT Bawah Tanah',
          authorName: 'Fattah Herawanto (Site Inspector)',
          notes: 'Pengecoran struktur kolom utama selesai sesuai spesifikasi.',
          badgeType: 'verified_gps' as const,
          customBadgeText: 'SAFETY FIRST',
        },
      },
    },
    {
      id: 'survey',
      title: 'Survei Geodesi & Lapangan',
      subtitle: 'Pengukuran Titik Nol & Kontur Tanah IKN',
      icon: Compass,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      data: {
        location: {
          placeName: 'Titik Nol Nusantara, KIPP',
          address: 'Kec. Sepaku, Kab. Penajam Paser Utara, Kaltim',
          city: 'Nusantara',
          country: 'Indonesia',
          showPlaceName: true,
          showAddress: true,
          showCity: true,
          isManuallyEdited: false,
        },
        coordinate: {
          enabled: true,
          latitude: -0.966700,
          longitude: 116.708900,
          altitude: 72,
          accuracy: 2,
          format: 'dms' as const,
          showAltitude: true,
          showAccuracy: true,
        },
        metadata: {
          projectName: 'Pemetaan Trase Jalan Tol IKN Seksi 3A',
          authorName: 'Tim Surveyor BPN',
          notes: 'Bench Mark (BM) stabil, deviasi koordinat dalam toleransi < 2cm.',
          badgeType: 'verified_gps' as const,
          customBadgeText: 'GEODESY AUDIT',
        },
      },
    },
    {
      id: 'office',
      title: 'Presensi / Absensi Karyawan',
      subtitle: 'Check-in Kehadiran Kerja dengan Verifikasi Lokasi',
      icon: Briefcase,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      data: {
        location: {
          placeName: 'Kantor Pusat Menara Astra',
          address: 'Jl. Jend. Sudirman Kav. 5-6, Karet Tengsin, Jakarta Pusat',
          city: 'Jakarta Pusat',
          country: 'Indonesia',
          showPlaceName: true,
          showAddress: true,
          showCity: true,
          isManuallyEdited: false,
        },
        coordinate: {
          enabled: true,
          latitude: -6.208800,
          longitude: 106.821800,
          altitude: 24,
          accuracy: 5,
          format: 'decimal' as const,
          showAltitude: false,
          showAccuracy: true,
        },
        metadata: {
          projectName: 'Presensi Shift Pagi',
          authorName: 'Fattah Herawanto (Emp: 92841)',
          notes: 'Hadir tepat waktu di lokasi kantor terdaftar.',
          badgeType: 'verified_gps' as const,
          customBadgeText: 'PRESENSI OK',
        },
      },
    },
    {
      id: 'travel',
      title: 'Inspeksi Alam & Konservasi',
      subtitle: 'Monitoring Wilayah Konsesi & Patroli Hutan',
      icon: Mountain,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      data: {
        location: {
          placeName: 'Puncak Jalur Gunung Bromo',
          address: 'Taman Nasional Bromo Tengger Semeru, Jawa Timur',
          city: 'Pasuruan',
          country: 'Indonesia',
          showPlaceName: true,
          showAddress: true,
          showCity: true,
          isManuallyEdited: false,
        },
        coordinate: {
          enabled: true,
          latitude: -7.942494,
          longitude: 112.953011,
          altitude: 2329,
          accuracy: 3,
          format: 'dms' as const,
          showAltitude: true,
          showAccuracy: true,
        },
        metadata: {
          projectName: 'Patroli Konservasi Kawasan',
          authorName: 'Ranger Taman Nasional',
          notes: 'Kondisi jalur bersih dan rambu navigasi lengkap.',
          badgeType: 'safety_first' as const,
          customBadgeText: 'SAFETY FIRST',
        },
      },
    },
  ];

  const handlePick = (item: (typeof samples)[0]) => {
    const dataUrl = createSamplePhoto(item.id as any);
    onSelectPhoto(dataUrl, item.data as any);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white border-slate-200 text-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Pilih Foto & Skenario Contoh
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Pilih salah satu contoh skenario foto di bawah untuk langsung mencoba watermark kustom.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {samples.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handlePick(item)}
                className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2.5 rounded-lg border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>📍 {item.data.location.city}</span>
                  <span className="text-sky-600 font-medium group-hover:underline">
                    Gunakan Preset →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
