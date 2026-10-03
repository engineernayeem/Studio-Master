import { RetouchSettings } from '../types';

/**
 * Check if a pixel represents human skin tone in YCbCr color space
 */
export function getSkinProbability(r: number, g: number, b: number): number {
  const Y = 0.299 * r + 0.587 * g + 0.114 * b;
  const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  // Skin color distribution bounds
  const cbMin = 77, cbMax = 135;
  const crMin = 130, crMax = 175;

  if (Cb >= cbMin && Cb <= cbMax && Cr >= crMin && Cr <= crMax && Y > 30) {
    // Soft weight near boundaries
    const dCb = Math.min(Cb - cbMin, cbMax - Cb) / (cbMax - cbMin);
    const dCr = Math.min(Cr - crMin, crMax - Cr) / (crMax - crMin);
    return Math.min(1, Math.max(0, dCb * 2) * Math.max(0, dCr * 2));
  }
  return 0;
}

/**
 * Apply studio skin smoothing, fairness brightening, clarity, warmth and sharpness
 */
export function applyFaceRetouch(
  sourceCanvas: HTMLCanvasElement,
  settings: RetouchSettings
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // If no adjustments are made, return a duplicate
  if (
    settings.skinSmoothing === 0 &&
    settings.skinBrightness === 0 &&
    settings.clarity === 0 &&
    settings.skinWarmth === 0 &&
    settings.studioGlow === 0 &&
    settings.sharpness === 0 &&
    (settings.overallBrightness ?? 0) === 0 &&
    (settings.overallContrast ?? 0) === 0 &&
    (settings.overallSaturation ?? 0) === 0
  ) {
    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = width;
    copyCanvas.height = height;
    copyCanvas.getContext('2d')!.drawImage(sourceCanvas, 0, 0);
    return copyCanvas;
  }

  // Create working canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const ctx = outCanvas.getContext('2d')!;
  ctx.drawImage(sourceCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Create a blurred version for skin smoothing
  let smoothData: Uint8ClampedArray | null = null;
  if (settings.skinSmoothing > 0) {
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const blurCtx = blurCanvas.getContext('2d')!;
    
    // Scale blur radius with smoothing level (2px to 7px)
    const blurRadius = Math.max(2, Math.round((settings.skinSmoothing / 100) * 6));
    blurCtx.filter = `blur(${blurRadius}px)`;
    blurCtx.drawImage(sourceCanvas, 0, 0);
    
    smoothData = blurCtx.getImageData(0, 0, width, height).data;
  }

  const smoothFactor = settings.skinSmoothing / 100;
  const brightnessBoost = settings.skinBrightness; // e.g. 20
  const clarityFactor = settings.clarity / 100;
  const warmthFactor = settings.skinWarmth;
  const glowFactor = settings.studioGlow / 100;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue; // transparent pixel

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const skinProb = getSkinProbability(r, g, b);

    // 1. Skin Smoothing (blend smoothed pixels over skin regions only)
    if (smoothData && skinProb > 0.1) {
      const sr = smoothData[i];
      const sg = smoothData[i + 1];
      const sb = smoothData[i + 2];

      const blend = skinProb * smoothFactor * 0.85;
      r = Math.round(r * (1 - blend) + sr * blend);
      g = Math.round(g * (1 - blend) + sg * blend);
      b = Math.round(b * (1 - blend) + sb * blend);
    }

    // 2. Fairness & Skin Brightening (চেহারা ফর্সা ও পরিষ্কার)
    if (brightnessBoost !== 0) {
      // Skin pixels receive full boost, rest receives gentle boost
      const boost = brightnessBoost * (0.4 + skinProb * 0.6);
      
      // Photographic curve lift on midtones
      const normR = r / 255;
      const normG = g / 255;
      const normB = b / 255;

      const curve = (val: number, delta: number) => {
        if (delta > 0) {
          // Lift shadows and midtones while keeping highlights natural
          const factor = delta / 100;
          return Math.min(255, Math.round(val + factor * (255 - val) * Math.sin(Math.PI * (val / 255))));
        } else {
          return Math.max(0, Math.min(255, Math.round(val + delta * 1.5)));
        }
      };

      r = curve(r, boost);
      g = curve(g, boost);
      b = curve(b, boost);
    }

    // 3. Warmth / Studio Lighting Tone
    if (warmthFactor !== 0) {
      r = Math.min(255, Math.max(0, Math.round(r + warmthFactor * 0.8)));
      b = Math.min(255, Math.max(0, Math.round(b - warmthFactor * 0.8)));
    }

    // 4. Clarity & Contrast
    if (clarityFactor !== 0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const contrast = 1 + clarityFactor * 0.6;
      r = Math.min(255, Math.max(0, Math.round(128 + (r - 128) * contrast)));
      g = Math.min(255, Math.max(0, Math.round(128 + (g - 128) * contrast)));
      b = Math.min(255, Math.max(0, Math.round(128 + (b - 128) * contrast)));
    }

    // 5. Studio Glow (soft highlight bloom)
    if (glowFactor > 0 && skinProb > 0.2) {
      const glow = Math.round(glowFactor * 25);
      r = Math.min(255, r + glow);
      g = Math.min(255, g + glow);
      b = Math.min(255, b + Math.round(glow * 0.8));
    }

    // 6. Manual Image Quality Controls: Brightness, Contrast, Saturation
    const overallBright = settings.overallBrightness ?? 0;
    const overallCont = settings.overallContrast ?? 0;
    const overallSat = settings.overallSaturation ?? 0;

    // A. Manual Overall Brightness (-50 to +50)
    if (overallBright !== 0) {
      const bDelta = (overallBright / 100) * 128;
      r = Math.min(255, Math.max(0, r + bDelta));
      g = Math.min(255, Math.max(0, g + bDelta));
      b = Math.min(255, Math.max(0, b + bDelta));
    }

    // B. Manual Overall Contrast (-50 to +50)
    if (overallCont !== 0) {
      const cFactor = (259 * (overallCont * 2.55 + 255)) / (255 * (259 - overallCont * 2.55));
      r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
    }

    // C. Manual Overall Saturation (-50 to +50)
    if (overallSat !== 0) {
      const satMultiplier = 1 + (overallSat / 50); // -50 => 0 (grayscale), 0 => 1, +50 => 2
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, Math.max(0, luminance + satMultiplier * (r - luminance)));
      g = Math.min(255, Math.max(0, luminance + satMultiplier * (g - luminance)));
      b = Math.min(255, Math.max(0, luminance + satMultiplier * (b - luminance)));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imgData, 0, 0);

  // 6. Sharpness (High-pass filter for eyes and lips)
  if (settings.sharpness > 0) {
    applyUnsharpMask(outCanvas, settings.sharpness / 100);
  }

  return outCanvas;
}

/**
 * Subtle unsharp mask to crisp up eyes, eyebrows, and lips for studio quality
 */
function applyUnsharpMask(canvas: HTMLCanvasElement, amount: number) {
  const ctx = canvas.getContext('2d')!;
  const width = canvas.width;
  const height = canvas.height;

  const originalData = ctx.getImageData(0, 0, width, height);
  const src = originalData.data;

  // Simple 3x3 sharpen convolution kernel
  const kWeight = amount * 0.5;
  const centerWeight = 1 + 4 * kWeight;

  const outData = ctx.createImageData(width, height);
  const dst = outData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          src[i + c] * centerWeight -
          (src[up + c] + src[down + c] + src[left + c] + src[right + c]) * kWeight;
        dst[i + c] = Math.min(255, Math.max(0, Math.round(val)));
      }
      dst[i + 3] = src[i + 3];
    }
  }

  ctx.putImageData(outData, 0, 0);
}
