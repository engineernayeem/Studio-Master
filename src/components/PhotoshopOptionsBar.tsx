import React from 'react';
import { 
  PhotoshopTool 
} from './PhotoshopToolbar';
import { 
  PhotoStandard, 
  PHOTO_STANDARDS 
} from '../types';
import { 
  Eye, 
  EyeOff, 
  RotateCw, 
  Sparkles, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Compass,
  Check
} from 'lucide-react';

interface PhotoshopOptionsBarProps {
  activeTool: PhotoshopTool;
  lang: 'bn' | 'en';
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  onCenterPhoto: () => void;
  selectedStandard: PhotoStandard;
  onSelectStandard: (std: PhotoStandard) => void;
  showHeadGuide: boolean;
  setShowHeadGuide: (show: boolean) => void;
  rotation: number;
  setRotation: (r: number) => void;
  magicTolerance: number;
  setMagicTolerance: (t: number) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  featherRadius: number;
  setFeatherRadius: (f: number) => void;
  isHoldingOriginal: boolean;
  setIsHoldingOriginal: (holding: boolean) => void;
  onAutoBeautify: () => void;
}

export const PhotoshopOptionsBar: React.FC<PhotoshopOptionsBarProps> = ({
  activeTool,
  lang,
  zoom,
  setZoom,
  pan,
  onCenterPhoto,
  selectedStandard,
  onSelectStandard,
  showHeadGuide,
  setShowHeadGuide,
  rotation,
  setRotation,
  magicTolerance,
  setMagicTolerance,
  brushSize,
  setBrushSize,
  featherRadius,
  setFeatherRadius,
  isHoldingOriginal,
  setIsHoldingOriginal,
  onAutoBeautify,
}) => {
  return (
    <div 
      className="no-print bg-[#22242a] border-b border-[#2d3038] px-2.5 sm:px-3 py-1 text-xs text-neutral-300 flex items-center justify-between gap-3 overflow-x-auto select-none min-h-[36px]"
      aria-label="Tool Options Bar"
    >
      {/* Left: Dynamic Context Options */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Tool Name Indicator Badge */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#343844] text-neutral-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0074d9]" />
          <span className="uppercase font-semibold text-white tracking-wider">
            {activeTool === 'move' ? 'Move (V)' 
              : activeTool === 'crop' ? 'Crop & Size (C)' 
              : activeTool === 'wand' ? 'Magic Wand (W)' 
              : activeTool === 'eraser' ? 'Eraser (E)' 
              : activeTool === 'restore' ? 'History Brush (Y)' 
              : activeTool === 'beautify' ? 'Beautify (J)' 
              : 'Zoom (Z)'}
          </span>
        </div>

        {/* MOVE / PAN OPTIONS */}
        {activeTool === 'move' && (
          <div className="flex items-center gap-3">
            {/* Position Coordinates */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
              <span className="text-neutral-500">X:</span>
              <span className="text-neutral-200 tabular-nums bg-[#1a1b20] px-1 rounded border border-[#323640]">{Math.round(pan.x)}</span>
              <span className="text-neutral-500">Y:</span>
              <span className="text-neutral-200 tabular-nums bg-[#1a1b20] px-1 rounded border border-[#323640]">{Math.round(pan.y)}</span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#343844]" />

            {/* Quick Zoom Slider */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-[11px]">{lang === 'bn' ? 'জুম:' : 'Zoom:'}</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20 accent-blue-500 h-1 bg-[#16171b] rounded cursor-pointer"
              />
              <span className="font-mono text-[11px] text-cyan-400 tabular-nums">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Center Frame */}
            <button
              onClick={onCenterPhoto}
              className="px-2 py-0.5 rounded bg-[#2b2e37] hover:bg-[#343844] text-neutral-200 text-[11px] font-medium border border-[#383d4a] transition-colors"
            >
              {lang === 'bn' ? 'সেন্টার ফ্রেম' : 'Center Frame'}
            </button>
          </div>
        )}

        {/* CROP & SIZE OPTIONS */}
        {activeTool === 'crop' && (
          <div className="flex items-center gap-3">
            {/* Standard Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[11px]">{lang === 'bn' ? 'স্ট্যান্ডার্ড সাইজ:' : 'Standard:'}</span>
              <select
                value={selectedStandard.id}
                onChange={(e) => {
                  const std = PHOTO_STANDARDS.find((s) => s.id === e.target.value);
                  if (std) onSelectStandard(std);
                }}
                className="bg-[#1a1b20] text-neutral-200 border border-[#363a46] rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-blue-500"
              >
                {PHOTO_STANDARDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.widthMm}x{s.heightMm}mm - {lang === 'bn' ? s.nameBn : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-[1px] h-3.5 bg-[#343844]" />

            {/* Straighten / Angle */}
            <div className="flex items-center gap-1.5">
              <RotateCw className="w-3 h-3 text-neutral-400" />
              <span className="text-neutral-400 text-[11px]">{lang === 'bn' ? 'অ্যাঙ্গেল:' : 'Angle:'}</span>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                className="w-16 accent-blue-500 h-1 bg-[#16171b] rounded cursor-pointer"
              />
              <span className="font-mono text-[11px] text-neutral-200 tabular-nums">{rotation}°</span>
              {rotation !== 0 && (
                <button
                  onClick={() => setRotation(0)}
                  className="text-[10px] text-neutral-400 hover:text-white px-1 py-0.2 rounded bg-[#2b2e37]"
                >
                  0°
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAGIC WAND OPTIONS */}
        {activeTool === 'wand' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[11px]">{lang === 'bn' ? 'টলারেন্স (Tolerance):' : 'Tolerance:'}</span>
              <input
                type="number"
                min="5"
                max="90"
                value={magicTolerance}
                onChange={(e) => setMagicTolerance(Math.max(5, Math.min(90, parseInt(e.target.value) || 25)))}
                className="w-12 bg-[#1a1b20] text-neutral-200 border border-[#363a46] rounded px-1.5 py-0.5 text-xs font-mono text-center"
              />
              <input
                type="range"
                min="5"
                max="90"
                value={magicTolerance}
                onChange={(e) => setMagicTolerance(parseInt(e.target.value))}
                className="w-16 accent-blue-500 h-1 bg-[#16171b] rounded cursor-pointer ml-1"
              />
            </div>

            <span className="text-[11px] text-cyan-400 hidden md:inline font-mono">
              {lang === 'bn' ? '💡 ছবির ব্যাকগ্রাউন্ডে ক্লিক করলে স্বয়ংক্রিয়ভাবে মুছে যাবে' : '💡 Click on the background to flood-erase color'}
            </span>
          </div>
        )}

        {/* ERASER & RESTORE BRUSH OPTIONS */}
        {(activeTool === 'eraser' || activeTool === 'restore') && (
          <div className="flex items-center gap-3">
            {/* Brush Size Slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[11px]">{lang === 'bn' ? 'ব্রাশ সাইজ:' : 'Size:'}</span>
              <input
                type="range"
                min="4"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                className="w-24 accent-blue-500 h-1 bg-[#16171b] rounded cursor-pointer"
              />
              <span className="font-mono text-[11px] text-cyan-400 tabular-nums bg-[#1a1b20] px-1 rounded border border-[#323640]">{brushSize}px</span>
            </div>

            <div className="w-[1px] h-3.5 bg-[#343844]" />

            {/* Edge Feather */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[11px]">{lang === 'bn' ? 'ফেদারিং:' : 'Feather:'}</span>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={featherRadius}
                onChange={(e) => setFeatherRadius(parseFloat(e.target.value))}
                className="w-16 accent-blue-500 h-1 bg-[#16171b] rounded cursor-pointer"
              />
              <span className="font-mono text-[11px] text-neutral-200 tabular-nums">{featherRadius}px</span>
            </div>

            <span className="text-[11px] text-neutral-400 hidden lg:inline font-mono">
              {activeTool === 'eraser' 
                ? (lang === 'bn' ? 'ব্রাশ দিয়ে ব্যাকগ্রাউন্ডের বাড়তি অংশ মুছুন' : 'Paint to remove background spots') 
                : (lang === 'bn' ? 'ব্রাশ দিয়ে মুছে যাওয়া শরীর/চুল ফেরত আনুন' : 'Paint to restore original pixels')}
            </span>
          </div>
        )}

        {/* BEAUTIFY / HEALING OPTIONS */}
        {activeTool === 'beautify' && (
          <div className="flex items-center gap-3">
            <button
              onClick={onAutoBeautify}
              className="px-3 py-1 rounded bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-100" />
              <span>{lang === 'bn' ? 'এক ক্লিকে অটো ফর্সা ও স্মুথ করুন' : 'One-Click Auto Beautify'}</span>
            </button>
            <span className="text-[11px] text-neutral-400 hidden md:inline font-mono">
              {lang === 'bn' ? 'ডানপাশের রূপচর্চা প্যানেল থেকে ফাইন-টিউন করতে পারবেন' : 'Fine-tune skin fairness in right Retouch panel'}
            </span>
          </div>
        )}

        {/* ZOOM TOOL OPTIONS */}
        {activeTool === 'zoom' && (
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setZoom((z: number) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-[#2b2e37] hover:bg-[#343844] text-neutral-200 text-xs border border-[#383d4a]"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z: number) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="px-2 py-0.5 rounded bg-[#2b2e37] hover:bg-[#343844] text-neutral-200 text-xs border border-[#383d4a]"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-0.5 rounded bg-[#2b2e37] hover:bg-[#343844] text-cyan-400 text-[11px] border border-[#383d4a]"
            >
              100% Fit
            </button>
          </div>
        )}
      </div>

      {/* Right: Head Guide Toggle & Compare with Original */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Head Guide Toggle */}
        <button
          onClick={() => setShowHeadGuide(!showHeadGuide)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
            showHeadGuide
              ? 'bg-[#1b2f45] text-cyan-300 border-[#0074d9]'
              : 'bg-[#1a1b20] text-neutral-400 hover:text-neutral-200 border-[#323640]'
          }`}
          title={lang === 'bn' ? 'পাসপোর্ট আইকাও হেড রুলার গাইড অন/অফ' : 'Toggle ICAO Passport Head Guide'}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'হেড গাইড' : 'Head Guide'}</span>
        </button>

        {/* Hold to Compare Original */}
        <button
          onMouseDown={() => setIsHoldingOriginal(true)}
          onMouseUp={() => setIsHoldingOriginal(false)}
          onTouchStart={() => setIsHoldingOriginal(true)}
          onTouchEnd={() => setIsHoldingOriginal(false)}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors select-none ${
            isHoldingOriginal
              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md'
              : 'bg-[#1a1b20] text-neutral-300 hover:text-white border-[#323640]'
          }`}
          title={lang === 'bn' ? 'চেপে ধরে রাখুন আসল ছবি দেখতে' : 'Hold to compare with original portrait'}
        >
          {isHoldingOriginal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-400" />}
          <span>{lang === 'bn' ? 'আসল ছবি' : 'Compare'}</span>
        </button>
      </div>
    </div>
  );
};
