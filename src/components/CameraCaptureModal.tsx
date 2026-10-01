import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';
import { TimemarkState } from '@/types/timemark';
import { formatDateString, formatTimeString } from '@/lib/formatters';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  state: TimemarkState;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  state,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setErrorMessage(null);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setErrorMessage(
          'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.'
        );
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Flip camera (front/back)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Shutter action
  const handleShutter = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setFlashActive(true);

    setTimeout(() => {
      setFlashActive(false);
    }, 150);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(dataUrl);
      onClose();
    }
    setIsCapturing(false);
  };

  if (!isOpen) return null;

  const now = new Date();
  const timeStr = formatTimeString(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    '24h',
    true,
    'WIB'
  );
  const dateStr = formatDateString(now, 'DD MMMM YYYY', true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col h-full max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white text-sm">
              Kamera Langsung TimeMark
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFacingMode}
              title="Ganti Kamera Depan/Belakang"
              className="h-8 w-8 text-slate-300 border-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {flashActive && (
            <div className="absolute inset-0 z-40 bg-white transition-opacity duration-150 pointer-events-none" />
          )}

          {errorMessage ? (
            <div className="p-6 text-center text-red-400 max-w-md">
              <p className="font-medium text-sm mb-2">{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFacingMode((prev) => prev)}
                className="mt-3 text-xs"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          )}

          {/* Real-time Viewfinder Watermark Overlay */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none rounded-xl bg-black/60 backdrop-blur-md border border-white/10 p-3 max-w-sm text-white">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {timeStr}
            </div>
            <div className="text-[11px] text-slate-300 font-medium">{dateStr}</div>
            <div className="text-[11px] text-slate-400 truncate">
              📍 {state.location.placeName || 'Lokasi GPS'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {state.coordinate.latitude.toFixed(5)}, {state.coordinate.longitude.toFixed(5)}
            </div>
          </div>

          {/* Grid lines overlay */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>
        </div>

        {/* Shutter controls footer */}
        <div className="flex items-center justify-center p-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={handleShutter}
            disabled={isCapturing || !!errorMessage}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-red-600 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <div className="h-11 w-11 rounded-full bg-white transition-transform group-hover:scale-90" />
          </button>
        </div>
      </div>
    </div>
  );
};
