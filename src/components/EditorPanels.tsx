import React, { useState } from 'react';
import {
  TimemarkState,
  LayerId,
} from '@/types/timemark';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import {
  Clock,
  MapPin,
  Palette,
  LocateFixed,
  RefreshCw,
  Type,
  Map as MapIcon,
  Award,
  ShieldCheck,
  Tag,
  Dices,
} from 'lucide-react';
import {
  getCurrentCoordinates,
  reverseGeocode,
  fetchWeatherData,
} from '@/lib/geoService';

interface EditorPanelsProps {
  state: TimemarkState;
  onChange: React.Dispatch<React.SetStateAction<TimemarkState>>;
}

export const EditorPanels: React.FC<EditorPanelsProps> = ({
  state,
  onChange,
}) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Helper updates
  const updateTimestamp = (updates: Partial<TimemarkState['timestamp']>) => {
    onChange((prev) => ({
      ...prev,
      timestamp: { ...prev.timestamp, ...updates },
    }));
  };

  const updateLocation = (updates: Partial<TimemarkState['location']>) => {
    onChange((prev) => ({
      ...prev,
      location: { ...prev.location, ...updates },
    }));
  };

  const updateCoordinate = (
    updates: Partial<TimemarkState['coordinate']>,
    autoSyncLocation = true
  ) => {
    onChange((prev) => {
      const nextCoord = { ...prev.coordinate, ...updates };

      // Requirement 5: Auto-sync location if user hasn't locked text
      if (
        autoSyncLocation &&
        !prev.location.isManuallyEdited &&
        (updates.latitude !== undefined || updates.longitude !== undefined)
      ) {
        const lat = nextCoord.latitude;
        const lng = nextCoord.longitude;

        reverseGeocode(lat, lng).then((geo) => {
          onChange((current) => {
            if (current.location.isManuallyEdited) return current;
            return {
              ...current,
              location: {
                ...current.location,
                placeName: geo.placeName,
                address: geo.address,
                city: geo.city,
                country: geo.country,
              },
            };
          });
        });
      }

      return {
        ...prev,
        coordinate: nextCoord,
      };
    });
  };

  const updateWeather = (updates: Partial<TimemarkState['weather']>) => {
    onChange((prev) => ({
      ...prev,
      weather: { ...prev.weather, ...updates },
    }));
  };

  const updateMinimap = (updates: Partial<TimemarkState['minimap']>) => {
    onChange((prev) => ({
      ...prev,
      minimap: { ...prev.minimap, ...updates },
    }));
  };

  const updateLogo = (updates: Partial<TimemarkState['logo']>) => {
    onChange((prev) => ({
      ...prev,
      logo: { ...prev.logo, ...updates },
    }));
  };

  const updatePhotoCode = (updates: Partial<TimemarkState['photoCode']>) => {
    onChange((prev) => ({
      ...prev,
      photoCode: { ...prev.photoCode, ...updates },
    }));
  };

  const updateBranding = (updates: Partial<TimemarkState['branding']>) => {
    onChange((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...updates },
    }));
  };

  const updateVerticalWatermark = (updates: Partial<TimemarkState['verticalWatermark']>) => {
    onChange((prev) => ({
      ...prev,
      verticalWatermark: { ...prev.verticalWatermark, ...updates },
    }));
  };

  const updateLayer = (id: LayerId, updates: Partial<TimemarkState['layers'][LayerId]>) => {
    onChange((prev) => ({
      ...prev,
      layers: {
        ...prev.layers,
        [id]: {
          ...prev.layers[id],
          ...updates,
        },
      },
    }));
  };

  // Generate random Photo Code
  const handleGenerateRandomCode = () => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 14; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updatePhotoCode({ code: result });
    updateVerticalWatermark({ text: `© ${result} Timemark Verified` });
  };

  // Re-sync location from coordinates
  const handleForceSyncLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const geo = await reverseGeocode(
        state.coordinate.latitude,
        state.coordinate.longitude
      );
      updateLocation({
        placeName: geo.placeName,
        address: geo.address,
        city: geo.city,
        country: geo.country,
        isManuallyEdited: false,
      });
      updateMinimap({ streetName: geo.placeName });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Auto-detect GPS
  const handleDetectGPS = async () => {
    try {
      setIsDetectingLocation(true);
      const coords = await getCurrentCoordinates();

      updateCoordinate(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: coords.altitude,
          accuracy: coords.accuracy,
        },
        false
      );

      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      updateLocation({
        placeName: geo.placeName,
        address: geo.address,
        city: geo.city,
        country: geo.country,
        isManuallyEdited: false,
      });
      updateMinimap({ streetName: geo.placeName });

      const w = await fetchWeatherData(coords.latitude, coords.longitude);
      updateWeather({
        condition: w.condition,
        temperature: w.temperature,
        humidity: w.humidity,
        windSpeed: w.windSpeed,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const activeLayerId = (state.selectedLayerId && state.layers?.[state.selectedLayerId])
    ? state.selectedLayerId
    : 'timestamp';
  const activeLayer = state.layers?.[activeLayerId] || {
    id: 'timestamp' as LayerId,
    name: 'Waktu & Tanggal',
    category: 'content' as const,
    enabled: true,
    x: 4.5,
    y: 70,
    fontSize: 24,
    textColor: '#ffffff',
    bgStyle: 'none' as const,
    bgOpacity: 0,
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <Tabs defaultValue="location_time" className="w-full">
        {/* Navigation Tabs */}
        <TabsList className="grid w-full grid-cols-3 gap-1 mb-4 p-1 bg-slate-100/90 border border-slate-200">
          <TabsTrigger value="location_time" className="flex items-center gap-1.5 py-1.5 text-xs font-semibold">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Waktu & Lokasi</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-1.5 py-1.5 text-xs font-semibold">
            <Award className="h-3.5 w-3.5 text-sky-600" />
            <span>Peta & Brand</span>
          </TabsTrigger>
          <TabsTrigger value="layer_styling" className="flex items-center gap-1.5 py-1.5 text-xs font-semibold">
            <Palette className="h-3.5 w-3.5 text-rose-600" />
            <span>Ukuran & Gaya</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. TAB: WAKTU & LOKASI & GPS */}
        <TabsContent value="location_time" className="space-y-4">
          {/* Timestamp section */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-600" />
                Format Waktu & Tanggal
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">
                  {state.timestamp.mode === 'live' ? 'Jam Live' : 'Manual'}
                </span>
                <Switch
                  checked={state.timestamp.mode === 'live'}
                  onCheckedChange={(c) => updateTimestamp({ mode: c ? 'live' : 'manual' })}
                />
              </div>
            </div>

            {state.timestamp.mode === 'manual' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-slate-600">Tanggal</Label>
                  <Input
                    type="date"
                    value={state.timestamp.customDate}
                    onChange={(e) => updateTimestamp({ customDate: e.target.value })}
                    className="bg-white border-slate-300 text-xs h-9"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600">Jam (HH:mm)</Label>
                  <Input
                    type="time"
                    step="1"
                    value={state.timestamp.customTime}
                    onChange={(e) => updateTimestamp({ customTime: e.target.value })}
                    className="bg-white border-slate-300 text-xs h-9"
                  />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <Label className="text-[11px] text-slate-600">Format Tanggal</Label>
                <select
                  value={state.timestamp.dateFormat}
                  onChange={(e) => updateTimestamp({ dateFormat: e.target.value as any })}
                  className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800"
                >
                  <option value="DAY_DD_MON_YYYY">Thurs, 01 Oct 2026 (Seperti Foto)</option>
                  <option value="DD MMMM YYYY">01 Oktober 2026</option>
                  <option value="DD/MM/YYYY">01/10/2026</option>
                  <option value="YYYY-MM-DD">2026-10-01</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] text-slate-600">Format Jam</Label>
                <select
                  value={state.timestamp.timeFormat}
                  onChange={(e) => updateTimestamp({ timeFormat: e.target.value as any })}
                  className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800"
                >
                  <option value="24h">24 Jam (14:34)</option>
                  <option value="12h">12 Jam (02:34 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & GPS Section */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Alamat & Lokasi
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDetectGPS}
                disabled={isDetectingLocation}
                className="h-7 text-xs border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              >
                <LocateFixed className="mr-1 h-3 w-3" />
                {isDetectingLocation ? 'Mendeteksi...' : 'GPS Otomatis'}
              </Button>
            </div>

            {/* Sync status alert */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              <span>
                {state.location.isManuallyEdited
                  ? '✏️ Teks dikunci manual'
                  : '✓ Sinkron otomatis dengan GPS'}
              </span>
              {state.location.isManuallyEdited && (
                <button
                  onClick={handleForceSyncLocation}
                  className="text-sky-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="h-2.5 w-2.5" /> Sinkronkan Ulang
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-600">Alamat Lengkap</Label>
              <Textarea
                rows={2}
                value={state.location.address}
                onChange={(e) =>
                  updateLocation({
                    address: e.target.value,
                    isManuallyEdited: true,
                  })
                }
                placeholder="mis. Jalan Letnan Jenderal MT Haryono, South Jakarta, Jakarta"
                className="bg-white border-slate-300 text-xs text-slate-800"
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-slate-600">Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={state.coordinate.latitude}
                  onChange={(e) =>
                    updateCoordinate({ latitude: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white border-slate-300 font-mono text-xs h-8"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600">Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={state.coordinate.longitude}
                  onChange={(e) =>
                    updateCoordinate({ longitude: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white border-slate-300 font-mono text-xs h-8"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 2. TAB: PETA, LOGO & BRANDING */}
        <TabsContent value="branding" className="space-y-4">
          {/* Minimap Card */}
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapIcon className="h-3.5 w-3.5 text-sky-600" />
                Peta Mini (Apple Maps Snippet)
              </Label>
              <Switch
                checked={state.layers.minimap.enabled}
                onCheckedChange={(c) => updateLayer('minimap', { enabled: c })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-600">Nama Jalan pada Peta</Label>
              <Input
                value={state.minimap.streetName}
                onChange={(e) => updateMinimap({ streetName: e.target.value })}
                placeholder="mis. JALAN TEBET BARAT"
                className="bg-white border-slate-300 text-xs h-8"
              />
            </div>
          </div>

          {/* Logo Card */}
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-blue-600" />
                Logo Perusahaan (Bulat / MAI)
              </Label>
              <Switch
                checked={state.layers.logo.enabled}
                onCheckedChange={(c) => updateLayer('logo', { enabled: c })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-slate-600">Teks Logo</Label>
                <Input
                  value={state.logo.text}
                  onChange={(e) => updateLogo({ text: e.target.value })}
                  placeholder="MAI"
                  className="bg-white border-slate-300 text-xs h-8 font-bold"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600">Ukuran Logo (px)</Label>
                <Input
                  type="number"
                  min="40"
                  max="160"
                  value={state.layers.logo.width || 88}
                  onChange={(e) =>
                    updateLayer('logo', {
                      width: parseInt(e.target.value, 10) || 88,
                      height: parseInt(e.target.value, 10) || 88,
                    })
                  }
                  className="bg-white border-slate-300 text-xs h-8"
                />
              </div>
            </div>
          </div>

          {/* Photo Code Card */}
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Kode Verifikasi Foto (Photo Code)
              </Label>
              <Switch
                checked={state.layers.photoCode.enabled}
                onCheckedChange={(c) => updateLayer('photoCode', { enabled: c })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={state.photoCode.code}
                onChange={(e) => updatePhotoCode({ code: e.target.value })}
                className="bg-white border-slate-300 font-mono text-xs h-8 font-bold text-slate-800"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateRandomCode}
                className="h-8 text-xs border-slate-300 text-slate-700 bg-white shrink-0"
              >
                <Dices className="h-3.5 w-3.5 mr-1" />
                Acak
              </Button>
            </div>
          </div>

          {/* Branding Watermark Card */}
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-500" />
                Watermark Kanan Bawah (Photo by TimeMark)
              </Label>
              <Switch
                checked={state.layers.branding.enabled}
                onCheckedChange={(c) => updateLayer('branding', { enabled: c })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] text-slate-500">Awalan</Label>
                <Input
                  value={state.branding.prefix}
                  onChange={(e) => updateBranding({ prefix: e.target.value })}
                  className="bg-white border-slate-300 text-xs h-8"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500">Brand</Label>
                <Input
                  value={state.branding.brandName}
                  onChange={(e) => updateBranding({ brandName: e.target.value })}
                  className="bg-white border-slate-300 text-xs h-8 font-bold"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500">Suffix</Label>
                <Input
                  value={state.branding.brandSuffix}
                  onChange={(e) => updateBranding({ brandSuffix: e.target.value })}
                  className="bg-white border-slate-300 text-xs h-8 font-bold text-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Vertical Edge Watermark */}
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800">
                Watermark Tepi Vertikal Kanan
              </Label>
              <Switch
                checked={state.layers.verticalWatermark.enabled}
                onCheckedChange={(c) => updateLayer('verticalWatermark', { enabled: c })}
              />
            </div>
            <Input
              value={state.verticalWatermark.text}
              onChange={(e) => updateVerticalWatermark({ text: e.target.value })}
              className="bg-white border-slate-300 text-xs font-mono h-8"
            />
          </div>
        </TabsContent>

        {/* 3. TAB: UKURAN FONT & STYLE LAYER */}
        <TabsContent value="layer_styling" className="space-y-4">
          <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Kustomisasi: {activeLayer.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Atur ukuran font, warna, dan posisi persentase
                </p>
              </div>
              <Switch
                checked={activeLayer.enabled}
                onCheckedChange={(c) => updateLayer(activeLayerId, { enabled: c })}
              />
            </div>

            {/* Requirement 4: FONT SIZE SLIDER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Type className="h-3.5 w-3.5 text-sky-600" />
                  Ukuran Font (Font Size)
                </span>
                <span className="font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                  {activeLayer.fontSize} px
                </span>
              </div>
              <Slider
                min={12}
                max={54}
                step={1}
                value={[activeLayer.fontSize]}
                onValueChange={(vals) => updateLayer(activeLayerId, { fontSize: vals[0] })}
              />
            </div>

            {/* Text Color */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Warna Teks</Label>
              <div className="flex items-center gap-2">
                {[
                  { hex: '#ffffff', label: 'Putih (Seperti Foto)' },
                  { hex: '#0f172a', label: 'Hitam' },
                  { hex: '#facc15', label: 'Kuning' },
                  { hex: '#38bdf8', label: 'Sky' },
                  { hex: '#10b981', label: 'Emerald' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => updateLayer(activeLayerId, { textColor: c.hex })}
                    style={{ backgroundColor: c.hex }}
                    className={`h-7 w-7 rounded-full shadow border border-slate-300 transition-transform ${
                      activeLayer.textColor === c.hex ? 'ring-2 ring-sky-500 scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
                <Input
                  type="color"
                  value={activeLayer.textColor}
                  onChange={(e) => updateLayer(activeLayerId, { textColor: e.target.value })}
                  className="h-8 w-10 p-0.5 border-slate-300 bg-white rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Background Style */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Gaya Background</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: 'none', label: 'Tanpa Kotak (Drop Shadow)' },
                  { id: 'glass-dark', label: 'Dark Glass' },
                  { id: 'glass-light', label: 'White Glass' },
                  { id: 'pill', label: 'Pill Rounded' },
                  { id: 'solid-dark', label: 'Solid Hitam' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateLayer(activeLayerId, { bgStyle: b.id as any })}
                    className={`rounded-lg py-1.5 px-2 text-xs border text-center transition-all ${
                      activeLayer.bgStyle === b.id
                        ? 'border-sky-500 bg-white text-sky-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Precision Position inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-sky-100">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">Posisi X (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="95"
                  step="0.5"
                  value={activeLayer.x}
                  onChange={(e) =>
                    updateLayer(activeLayerId, { x: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white border-slate-300 font-mono text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-600">Posisi Y (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="95"
                  step="0.5"
                  value={activeLayer.y}
                  onChange={(e) =>
                    updateLayer(activeLayerId, { y: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white border-slate-300 font-mono text-xs h-8"
                />
              </div>
            </div>
          </div>

          {/* Global Font Picker */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Pilihan Font Global</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Kompak)' },
                { id: 'JetBrains Mono', label: 'JetBrains Mono (Digital)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onChange((prev) => ({ ...prev, globalFontFamily: f.id as any }))}
                  className={`rounded-lg py-1.5 px-2 text-xs border text-left transition-all ${
                    state.globalFontFamily === f.id
                      ? 'border-sky-500 bg-white text-sky-700 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
