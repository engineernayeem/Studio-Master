import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Grid, 
  Check, 
  Sparkles, 
  Sliders, 
  Maximize2, 
  Minimize2,
  Layers,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PhotoStandard, 
  PrintLayoutConfig, 
  PaperSize, 
  PHOTO_STANDARDS 
} from '../types';
import { renderPrintSheet, getPaperDimensions } from '../utils/printRenderer';

interface A4PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
  passportCanvas: HTMLCanvasElement | null;
  stampCanvas: HTMLCanvasElement | null;
  activeStandard: PhotoStandard;
  onDownloadSingle: () => void;
}

export const A4PrintSheetModal: React.FC<A4PrintSheetModalProps> = ({
  isOpen,
  onClose,
  lang,
  passportCanvas,
  stampCanvas,
  activeStandard,
  onDownloadSingle,
}) => {
  const [config, setConfig] = useState<PrintLayoutConfig>({
    paperSize: 'a4',
    orientation: 'portrait',
    copiesPassport: 8,
    copiesStamp: 4,
    layoutMode: 'combo',
    showCuttingMarks: true,
    borderStrokeWidthMm: 0.25,
    gapMm: 3,
    marginMm: 8,
  });

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const printSheetRef = useRef<HTMLCanvasElement | null>(null);

  // Standard stamp reference
  const stampStd = PHOTO_STANDARDS.find((s) => s.id === 'bd-stamp') || PHOTO_STANDARDS[3];

  // Render sheet preview whenever config or canvases change
  useEffect(() => {
    if (!isOpen || !passportCanvas) return;

    setIsRendering(true);
    const timeout = setTimeout(() => {
      try {
        const sheetCanvas = renderPrintSheet(
          passportCanvas,
          stampCanvas,
          activeStandard,
          stampStd,
          config
        );
        printSheetRef.current = sheetCanvas;
        setPreviewDataUrl(sheetCanvas.toDataURL('image/jpeg', 0.88));
      } catch (err) {
        console.error('Error rendering print sheet:', err);
      } finally {
        setIsRendering(false);
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [isOpen, passportCanvas, stampCanvas, activeStandard, config]);

  if (!isOpen || !passportCanvas) return null;

  // Presets
  const applyPreset = (
    mode: 'passport-only' | 'stamp-only' | 'combo',
    pCopies: number,
    sCopies: number = 0
  ) => {
    setConfig((prev) => ({
      ...prev,
      layoutMode: mode,
      copiesPassport: pCopies,
      copiesStamp: sCopies,
    }));
  };

  // Direct Browser Print (iFrame sandbox friendly)
  const handlePrint = () => {
    if (!printSheetRef.current) return;
    const sheetUrl = printSheetRef.current.toDataURL('image/png');

    // Create an invisible iframe for reliable print execution inside sandboxed environments
    let printIframe = document.getElementById('studio-print-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'studio-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);
    }

    const doc = printIframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>StudioMaster Print - ${config.paperSize.toUpperCase()}</title>
            <style>
              @page {
                size: ${config.paperSize} ${config.orientation};
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #ffffff;
              }
              img {
                width: 100vw;
                height: 100vh;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="${sheetUrl}" />
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch {
          window.print();
        }
      }, 250);
    } else {
      window.print();
    }
  };

  // Download High-Resolution Sheet
  const handleDownloadSheet = () => {
    if (!printSheetRef.current) return;

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    const link = document.createElement('a');
    link.download = `studiomaster_${config.paperSize}_sheet_${Date.now()}.png`;
    link.href = printSheetRef.current.toDataURL('image/png');
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const totalCopies =
    config.layoutMode === 'passport-only'
      ? config.copiesPassport
      : config.layoutMode === 'stamp-only'
      ? config.copiesStamp
      : config.copiesPassport + config.copiesStamp;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto select-none">
      <div className="bg-[#1f2228] border border-[#32363e] rounded-xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-neutral-200">
        {/* Photoshop Dialog Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2d3036] bg-[#1a1c20]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-[#001e36] border border-[#0074d9] flex items-center justify-center font-bold text-[#38a9ff] text-[10px] font-sans">
              Ps
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'Photoshop প্রিন্ট সেটিংস - A4 স্টুডিও শিট' : 'Photoshop Print Settings - A4 Studio Sheet'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-cyan-400 font-mono">
                  {totalCopies} {lang === 'bn' ? 'কপি' : 'COPIES'}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded hover:bg-[#2e323a] text-neutral-400 hover:text-white flex items-center justify-center transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body: Left Preview, Right Controls */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-5">
          {/* Left Preview Canvas (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#141518] rounded-lg border border-[#2d3036] p-4 min-h-[380px] sm:min-h-[500px]">
            {isRendering ? (
              <div className="flex flex-col items-center gap-2 text-neutral-400 text-xs font-mono">
                <div className="w-7 h-7 border-2 border-[#0074d9] border-t-transparent rounded-full animate-spin" />
                <span>RENDERING 300 DPI SHEET...</span>
              </div>
            ) : previewDataUrl ? (
              <div className="relative max-h-[65vh] flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-2 bg-[#1b1c20] rounded border border-[#2e323a]">
                <img
                  src={previewDataUrl}
                  alt="A4 Print Sheet Preview"
                  className="max-h-[58vh] w-auto object-contain rounded shadow-lg border border-[#444] bg-white"
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-black/85 text-neutral-300 border border-[#333]">
                  {config.paperSize.toUpperCase()} • 300 DPI • {totalCopies} COPIES
                </span>
              </div>
            ) : null}
          </div>

          {/* Right Configuration Controls (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left text-xs">
            {/* Paper Size Selector */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                {lang === 'bn' ? '১. পেপারের সাইজ (Paper Size)' : '1. Paper Size'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['a4', '4r', 'letter'] as PaperSize[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setConfig((prev) => ({ ...prev, paperSize: p }))}
                    className={`py-1.5 px-2 rounded-md border text-center transition-all ${
                      config.paperSize === p
                        ? 'bg-[#0074d9] border-[#0074d9] text-white shadow-sm font-semibold'
                        : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{p === 'a4' ? 'A4 Paper' : p === '4r' ? '4R (4x6 in)' : 'Letter'}</div>
                    <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                      {p === 'a4' ? '210x297mm' : p === '4r' ? '102x152mm' : '8.5x11 in'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Studio Quantity Presets */}
            <div>
              <label className="text-[10px] font-semibold text-neutral-400 uppercase font-mono tracking-wider block mb-1.5">
                {lang === 'bn' ? '২. স্টুডিও পপুলার লেআউট প্রিসেট' : '2. Studio Layout Presets'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => applyPreset('combo', 8, 4)}
                  className={`p-2 rounded-md border text-left transition-all ${
                    config.layoutMode === 'combo' && config.copiesPassport === 8 && config.copiesStamp === 4
                      ? 'bg-[#2b2e35] border-[#0074d9] text-white ring-1 ring-[#0074d9]'
                      : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-between text-[11px]">
                    <span>৮ পাসপোর্ট + ৪ স্ট্যাম্প</span>
                    <span className="text-[9px] text-cyan-400 font-mono">COMBO</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">৮ পিস পাসপোর্ট এবং ৪ পিস স্ট্যাম্প</div>
                </button>

                <button
                  onClick={() => applyPreset('combo', 6, 6)}
                  className={`p-2 rounded-md border text-left transition-all ${
                    config.layoutMode === 'combo' && config.copiesPassport === 6 && config.copiesStamp === 6
                      ? 'bg-[#2b2e35] border-[#0074d9] text-white ring-1 ring-[#0074d9]'
                      : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                  }`}
                >
                  <div className="font-semibold text-[11px]">৬ পাসপোর্ট + ৬ স্ট্যাম্প</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">সমান সংখ্যক পাসপোর্ট ও স্ট্যাম্প</div>
                </button>

                <button
                  onClick={() => applyPreset('passport-only', 8)}
                  className={`p-2 rounded-md border text-left transition-all ${
                    config.layoutMode === 'passport-only' && config.copiesPassport === 8
                      ? 'bg-[#2b2e35] border-[#0074d9] text-white ring-1 ring-[#0074d9]'
                      : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                  }`}
                >
                  <div className="font-semibold text-[11px]">৮ কপি পাসপোর্ট</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">স্ট্যান্ডার্ড ৮ পিস পাসপোর্ট</div>
                </button>

                <button
                  onClick={() => applyPreset('passport-only', 16)}
                  className={`p-2 rounded-md border text-left transition-all ${
                    config.layoutMode === 'passport-only' && config.copiesPassport === 16
                      ? 'bg-[#2b2e35] border-[#0074d9] text-white ring-1 ring-[#0074d9]'
                      : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                  }`}
                >
                  <div className="font-semibold text-[11px]">১৬ কপি পাসপোর্ট</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">ফুল শিট পাসপোর্ট প্যাক</div>
                </button>

                <button
                  onClick={() => applyPreset('stamp-only', 30)}
                  className={`p-2 rounded-md border text-left transition-all ${
                    config.layoutMode === 'stamp-only' && config.copiesStamp === 30
                      ? 'bg-[#2b2e35] border-[#0074d9] text-white ring-1 ring-[#0074d9]'
                      : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                  }`}
                >
                  <div className="font-semibold text-[11px]">৩০ কপি স্ট্যাম্প সাইজ</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">শুধুমাত্র স্ট্যাম্প সাইজ শিট</div>
                </button>

                <button
                  onClick={() => applyPreset('passport-only', 4)}
                  className={`p-2 rounded-md border text-left transition-all ${
                    config.layoutMode === 'passport-only' && config.copiesPassport === 4
                      ? 'bg-[#2b2e35] border-[#0074d9] text-white ring-1 ring-[#0074d9]'
                      : 'bg-[#181a1f] border-[#2d3036] text-neutral-300 hover:bg-[#22252b]'
                  }`}
                >
                  <div className="font-semibold text-[11px]">৪ কপি পাসপোর্ট</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">ছোট জরুরি প্রিন্ট</div>
                </button>
              </div>
            </div>

            {/* Custom Copy Count Adjustments */}
            <div className="p-3 rounded-md bg-[#181a1f] border border-[#2d3036] space-y-2.5">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase font-mono tracking-wider block">
                {lang === 'bn' ? '৩. কাস্টম সংখ্যা নির্বাচন' : '3. Custom Count'}
              </label>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>{lang === 'bn' ? 'পাসপোর্ট সংখ্যা:' : 'Passport Copies:'}</span>
                  <span className="font-bold text-cyan-400 font-mono">{config.copiesPassport} pcs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  value={config.copiesPassport}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      copiesPassport: parseInt(e.target.value, 10),
                      layoutMode: prev.copiesStamp > 0 && parseInt(e.target.value, 10) > 0 ? 'combo' : parseInt(e.target.value, 10) > 0 ? 'passport-only' : 'stamp-only',
                    }))
                  }
                  className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>{lang === 'bn' ? 'স্ট্যাম্প সংখ্যা:' : 'Stamp Copies:'}</span>
                  <span className="font-bold text-indigo-400 font-mono">{config.copiesStamp} pcs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="2"
                  value={config.copiesStamp}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      copiesStamp: parseInt(e.target.value, 10),
                      layoutMode: prev.copiesPassport > 0 && parseInt(e.target.value, 10) > 0 ? 'combo' : parseInt(e.target.value, 10) > 0 ? 'stamp-only' : 'passport-only',
                    }))
                  }
                  className="w-full accent-indigo-500 h-1 bg-[#121316] rounded"
                />
              </div>

              <div className="pt-2 border-t border-[#272a31] flex items-center justify-between">
                <label className="text-xs text-neutral-300 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.showCuttingMarks}
                    onChange={(e) => setConfig((prev) => ({ ...prev, showCuttingMarks: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded text-blue-600 bg-[#121316] border-[#32363e]"
                  />
                  <span>{lang === 'bn' ? 'কাটিং গাইডলাইন ও বর্ডার দাগ' : 'Scissor cutting lines'}</span>
                </label>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span>Gap:</span>
                  <select
                    value={config.gapMm}
                    onChange={(e) => setConfig((prev) => ({ ...prev, gapMm: parseFloat(e.target.value) }))}
                    className="bg-[#121316] text-neutral-200 border border-[#2d3036] rounded px-1.5 py-0.5 text-xs font-mono"
                  >
                    <option value="2">2 mm</option>
                    <option value="3">3 mm</option>
                    <option value="4">4 mm</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons: Print & Download */}
            <div className="pt-1 flex flex-col gap-2 mt-auto">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 rounded-md bg-[#0074d9] hover:bg-[#0084f7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'bn' ? 'প্রিন্ট করুন (Print Now)' : 'Print Now'}</span>
              </button>

              <button
                onClick={handleDownloadSheet}
                className="w-full py-2 rounded-md bg-[#252830] hover:bg-[#2f333e] text-cyan-300 border border-[#353944] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {downloadSuccess 
                    ? (lang === 'bn' ? '✓ ডাউনলোড সফল হয়েছে!' : '✓ Downloaded!') 
                    : (lang === 'bn' ? 'পুরো A4 শিট সেভ করুন (300 DPI PNG)' : 'Save Complete A4 Sheet (300 DPI)')}
                </span>
              </button>

              <button
                onClick={onDownloadSingle}
                className="text-center text-[11px] text-neutral-400 hover:text-neutral-200 py-0.5 transition-colors"
              >
                {lang === 'bn' ? 'অথবা শুধুমাত্র ১টি সিঙ্গেল ছবি ডাউনলোড করুন' : 'Or download single photo only'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
