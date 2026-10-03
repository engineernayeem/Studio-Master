import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Sparkles, 
  Image as ImageIcon,
  ChevronDown,
  Layers,
  Sliders,
  Maximize,
  Minimize,
  Undo2,
  FolderOpen,
  FilePlus,
  HelpCircle,
  Eye,
  RotateCw,
  Crop,
  SlidersHorizontal,
  Users,
  Check
} from 'lucide-react';
import { PhotoStandard, PHOTO_STANDARDS } from '../types';

interface PhotoshopMenuBarProps {
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  hasPhoto: boolean;
  activeStandard: PhotoStandard;
  onSelectStandard?: (std: PhotoStandard) => void;
  onReset: () => void;
  onOpenPrintModal: () => void;
  onOpenSampleModal: () => void;
  onDownloadSingle: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onAutoBeautify: () => void;
  onReCutBackground: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onToggleHeadGuide?: () => void;
  onSelectTab?: (tab: 'layers' | 'adjustments' | 'sizing' | 'joint' | 'history') => void;
}

export const PhotoshopMenuBar: React.FC<PhotoshopMenuBarProps> = ({
  lang,
  setLang,
  hasPhoto,
  activeStandard,
  onSelectStandard,
  onReset,
  onOpenPrintModal,
  onOpenSampleModal,
  onDownloadSingle,
  onUndo,
  canUndo,
  onAutoBeautify,
  onReCutBackground,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleHeadGuide,
  onSelectTab,
}) => {
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | 'image' | 'layer' | 'filter' | 'view' | 'window' | 'help' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing shortcuts when user is typing inside an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) onUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (hasPhoto) onAutoBeautify();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (hasPhoto) onOpenPrintModal();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasPhoto) onDownloadSingle();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        onOpenSampleModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, hasPhoto, onUndo, onAutoBeautify, onOpenPrintModal, onDownloadSingle, onOpenSampleModal]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const closeDropdown = () => setOpenMenu(null);

  return (
    <header 
      ref={menuRef}
      className="no-print bg-[#1a1b1f] border-b border-[#282a30] text-neutral-300 text-xs select-none sticky top-0 z-50 shadow-md"
      aria-label="Photoshop Application Menu Bar"
    >
      <div className="flex items-center justify-between px-2 sm:px-3 h-8 sm:h-9">
        {/* Left: Photoshop Icon & Menu Bar Items */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Photoshop "Ps" Badge */}
          <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-[#282a30]">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#001e36] border border-[#0074d9] flex items-center justify-center font-bold text-[#38a9ff] text-[10px] sm:text-[11px] font-sans shadow-sm select-none">
              Ps
            </div>
            <span className="font-semibold text-white tracking-tight hidden md:inline text-xs font-mono">
              StudioMaster <span className="text-[#38a9ff] text-[10px]">CC</span>
            </span>
          </div>

          {/* Software Dropdown Menus */}
          <nav className="flex items-center text-[11px] font-sans" aria-label="Main Menu">
            {/* FILE MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
                className={`px-2 py-1 rounded hover:bg-[#282a31] hover:text-white transition-colors ${
                  openMenu === 'file' ? 'bg-[#282a31] text-white' : ''
                }`}
              >
                {lang === 'bn' ? 'ফাইল (File)' : 'File'}
              </button>

              {openMenu === 'file' && (
                <div className="absolute top-full left-0 mt-0.5 w-56 bg-[#212328] border border-[#32363f] rounded-md shadow-2xl py-1 z-50 text-neutral-200">
                  <button
                    onClick={() => {
                      onReset();
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'নতুন ছবি আপলোড...' : 'New / Upload Photo...'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+N</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSampleModal();
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'স্যাম্পল ছবি ওপেন...' : 'Open Sample Portrait...'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+O</span>
                  </button>

                  <div className="my-1 border-t border-[#2d3038]" />

                  <button
                    onClick={() => {
                      onDownloadSingle();
                      closeDropdown();
                    }}
                    disabled={!hasPhoto}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs disabled:opacity-40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'সিঙ্গেল ছবি সেভ (HD)' : 'Save Single HD (300 DPI)'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+S</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenPrintModal();
                      closeDropdown();
                    }}
                    disabled={!hasPhoto}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs disabled:opacity-40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Printer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'A4 পেপারে প্রিন্ট স্টুডিও...' : 'A4 Print Studio Setup...'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+P</span>
                  </button>
                </div>
              )}
            </div>

            {/* EDIT MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
                className={`px-2 py-1 rounded hover:bg-[#282a31] hover:text-white transition-colors ${
                  openMenu === 'edit' ? 'bg-[#282a31] text-white' : ''
                }`}
              >
                {lang === 'bn' ? 'এডিট (Edit)' : 'Edit'}
              </button>

              {openMenu === 'edit' && (
                <div className="absolute top-full left-0 mt-0.5 w-60 bg-[#212328] border border-[#32363f] rounded-md shadow-2xl py-1 z-50 text-neutral-200">
                  <button
                    onClick={() => {
                      onUndo();
                      closeDropdown();
                    }}
                    disabled={!canUndo}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs disabled:opacity-40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'আন্ডু (Undo Brush/Erase)' : 'Undo Brush / Erase'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+Z</span>
                  </button>

                  <div className="my-1 border-t border-[#2d3038]" />

                  <button
                    onClick={() => {
                      onReCutBackground();
                      closeDropdown();
                    }}
                    disabled={!hasPhoto}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs disabled:opacity-40 transition-colors"
                  >
                    <span>{lang === 'bn' ? 'AI ব্যাকগ্রাউন্ড পুনরায় রিমুভ' : 'Re-run AI Background Removal'}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">ISNet ML</span>
                  </button>
                </div>
              )}
            </div>

            {/* IMAGE / SIZE MENU */}
            <div className="relative hidden xs:block">
              <button
                onClick={() => setOpenMenu(openMenu === 'image' ? null : 'image')}
                className={`px-2 py-1 rounded hover:bg-[#282a31] hover:text-white transition-colors ${
                  openMenu === 'image' ? 'bg-[#282a31] text-white' : ''
                }`}
              >
                {lang === 'bn' ? 'সাইজ (Image)' : 'Image'}
              </button>

              {openMenu === 'image' && (
                <div className="absolute top-full left-0 mt-0.5 w-64 bg-[#212328] border border-[#32363f] rounded-md shadow-2xl py-1 z-50 text-neutral-200">
                  <div className="px-3 py-1 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    {lang === 'bn' ? 'পাসপোর্ট ও স্ট্যাম্প সাইজসমূহ' : 'Document Standards'}
                  </div>
                  {PHOTO_STANDARDS.map((std) => (
                    <button
                      key={std.id}
                      onClick={() => {
                        onSelectStandard?.(std);
                        closeDropdown();
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        {activeStandard.id === std.id && <Check className="w-3 h-3 text-cyan-400" />}
                        <span>{lang === 'bn' ? std.nameBn : std.nameEn}</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono ml-2 shrink-0">
                        {std.widthMm}x{std.heightMm}mm
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FILTER MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'filter' ? null : 'filter')}
                className={`px-2 py-1 rounded hover:bg-[#282a31] hover:text-white transition-colors ${
                  openMenu === 'filter' ? 'bg-[#282a31] text-white' : ''
                }`}
              >
                {lang === 'bn' ? 'ফিল্টার (Filter)' : 'Filter'}
              </button>

              {openMenu === 'filter' && (
                <div className="absolute top-full left-0 mt-0.5 w-60 bg-[#212328] border border-[#32363f] rounded-md shadow-2xl py-1 z-50 text-neutral-200">
                  <button
                    onClick={() => {
                      onAutoBeautify();
                      closeDropdown();
                    }}
                    disabled={!hasPhoto}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs disabled:opacity-40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{lang === 'bn' ? 'অটো বিউটি ও স্কিন স্মুথ' : 'One-Click Auto Beautify'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+B</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab?.('adjustments');
                      closeDropdown();
                    }}
                    disabled={!hasPhoto}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs disabled:opacity-40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'স্মুথ ও ফর্সা স্লাইডার্স...' : 'Skin & Light Sliders...'}</span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* VIEW MENU */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setOpenMenu(openMenu === 'view' ? null : 'view')}
                className={`px-2 py-1 rounded hover:bg-[#282a31] hover:text-white transition-colors ${
                  openMenu === 'view' ? 'bg-[#282a31] text-white' : ''
                }`}
              >
                {lang === 'bn' ? 'ভিউ (View)' : 'View'}
              </button>

              {openMenu === 'view' && (
                <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#212328] border border-[#32363f] rounded-md shadow-2xl py-1 z-50 text-neutral-200">
                  <button
                    onClick={() => {
                      onZoomIn?.();
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                  >
                    <span>{lang === 'bn' ? 'জুম ইন (+)' : 'Zoom In'}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl++</span>
                  </button>

                  <button
                    onClick={() => {
                      onZoomOut?.();
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                  >
                    <span>{lang === 'bn' ? 'জুম আউট (-)' : 'Zoom Out'}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+-</span>
                  </button>

                  <button
                    onClick={() => {
                      onResetZoom?.();
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                  >
                    <span>{lang === 'bn' ? '১০০% ফিট সাইজ' : '100% Fit View'}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Ctrl+0</span>
                  </button>

                  <div className="my-1 border-t border-[#2d3038]" />

                  <button
                    onClick={() => {
                      onToggleHeadGuide?.();
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center justify-between text-xs transition-colors"
                  >
                    <span>{lang === 'bn' ? 'পাসপোর্ট রুলার হেড গাইড' : 'Passport Head Guide'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* WINDOW MENU */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setOpenMenu(openMenu === 'window' ? null : 'window')}
                className={`px-2 py-1 rounded hover:bg-[#282a31] hover:text-white transition-colors ${
                  openMenu === 'window' ? 'bg-[#282a31] text-white' : ''
                }`}
              >
                {lang === 'bn' ? 'উইন্ডো (Window)' : 'Window'}
              </button>

              {openMenu === 'window' && (
                <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#212328] border border-[#32363f] rounded-md shadow-2xl py-1 z-50 text-neutral-200">
                  <button
                    onClick={() => {
                      onSelectTab?.('layers');
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center gap-2 text-xs transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'লেয়ার প্যানেল (Layers)' : 'Layers Panel'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab?.('adjustments');
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center gap-2 text-xs transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'রূপচর্চা প্যানেল (Retouch)' : 'Retouch & Adjustments'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab?.('sizing');
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center gap-2 text-xs transition-colors"
                  >
                    <Crop className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'সাইজ প্যানেল (Standards)' : 'Standards & Sizing'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab?.('joint');
                      closeDropdown();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0074d9] hover:text-white flex items-center gap-2 text-xs transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'জোড়া ছবি (Joint Couple)' : 'Joint Photo Composer'}</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Active Standard Indicator in Center/Left */}
          {hasPhoto && (
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-[#282a30] text-[11px] text-neutral-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
              <span className="text-neutral-200">{activeStandard.nameEn.split('(')[0]}</span>
              <span className="text-neutral-600">|</span>
              <span className="text-cyan-400">{activeStandard.widthMm}x{activeStandard.heightMm}mm</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">300 DPI</span>
            </div>
          )}
        </div>

        {/* Right: Modern Software Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sample Photo Button */}
          <button
            onClick={onOpenSampleModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#25272e] hover:bg-[#2d3039] text-neutral-200 border border-[#323640] transition-colors text-[11px] font-medium"
            title={lang === 'bn' ? 'স্যাম্পল ছবি ওপেন করুন' : 'Load sample portrait'}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'স্যাম্পল' : 'Samples'}</span>
          </button>

          {/* Single Save HD */}
          {hasPhoto && (
            <button
              onClick={onDownloadSingle}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#25272e] hover:bg-[#2d3039] text-neutral-200 border border-[#323640] transition-colors text-[11px] font-medium"
              title={lang === 'bn' ? '১ কপি HD ছবি ডাউনলোড' : 'Export Single HD Photo'}
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">{lang === 'bn' ? 'সেভ HD' : 'Save HD'}</span>
            </button>
          )}

          {/* Primary Action: A4 Print Sheet Studio */}
          {hasPhoto && (
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0074d9] hover:bg-[#0084f7] text-white font-semibold text-[11px] shadow-sm shadow-blue-500/20 transition-all whitespace-nowrap active:scale-[0.98]"
              title={lang === 'bn' ? 'A4 পেপারে কত কপি প্রিন্ট করবেন' : 'A4 Multi-Copy Print Studio'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'A4 প্রিন্ট স্টুডিও' : 'A4 Print Studio'}</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded bg-[#25272e] hover:bg-[#2d3039] text-neutral-400 hover:text-white border border-[#323640] transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#25272e] border border-[#323640] rounded p-0.5 text-[10px] font-mono font-semibold">
            <button
              onClick={() => setLang('bn')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                lang === 'bn' ? 'bg-[#0074d9] text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                lang === 'en' ? 'bg-[#0074d9] text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              ENG
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
