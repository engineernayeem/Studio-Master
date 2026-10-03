import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  User, 
  Users, 
  FileImage, 
  ShieldAlert,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { SAMPLE_PORTRAITS, loadSampleDataUrl } from '../data/samplePortraits';
import { PHOTO_STANDARDS } from '../types';

interface PhotoUploaderProps {
  lang: 'bn' | 'en';
  onImageSelected: (dataUrl: string, autoRemoveBg?: boolean) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ lang, onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError(lang === 'bn' ? 'দয়া করে একটি ছবি ফাইল (JPG, PNG, WEBP) সিলেক্ট করুন' : 'Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        lang === 'bn' 
          ? 'ক্যামেরা এক্সেস পাওয়া যায়নি। অনুগ্রহ করে ফাইল আপলোড ব্যবহার করুন।' 
          : 'Could not access camera. Please upload an image file instead.'
      );
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 960;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        stopCamera();
        onImageSelected(dataUrl, true);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#14161a] select-none">
      <div className="max-w-4xl w-full">
        {/* Photoshop Software Header / Splash */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2d3036] mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#001e36] border border-[#0074d9] flex items-center justify-center font-bold text-[#38a9ff] text-2xl font-sans shadow-lg">
              Ps
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                StudioMaster <span className="text-[#38a9ff] font-mono text-sm font-semibold">WORKSTATION</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'bn' 
                  ? 'প্রফেশনাল পাসপোর্ট ও স্টুডিও ফটো এডিটর • ML ব্যাকগ্রাউন্ড কাটার • A4 প্রিন্ট' 
                  : 'Professional Passport & Stamp Studio Workspace • ML Background Matting'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-md bg-[#0074d9] hover:bg-[#0084f7] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ফটো ওপেন করুন (Open)' : 'Open Photo'}</span>
            </button>

            <button
              onClick={startCamera}
              className="px-3.5 py-2 rounded-md bg-[#22252a] hover:bg-[#2b2e35] text-neutral-200 border border-[#32363e] text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'ক্যামেরা' : 'Camera'}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Canvas Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-14 text-center transition-all cursor-pointer bg-[#181a1f] ${
            isDragging
              ? 'border-[#0074d9] bg-[#0074d9]/10 scale-[1.005]'
              : 'border-[#2d3036] hover:border-[#3d424e] hover:bg-[#1b1d24]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-14 h-14 mx-auto rounded-xl bg-[#23262e] border border-[#343842] flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            {lang === 'bn' ? 'ছবিটি এখানে ড্র্যাগ করুন বা ক্লিক করে ওপেন করুন' : 'Drag and drop your portrait here or click to browse'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4 font-mono">
            {lang === 'bn' 
              ? 'JPG, PNG, WEBP ফরম্যাট সাপোর্ট করে • অটোমেটিক ML ব্যাকগ্রাউন্ড রিমুভ হবে' 
              : 'Supports JPG, PNG, WEBP • Automatically processes ISNet ML background removal'}
          </p>

          <span className="inline-block px-3 py-1 rounded bg-[#252830] text-neutral-300 border border-[#353944] text-[11px] font-mono">
            {lang === 'bn' ? 'ব্রাউজ করতে এখানে চাপুন' : 'Click to select from device'}
          </span>

          {uploadError && (
            <div className="mt-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {cameraError && (
            <div className="mt-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Camera Live Modal */}
        {isCameraActive && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1f2228] border border-[#32363e] rounded-xl max-w-lg w-full p-5 text-center shadow-2xl">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5 font-mono">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>LIVE CAMERA PORTRAIT CAPTURE</span>
                </span>
                <button onClick={stopCamera} className="text-neutral-400 hover:text-white px-2 py-1">
                  ✕
                </button>
              </div>

              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black mb-4 border border-[#32363e]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[62%] h-[68%] rounded-[50%] border-2 border-dashed border-cyan-400/70 relative">
                    <div className="absolute top-[42%] left-0 right-0 border-t border-cyan-400/40" />
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-cyan-300 font-mono bg-black/80 px-1.5 rounded">
                      TOP OF HEAD
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded bg-[#2b2e35] hover:bg-[#343842] text-neutral-300 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2 rounded bg-[#0074d9] hover:bg-[#0084f7] text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ছবি তুলুন ও ওপেন করুন' : 'Capture & Open in Photoshop'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start with Studio Samples */}
        <div className="mt-8 pt-6 border-t border-[#2d3036]">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'অথবা তাৎক্ষণিক টেস্ট করতে স্টুডিও স্যাম্পল ওপেন করুন:' : 'Or open a test studio portrait preset:'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_PORTRAITS.map((sample) => (
              <button
                key={sample.id}
                onClick={async () => {
                  const dataUrl = await loadSampleDataUrl(sample);
                  onImageSelected(dataUrl, true);
                }}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#181a1f] hover:bg-[#20232a] border border-[#2d3036] hover:border-[#0074d9] transition-all text-left group"
              >
                <div className="w-10 h-10 rounded bg-[#22252a] border border-[#32363e] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-neutral-300">
                  {sample.category === 'couple' ? (
                    <Users className="w-5 h-5 text-pink-400" />
                  ) : (
                    <User className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-cyan-400 transition-colors truncate">
                    {lang === 'bn' ? sample.nameBn : sample.nameEn}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {sample.category === 'couple' ? 'Joint 60x40mm' : 'Portrait 40x50mm'}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Supported Studio Standards Showcase */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
          {PHOTO_STANDARDS.slice(0, 5).map((std) => (
            <div key={std.id} className="p-2.5 rounded bg-[#181a1f] border border-[#26282e]">
              <div className="font-semibold text-neutral-300 truncate text-[11px]">{std.nameEn.split('(')[0]}</div>
              <div className="text-cyan-400 text-[10px] mt-0.5">{std.widthMm} × {std.heightMm} mm</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
