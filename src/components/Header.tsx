import React from 'react';
import { Camera, Download, Upload, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  onOpenLiveCamera: () => void;
  onUploadPhoto: () => void;
  onSelectSample: () => void;
  onReset: () => void;
  onExport: () => void;
  isExporting: boolean;
  isLiveTime: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLiveCamera,
  onUploadPhoto,
  onSelectSample,
  onReset,
  onExport,
  isExporting,
  isLiveTime,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-md shadow-sky-500/20">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                TimeMark <span className="text-sky-600">Pro</span>
              </span>
              <Badge variant="emerald" className="hidden sm:inline-flex text-[10px] px-2 py-0.5">
                Custom Layers
              </Badge>
              {isLiveTime && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Time
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-slate-500">
              Kamera & Stempel Watermark GPS Bebas Geser, Waktu Manual, dan Cuaca
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Preset Sample button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectSample}
            className="hidden sm:inline-flex text-xs border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            Contoh Foto
          </Button>

          {/* Upload Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadPhoto}
            className="text-xs border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5 text-sky-600" />
            <span className="hidden sm:inline">Unggah Foto</span>
            <span className="sm:hidden">Unggah</span>
          </Button>

          {/* Camera Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenLiveCamera}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Kamera Langsung</span>
            <span className="sm:hidden">Kamera</span>
          </Button>

          {/* Reset */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            title="Reset Pengaturan"
            className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Export HD */}
          <Button
            variant="default"
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="text-xs font-semibold px-4 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {isExporting ? 'Memproses...' : 'Simpan Foto HD'}
          </Button>
        </div>
      </div>
    </header>
  );
};
