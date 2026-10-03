import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Scissors, 
  Crop, 
  Printer, 
  Download, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw, 
  Check, 
  Sliders, 
  Eye, 
  Sun, 
  Palette, 
  Eraser, 
  Brush, 
  Users, 
  Info,
  Maximize2,
  Wand2,
  Move,
  Undo2,
  EyeOff,
  Layers,
  FileImage,
  SlidersHorizontal,
  ChevronRight,
  Maximize,
  Minimize,
  History,
  Lock,
  Compass,
  Contrast,
  Smile,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  PhotoStandard, 
  PHOTO_STANDARDS, 
  STUDIO_BACKGROUNDS, 
  BackgroundStyle, 
  RetouchSettings 
} from '../types';
import { 
  removePortraitBackground, 
  paintBrushOnCutout, 
  magicWandErase 
} from '../utils/backgroundRemoval';
import { applyFaceRetouch } from '../utils/faceRetouch';
import { PhotoshopToolbar, PhotoshopTool } from './PhotoshopToolbar';
import { PhotoshopOptionsBar } from './PhotoshopOptionsBar';

export interface StudioEditorActions {
  undo: () => void;
  canUndo: boolean;
  autoBeautify: () => void;
  reCutBackground: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleHeadGuide: () => void;
  selectTab: (tab: 'layers' | 'adjustments' | 'sizing' | 'joint' | 'history') => void;
}

interface StudioEditorProps {
  lang: 'bn' | 'en';
  originalImageSrc: string;
  onOpenPrintModal: () => void;
  onSetCanvasesForPrint: (passport: HTMLCanvasElement, stamp: HTMLCanvasElement | null) => void;
  onDownloadSingle: () => void;
  onReset: () => void;
  activeStandard: PhotoStandard;
  onSelectStandard: (std: PhotoStandard) => void;
  onRegisterActions?: (actions: StudioEditorActions) => void;
}

type InspectorPanelTab = 'layers' | 'adjustments' | 'sizing' | 'joint' | 'history';

interface HistoryStep {
  id: string;
  nameBn: string;
  nameEn: string;
  time: string;
  snapshot: ImageData;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  lang,
  originalImageSrc,
  onOpenPrintModal,
  onSetCanvasesForPrint,
  onDownloadSingle,
  onReset,
  activeStandard,
  onSelectStandard,
  onRegisterActions,
}) => {
  // Active Photoshop tool
  const [activeTool, setActiveTool] = useState<PhotoshopTool>('move');
  const [activePanelTab, setActivePanelTab] = useState<InspectorPanelTab>('layers');

  // Background states
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [selectedBg, setSelectedBg] = useState<BackgroundStyle>(STUDIO_BACKGROUNDS[0]); // default white
  const [customColor, setCustomColor] = useState('#8ec5fc');
  const [featherRadius, setFeatherRadius] = useState<number>(2);
  const [cutoutThreshold, setCutoutThreshold] = useState<number>(0.45);
  const [mlEngine, setMlEngine] = useState<'ml-service' | 'mediapipe'>('ml-service');

  // Swatch colors
  const [fgColor, setFgColor] = useState('#222222');
  const [bgColor, setBgColor] = useState('#ffffff');

  // Layer Visibility & Opacity
  const [isPortraitVisible, setIsPortraitVisible] = useState(true);
  const [isBgVisible, setIsBgVisible] = useState(true);
  const [portraitOpacity, setPortraitOpacity] = useState(100);

  // Interactive Touch-up Tools
  const [brushSize, setBrushSize] = useState<number>(24);
  const [magicTolerance, setMagicTolerance] = useState<number>(25);
  const [historySteps, setHistorySteps] = useState<HistoryStep[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);

  // Brush Cursor Overlay Position
  const [mousePos, setMousePos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  // Retouch states
  const [retouch, setRetouch] = useState<RetouchSettings>({
    autoBeautify: false,
    skinSmoothing: 40,
    skinBrightness: 16,
    clarity: 8,
    skinWarmth: 3,
    studioGlow: 15,
    sharpness: 20,
    overallBrightness: 0,
    overallContrast: 0,
    overallSaturation: 0,
  });

  // Alignment guide
  const [showHeadGuide, setShowHeadGuide] = useState(true);

  // Transform / Crop states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Joint photo state (Person 2 for couple photos)
  const [isJointMode, setIsJointMode] = useState(activeStandard.category === 'joint');
  const [person2Src, setPerson2Src] = useState<string | null>(null);
  const [person2Canvas, setPerson2Canvas] = useState<HTMLCanvasElement | null>(null);

  // AI analysis state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Canvas references
  const rawImageRef = useRef<HTMLImageElement | null>(null);
  const cutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const isInteractingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Synchronize joint mode with active standard
  useEffect(() => {
    setIsJointMode(activeStandard.category === 'joint');
  }, [activeStandard]);

  // Save history snapshot with label
  const pushHistoryStep = useCallback((canvas: HTMLCanvasElement, nameBn: string, nameEn: string) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const step: HistoryStep = {
      id: `${Date.now()}-${Math.random()}`,
      nameBn,
      nameEn,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      snapshot,
    };

    setHistorySteps((prev) => {
      const trimmed = prev.slice(0, currentHistoryIndex + 1);
      const updated = [...trimmed, step].slice(-15);
      setCurrentHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [currentHistoryIndex]);

  // Restore specific history index
  const restoreHistoryIndex = (index: number) => {
    if (index < 0 || index >= historySteps.length || !cutoutCanvasRef.current) return;
    const target = historySteps[index];
    const ctx = cutoutCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (ctx && target.snapshot) {
      ctx.putImageData(target.snapshot, 0, 0);
      setCurrentHistoryIndex(index);
      renderComposite();
    }
  };

  // Undo
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      restoreHistoryIndex(currentHistoryIndex - 1);
    }
  }, [currentHistoryIndex, historySteps]);

  // Initialize and run auto background removal on load
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      rawImageRef.current = img;
      await executeBackgroundRemoval(img, featherRadius, cutoutThreshold, mlEngine);
    };
    img.src = originalImageSrc;
  }, [originalImageSrc]);

  // Execute background removal
  const executeBackgroundRemoval = async (
    img: HTMLImageElement,
    feather: number,
    threshold: number,
    engine: 'ml-service' | 'mediapipe' = mlEngine
  ) => {
    setIsRemovingBg(true);
    try {
      const cutout = await removePortraitBackground(
        img,
        feather,
        threshold,
        engine === 'ml-service'
      );
      cutoutCanvasRef.current = cutout;
      pushHistoryStep(cutout, 'অটো ব্যাকগ্রাউন্ড রিমুভ (ISNet ML)', 'Auto Background Removal (ISNet ML)');
      setBgRemoved(true);
      renderComposite();
    } catch (err) {
      console.error('Background removal failed:', err);
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Re-run background removal
  const handleFeatherChange = async (radius: number) => {
    setFeatherRadius(radius);
    if (rawImageRef.current) {
      await executeBackgroundRemoval(rawImageRef.current, radius, cutoutThreshold, mlEngine);
    }
  };

  const handleThresholdChange = async (thresh: number) => {
    setCutoutThreshold(thresh);
    if (rawImageRef.current) {
      await executeBackgroundRemoval(rawImageRef.current, featherRadius, thresh, mlEngine);
    }
  };

  // Main rendering pipeline
  const renderComposite = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;

    const source = isHoldingOriginal 
      ? rawImageRef.current 
      : (cutoutCanvasRef.current || rawImageRef.current);
    if (!source) return;

    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    const targetAspect = activeStandard.aspectRatio;
    const baseHeight = 900;
    const baseWidth = Math.round(baseHeight * targetAspect);

    displayCanvas.width = baseWidth;
    displayCanvas.height = baseHeight;

    // 1. Draw Background Layer
    if (isHoldingOriginal) {
      ctx.fillStyle = '#111317';
      ctx.fillRect(0, 0, baseWidth, baseHeight);
    } else if (isBgVisible) {
      if (selectedBg.type === 'solid') {
        ctx.fillStyle = selectedBg.color;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
      } else if (selectedBg.type === 'gradient') {
        const grad = ctx.createRadialGradient(
          baseWidth * 0.5,
          baseHeight * 0.45,
          50,
          baseWidth * 0.5,
          baseHeight * 0.45,
          baseWidth * 0.9
        );
        grad.addColorStop(0, selectedBg.colors[0]);
        grad.addColorStop(1, selectedBg.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
      } else {
        drawCheckerboard(ctx, baseWidth, baseHeight);
      }
    } else {
      drawCheckerboard(ctx, baseWidth, baseHeight);
    }

    // 2. Prepare Retouched Foreground Layer
    if (isPortraitVisible) {
      let workingSource: HTMLCanvasElement | HTMLImageElement = source;
      if (!isHoldingOriginal && cutoutCanvasRef.current) {
        workingSource = applyFaceRetouch(cutoutCanvasRef.current, retouch);
      }

      ctx.save();
      ctx.globalAlpha = portraitOpacity / 100;
      const centerX = baseWidth / 2 + pan.x;
      const centerY = baseHeight / 2 + pan.y;

      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const scale = Math.max(baseWidth / workingSource.width, baseHeight / workingSource.height);
      const drawW = workingSource.width * scale;
      const drawH = workingSource.height * scale;

      if (isJointMode && person2Canvas && !isHoldingOriginal) {
        ctx.drawImage(workingSource, -drawW * 0.75, -drawH * 0.5, drawW * 0.75, drawH);
        ctx.drawImage(person2Canvas, 0, -drawH * 0.5, drawW * 0.75, drawH);
      } else {
        ctx.drawImage(workingSource, -drawW / 2, -drawH / 2, drawW, drawH);
      }

      ctx.restore();
    }

    // 3. Update the high-res canvases for A4 print layout
    updatePrintCanvases(displayCanvas);
  }, [
    selectedBg, 
    retouch, 
    activeStandard, 
    zoom, 
    pan, 
    rotation, 
    isJointMode, 
    person2Canvas, 
    isHoldingOriginal,
    isPortraitVisible,
    isBgVisible,
    portraitOpacity
  ]);

  const updatePrintCanvases = (currentDisplayCanvas: HTMLCanvasElement) => {
    const passportCopy = document.createElement('canvas');
    passportCopy.width = currentDisplayCanvas.width;
    passportCopy.height = currentDisplayCanvas.height;
    passportCopy.getContext('2d')!.drawImage(currentDisplayCanvas, 0, 0);

    const stampCopy = document.createElement('canvas');
    stampCopy.width = Math.round(450 * (20 / 25));
    stampCopy.height = 450;
    const sCtx = stampCopy.getContext('2d')!;
    sCtx.drawImage(currentDisplayCanvas, 0, 0, stampCopy.width, stampCopy.height);

    onSetCanvasesForPrint(passportCopy, stampCopy);
  };

  useEffect(() => {
    renderComposite();
  }, [renderComposite]);

  const drawCheckerboard = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const size = 16;
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#1f2228' : '#282c34';
        ctx.fillRect(x, y, size, size);
      }
    }
  };

  // Convert canvas client coordinates to original image coordinates for brush/wand
  const getImageCoordinates = (clientX: number, clientY: number) => {
    const displayCanvas = displayCanvasRef.current;
    const cutoutCanvas = cutoutCanvasRef.current;
    if (!displayCanvas || !cutoutCanvas) return null;

    const rect = displayCanvas.getBoundingClientRect();
    const canvasX = ((clientX - rect.left) / rect.width) * displayCanvas.width;
    const canvasY = ((clientY - rect.top) / rect.height) * displayCanvas.height;

    const centerX = displayCanvas.width / 2 + pan.x;
    const centerY = displayCanvas.height / 2 + pan.y;

    const rad = (-rotation * Math.PI) / 180;
    const dx = (canvasX - centerX) / zoom;
    const dy = (canvasY - centerY) / zoom;

    const rotX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const rotY = dx * Math.sin(rad) + dy * Math.cos(rad);

    const scale = Math.max(displayCanvas.width / cutoutCanvas.width, displayCanvas.height / cutoutCanvas.height);
    const drawW = cutoutCanvas.width * scale;
    const drawH = cutoutCanvas.height * scale;

    const imgX = ((rotX + drawW / 2) / drawW) * cutoutCanvas.width;
    const imgY = ((rotY + drawH / 2) / drawH) * cutoutCanvas.height;

    if (imgX >= 0 && imgX < cutoutCanvas.width && imgY >= 0 && imgY < cutoutCanvas.height) {
      return { x: Math.round(imgX), y: Math.round(imgY) };
    }
    return null;
  };

  // Pointer event router
  const handlePointerDown = (clientX: number, clientY: number) => {
    isInteractingRef.current = true;

    if (activeTool === 'move') {
      dragStartRef.current = { x: clientX - pan.x, y: clientY - pan.y };
    } else if (activeTool === 'wand') {
      const coords = getImageCoordinates(clientX, clientY);
      if (coords && cutoutCanvasRef.current) {
        magicWandErase(cutoutCanvasRef.current, coords.x, coords.y, magicTolerance);
        pushHistoryStep(cutoutCanvasRef.current, 'ম্যাজিক ওয়ান্ড ইরেজ', 'Magic Wand Erase');
        renderComposite();
      }
    } else if (activeTool === 'eraser' || activeTool === 'restore') {
      const coords = getImageCoordinates(clientX, clientY);
      if (coords && cutoutCanvasRef.current && rawImageRef.current) {
        paintBrushOnCutout(
          cutoutCanvasRef.current,
          rawImageRef.current,
          coords.x,
          coords.y,
          brushSize,
          activeTool === 'eraser' ? 'erase' : 'restore'
        );
        renderComposite();
      }
    } else if (activeTool === 'zoom') {
      setZoom((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    // Update live brush cursor position
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      setMousePos({
        x: clientX - rect.left,
        y: clientY - rect.top,
        visible: true,
      });
    }

    if (!isInteractingRef.current) return;

    if (activeTool === 'move') {
      setPan({
        x: clientX - dragStartRef.current.x,
        y: clientY - dragStartRef.current.y,
      });
    } else if (activeTool === 'eraser' || activeTool === 'restore') {
      const coords = getImageCoordinates(clientX, clientY);
      if (coords && cutoutCanvasRef.current && rawImageRef.current) {
        paintBrushOnCutout(
          cutoutCanvasRef.current,
          rawImageRef.current,
          coords.x,
          coords.y,
          brushSize,
          activeTool === 'eraser' ? 'erase' : 'restore'
        );
        renderComposite();
      }
    }
  };

  const handlePointerUp = () => {
    if (isInteractingRef.current && (activeTool === 'eraser' || activeTool === 'restore')) {
      if (cutoutCanvasRef.current) {
        pushHistoryStep(
          cutoutCanvasRef.current,
          activeTool === 'eraser' ? 'ইরেজার ব্রাশ স্ট্রোক' : 'রিস্টোর ব্রাশ স্ট্রোক',
          activeTool === 'eraser' ? 'Eraser Brush Stroke' : 'Restore Brush Stroke'
        );
      }
    }
    isInteractingRef.current = false;
  };

  // Auto Beautify One-Click Toggle
  const handleAutoBeautify = useCallback(() => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });

    setRetouch((prev) => ({
      ...prev,
      autoBeautify: true,
      skinSmoothing: 55,
      skinBrightness: 24,
      clarity: 10,
      skinWarmth: 4,
      studioGlow: 25,
      sharpness: 25,
    }));
  }, []);

  // Gemini AI Face & Lighting Analysis
  const handleAiFaceAnalysis = async () => {
    if (!displayCanvasRef.current) return;
    setIsAiAnalyzing(true);
    setAiAdvice(null);

    try {
      const dataUrl = displayCanvasRef.current.toDataURL('image/jpeg', 0.8);
      const res = await fetch('/api/ai/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      setRetouch((prev) => ({
        ...prev,
        skinSmoothing: data.recommendedSmoothing ?? 45,
        skinBrightness: data.recommendedBrightness ?? 18,
        clarity: data.recommendedContrast ?? 8,
        skinWarmth: data.recommendedWarmth ?? 3,
        sharpness: data.sharpness ?? 20,
      }));

      setAiAdvice(lang === 'bn' ? data.studioAdviceBn : data.studioAdviceEn);
    } catch (err) {
      console.warn('AI analysis fallback:', err);
      handleAutoBeautify();
      setAiAdvice(
        lang === 'bn'
          ? 'স্টুডিও ফটো স্ট্যান্ডার্ড অনুযায়ী অটো ব্রাইটনেস ও স্কিন স্মুথিং সেট করা হয়েছে।'
          : 'Studio standard skin smoothing and brightness applied.'
      );
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handlePerson2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const url = evt.target?.result as string;
        setPerson2Src(url);
        const img = new Image();
        img.onload = async () => {
          const cutout2 = await removePortraitBackground(img, featherRadius, cutoutThreshold, mlEngine === 'ml-service');
          setPerson2Canvas(cutout2);
          setIsJointMode(true);
          onSelectStandard(PHOTO_STANDARDS[4]); // 60x40mm joint standard
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

  // Register actions to parent Photoshop Menu Bar
  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions({
        undo: handleUndo,
        canUndo: currentHistoryIndex > 0,
        autoBeautify: handleAutoBeautify,
        reCutBackground: () => {
          if (rawImageRef.current) {
            executeBackgroundRemoval(rawImageRef.current, featherRadius, cutoutThreshold, mlEngine);
          }
        },
        zoomIn: () => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2))),
        zoomOut: () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2))),
        resetZoom: () => setZoom(1),
        toggleHeadGuide: () => setShowHeadGuide((v) => !v),
        selectTab: (tab) => setActivePanelTab(tab),
      });
    }
  }, [
    onRegisterActions,
    handleUndo,
    currentHistoryIndex,
    handleAutoBeautify,
    featherRadius,
    cutoutThreshold,
    mlEngine,
  ]);

  // Calculate live brush display diameter in screen pixels
  const liveBrushDiameter = Math.max(8, brushSize * zoom * 0.9);

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-36px)] overflow-hidden bg-[#18191d] text-neutral-200 select-none">
      {/* 1. Context Options Bar (Photoshop Sub-header) */}
      <PhotoshopOptionsBar
        activeTool={activeTool}
        lang={lang}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        onCenterPhoto={() => setPan({ x: 0, y: 0 })}
        selectedStandard={activeStandard}
        onSelectStandard={onSelectStandard}
        showHeadGuide={showHeadGuide}
        setShowHeadGuide={setShowHeadGuide}
        rotation={rotation}
        setRotation={setRotation}
        magicTolerance={magicTolerance}
        setMagicTolerance={setMagicTolerance}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        featherRadius={featherRadius}
        setFeatherRadius={handleFeatherChange}
        isHoldingOriginal={isHoldingOriginal}
        setIsHoldingOriginal={setIsHoldingOriginal}
        onAutoBeautify={handleAutoBeautify}
      />

      {/* 2. Main Workstation Area: Left Toolbar + Center Canvas Desk + Right Inspector Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Photoshop Toolbar */}
        <PhotoshopToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          lang={lang}
          fgColor={fgColor}
          bgColor={selectedBg.type === 'solid' ? selectedBg.color : '#ffffff'}
          onChangeBgColor={(hex) => {
            setBgColor(hex);
            setSelectedBg({
              type: 'solid',
              color: hex,
              labelBn: 'কাস্টম ব্যাকগ্রাউন্ড',
              labelEn: 'Custom Color',
            });
          }}
          onSwapColors={() => {
            const temp = fgColor;
            setFgColor(bgColor);
            setBgColor(temp);
            setSelectedBg({
              type: 'solid',
              color: fgColor,
              labelBn: 'সোয়াপ ব্যাকগ্রাউন্ড',
              labelEn: 'Swapped Color',
            });
          }}
          onResetColors={() => {
            setFgColor('#222222');
            setBgColor('#ffffff');
            setSelectedBg(STUDIO_BACKGROUNDS[0]);
          }}
        />

        {/* Center Canvas Desk (The Viewport with Rulers & Document Tab) */}
        <div 
          ref={viewportRef}
          className="flex-1 flex flex-col bg-[#141518] overflow-hidden relative"
          onMouseEnter={() => setMousePos((p) => ({ ...p, visible: true }))}
          onMouseLeave={() => {
            setMousePos((p) => ({ ...p, visible: false }));
            handlePointerUp();
          }}
        >
          {/* Document Tab Bar */}
          <div className="bg-[#1e2025] border-b border-[#282a30] flex items-center px-2 h-7 text-[11px] font-mono text-neutral-400 shrink-0">
            <div className="bg-[#282b32] text-neutral-200 border-t-2 border-t-[#0074d9] px-3 py-1 flex items-center gap-2 border-r border-[#22242a] shadow-sm">
              <FileImage className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white tracking-tight">{activeStandard.nameEn.split('(')[0]}.psd</span>
              <span className="text-[10px] text-neutral-400 font-mono">@{Math.round(zoom * 100)}%</span>
            </div>
            <div className="ml-auto text-[10px] text-neutral-400 font-mono hidden sm:flex items-center gap-3">
              <span>{activeStandard.widthMm} × {activeStandard.heightMm} mm</span>
              <span className="text-neutral-600">|</span>
              <span className="text-cyan-400">300 DPI (Print Ready)</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">sRGB/8</span>
            </div>
          </div>

          {/* Canvas Viewport Stage (Surrounded by Software Millimeter Rulers) */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top Ruler Bar */}
            <div className="h-4 bg-[#1a1c20] border-b border-[#282b30] flex items-end pl-5 pr-2 select-none overflow-hidden shrink-0 font-mono text-[8px] text-neutral-500">
              <div className="flex justify-between w-full max-w-2xl mx-auto px-4 opacity-70">
                <span>0mm</span>
                <span>10mm</span>
                <span>20mm</span>
                <span>30mm</span>
                <span>40mm</span>
                <span>50mm</span>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              {/* Left Ruler Bar */}
              <div className="w-4 bg-[#1a1c20] border-r border-[#282b30] flex flex-col justify-between py-6 items-center select-none overflow-hidden shrink-0 font-mono text-[8px] text-neutral-500 opacity-70">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
              </div>

              {/* Central Drafting Workspace */}
              <div 
                className={`flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative ${
                  activeTool === 'move'
                    ? 'cursor-grab active:cursor-grabbing'
                    : activeTool === 'wand'
                    ? 'cursor-crosshair'
                    : activeTool === 'zoom'
                    ? 'cursor-zoom-in'
                    : 'cursor-none'
                }`}
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={handlePointerUp}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 1) {
                    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={handlePointerUp}
              >
                {/* Background Removal Spinner */}
                {isRemovingBg && (
                  <div className="absolute inset-0 z-30 bg-[#121316]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#0074d9] border-t-transparent rounded-full animate-spin" />
                    <div className="text-center px-4">
                      <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>ISNet-v1 ML NEURAL SEGMENTATION...</span>
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {lang === 'bn'
                          ? 'পোর্ট্রেট চেহারার সূক্ষ্ম চুল ও কাঁধের প্রান্ত আলাদা করা হচ্ছে'
                          : 'Extracting ultra-clean portrait silhouette'}
                      </p>
                    </div>
                  </div>
                )}

                {/* The Physical Paper Document Frame with Authentic Drop Shadow */}
                <div className="relative max-h-[95%] max-w-[95%] flex items-center justify-center shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-[#383d48] rounded-sm bg-[#111215]">
                  <canvas
                    ref={displayCanvasRef}
                    className="max-h-[70vh] w-auto object-contain block"
                  />

                  {/* Passport Head Alignment Overlay (ICAO / BD Standard) */}
                  {showHeadGuide && !isHoldingOriginal && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                      <div className="w-[66%] h-[78%] border border-dashed border-cyan-400/50 rounded-[46%] relative">
                        <div className="absolute top-[8%] left-0 right-0 border-t border-cyan-400/40">
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-300 bg-[#181a1f]/90 px-1 rounded shadow">
                            CROWN / মাথা
                          </span>
                        </div>
                        <div className="absolute top-[42%] left-0 right-0 border-t border-cyan-400/60">
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-300 bg-[#181a1f]/90 px-1 rounded shadow">
                            EYE LEVEL / চোখ
                          </span>
                        </div>
                        <div className="absolute bottom-[10%] left-0 right-0 border-t border-cyan-400/40">
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-300 bg-[#181a1f]/90 px-1 rounded shadow">
                            CHIN / চিবুক
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Brush Cursor Overlay for Eraser & Restore Tool */}
                {(activeTool === 'eraser' || activeTool === 'restore') && mousePos.visible && (
                  <div
                    className="pointer-events-none fixed z-50 rounded-full border border-white/80 shadow-[0_0_2px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${mousePos.x + (viewportRef.current?.getBoundingClientRect().left || 0)}px`,
                      top: `${mousePos.y + (viewportRef.current?.getBoundingClientRect().top || 0)}px`,
                      width: `${liveBrushDiameter}px`,
                      height: `${liveBrushDiameter}px`,
                      backgroundColor: activeTool === 'eraser' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Photoshop Status Bar */}
          <div className="bg-[#1a1c21] border-t border-[#282a30] px-3 h-6 flex items-center justify-between text-[10px] font-mono text-neutral-400 shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span>Doc: {activeStandard.widthMm}mm × {activeStandard.heightMm}mm</span>
              <span className="text-neutral-600">|</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              <span className="text-neutral-600">|</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ISNet-v1 ML Active
              </span>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 hidden sm:flex">
              <span>Layers: 2</span>
              <span className="text-neutral-600">•</span>
              <span>RGB/8</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400 font-sans">StudioMaster Professional</span>
            </div>
          </div>
        </div>

        {/* Right Photoshop Inspector Panels (Layers, Adjustments, Sizing, Joint, History) */}
        <aside 
          className="no-print w-80 sm:w-88 bg-[#202227] border-l border-[#282a30] flex flex-col shrink-0 text-neutral-300 select-none overflow-y-auto"
          aria-label="Photoshop Inspector Panel"
        >
          {/* Panel Header Tabs */}
          <div className="flex items-center border-b border-[#282a30] bg-[#181a1f] text-xs font-semibold">
            <button
              onClick={() => setActivePanelTab('layers')}
              className={`flex-1 py-2 px-1 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activePanelTab === 'layers'
                  ? 'border-[#0074d9] text-white bg-[#202227]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              title="Layers (লেয়ার)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লেয়ার' : 'Layers'}</span>
            </button>

            <button
              onClick={() => setActivePanelTab('adjustments')}
              className={`flex-1 py-2 px-1 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activePanelTab === 'adjustments'
                  ? 'border-[#0074d9] text-white bg-[#202227]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              title="Retouch & Adjustments (রূপচর্চা)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'রূপচর্চা' : 'Retouch'}</span>
            </button>

            <button
              onClick={() => setActivePanelTab('sizing')}
              className={`flex-1 py-2 px-1 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activePanelTab === 'sizing'
                  ? 'border-[#0074d9] text-white bg-[#202227]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              title="Size & Standards (সাইজ)"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সাইজ' : 'Size'}</span>
            </button>

            <button
              onClick={() => setActivePanelTab('joint')}
              className={`flex-1 py-2 px-1 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activePanelTab === 'joint'
                  ? 'border-[#0074d9] text-white bg-[#202227]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              title="Joint Couple (জোড়া)"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'জোড়া' : 'Joint'}</span>
            </button>

            <button
              onClick={() => setActivePanelTab('history')}
              className={`flex-1 py-2 px-1 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activePanelTab === 'history'
                  ? 'border-[#0074d9] text-white bg-[#202227]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
              title="History (হিস্ট্রি)"
            >
              <History className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'হিস্ট্রি' : 'History'}</span>
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="p-3.5 flex-1 space-y-4 text-xs">
            {/* ================= TAB 1: LAYERS & BACKDROP ================= */}
            {activePanelTab === 'layers' && (
              <div className="space-y-4">
                {/* Photoshop Layer Stack Box */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase font-mono tracking-wider">
                    <span>{lang === 'bn' ? 'লেয়ার স্ট্যাক (Layers)' : 'Layer Stack'}</span>
                    <span className="text-neutral-500 font-normal">Normal • {portraitOpacity}%</span>
                  </div>

                  {/* Opacity Scrubber */}
                  <div className="flex items-center justify-between gap-2 p-1.5 bg-[#17191d] rounded border border-[#2b2e35] mb-2 font-mono text-[11px]">
                    <span className="text-neutral-400">{lang === 'bn' ? 'অপাসিটি:' : 'Opacity:'}</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={portraitOpacity}
                      onChange={(e) => setPortraitOpacity(parseInt(e.target.value))}
                      className="w-24 accent-blue-500 h-1 bg-[#121316] rounded cursor-pointer"
                    />
                    <span className="text-cyan-400 tabular-nums">{portraitOpacity}%</span>
                  </div>

                  <div className="border border-[#2b2e35] rounded-md overflow-hidden divide-y divide-[#2b2e35] bg-[#17191d]">
                    {/* Layer 1: Subject Foreground */}
                    <div className="p-2 flex items-center gap-2.5 bg-[#252830]">
                      <button
                        onClick={() => setIsPortraitVisible(!isPortraitVisible)}
                        className="text-neutral-400 hover:text-white"
                        title="Toggle Subject Visibility"
                      >
                        {isPortraitVisible ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-neutral-600" />}
                      </button>

                      {/* Layer Thumbnail */}
                      <div className="w-8 h-8 rounded border border-[#3b404c] bg-[#121316] overflow-hidden flex items-center justify-center shrink-0">
                        {cutoutCanvasRef.current ? (
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${cutoutCanvasRef.current.toDataURL()})` }}
                          />
                        ) : (
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate text-[11px]">
                          {lang === 'bn' ? 'লেয়ার ১: চেহারা / শরীর (Subject)' : 'Layer 1: Portrait Subject'}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          {bgRemoved ? '✓ ML Cutout Matched' : 'Processing...'}
                        </div>
                      </div>

                      <Lock className="w-3 h-3 text-neutral-600" />
                    </div>

                    {/* Layer 0: Studio Background */}
                    <div className="p-2 flex items-center gap-2.5 bg-[#1b1d22]">
                      <button
                        onClick={() => setIsBgVisible(!isBgVisible)}
                        className="text-neutral-400 hover:text-white"
                        title="Toggle Background Visibility"
                      >
                        {isBgVisible ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-neutral-600" />}
                      </button>

                      {/* Swatch Thumbnail */}
                      <div 
                        className="w-8 h-8 rounded border border-[#3b404c] shrink-0 shadow-inner"
                        style={{
                          background: selectedBg.type === 'solid' 
                            ? selectedBg.color 
                            : selectedBg.type === 'gradient'
                            ? `radial-gradient(circle, ${selectedBg.colors[0]}, ${selectedBg.colors[1]})`
                            : 'transparent'
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-200 truncate text-[11px]">
                          {lang === 'bn' ? 'লেয়ার ০: ব্যাকগ্রাউন্ড কালার' : 'Layer 0: Studio Backdrop'}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {selectedBg.type === 'solid' ? selectedBg.color : 'Gradient Fill'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Studio Standard Backdrop Colors */}
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase font-mono tracking-wider mb-2">
                    {lang === 'bn' ? 'স্টুডিও কালার প্যালেট (Backdrops)' : 'Studio Color Palette'}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {STUDIO_BACKGROUNDS.map((bg, idx) => {
                      const isSelected = selectedBg.type === bg.type && 
                        (bg.type === 'solid' ? bg.color === (selectedBg as any).color : true);

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedBg(bg)}
                          className={`group p-1 rounded-md border flex flex-col items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-[#2b2e35] border-[#0074d9] ring-1 ring-[#0074d9]'
                              : 'bg-[#181a1f] border-[#2b2e35] hover:bg-[#22242a]'
                          }`}
                        >
                          <div
                            className="w-full h-7 rounded border border-black/20 shadow-inner flex items-center justify-center"
                            style={{
                              background: bg.type === 'solid' 
                                ? bg.color 
                                : bg.type === 'gradient'
                                ? `radial-gradient(circle, ${bg.colors[0]}, ${bg.colors[1]})`
                                : 'transparent',
                            }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900 drop-shadow" />}
                          </div>
                          <span className="text-[9px] text-neutral-300 truncate w-full text-center font-sans">
                            {lang === 'bn' ? bg.labelBn : bg.labelEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="mt-3 p-2 rounded-md bg-[#181a1f] border border-[#2b2e35] flex items-center justify-between">
                    <span className="text-[11px] text-neutral-300 font-sans">
                      {lang === 'bn' ? 'কাস্টম হেক্স কালার:' : 'Custom Hex Color:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            setSelectedBg({
                              type: 'solid',
                              color: e.target.value,
                              labelBn: 'কাস্টম',
                              labelEn: 'Custom',
                            });
                          }
                        }}
                        className="w-18 bg-[#121316] text-neutral-200 border border-[#3b404d] rounded px-1.5 py-0.5 font-mono text-[11px] text-center"
                      />
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedBg({
                            type: 'solid',
                            color: e.target.value,
                            labelBn: 'কাস্টম',
                            labelEn: 'Custom',
                          });
                        }}
                        className="w-7 h-7 rounded cursor-pointer border border-[#3b404d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Edge Refinement Controls */}
                <div className="p-3 rounded-md bg-[#181a1f] border border-[#2b2e35] space-y-3">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase font-mono tracking-wider">
                    {lang === 'bn' ? 'এজ রিফাইনিং ও মাস্ক কন্ট্রোল' : 'Edge Refine & Masking'}
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'ফেদারিং (Edge Feather):' : 'Edge Feathering:'}</span>
                      <span className="font-mono text-cyan-400">{featherRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={featherRadius}
                      onChange={(e) => handleFeatherChange(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'কাটআউট থ্রেশহোল্ড (Alpha Limit):' : 'Cutout Threshold:'}</span>
                      <span className="font-mono text-cyan-400">{Math.round(cutoutThreshold * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.05"
                      value={cutoutThreshold}
                      onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: RETOUCH & BEAUTIFY ================= */}
            {activePanelTab === 'adjustments' && (
              <div className="space-y-4">
                {/* One-Click Auto Beautify Button */}
                <button
                  onClick={handleAutoBeautify}
                  className="w-full py-2.5 px-3 rounded-md bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  <span>{lang === 'bn' ? 'এক ক্লিকে অটো ফর্সা ও স্মুথ করুন' : 'One-Click Auto Beautify'}</span>
                </button>

                {/* Gemini AI Face Advisor */}
                <div className="p-3 rounded-md bg-[#181a1f] border border-[#2b2e35] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-200 flex items-center gap-1.5 text-xs">
                      <Sun className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'AI ফেস ও লাইটিং অ্যানালাইজার' : 'AI Face & Light Advisor'}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">Gemini 3.8 Flash Engine</div>
                  </div>
                  <button
                    onClick={handleAiFaceAnalysis}
                    disabled={isAiAnalyzing}
                    className="px-3 py-1 rounded bg-[#272a31] hover:bg-[#343842] border border-[#3b404d] text-cyan-400 text-[11px] font-semibold disabled:opacity-50 transition-colors"
                  >
                    {isAiAnalyzing ? '...' : (lang === 'bn' ? 'অ্যানালাইজ' : 'Tune')}
                  </button>
                </div>

                {aiAdvice && (
                  <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-[11px] flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{aiAdvice}</span>
                  </div>
                )}

                {/* Retouch Sliders with Numerical Inputs */}
                <div className="space-y-3 pt-1">
                  {/* Skin Smoothing */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'স্কিন স্মুথিং (Smooth):' : 'Skin Smoothing:'}</span>
                      <span className="font-mono text-cyan-400 tabular-nums bg-[#121316] px-1 rounded border border-[#2b2e35]">{retouch.skinSmoothing}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={retouch.skinSmoothing}
                      onChange={(e) => setRetouch((p) => ({ ...p, skinSmoothing: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>

                  {/* Skin Fairness / Brightness */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'চেহারা ফর্সা ও ব্রাইটনেস:' : 'Fairness & Brightness:'}</span>
                      <span className="font-mono text-amber-400 tabular-nums bg-[#121316] px-1 rounded border border-[#2b2e35]">+{retouch.skinBrightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="80"
                      value={retouch.skinBrightness}
                      onChange={(e) => setRetouch((p) => ({ ...p, skinBrightness: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>

                  {/* Clarity */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'ক্ল্যারিটি ও কনট্রাস্ট:' : 'Clarity & Contrast:'}</span>
                      <span className="font-mono text-neutral-200 tabular-nums bg-[#121316] px-1 rounded border border-[#2b2e35]">{retouch.clarity}%</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="50"
                      value={retouch.clarity}
                      onChange={(e) => setRetouch((p) => ({ ...p, clarity: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>

                  {/* Studio Radiance Glow */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'স্টুডিও গ্লো (Glow):' : 'Studio Radiance Glow:'}</span>
                      <span className="font-mono text-pink-400 tabular-nums bg-[#121316] px-1 rounded border border-[#2b2e35]">{retouch.studioGlow}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={retouch.studioGlow}
                      onChange={(e) => setRetouch((p) => ({ ...p, studioGlow: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>

                  {/* Sharpness */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>{lang === 'bn' ? 'চোখ ও লিপ শার্পনেস:' : 'Eye & Lip Sharpness:'}</span>
                      <span className="font-mono text-emerald-400 tabular-nums bg-[#121316] px-1 rounded border border-[#2b2e35]">{retouch.sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={retouch.sharpness}
                      onChange={(e) => setRetouch((p) => ({ ...p, sharpness: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 h-1 bg-[#121316] rounded"
                    />
                  </div>
                </div>

                {/* ================= MANUAL IMAGE QUALITY CONTROLS ================= */}
                <div className="p-3 rounded-md bg-[#181a1f] border border-[#2b2e35] space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#2b2e35] pb-2">
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-200 text-xs">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'ম্যানুয়াল ইমেজ কোয়ালিটি কন্ট্রোল' : 'Manual Image Quality'}</span>
                    </div>
                    <button
                      onClick={() =>
                        setRetouch((p) => ({
                          ...p,
                          overallBrightness: 0,
                          overallContrast: 0,
                          overallSaturation: 0,
                        }))
                      }
                      className="text-[10px] text-neutral-400 hover:text-cyan-400 font-mono transition-colors"
                      title="Reset Brightness, Contrast, Saturation"
                    >
                      {lang === 'bn' ? 'ডিফল্ট (0%)' : 'Reset (0%)'}
                    </button>
                  </div>

                  {/* 1. Overall Brightness */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>{lang === 'bn' ? 'উজ্জ্বলতা (Brightness):' : 'Brightness:'}</span>
                      </span>
                      <span className="font-mono text-amber-400 tabular-nums bg-[#121316] px-1.5 py-0.5 rounded border border-[#2b2e35]">
                        {retouch.overallBrightness > 0 ? `+${retouch.overallBrightness}` : retouch.overallBrightness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={retouch.overallBrightness}
                      onChange={(e) => setRetouch((p) => ({ ...p, overallBrightness: parseInt(e.target.value) }))}
                      className="w-full accent-amber-500 h-1 bg-[#121316] rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                      <span>-50%</span>
                      <button 
                        onClick={() => setRetouch((p) => ({ ...p, overallBrightness: 0 }))}
                        className="hover:text-neutral-300"
                      >
                        0%
                      </button>
                      <span>+50%</span>
                    </div>
                  </div>

                  {/* 2. Overall Contrast */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Contrast className="w-3 h-3 text-cyan-400" />
                        <span>{lang === 'bn' ? 'কনট্রাস্ট (Contrast):' : 'Contrast:'}</span>
                      </span>
                      <span className="font-mono text-cyan-400 tabular-nums bg-[#121316] px-1.5 py-0.5 rounded border border-[#2b2e35]">
                        {retouch.overallContrast > 0 ? `+${retouch.overallContrast}` : retouch.overallContrast}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={retouch.overallContrast}
                      onChange={(e) => setRetouch((p) => ({ ...p, overallContrast: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-500 h-1 bg-[#121316] rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                      <span>-50%</span>
                      <button 
                        onClick={() => setRetouch((p) => ({ ...p, overallContrast: 0 }))}
                        className="hover:text-neutral-300"
                      >
                        0%
                      </button>
                      <span>+50%</span>
                    </div>
                  </div>

                  {/* 3. Overall Saturation */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Palette className="w-3 h-3 text-pink-400" />
                        <span>{lang === 'bn' ? 'স্যাচুরেশন (Saturation):' : 'Saturation:'}</span>
                      </span>
                      <span className="font-mono text-pink-400 tabular-nums bg-[#121316] px-1.5 py-0.5 rounded border border-[#2b2e35]">
                        {retouch.overallSaturation > 0 ? `+${retouch.overallSaturation}` : retouch.overallSaturation}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={retouch.overallSaturation}
                      onChange={(e) => setRetouch((p) => ({ ...p, overallSaturation: parseInt(e.target.value) }))}
                      className="w-full accent-pink-500 h-1 bg-[#121316] rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                      <span>-50% (B&W)</span>
                      <button 
                        onClick={() => setRetouch((p) => ({ ...p, overallSaturation: 0 }))}
                        className="hover:text-neutral-300"
                      >
                        0%
                      </button>
                      <span>+50% (Vivid)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setRetouch({
                    autoBeautify: false,
                    skinSmoothing: 0,
                    skinBrightness: 0,
                    clarity: 0,
                    skinWarmth: 0,
                    studioGlow: 0,
                    sharpness: 0,
                    overallBrightness: 0,
                    overallContrast: 0,
                    overallSaturation: 0,
                  })}
                  className="w-full py-1.5 text-[11px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {lang === 'bn' ? 'রিসেট অল ফিল্টার্স' : 'Reset All Filters'}
                </button>
              </div>
            )}

            {/* ================= TAB 3: CANVAS SIZING ================= */}
            {activePanelTab === 'sizing' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase font-mono tracking-wider mb-1">
                  {lang === 'bn' ? 'পাসপোর্ট ও স্ট্যাম্প সাইজসমূহ' : 'Document Standards'}
                </div>

                <div className="space-y-1.5">
                  {PHOTO_STANDARDS.map((std) => {
                    const isSelected = activeStandard.id === std.id;
                    return (
                      <button
                        key={std.id}
                        onClick={() => {
                          onSelectStandard(std);
                          setIsJointMode(std.category === 'joint');
                        }}
                        className={`w-full p-2.5 rounded-md border text-left transition-all ${
                          isSelected
                            ? 'bg-[#2b2e35] border-[#0074d9] ring-1 ring-[#0074d9]'
                            : 'bg-[#181a1f] border-[#2b2e35] hover:bg-[#22242a]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-200">
                          <span className="truncate">{lang === 'bn' ? std.nameBn : std.nameEn}</span>
                          <span className="font-mono text-[10px] text-cyan-400 shrink-0 ml-1 bg-[#121316] px-1.5 py-0.5 rounded border border-[#2b2e35]">
                            {std.widthMm}x{std.heightMm}mm
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 truncate">
                          {std.descriptionBn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 4: JOINT PHOTO ================= */}
            {activePanelTab === 'joint' && (
              <div className="space-y-4">
                <div className="p-2.5 rounded-md bg-[#181a1f] border border-[#2b2e35] text-[11px] text-neutral-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'বিবাহিত দম্পতি বা যৌথ আবেদনের জন্য ২ জনের ছবি পাশাপাশি জোড়া লাগানো হয়।'
                    : 'Joint couple passport photo for marriage or joint visa application.'}
                </div>

                <div className="p-3 rounded-md bg-[#181a1f] border border-[#2b2e35] text-center space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-300 block">
                    {lang === 'bn' ? '২য় ব্যক্তির ছবি যোগ করুন (Person 2):' : 'Upload Person 2 Photo:'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePerson2Upload}
                    className="text-[11px] text-neutral-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-[#0074d9] file:text-white hover:file:bg-[#0084f7] cursor-pointer"
                  />
                  {person2Src && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      ✓ Person 2 Layer Mounted
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onSelectStandard(PHOTO_STANDARDS[4]);
                      setIsJointMode(true);
                    }}
                    className="p-2 rounded bg-[#181a1f] border border-[#2b2e35] hover:bg-[#22242a] text-left text-[11px]"
                  >
                    <div className="font-semibold text-white">60x40 mm</div>
                    <div className="text-[10px] text-neutral-400">Landscape Joint</div>
                  </button>
                  <button
                    onClick={() => {
                      onSelectStandard(PHOTO_STANDARDS[5]);
                      setIsJointMode(true);
                    }}
                    className="p-2 rounded bg-[#181a1f] border border-[#2b2e35] hover:bg-[#22242a] text-left text-[11px]"
                  >
                    <div className="font-semibold text-white">50x50 mm</div>
                    <div className="text-[10px] text-neutral-400">Square Joint</div>
                  </button>
                </div>
              </div>
            )}

            {/* ================= TAB 5: HISTORY ================= */}
            {activePanelTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase font-mono tracking-wider mb-1">
                  <span>{lang === 'bn' ? 'হিস্ট্রি স্টেটসমূহ' : 'History States'}</span>
                  <button
                    onClick={handleUndo}
                    disabled={currentHistoryIndex <= 0}
                    className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                </div>

                <div className="space-y-1">
                  {historySteps.map((step, idx) => {
                    const isCurrent = idx === currentHistoryIndex;
                    return (
                      <button
                        key={step.id}
                        onClick={() => restoreHistoryIndex(idx)}
                        className={`w-full p-2 rounded text-left flex items-center justify-between text-[11px] transition-colors ${
                          isCurrent
                            ? 'bg-[#0074d9] text-white font-semibold'
                            : 'bg-[#181a1f] hover:bg-[#22242a] text-neutral-300'
                        }`}
                      >
                        <span className="truncate">{lang === 'bn' ? step.nameBn : step.nameEn}</span>
                        <span className="text-[10px] opacity-70 font-mono shrink-0 ml-2">{step.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dock Action Bar (Export & Print) */}
          <div className="p-3 border-t border-[#282a30] bg-[#1a1c21] space-y-2">
            <button
              onClick={onOpenPrintModal}
              className="w-full py-2.5 px-3 rounded bg-[#0074d9] hover:bg-[#0084f7] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'A4 পেপারে কত কপি প্রিন্ট দিবেন' : 'Launch A4 Print Studio'}</span>
            </button>

            <button
              onClick={onDownloadSingle}
              className="w-full py-2 px-3 rounded bg-[#272a31] hover:bg-[#323640] border border-[#383d4a] text-neutral-200 font-medium text-[11px] flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? '১ কপি সিঙ্গেল ছবি ডাউনলোড (HD)' : 'Save Single Photo (HD)'}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
