import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  TimemarkState,
  LayerId,
} from '@/types/timemark';
import { renderTimemarkCanvas, LayerBounds } from '@/lib/canvasRenderer';
import { Button } from './ui/button';
import {
  ZoomIn,
  ZoomOut,
  Sparkles,
  Move,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface PhotoPreviewProps {
  imageSrc: string;
  state: TimemarkState;
  onUpdateLayerPosition: (id: LayerId, x: number, y: number) => void;
  onSelectLayer: (id: LayerId | null) => void;
  onResetPositions: () => void;
  onDropPhoto: (file: File) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  imageSrc,
  state,
  onUpdateLayerPosition,
  onSelectLayer,
  onResetPositions,
  onDropPhoto,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    w: number;
    h: number;
  }>({ w: 0, h: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  // Dragging state for layers
  const [draggingLayerId, setDraggingLayerId] = useState<LayerId | null>(null);
  const [dragOffset, setDragOffset] = useState<{ offsetX: number; offsetY: number }>({
    offsetX: 0,
    offsetY: 0,
  });
  const [layerBounds, setLayerBounds] = useState<LayerBounds[]>([]);
  const [hoveredLayerId, setHoveredLayerId] = useState<LayerId | null>(null);

  // Load image element
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    // Only set crossOrigin for remote absolute HTTP URLs to avoid local file CORS blocks
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      setImgElement(img);
      setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      console.warn('Failed to load imageSrc:', imageSrc, 'falling back to meeting_timemark.jpg');
      // If error occurs, try direct local fallback
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setImgElement(fallbackImg);
        setImageDimensions({ w: fallbackImg.naturalWidth, h: fallbackImg.naturalHeight });
      };
      fallbackImg.src = '/samples/meeting_timemark.jpg';
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Live tick effect if mode is live
  useEffect(() => {
    if (state.timestamp.mode !== 'live') return;
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [state.timestamp.mode]);

  // Render canvas & update bounds
  const updateCanvas = useCallback(() => {
    if (!canvasRef.current || !imgElement) return;
    const bounds = renderTimemarkCanvas({
      canvas: canvasRef.current,
      image: imgElement,
      state,
      overrideDate: state.timestamp.mode === 'live' ? new Date() : undefined,
      selectedLayerId: state.selectedLayerId,
    });
    setLayerBounds(bounds);
  }, [canvasRef, imgElement, state]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  // Convert client pointer event (mouse/touch) to canvas coordinates
  const getCanvasCoordinates = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  // Find layer at canvas coordinate
  const hitTestLayer = (x: number, y: number): LayerBounds | null => {
    // Check in reverse order so top-rendered layers are hit first
    for (let i = layerBounds.length - 1; i >= 0; i--) {
      const b = layerBounds[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        return b;
      }
    }
    return null;
  };

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (clientX: number, clientY: number) => {
    const coords = getCanvasCoordinates(clientX, clientY);
    if (!coords || !canvasRef.current) return;

    const hit = hitTestLayer(coords.x, coords.y);
    if (hit) {
      onSelectLayer(hit.id);
      setDraggingLayerId(hit.id);

      // Offset from layer's top-left to click position
      const layer = state.layers[hit.id];
      const layerPixelX = (layer.x / 100) * canvasRef.current.width;
      const layerPixelY = (layer.y / 100) * canvasRef.current.height;

      setDragOffset({
        offsetX: coords.x - layerPixelX,
        offsetY: coords.y - layerPixelY,
      });
    } else {
      onSelectLayer(null);
    }
  };

  // Pointer Move (Mouse or Touch)
  const handlePointerMove = (clientX: number, clientY: number) => {
    const coords = getCanvasCoordinates(clientX, clientY);
    if (!coords || !canvasRef.current) return;

    if (draggingLayerId) {
      const canvasW = canvasRef.current.width;
      const canvasH = canvasRef.current.height;

      const newPixelX = coords.x - dragOffset.offsetX;
      const newPixelY = coords.y - dragOffset.offsetY;

      // Convert to percentage
      const percentX = Math.max(0, Math.min(95, (newPixelX / canvasW) * 100));
      const percentY = Math.max(0, Math.min(95, (newPixelY / canvasH) * 100));

      onUpdateLayerPosition(
        draggingLayerId,
        parseFloat(percentX.toFixed(1)),
        parseFloat(percentY.toFixed(1))
      );
    } else {
      // Hover check
      const hit = hitTestLayer(coords.x, coords.y);
      setHoveredLayerId(hit ? hit.id : null);
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    setDraggingLayerId(null);
  };

  // Global mouseup window listener
  useEffect(() => {
    const handleGlobalUp = () => setDraggingLayerId(null);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  // Quick Corner Alignment for selected layer
  const alignSelectedLayer = (corner: 'bl' | 'br' | 'tl' | 'tr' | 'center') => {
    const id = state.selectedLayerId || 'timestamp';
    let x = 4;
    let y = 84;
    switch (corner) {
      case 'tl':
        x = 4;
        y = 5;
        break;
      case 'tr':
        x = 55;
        y = 5;
        break;
      case 'br':
        x = 55;
        y = 84;
        break;
      case 'center':
        x = 25;
        y = 45;
        break;
      case 'bl':
      default:
        x = 4;
        y = 84;
        break;
    }
    onUpdateLayerPosition(id, x, y);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        if (e.dataTransfer.files?.[0]) onDropPhoto(e.dataTransfer.files[0]);
      }}
      className={`relative flex flex-col items-center justify-between rounded-2xl border ${
        isDraggingFile
          ? 'border-sky-500 bg-sky-50/50'
          : 'border-slate-200 bg-white/95'
      } p-3 sm:p-5 shadow-xl transition-all overflow-hidden`}
    >
      {/* Top Floating Controls Bar */}
      <div className="flex w-full items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-700 font-mono">
            {imageDimensions.w > 0
              ? `${imageDimensions.w} × ${imageDimensions.h} px`
              : 'Memuat Foto...'}
          </Badge>
          {state.selectedLayerId && (
            <span className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Move className="h-3 w-3 text-sky-500" />
              Layer Aktif: <strong>{state.layers[state.selectedLayerId]?.name}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            title="Perkecil"
            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono text-slate-600 min-w-[2.8rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            title="Perbesar"
            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoomLevel(1)}
            title="Reset Ukuran"
            className="h-8 w-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            1:1
          </Button>
        </div>
      </div>

      {/* Main Canvas Viewport with Drag Support */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-auto py-3 min-h-[380px] sm:min-h-[500px]">
        {isDraggingFile && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-sky-500/90 backdrop-blur-sm border-2 border-dashed border-white text-white">
            <Sparkles className="h-10 w-10 animate-bounce mb-2" />
            <p className="font-bold text-lg">Lepas file foto di sini</p>
            <p className="text-xs opacity-90">Membaca EXIF Tanggal & GPS secara otomatis</p>
          </div>
        )}

        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: draggingLayerId ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full rounded-xl shadow-lg ring-1 ring-slate-200/80 overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handlePointerUp}
            style={{
              cursor: draggingLayerId
                ? 'grabbing'
                : hoveredLayerId
                ? 'grab'
                : 'default',
            }}
            className="block max-h-[70vh] w-auto max-w-full object-contain rounded-xl select-none"
          />
        </div>
      </div>

      {/* Interactive Layer Bar & Quick Controls */}
      <div className="flex w-full flex-col gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Layers className="h-3 w-3 text-sky-600" /> Layer:
            </span>
            {Object.keys(state.layers || {}).map((key) => {
              const id = key as LayerId;
              const layer = state.layers[id];
              if (!layer) return null;
              const isSelected = state.selectedLayerId === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectLayer(isSelected ? null : id)}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white font-semibold shadow-sm'
                      : layer.enabled
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-50 text-slate-400 line-through opacity-60'
                  }`}
                >
                  {layer.name}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetPositions}
            title="Reset Posisi Default"
            className="text-[11px] h-7 text-slate-500 hover:text-slate-800 shrink-0"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset Posisi
          </Button>
        </div>

        {/* Selected Layer Quick Alignment */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400">Pindah Cepat:</span>
            <button
              onClick={() => alignSelectedLayer('bl')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
            >
              Bawah Kiri
            </button>
            <button
              onClick={() => alignSelectedLayer('br')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
            >
              Bawah Kanan
            </button>
            <button
              onClick={() => alignSelectedLayer('tl')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
            >
              Atas Kiri
            </button>
            <button
              onClick={() => alignSelectedLayer('tr')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
            >
              Atas Kanan
            </button>
          </div>

          <span className="text-[11px] text-sky-700 font-medium hidden sm:inline">
            💡 Klik & Drag langsung watermark pada foto untuk memindahkannya
          </span>
        </div>
      </div>
    </div>
  );
};
