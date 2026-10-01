// Generate procedural high-quality sample photos for immediate testing without external dependencies

export function createSamplePhoto(theme: 'construction' | 'survey' | 'office' | 'travel'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  if (theme === 'construction') {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant city silhouette
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 20; i++) {
      const bh = 150 + Math.sin(i * 1.5) * 80 + (i % 3) * 60;
      ctx.fillRect(i * 80, h * 0.55 - bh, 65, bh + 100);
    }

    // Concrete construction structure
    ctx.fillStyle = '#475569';
    ctx.fillRect(w * 0.15, h * 0.25, w * 0.7, h * 0.6);

    // Pillars & Beams
    ctx.fillStyle = '#334155';
    ctx.fillRect(w * 0.2, h * 0.3, 90, h * 0.55);
    ctx.fillRect(w * 0.45, h * 0.3, 90, h * 0.55);
    ctx.fillRect(w * 0.7, h * 0.3, 90, h * 0.55);

    // Yellow Tower Crane
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(w * 0.82, h * 0.15);
    ctx.lineTo(w * 0.82, h * 0.6);
    ctx.moveTo(w * 0.6, h * 0.15);
    ctx.lineTo(w * 0.95, h * 0.15);
    ctx.stroke();

    // Ground
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Safety orange stripes on bottom
    ctx.fillStyle = '#ea580c';
    for (let x = 0; x < w; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.96);
      ctx.lineTo(x + 50, h * 0.96);
      ctx.lineTo(x + 10, h);
      ctx.lineTo(x - 40, h);
      ctx.fill();
    }
  } else if (theme === 'survey') {
    // Open nature landscape for surveying
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Rolling green hills
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.9, w * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.95, w * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Road
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.58);
    ctx.lineTo(w * 0.55, h * 0.58);
    ctx.lineTo(w * 0.85, h);
    ctx.lineTo(w * 0.15, h);
    ctx.closePath();
    ctx.fill();

    // Yellow road line
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.setLineDash([40, 30]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.58);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (theme === 'office') {
    // Modern lobby / office attendance check-in backdrop
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Warm architectural light rays
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.1 + i * 260, 0);
      ctx.lineTo(w * 0.2 + i * 260, 0);
      ctx.lineTo(w * 0.35 + i * 260, h);
      ctx.lineTo(w * 0.25 + i * 260, h);
      ctx.fill();
    }

    // Glass reception counter
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(w * 0.15, h * 0.6, w * 0.7, h * 0.3);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(w * 0.15, h * 0.6, w * 0.7, h * 0.3);
  } else {
    // Travel / Field inspection
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#f97316');
    sky.addColorStop(0.3, '#f59e0b');
    sky.addColorStop(0.7, '#0ea5e9');
    sky.addColorStop(1, '#0284c7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Mountain silhouettes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.lineTo(w * 0.25, h * 0.42);
    ctx.lineTo(w * 0.5, h * 0.65);
    ctx.lineTo(w * 0.78, h * 0.38);
    ctx.lineTo(w, h * 0.72);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}
