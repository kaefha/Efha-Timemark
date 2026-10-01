import {
  TimemarkState,
  LayerId,
  LayerConfig,
} from '@/types/timemark';
import {
  formatCoordinates,
  formatDateString,
  formatTimeString,
  getWeatherConditionName,
} from './formatters';

export interface LayerBounds {
  id: LayerId;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RenderOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  state: TimemarkState;
  overrideDate?: Date;
  selectedLayerId?: LayerId | null;
}

// Draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Generate Date object based on state
export function getActiveDate(state: TimemarkState): Date {
  if (state.timestamp.mode === 'live') {
    return new Date();
  }

  const dateParts = state.timestamp.customDate.split('-');
  const timeParts = state.timestamp.customTime.split(':');

  const year = parseInt(dateParts[0], 10) || 2026;
  const month = (parseInt(dateParts[1], 10) || 1) - 1;
  const day = parseInt(dateParts[2], 10) || 1;

  const hours = parseInt(timeParts[0], 10) || 12;
  const minutes = parseInt(timeParts[1], 10) || 0;
  const seconds = parseInt(timeParts[2], 10) || 0;

  return new Date(year, month, day, hours, minutes, seconds);
}

// Draw Minimap (Apple Maps / Modern GPS Map Snippet)
function drawMinimap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fm: number,
  streetName: string
) {
  ctx.save();
  // Card base
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, x, y, w, h, 14 * fm);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3 * fm;
  ctx.stroke();

  // Clip content inside rounded card
  ctx.save();
  roundRect(ctx, x, y, w, h, 14 * fm);
  ctx.clip();

  // Background map land
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x, y, w, h);

  // Secondary streets (grid)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6 * fm;
  ctx.beginPath();
  for (let gy = y; gy < y + h; gy += 28 * fm) {
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
  }
  for (let gx = x; gx < x + w; gx += 32 * fm) {
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
  }
  ctx.stroke();

  // Main highway / primary road (gray road like in Apple Maps)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 22 * fm;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.52);
  ctx.lineTo(x + w, y + h * 0.52);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 16 * fm;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.52);
  ctx.lineTo(x + w, y + h * 0.52);
  ctx.stroke();

  // Street Name Text
  ctx.fillStyle = '#475569';
  ctx.font = `bold ${Math.round(11 * fm)}px sans-serif`;
  ctx.fillText(streetName || 'JALAN TEBET BARAT', x + w * 0.28, y + h * 0.36);

  // Radar direction cone (semi-transparent cyan triangle)
  const pinX = x + w * 0.44;
  const pinY = y + h * 0.48;

  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.beginPath();
  ctx.moveTo(pinX, pinY);
  ctx.lineTo(pinX + 38 * fm, pinY - 44 * fm);
  ctx.lineTo(pinX + 54 * fm, pinY - 14 * fm);
  ctx.closePath();
  ctx.fill();

  // Location Pin Marker (Blue circle with white center and drop shadow)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 6 * fm;
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(pinX, pinY, 11 * fm, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pinX, pinY, 4.5 * fm, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // "Maps" logo at bottom left
  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${Math.round(12 * fm)}px -apple-system, sans-serif`;
  ctx.fillText(' Maps', x + 10 * fm, y + h - 10 * fm);

  ctx.restore();
  ctx.restore();
}

// Draw Circular Logo (e.g. "MAI" Badge with rings)
function drawCircularLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fm: number,
  text: string,
  primaryColor: string,
  secondaryColor: string,
  imageUrl?: string | null
) {
  ctx.save();
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // Outer red ring
  ctx.strokeStyle = secondaryColor || '#dc2626';
  ctx.lineWidth = 4 * fm;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 3 * fm, 0, Math.PI * 2);
  ctx.stroke();

  // Inner blue ring
  ctx.strokeStyle = primaryColor || '#2563eb';
  ctx.lineWidth = 3.5 * fm;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8 * fm, 0, Math.PI * 2);
  ctx.stroke();

  // White base
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 12 * fm, 0, Math.PI * 2);
  ctx.fill();

  // If custom image provided, draw it
  if (imageUrl) {
    const img = new Image();
    img.src = imageUrl;
    if (img.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 14 * fm, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, cx - r + 14 * fm, cy - r + 14 * fm, (r - 14 * fm) * 2, (r - 14 * fm) * 2);
      ctx.restore();
      ctx.restore();
      return;
    }
  }

  // Draw Logo Acronym (e.g. "MAI")
  ctx.fillStyle = primaryColor || '#1e3a8a';
  ctx.font = `900 ${Math.round(size * 0.34)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'MAI', cx, cy - 2 * fm);

  // Red swoosh curve over text
  ctx.strokeStyle = secondaryColor || '#dc2626';
  ctx.lineWidth = 3 * fm;
  ctx.beginPath();
  ctx.arc(cx, cy - 1 * fm, size * 0.26, Math.PI * 0.85, Math.PI * 1.85);
  ctx.stroke();

  ctx.restore();
}

// Render individual layer
function renderLayerItem(
  ctx: CanvasRenderingContext2D,
  layer: LayerConfig,
  canvasW: number,
  canvasH: number,
  fm: number,
  state: TimemarkState,
  activeDate: Date,
  isSelected: boolean
): LayerBounds | null {
  if (!layer.enabled) return null;

  const posX = (layer.x / 100) * canvasW;
  const posY = (layer.y / 100) * canvasH;
  const baseFontSize = layer.fontSize * fm;
  const fontFamily = state.globalFontFamily || 'Plus Jakarta Sans';

  let boxW = 0;
  let boxH = 0;

  // 1. MINIMAP LAYER
  if (layer.id === 'minimap') {
    boxW = 180 * fm;
    boxH = 145 * fm;
    const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
    const clampY = Math.max(0, Math.min(canvasH - boxH, posY));
    const street = state.minimap?.streetName || 'JALAN TEBET BARAT';

    drawMinimap(ctx, clampX, clampY, boxW, boxH, fm, street);

    if (isSelected) {
      drawSelectionBox(ctx, clampX, clampY, boxW, boxH, 14 * fm, fm);
    }
    return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
  }

  // 2. LOGO LAYER
  if (layer.id === 'logo') {
    const size = (layer.width || 88) * fm;
    boxW = size;
    boxH = size;
    const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
    const clampY = Math.max(0, Math.min(canvasH - boxH, posY));
    const logoText = state.logo?.text || 'MAI';
    const primary = state.logo?.primaryColor || '#2563eb';
    const secondary = state.logo?.secondaryColor || '#dc2626';
    const imgUrl = state.logo?.imageUrl;

    drawCircularLogo(
      ctx,
      clampX,
      clampY,
      size,
      fm,
      logoText,
      primary,
      secondary,
      imgUrl
    );

    if (isSelected) {
      drawSelectionBox(ctx, clampX, clampY, boxW, boxH, size / 2, fm);
    }
    return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
  }

  // 3. ACCENT BAR LAYER (Red vertical bar next to text)
  if (layer.id === 'accentBar') {
    boxW = 6 * fm;
    boxH = (layer.height || 108) * fm;
    const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
    const clampY = Math.max(0, Math.min(canvasH - boxH, posY));

    ctx.save();
    ctx.fillStyle = layer.accentColor || '#dc2626';
    roundRect(ctx, clampX, clampY, boxW, boxH, 3 * fm);
    ctx.fill();
    ctx.restore();

    if (isSelected) {
      drawSelectionBox(ctx, clampX, clampY, boxW, boxH, 4 * fm, fm);
    }
    return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
  }

  // 4. BRANDING LAYER ("Photo by TimeMark" bottom-right)
  if (layer.id === 'branding') {
    ctx.save();
    const prefixFont = `500 ${Math.round(13 * fm)}px sans-serif`;
    const brandFont = `bold ${Math.round(20 * fm)}px sans-serif`;

    const bPrefix = state.branding?.prefix || 'Photo by';
    const bName = state.branding?.brandName || 'Time';
    const bSuffix = state.branding?.brandSuffix || 'mark';
    const bColor = state.branding?.suffixColor || '#facc15';

    ctx.font = prefixFont;
    const pw = ctx.measureText(bPrefix).width;

    ctx.font = brandFont;
    const bw1 = ctx.measureText(bName).width;
    const bw2 = ctx.measureText(bSuffix).width;

    boxW = Math.max(pw, bw1 + bw2) + 20 * fm;
    boxH = 48 * fm;
    const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
    const clampY = Math.max(0, Math.min(canvasH - boxH, posY));

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4 * fm;

    // "Photo by"
    ctx.fillStyle = '#f1f5f9';
    ctx.font = prefixFont;
    ctx.textAlign = 'right';
    ctx.fillText(bPrefix, clampX + boxW - 6 * fm, clampY + 16 * fm);

    // "Time" (white) + "mark" (yellow)
    ctx.font = brandFont;
    const startX = clampX + boxW - 6 * fm - bw1 - bw2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(bName, startX, clampY + 38 * fm);

    ctx.fillStyle = bColor;
    ctx.fillText(bSuffix, startX + bw1, clampY + 38 * fm);

    ctx.restore();

    if (isSelected) {
      drawSelectionBox(ctx, clampX, clampY, boxW, boxH, 8 * fm, fm);
    }
    return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
  }

  // 5. VERTICAL WATERMARK LAYER (Right border text: © 3DCCRBEMM2TE9U Timemark Verified)
  if (layer.id === 'verticalWatermark') {
    const text = state.verticalWatermark?.text || '© 3DCCRBEMM2TE9U Timemark Verified';
    ctx.save();
    ctx.font = `600 ${Math.round(15 * fm)}px "JetBrains Mono", monospace`;
    const tw = ctx.measureText(text).width;
    boxW = 28 * fm;
    boxH = tw + 20 * fm;

    const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
    const clampY = Math.max(0, Math.min(canvasH - boxH, posY));

    ctx.translate(clampX + 16 * fm, clampY + tw + 10 * fm);
    ctx.rotate(-Math.PI / 2);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3 * fm;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(text, 0, 0);

    ctx.restore();

    if (isSelected) {
      drawSelectionBox(ctx, clampX, clampY, boxW, boxH, 6 * fm, fm);
    }
    return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
  }

  // 6. PHOTO CODE LAYER (🛡️ Photo Code: 3DCCRBEMM2TE9U)
  if (layer.id === 'photoCode') {
    const code = state.photoCode?.code || '3DCCRBEMM2TE9U';
    const codeText = `🛡️ Photo Code: ${code}`;
    ctx.save();
    ctx.font = `600 ${baseFontSize}px "JetBrains Mono", monospace`;
    const tw = ctx.measureText(codeText).width;
    boxW = tw + 16 * fm;
    boxH = baseFontSize * 1.5;

    const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
    const clampY = Math.max(0, Math.min(canvasH - boxH, posY));

    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 4 * fm;
    ctx.fillStyle = layer.textColor || '#ffffff';
    ctx.fillText(codeText, clampX, clampY + baseFontSize * 1.05);

    ctx.restore();

    if (isSelected) {
      drawSelectionBox(ctx, clampX, clampY, boxW, boxH, 6 * fm, fm);
    }
    return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
  }

  // 7. TEXT-BASED LAYERS (timestamp, location, coordinate, weather, metadata)
  const lines: { text: string; size: number; weight: string; color: string; mono?: boolean }[] = [];

  switch (layer.id) {
    case 'timestamp': {
      const dateStr = formatDateString(
        activeDate,
        state.timestamp.dateFormat,
        state.timestamp.showDayOfWeek
      );
      const timeStr = formatTimeString(
        activeDate.getHours(),
        activeDate.getMinutes(),
        activeDate.getSeconds(),
        state.timestamp.timeFormat,
        state.timestamp.showSeconds,
        state.timestamp.showTimezone ? state.timestamp.timezone : ''
      );

      lines.push({
        text: `${dateStr} ${timeStr}`,
        size: baseFontSize,
        weight: '700',
        color: layer.textColor || '#ffffff',
      });
      break;
    }

    case 'location': {
      if (state.location.showPlaceName && state.location.placeName) {
        lines.push({
          text: state.location.placeName,
          size: baseFontSize,
          weight: '700',
          color: layer.textColor || '#ffffff',
        });
      }
      if (state.location.showAddress && state.location.address) {
        lines.push({
          text: state.location.address,
          size: Math.round(baseFontSize * 0.95),
          weight: '600',
          color: layer.textColor || '#ffffff',
        });
      }
      if (lines.length === 0) {
        lines.push({
          text: 'Jalan Letnan Jenderal MT Haryono, South Jakarta, Jakarta',
          size: baseFontSize,
          weight: '700',
          color: layer.textColor || '#ffffff',
        });
      }
      break;
    }

    case 'coordinate': {
      const coords = formatCoordinates(
        state.coordinate.latitude,
        state.coordinate.longitude,
        state.coordinate.format
      );
      lines.push({
        text: coords,
        size: baseFontSize,
        weight: '600',
        color: layer.textColor || '#ffffff',
        mono: true,
      });
      break;
    }

    case 'weather': {
      const wText = `🌤️ ${state.weather.temperature}°C ${getWeatherConditionName(
        state.weather.condition
      )}`;
      lines.push({
        text: wText,
        size: baseFontSize,
        weight: '600',
        color: layer.textColor || '#f59e0b',
      });
      break;
    }

    case 'metadata': {
      if (state.metadata.projectName) {
        lines.push({
          text: state.metadata.projectName,
          size: baseFontSize,
          weight: 'bold',
          color: layer.textColor || '#ffffff',
        });
      }
      if (state.metadata.authorName) {
        lines.push({
          text: state.metadata.authorName,
          size: Math.round(baseFontSize * 0.8),
          weight: '500',
          color: layer.textColor || '#e2e8f0',
        });
      }
      break;
    }
  }

  // Calculate dimensions
  ctx.save();
  let maxLineWidth = 0;
  let totalTextHeight = 0;
  const lineSpacing = 4 * fm;

  for (const line of lines) {
    ctx.font = `${line.weight} ${line.size}px "${line.mono ? 'JetBrains Mono' : fontFamily}", sans-serif`;
    const m = ctx.measureText(line.text);
    if (m.width > maxLineWidth) maxLineWidth = m.width;
    totalTextHeight += line.size + lineSpacing;
  }
  ctx.restore();

  const paddingX = layer.bgStyle !== 'none' ? 14 * fm : 4 * fm;
  const paddingY = layer.bgStyle !== 'none' ? 10 * fm : 4 * fm;
  boxW = maxLineWidth + paddingX * 2;
  boxH = totalTextHeight + paddingY * 2;

  const clampX = Math.max(0, Math.min(canvasW - boxW, posX));
  const clampY = Math.max(0, Math.min(canvasH - boxH, posY));

  ctx.save();

  // Background if configured
  const opacity = layer.bgOpacity / 100;
  if (layer.bgStyle !== 'none' && opacity > 0) {
    if (layer.bgStyle === 'glass-dark' || layer.bgStyle === 'solid-dark') {
      ctx.fillStyle = `rgba(15, 23, 42, ${opacity})`;
      roundRect(ctx, clampX, clampY, boxW, boxH, 10 * fm);
      ctx.fill();
    } else if (layer.bgStyle === 'glass-light' || layer.bgStyle === 'solid-white') {
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      roundRect(ctx, clampX, clampY, boxW, boxH, 10 * fm);
      ctx.fill();
    } else if (layer.bgStyle === 'pill') {
      ctx.fillStyle = `rgba(15, 23, 42, ${opacity})`;
      roundRect(ctx, clampX, clampY, boxW, boxH, boxH / 2);
      ctx.fill();
    }
  }

  // Text Lines with crisp drop shadow
  let curY = clampY + paddingY;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 4 * fm;

  for (const line of lines) {
    curY += line.size * 0.88;
    ctx.fillStyle = line.color;
    ctx.font = `${line.weight} ${line.size}px "${line.mono ? 'JetBrains Mono' : fontFamily}", sans-serif`;
    ctx.fillText(line.text, clampX + paddingX, curY);
    curY += lineSpacing + line.size * 0.12;
  }

  ctx.restore();

  if (isSelected) {
    drawSelectionBox(ctx, clampX, clampY, boxW, boxH, 8 * fm, fm);
  }

  return { id: layer.id, x: clampX, y: clampY, w: boxW, h: boxH };
}

function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fm: number
) {
  ctx.save();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5 * fm;
  ctx.setLineDash([6 * fm, 4 * fm]);
  roundRect(ctx, x - 3 * fm, y - 3 * fm, w + 6 * fm, h + 6 * fm, radius + 2 * fm);
  ctx.stroke();
  ctx.setLineDash([]);

  // Blue corner dot
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(x + w + 3 * fm, y - 3 * fm, 5 * fm, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Main Render Function
export function renderTimemarkCanvas({
  canvas,
  image,
  state,
  overrideDate,
  selectedLayerId,
}: RenderOptions): LayerBounds[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const width = image.naturalWidth || image.width || 1200;
  const height = image.naturalHeight || image.height || 800;

  canvas.width = width;
  canvas.height = height;

  // 1. Draw base photo
  ctx.drawImage(image, 0, 0, width, height);

  // 2. Base dimension multiplier for consistent high-res scaling
  const baseDim = Math.min(width, height);
  const fontMultiplier = (baseDim / 1000) * (state.globalScale || 1.0);
  const activeDate = overrideDate || getActiveDate(state);

  const layerBoundsList: LayerBounds[] = [];

  // Render layer sequence
  const layerOrder: LayerId[] = [
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

  for (const id of layerOrder) {
    const layer = state.layers[id];
    if (!layer || !layer.enabled) continue;

    const bounds = renderLayerItem(
      ctx,
      layer,
      width,
      height,
      fontMultiplier,
      state,
      activeDate,
      selectedLayerId === id
    );

    if (bounds) {
      layerBoundsList.push(bounds);
    }
  }

  return layerBoundsList;
}
