import { PhotoStandard, PrintLayoutConfig, PaperSize } from '../types';

export interface SheetDimensions {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

export const PAPER_DIMENSIONS: Record<PaperSize, { widthMm: number; heightMm: number }> = {
  a4: { widthMm: 210, heightMm: 297 },
  '4r': { widthMm: 102, heightMm: 152 },
  letter: { widthMm: 215.9, heightMm: 279.4 },
};

const DPI = 300;
const MM_TO_PX = DPI / 25.4; // ~11.811 px per mm

export function getPaperDimensions(paperSize: PaperSize, orientation: 'portrait' | 'landscape'): SheetDimensions {
  const base = PAPER_DIMENSIONS[paperSize];
  const widthMm = orientation === 'portrait' ? base.widthMm : base.heightMm;
  const heightMm = orientation === 'portrait' ? base.heightMm : base.widthMm;

  return {
    widthMm,
    heightMm,
    widthPx: Math.round(widthMm * MM_TO_PX),
    heightPx: Math.round(heightMm * MM_TO_PX),
  };
}

export interface RenderItem {
  imageCanvas: HTMLCanvasElement;
  widthMm: number;
  heightMm: number;
  type: 'passport' | 'stamp' | 'joint';
}

/**
 * Render a complete high-resolution printable sheet (e.g. A4, 4R)
 */
export function renderPrintSheet(
  passportCanvas: HTMLCanvasElement,
  stampCanvas: HTMLCanvasElement | null,
  passportStd: PhotoStandard,
  stampStd: PhotoStandard,
  config: PrintLayoutConfig
): HTMLCanvasElement {
  const paper = getPaperDimensions(config.paperSize, config.orientation);
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = paper.widthPx;
  sheetCanvas.height = paper.heightPx;
  const ctx = sheetCanvas.getContext('2d')!;

  // Fill sheet with pure print white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, paper.widthPx, paper.heightPx);

  // Compile list of items to place
  const items: RenderItem[] = [];

  if (config.layoutMode === 'passport-only') {
    for (let i = 0; i < config.copiesPassport; i++) {
      items.push({
        imageCanvas: passportCanvas,
        widthMm: passportStd.widthMm,
        heightMm: passportStd.heightMm,
        type: 'passport',
      });
    }
  } else if (config.layoutMode === 'stamp-only') {
    const sCanvas = stampCanvas || passportCanvas;
    for (let i = 0; i < config.copiesStamp; i++) {
      items.push({
        imageCanvas: sCanvas,
        widthMm: stampStd.widthMm,
        heightMm: stampStd.heightMm,
        type: 'stamp',
      });
    }
  } else if (config.layoutMode === 'combo') {
    // Combination of passport and stamp
    for (let i = 0; i < config.copiesPassport; i++) {
      items.push({
        imageCanvas: passportCanvas,
        widthMm: passportStd.widthMm,
        heightMm: passportStd.heightMm,
        type: 'passport',
      });
    }
    const sCanvas = stampCanvas || passportCanvas;
    for (let i = 0; i < config.copiesStamp; i++) {
      items.push({
        imageCanvas: sCanvas,
        widthMm: stampStd.widthMm,
        heightMm: stampStd.heightMm,
        type: 'stamp',
      });
    }
  } else {
    // Joint or custom
    for (let i = 0; i < config.copiesPassport; i++) {
      items.push({
        imageCanvas: passportCanvas,
        widthMm: passportStd.widthMm,
        heightMm: passportStd.heightMm,
        type: 'joint',
      });
    }
  }

  // Layout items onto the sheet with margin and gaps
  const marginPx = Math.round(config.marginMm * MM_TO_PX);
  const gapPx = Math.round(config.gapMm * MM_TO_PX);

  let currentX = marginPx;
  let currentY = marginPx;
  let rowMaxHeight = 0;

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const itemWidthPx = Math.round(item.widthMm * MM_TO_PX);
    const itemHeightPx = Math.round(item.heightMm * MM_TO_PX);

    // Check if item fits in current row
    if (currentX + itemWidthPx > paper.widthPx - marginPx) {
      // Move to next row
      currentX = marginPx;
      currentY += rowMaxHeight + gapPx;
      rowMaxHeight = 0;
    }

    // Check if item exceeds page height
    if (currentY + itemHeightPx > paper.heightPx - marginPx) {
      // Reached page limit
      break;
    }

    // Draw the photo
    ctx.drawImage(item.imageCanvas, currentX, currentY, itemWidthPx, itemHeightPx);

    // Draw cutting guides / border if enabled
    if (config.showCuttingMarks) {
      // Thin cutting border around photo
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = Math.max(1, Math.round(config.borderStrokeWidthMm * MM_TO_PX));
      ctx.strokeRect(currentX, currentY, itemWidthPx, itemHeightPx);

      // Light corner tick marks for scissors
      drawCuttingTickMarks(ctx, currentX, currentY, itemWidthPx, itemHeightPx, gapPx);
    }

    rowMaxHeight = Math.max(rowMaxHeight, itemHeightPx);
    currentX += itemWidthPx + gapPx;
  }

  // Draw studio header/watermark at bottom edge of sheet (non-obtrusive)
  drawPrintFooter(ctx, paper, items.length);

  return sheetCanvas;
}

/**
 * Draw corner scissor alignment ticks between photos
 */
function drawCuttingTickMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number
) {
  const tickLen = Math.min(12, Math.max(4, gap * 0.4));
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;

  ctx.beginPath();
  // Top-left
  ctx.moveTo(x - tickLen, y);
  ctx.lineTo(x, y);
  ctx.moveTo(x, y - tickLen);
  ctx.lineTo(x, y);

  // Top-right
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + tickLen, y);
  ctx.moveTo(x + w, y - tickLen);
  ctx.lineTo(x + w, y);

  // Bottom-left
  ctx.moveTo(x - tickLen, y + h);
  ctx.lineTo(x, y + h);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h + tickLen);

  // Bottom-right
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w + tickLen, y + h);
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w, y + h + tickLen);
  ctx.stroke();
}

/**
 * Draw small metadata stamp at bottom margin of paper
 */
function drawPrintFooter(ctx: CanvasRenderingContext2D, paper: SheetDimensions, count: number) {
  ctx.fillStyle = '#888888';
  ctx.font = `${Math.round(10 * (DPI / 96))}px sans-serif`;
  ctx.textAlign = 'right';
  const text = `StudioMaster Pro Print • ${paper.widthMm}x${paper.heightMm}mm (${count} copies) • 300 DPI`;
  ctx.fillText(text, paper.widthPx - Math.round(10 * MM_TO_PX), paper.heightPx - Math.round(6 * MM_TO_PX));
}
