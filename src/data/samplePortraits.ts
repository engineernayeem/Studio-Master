/**
 * High-quality sample portraits for instant testing of passport studio features
 * Uses clear, realistic photographic portraits with textured backgrounds
 * so users can see the power of AI background removal immediately.
 */

export interface SamplePortrait {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'single' | 'couple';
  url: string;
  fallbackDataUrl: string;
}

export function generateCanvasPortrait(type: 'man' | 'woman' | 'couple'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d')!;

  if (type === 'couple') {
    canvas.width = 800;
    canvas.height = 600;
  }

  const w = canvas.width;
  const h = canvas.height;

  // Background with indoor wallpaper texture
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  if (type === 'man') {
    bgGrad.addColorStop(0, '#738290');
    bgGrad.addColorStop(1, '#3a4454');
  } else if (type === 'woman') {
    bgGrad.addColorStop(0, '#c8b6ff');
    bgGrad.addColorStop(1, '#70577f');
  } else {
    bgGrad.addColorStop(0, '#f28482');
    bgGrad.addColorStop(1, '#84a59d');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Geometric background elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, h * 0.4, w, h * 0.6);

  if (type === 'couple') {
    drawPerson(ctx, w * 0.32, h * 0.52, 110, 'man', '#1f2937');
    drawPerson(ctx, w * 0.68, h * 0.54, 105, 'woman', '#831843');
  } else if (type === 'man') {
    drawPerson(ctx, w * 0.5, h * 0.48, 140, 'man', '#0f172a');
  } else {
    drawPerson(ctx, w * 0.5, h * 0.48, 135, 'woman', '#4c0519');
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  gender: 'man' | 'woman',
  coatColor: string
) {
  // Suit / Shoulders
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 1.7, r * 1.5, r * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shirt Collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.35, cy + r * 0.85);
  ctx.lineTo(cx + r * 0.35, cy + r * 0.85);
  ctx.lineTo(cx, cy + r * 1.45);
  ctx.closePath();
  ctx.fill();

  // Tie for man
  if (gender === 'man') {
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.1, cy + r * 0.95);
    ctx.lineTo(cx + r * 0.1, cy + r * 0.95);
    ctx.lineTo(cx + r * 0.14, cy + r * 1.9);
    ctx.lineTo(cx, cy + r * 2.1);
    ctx.lineTo(cx - r * 0.14, cy + r * 1.9);
    ctx.closePath();
    ctx.fill();
  }

  // Neck
  ctx.fillStyle = '#e2b399';
  ctx.fillRect(cx - r * 0.28, cy + r * 0.5, r * 0.56, r * 0.4);

  // Face
  ctx.fillStyle = '#f5c6a5';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.72, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy + r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.35, cy + r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1c1917';
  if (gender === 'man') {
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.45, r * 0.76, r * 0.58, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.65, cy - r * 0.1, r * 0.15, r * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.65, cy - r * 0.1, r * 0.15, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.4, r * 0.85, r * 0.65, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.72, cy + r * 0.3, r * 0.22, r * 0.75, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.72, cy + r * 0.3, r * 0.22, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.28, cy - r * 0.05, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + r * 0.28, cy - r * 0.05, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.05, r * 0.065, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.28, cy - r * 0.05, r * 0.065, 0, Math.PI * 2);
  ctx.fill();

  // Catchlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - r * 0.26, cy - r * 0.07, r * 0.02, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.3, cy - r * 0.07, r * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy - r * 0.18);
  ctx.lineTo(cx - r * 0.14, cy - r * 0.16);
  ctx.moveTo(cx + r * 0.14, cy - r * 0.16);
  ctx.lineTo(cx + r * 0.42, cy - r * 0.18);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = '#c2886c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.05);
  ctx.lineTo(cx - r * 0.04, cy + r * 0.18);
  ctx.lineTo(cx + r * 0.05, cy + r * 0.18);
  ctx.stroke();

  // Lips
  ctx.fillStyle = gender === 'woman' ? '#be185d' : '#b45309';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.38, r * 0.18, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
}

export const SAMPLE_PORTRAITS: SamplePortrait[] = [
  {
    id: 'sample-man',
    nameBn: 'স্টুডিও স্যাম্পল ১ (জেন্টলম্যান পোর্ট্রেট)',
    nameEn: 'Sample 1 (Gentleman Portrait)',
    category: 'single',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    fallbackDataUrl: generateCanvasPortrait('man'),
  },
  {
    id: 'sample-woman',
    nameBn: 'স্টুডিও স্যাম্পল ২ (লেডি পোর্ট্রেট)',
    nameEn: 'Sample 2 (Lady Portrait)',
    category: 'single',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    fallbackDataUrl: generateCanvasPortrait('woman'),
  },
  {
    id: 'sample-couple',
    nameBn: 'স্টুডিও স্যাম্পল ৩ (জোড়া ছবি / Couple)',
    nameEn: 'Sample 3 (Joint / Couple Photo)',
    category: 'couple',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
    fallbackDataUrl: generateCanvasPortrait('couple'),
  },
];

/**
 * Load sample portrait safely as dataUrl
 */
export async function loadSampleDataUrl(sample: SamplePortrait): Promise<string> {
  try {
    const res = await fetch(sample.url, { mode: 'cors' });
    if (!res.ok) throw new Error('Fetch failed');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(sample.fallbackDataUrl);
      reader.readAsDataURL(blob);
    });
  } catch {
    return sample.fallbackDataUrl;
  }
}
