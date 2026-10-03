import React from 'react';
import { X, User, Users, Sparkles, FolderOpen } from 'lucide-react';
import { SAMPLE_PORTRAITS, loadSampleDataUrl } from '../data/samplePortraits';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
  onSelectSample: (dataUrl: string) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1f2228] border border-[#32363e] rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-neutral-200">
        {/* Photoshop Dialog Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2d3038] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#001e36] border border-[#0074d9] flex items-center justify-center font-bold text-[#38a9ff] text-xs font-sans">
              Ps
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'স্টুডিও স্যাম্পল প্রিসেট' : 'Open Sample Portrait Preset'}</span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">Photoshop Document Templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-[#2c2f38] text-neutral-400 hover:text-white flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-4 font-sans">
          {lang === 'bn'
            ? 'ব্যাকগ্রাউন্ড রিমুভ, চেহারা ফর্সা করা এবং A4 পেপারে প্রিন্ট টেস্ট করতে যেকোনো একটি স্যাম্পল ওপেন করুন:'
            : 'Select a studio sample to test background removal, skin smoothing, and multi-copy A4 print layout:'}
        </p>

        <div className="space-y-2.5">
          {SAMPLE_PORTRAITS.map((sample) => (
            <button
              key={sample.id}
              onClick={async () => {
                const dataUrl = await loadSampleDataUrl(sample);
                onSelectSample(dataUrl);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#181a1f] hover:bg-[#252830] border border-[#2d3038] hover:border-[#0074d9] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-md bg-[#22242b] border border-[#343844] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {sample.category === 'couple' ? (
                  <Users className="w-5 h-5 text-pink-400" />
                ) : (
                  <User className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {lang === 'bn' ? sample.nameBn : sample.nameEn}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  {sample.category === 'couple'
                    ? (lang === 'bn' ? 'দম্পতি বা যৌথ আবেদন (Landscape Joint)' : 'Joint Couple Portrait (Landscape)')
                    : (lang === 'bn' ? 'স্ট্যান্ডার্ড পাসপোর্ট ও স্ট্যাম্প সাইজ' : 'Standard Portrait for Passport & Stamp')}
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                OPEN ↵
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
