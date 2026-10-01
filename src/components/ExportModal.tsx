import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Download, Copy, Share2, Check, FileImage } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvas,
}) => {
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState<number>(0.95);
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `TIMEMARK_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  });

  if (!isOpen || !canvas) return null;

  const dataUrl = canvas.toDataURL(
    format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg',
    quality
  );

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${filename || 'timemark_photo'}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleCopyClipboard = async () => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch (e) {
      console.warn('Copy to clipboard failed:', e);
    }
  };

  const handleWebShare = async () => {
    if (!navigator.share) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${filename}.${format}`, {
          type: blob.type,
        });
        await navigator.share({
          files: [file],
          title: 'TimeMark Pro Photo',
          text: 'Foto terverifikasi dengan stempel watermark GPS & Timestamp.',
        });
      }, `image/${format}`);
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white border-slate-200 text-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileImage className="h-5 w-5 text-sky-600" />
            Ekspor & Simpan Foto Watermark HD
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Foto akan diekspor dalam resolusi penuh asli ({canvas.width} × {canvas.height} px)
          </DialogDescription>
        </DialogHeader>

        {/* Thumbnail Preview */}
        <div className="relative my-2 max-h-48 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
          <img
            src={dataUrl}
            alt="Export Preview"
            className="max-h-44 w-auto object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Options */}
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-700 font-semibold">Nama Berkas</Label>
            <div className="flex items-center gap-2">
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="bg-white border-slate-300 text-sm font-mono text-slate-800"
              />
              <span className="text-xs text-slate-500 font-mono">.{format}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700 font-semibold">Format Gambar</Label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              >
                <option value="jpeg">JPEG (Kualitas Tajam & Ringan)</option>
                <option value="png">PNG (Lossless / Tanpa Kompresi)</option>
                <option value="webp">WebP (Ukuran Berkas Paling Ringkas)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-700 font-semibold">Kualitas Ekspor</Label>
              <select
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                disabled={format === 'png'}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 shadow-sm"
              >
                <option value={1.0}>100% (Maksimal)</option>
                <option value={0.95}>95% (Sangat Tinggi / Rekomendasi)</option>
                <option value={0.85}>85% (Optimal Ukuran Berkas)</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          {navigator.clipboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyClipboard}
              className="border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Salin Gambar
                </>
              )}
            </Button>
          )}

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWebShare}
              className="border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5 text-sky-600" />
              Bagikan
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="text-xs font-semibold px-5 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Unduh Berkas Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
