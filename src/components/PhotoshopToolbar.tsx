import React from 'react';
import { 
  Move, 
  Crop, 
  Wand2, 
  Eraser, 
  Brush, 
  Sparkles, 
  ZoomIn, 
  ArrowLeftRight,
  RotateCcw
} from 'lucide-react';

export type PhotoshopTool = 'move' | 'crop' | 'wand' | 'eraser' | 'restore' | 'beautify' | 'zoom';

interface PhotoshopToolbarProps {
  activeTool: PhotoshopTool;
  onSelectTool: (tool: PhotoshopTool) => void;
  lang: 'bn' | 'en';
  fgColor: string;
  bgColor: string;
  onChangeBgColor: (color: string) => void;
  onSwapColors: () => void;
  onResetColors: () => void;
}

export const PhotoshopToolbar: React.FC<PhotoshopToolbarProps> = ({
  activeTool,
  onSelectTool,
  lang,
  fgColor,
  bgColor,
  onChangeBgColor,
  onSwapColors,
  onResetColors,
}) => {
  const tools: { id: PhotoshopTool; icon: React.ReactNode; labelBn: string; labelEn: string; shortcut: string }[] = [
    {
      id: 'move',
      icon: <Move className="w-4 h-4" />,
      labelBn: 'মুভ টুল (Move Tool) - ছবি ফ্রেমের মাঝে বসান',
      labelEn: 'Move Tool (V) - Reposition portrait',
      shortcut: 'V',
    },
    {
      id: 'crop',
      icon: <Crop className="w-4 h-4" />,
      labelBn: 'ক্রপ ও সাইজ টুল (Crop & Size Tool) - পাসপোর্ট সাইজ নির্বাচন',
      labelEn: 'Crop & Size Tool (C) - Standard passport framing',
      shortcut: 'C',
    },
    {
      id: 'wand',
      icon: <Wand2 className="w-4 h-4" />,
      labelBn: 'ম্যাজিক ইরেজার (Magic Wand) - ক্লিক করে ব্যাকগ্রাউন্ড মুছুন',
      labelEn: 'Magic Wand Tool (W) - Click to delete background',
      shortcut: 'W',
    },
    {
      id: 'eraser',
      icon: <Eraser className="w-4 h-4" />,
      labelBn: 'ইরেজার ব্রাশ (Eraser Brush) - ম্যানুয়ালি অপ্রয়োজনীয় অংশ মুছুন',
      labelEn: 'Eraser Tool (E) - Manually erase unwanted pixels',
      shortcut: 'E',
    },
    {
      id: 'restore',
      icon: <Brush className="w-4 h-4" />,
      labelBn: 'রিস্টোর ব্রাশ (History / Restore) - ভুলবশত মুছে যাওয়া অংশ ফিরিয়ে আনুন',
      labelEn: 'History Brush Tool (Y) - Restore original pixels',
      shortcut: 'Y',
    },
    {
      id: 'beautify',
      icon: <Sparkles className="w-4 h-4" />,
      labelBn: 'বিউটি হিলিং টুল (Spot Healing / Beautify) - স্কিন স্মুথ ও ফর্সা',
      labelEn: 'Healing / Beautify Tool (J) - Skin smoothing & fairness',
      shortcut: 'J',
    },
    {
      id: 'zoom',
      icon: <ZoomIn className="w-4 h-4" />,
      labelBn: 'জুম টুল (Zoom Tool) - জুম ইন / আউট',
      labelEn: 'Zoom Tool (Z) - Zoom in / out',
      shortcut: 'Z',
    },
  ];

  return (
    <aside 
      className="no-print w-11 sm:w-12 bg-[#202226] border-r border-[#2d3036] flex flex-col items-center py-2 select-none shrink-0 z-30"
      aria-label="Photoshop Tools"
    >
      {/* Tool Button List */}
      <div className="flex flex-col items-center gap-1 w-full px-1">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#383d47] text-white shadow-inner border border-[#4a505e]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#2b2e35]'
              }`}
              title={`${lang === 'bn' ? t.labelBn : t.labelEn} [${t.shortcut}]`}
            >
              {t.icon}
              {/* Shortcut indicator corner */}
              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono leading-none text-neutral-500 pointer-events-none">
                {t.shortcut}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hairline Divider */}
      <div className="w-7 h-[1px] bg-[#2f3238] my-3" />

      {/* Photoshop Color Swatches (Foreground / Background) */}
      <div className="flex flex-col items-center mt-auto mb-2 w-full">
        {/* Swap & Reset micro icons */}
        <div className="flex items-center justify-between w-7 mb-1 px-0.5">
          <button
            onClick={onResetColors}
            title={lang === 'bn' ? 'ডিফল্ট কালার রিসেট (D)' : 'Default Colors (D)'}
            className="text-neutral-500 hover:text-neutral-300"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={onSwapColors}
            title={lang === 'bn' ? 'কালার সোয়াপ (X)' : 'Switch Colors (X)'}
            className="text-neutral-500 hover:text-neutral-300"
          >
            <ArrowLeftRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Overlapping Color Squares */}
        <div className="relative w-8 h-8">
          {/* Background swatch (behind) */}
          <label
            className="absolute bottom-0 right-0 w-5 h-5 rounded-sm border border-[#4a505e] shadow cursor-pointer block overflow-hidden z-10"
            title={lang === 'bn' ? 'ব্যাকগ্রাউন্ড কালার নির্বাচন' : 'Set Background Color'}
          >
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onChangeBgColor(e.target.value)}
              className="opacity-0 w-full h-full cursor-pointer absolute"
            />
            <div className="w-full h-full" style={{ backgroundColor: bgColor }} />
          </label>

          {/* Foreground swatch (front) */}
          <div
            className="absolute top-0 left-0 w-5 h-5 rounded-sm border border-[#4a505e] shadow cursor-default z-20"
            style={{ backgroundColor: fgColor }}
            title={lang === 'bn' ? 'ফোরগ্রাউন্ড পোর্ট্রেট কালার' : 'Foreground Layer'}
          />
        </div>
      </div>
    </aside>
  );
};
