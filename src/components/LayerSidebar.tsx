import React from 'react';
import { TimemarkState, LayerId } from '@/types/timemark';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Layers,
  Map as MapIcon,
  Award,
  Clock,
  MapPin,
  Compass,
  ShieldCheck,
  Tag,
  AlignVerticalJustifyCenter,
  CloudSun,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface LayerSidebarProps {
  state: TimemarkState;
  onToggleLayer: (id: LayerId, enabled: boolean) => void;
  onSelectLayer: (id: LayerId) => void;
  onResetPositions: () => void;
  onApplyReferenceLayout: () => void;
}

export const LayerSidebar: React.FC<LayerSidebarProps> = ({
  state,
  onToggleLayer,
  onSelectLayer,
  onResetPositions,
  onApplyReferenceLayout,
}) => {
  const layerMeta: Record<
    LayerId,
    { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    minimap: {
      title: 'Peta Mini (Maps)',
      desc: 'Cuplikan peta Apple/Google Maps di sudut atas',
      icon: MapIcon,
    },
    logo: {
      title: 'Logo Perusahaan',
      desc: 'Logo bulat (MAI / Custom) di atas teks',
      icon: Award,
    },
    accentBar: {
      title: 'Bar Aksen Vertikal',
      desc: 'Garis vertikal merah di samping teks utama',
      icon: AlignVerticalJustifyCenter,
    },
    timestamp: {
      title: 'Waktu & Tanggal',
      desc: 'Thurs, 01 Oct 2026 14:34',
      icon: Clock,
    },
    location: {
      title: 'Alamat & Lokasi',
      desc: 'Jl. Letnan Jenderal MT Haryono...',
      icon: MapPin,
    },
    coordinate: {
      title: 'Koordinat GPS',
      desc: '-6.243186, 106.848920',
      icon: Compass,
    },
    photoCode: {
      title: 'Kode Foto (Photo Code)',
      desc: '🛡️ Photo Code: 3DCCRBEMM2TE9U',
      icon: ShieldCheck,
    },
    branding: {
      title: 'Watermark Timemark',
      desc: 'Photo by TimeMark di sudut kanan',
      icon: Tag,
    },
    verticalWatermark: {
      title: 'Watermark Tepi Vertikal',
      desc: 'Teks vertikal di tepi kanan foto',
      icon: AlignVerticalJustifyCenter,
    },
    weather: {
      title: 'Cuaca & Suhu',
      desc: 'Kondisi cuaca, suhu, kelembapan',
      icon: CloudSun,
    },
    metadata: {
      title: 'Catatan & Proyek',
      desc: 'Nama proyek dan pemeriksa lapangan',
      icon: FileText,
    },
  };

  const layersList: LayerId[] = [
    'minimap',
    'logo',
    'accentBar',
    'timestamp',
    'location',
    'coordinate',
    'photoCode',
    'branding',
    'verticalWatermark',
    'weather',
    'metadata',
  ];

  const activeCount = Object.values(state.layers || {}).filter((l) => l?.enabled).length;

  return (
    <aside className="flex flex-col w-full lg:w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Daftar Layer</h3>
            <p className="text-[11px] text-slate-500">Komponen Watermark</p>
          </div>
        </div>

        <Badge variant="outline" className="text-[11px] bg-slate-50 font-semibold text-slate-700">
          {activeCount}/{layersList.length} Aktif
        </Badge>
      </div>

      {/* 1-Click Match Reference Layout Button */}
      <Button
        variant="default"
        size="sm"
        onClick={onApplyReferenceLayout}
        className="w-full mb-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
        Terapkan Layout Seperti Contoh Foto
      </Button>

      {/* Layer Items List with Toggle Switches */}
      <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
        {layersList.map((id) => {
          const layer = state.layers?.[id] || { id, name: layerMeta[id].title, enabled: true };
          const meta = layerMeta[id];
          const isSelected = state.selectedLayerId === id;
          const Icon = meta.icon;

          return (
            <div
              key={id}
              onClick={() => onSelectLayer(id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/80 shadow-xs ring-1 ring-sky-300'
                  : layer.enabled
                  ? 'border-slate-200/80 bg-white hover:bg-slate-50'
                  : 'border-slate-100 bg-slate-50/60 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-sky-600 text-white'
                      : layer.enabled
                      ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-sky-900 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {meta.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{meta.desc}</p>
                </div>
              </div>

              {/* On/Off Switch */}
              <div
                className="shrink-0 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Switch
                  checked={layer.enabled}
                  onCheckedChange={(checked) => onToggleLayer(id, checked)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Reset */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">
          💡 Klik layer untuk kustomisasi
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetPositions}
          className="text-slate-600 hover:text-slate-900 text-xs h-7 px-2"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset Posisi
        </Button>
      </div>
    </aside>
  );
};
