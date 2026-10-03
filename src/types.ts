export type PhotoStandard = {
  id: string;
  nameBn: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  category: 'passport' | 'stamp' | 'joint' | 'other';
  descriptionBn: string;
};

export const PHOTO_STANDARDS: PhotoStandard[] = [
  {
    id: 'bd-passport',
    nameBn: 'বাংলাদেশ পাসপোর্ট (৪০ × ৫০ মি.মি.)',
    nameEn: 'BD Passport (40 x 50 mm)',
    widthMm: 40,
    heightMm: 50,
    aspectRatio: 40 / 50,
    category: 'passport',
    descriptionBn: 'বাংলাদেশ সরকারি পাসপোর্ট ও অফিসিয়াল স্ট্যান্ডার্ড সাইজ',
  },
  {
    id: 'in-uk-passport',
    nameBn: 'ভারত / যুক্তরাজ্য / ইউরোপ (৩৫ × ৪৫ মি.মি.)',
    nameEn: 'India / UK / Schengen (35 x 45 mm)',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    category: 'passport',
    descriptionBn: 'ইউরোপ শেনজেন ও ভারতীয় পাসপোর্ট সাইজ',
  },
  {
    id: 'us-visa',
    nameBn: 'ইউএস ভিসা (২ × ২ ইঞ্চি / ৫০.৮ মি.মি.)',
    nameEn: 'US Visa (2 x 2 inch / 50.8 mm)',
    widthMm: 50.8,
    heightMm: 50.8,
    aspectRatio: 1,
    category: 'passport',
    descriptionBn: 'যুক্তরাষ্ট্র ভিসা ও গ্রিন কার্ড স্কয়ার সাইজ',
  },
  {
    id: 'bd-stamp',
    nameBn: 'স্ট্যাম্প সাইজ (২০ × ২৫ মি.মি.)',
    nameEn: 'Stamp Size (20 x 25 mm)',
    widthMm: 20,
    heightMm: 25,
    aspectRatio: 20 / 25,
    category: 'stamp',
    descriptionBn: 'স্কুল, কলেজ, চাকরির আবেদন ও স্ট্যাম্প সাইজ',
  },
  {
    id: 'joint-photo-rect',
    nameBn: 'জোড়া ছবি - যৌথ পাসপোর্ট (৬০ × ৪০ মি.মি.)',
    nameEn: 'Joint Photo - Landscape (60 x 40 mm)',
    widthMm: 60,
    heightMm: 40,
    aspectRatio: 60 / 40,
    category: 'joint',
    descriptionBn: 'বিবাহিত দম্পতি বা যৌথ আবেদনের জন্য জোড়া ছবি',
  },
  {
    id: 'joint-photo-sq',
    nameBn: 'জোড়া ছবি - স্কয়ার (৫০ × ৫০ মি.মি.)',
    nameEn: 'Joint Photo - Square (50 x 50 mm)',
    widthMm: 50,
    heightMm: 50,
    aspectRatio: 1,
    category: 'joint',
    descriptionBn: '২ জনের পাশাপাশি যৌথ ছবি',
  },
  {
    id: 'size-3r',
    nameBn: '৩R সাইজ (৮৯ × ১২৭ মি.মি. / ৩.৫ × ৫ ইঞ্চি)',
    nameEn: '3R Size (3.5 x 5 inch)',
    widthMm: 89,
    heightMm: 127,
    aspectRatio: 89 / 127,
    category: 'other',
    descriptionBn: 'ছোট পোস্টকার্ড সাইজ প্রিন্ট',
  },
  {
    id: 'size-4r',
    nameBn: '৪R সাইজ (১০২ × ১৫২ মি.মি. / ৪ × ৬ ইঞ্চি)',
    nameEn: '4R Size (4 x 6 inch)',
    widthMm: 102,
    heightMm: 152,
    aspectRatio: 102 / 152,
    category: 'other',
    descriptionBn: 'স্ট্যান্ডার্ড অ্যালবাম ফটো সাইজ',
  },
];

export type BackgroundStyle = 
  | { type: 'solid'; color: string; labelBn: string; labelEn: string }
  | { type: 'gradient'; colors: [string, string]; labelBn: string; labelEn: string }
  | { type: 'transparent'; labelBn: string; labelEn: string };

export const STUDIO_BACKGROUNDS: BackgroundStyle[] = [
  { type: 'solid', color: '#ffffff', labelBn: 'পাসপোর্ট সাদা', labelEn: 'Official White' },
  { type: 'solid', color: '#8ec5fc', labelBn: 'স্টুডিও লাইট ব্লু', labelEn: 'Studio Light Blue' },
  { type: 'solid', color: '#1c44b1', labelBn: 'রয়্যাল ডিপ ব্লু', labelEn: 'Royal Deep Blue' },
  { type: 'solid', color: '#d9e2ec', labelBn: 'সফট গ্রে', labelEn: 'Soft Light Grey' },
  { type: 'solid', color: '#c5221f', labelBn: 'স্টুডিও রেড (মালয়েশিয়া)', labelEn: 'Studio Red' },
  { type: 'gradient', colors: ['#a1c4fd', '#c2e9fb'], labelBn: 'স্টুডিও ব্লু গ্রেডিয়েন্ট', labelEn: 'Studio Blue Gradient' },
  { type: 'gradient', colors: ['#fdfbfb', '#ebedee'], labelBn: 'সফট ভিনিয়েট লাইট', labelEn: 'Studio Soft Glow' },
  { type: 'transparent', labelBn: 'স্বচ্ছ (ট্রান্সপারেন্ট)', labelEn: 'Transparent PNG' },
];

export interface RetouchSettings {
  autoBeautify: boolean;
  skinSmoothing: number; // 0 - 100
  skinBrightness: number; // -50 - 100 (fairness)
  clarity: number; // -50 - 50
  skinWarmth: number; // -30 - 30
  studioGlow: number; // 0 - 100
  sharpness: number; // 0 - 100
  // Manual Image Quality Controls (Brightness, Contrast, Saturation)
  overallBrightness: number; // -50 to +50 (default 0)
  overallContrast: number; // -50 to +50 (default 0)
  overallSaturation: number; // -50 to +50 (default 0)
}

export interface CropState {
  x: number; // 0 - 1 normalized
  y: number; // 0 - 1 normalized
  width: number; // 0 - 1 normalized
  height: number; // 0 - 1 normalized
  zoom: number; // 1 - 3
  rotation: number; // -45 to 45 deg
}

export type PaperSize = 'a4' | '4r' | 'letter';

export interface PrintLayoutConfig {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  copiesPassport: number;
  copiesStamp: number;
  layoutMode: 'passport-only' | 'stamp-only' | 'combo' | 'joint';
  showCuttingMarks: boolean;
  borderStrokeWidthMm: number; // 0.2 mm thin border
  gapMm: number;
  marginMm: number;
}
