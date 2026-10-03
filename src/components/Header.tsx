import React from 'react';
import { Camera, Sparkles, Printer, RefreshCw, Scissors, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  hasPhoto: boolean;
  onReset: () => void;
  onOpenPrintModal: () => void;
  onOpenSampleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  hasPhoto,
  onReset,
  onOpenPrintModal,
  onOpenSampleModal,
}) => {
  return (
    <header className="no-print bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                StudioMaster <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">PRO</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {lang === 'bn' 
                ? 'অটো ব্যাকগ্রাউন্ড রিমুভার • ফর্সা ও স্মুথ স্কিন • পাসপোর্ট ও স্ট্যাম্প প্রিন্ট' 
                : 'Auto Background Remover • Skin Beautify • Passport & Stamp Studio'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sample Photos Button */}
          <button
            onClick={onOpenSampleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={lang === 'bn' ? 'স্যাম্পল ছবি টেস্ট করুন' : 'Try sample photos'}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">{lang === 'bn' ? 'স্যাম্পল ছবি' : 'Samples'}</span>
          </button>

          {/* New Photo / Reset */}
          {hasPhoto && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title={lang === 'bn' ? 'নতুন ছবি আপলোড' : 'New Photo'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন ছবি' : 'New'}</span>
            </button>
          )}

          {/* Quick Print Button */}
          {hasPhoto && (
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'A4 প্রিন্ট শীট' : 'A4 Print Sheet'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {lang === 'bn' ? 'ENG' : 'বাংলা'}
          </button>
        </div>
      </div>
    </header>
  );
};
