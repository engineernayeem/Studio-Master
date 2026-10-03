import React, { useState, useRef } from 'react';
import { PhotoshopMenuBar } from './components/PhotoshopMenuBar';
import { PhotoUploader } from './components/PhotoUploader';
import { StudioEditor, StudioEditorActions } from './components/StudioEditor';
import { A4PrintSheetModal } from './components/A4PrintSheetModal';
import { SampleModal } from './components/SampleModal';
import { PhotoStandard, PHOTO_STANDARDS } from './types';

export default function App() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Active Document Standard (Passport, Stamp, Visa, Joint, etc.)
  const [activeStandard, setActiveStandard] = useState<PhotoStandard>(PHOTO_STANDARDS[0]);

  // Canvases prepared by StudioEditor for A4 Print sheet
  const [passportCanvas, setPassportCanvas] = useState<HTMLCanvasElement | null>(null);
  const [stampCanvas, setStampCanvas] = useState<HTMLCanvasElement | null>(null);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  // Registered actions from StudioEditor
  const editorActionsRef = useRef<StudioEditorActions | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  // Callback when canvases update in StudioEditor
  const handleSetCanvasesForPrint = (pCanvas: HTMLCanvasElement, sCanvas: HTMLCanvasElement | null) => {
    setPassportCanvas(pCanvas);
    setStampCanvas(sCanvas);
  };

  // Image selected from uploader or sample
  const handleImageSelected = (dataUrl: string) => {
    setImageSrc(dataUrl);
  };

  // Reset editor
  const handleReset = () => {
    if (!imageSrc) return;
    setImageSrc(null);
    setPassportCanvas(null);
    setStampCanvas(null);
    editorActionsRef.current = null;
    setCanUndo(false);
  };

  // Download Single Photo HD
  const handleDownloadSingle = () => {
    if (passportCanvas) {
      const link = document.createElement('a');
      link.download = `studiomaster_${activeStandard.id}_${Date.now()}.png`;
      link.href = passportCanvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#18191d] text-neutral-100 flex flex-col font-['Hind_Siliguri','Inter',sans-serif]">
      {/* Global Photoshop Top Menu Bar */}
      <PhotoshopMenuBar
        lang={lang}
        setLang={setLang}
        hasPhoto={!!imageSrc}
        activeStandard={activeStandard}
        onSelectStandard={(std) => {
          setActiveStandard(std);
          editorActionsRef.current?.selectTab('sizing');
        }}
        onReset={handleReset}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onDownloadSingle={handleDownloadSingle}
        onUndo={() => editorActionsRef.current?.undo()}
        canUndo={canUndo}
        onAutoBeautify={() => editorActionsRef.current?.autoBeautify()}
        onReCutBackground={() => editorActionsRef.current?.reCutBackground()}
        onZoomIn={() => editorActionsRef.current?.zoomIn()}
        onZoomOut={() => editorActionsRef.current?.zoomOut()}
        onResetZoom={() => editorActionsRef.current?.resetZoom()}
        onToggleHeadGuide={() => editorActionsRef.current?.toggleHeadGuide()}
        onSelectTab={(tab) => editorActionsRef.current?.selectTab(tab)}
      />

      {/* Main Workstation Stage */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!imageSrc ? (
          <PhotoUploader lang={lang} onImageSelected={handleImageSelected} />
        ) : (
          <StudioEditor
            lang={lang}
            originalImageSrc={imageSrc}
            activeStandard={activeStandard}
            onSelectStandard={setActiveStandard}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onSetCanvasesForPrint={handleSetCanvasesForPrint}
            onDownloadSingle={handleDownloadSingle}
            onReset={handleReset}
            onRegisterActions={(actions) => {
              editorActionsRef.current = actions;
              setCanUndo(actions.canUndo);
            }}
          />
        )}
      </main>

      {/* A4 Print Production Studio Modal */}
      <A4PrintSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        lang={lang}
        passportCanvas={passportCanvas}
        stampCanvas={stampCanvas}
        activeStandard={activeStandard}
        onDownloadSingle={handleDownloadSingle}
      />

      {/* Sample Portrait Selection Modal */}
      <SampleModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        lang={lang}
        onSelectSample={handleImageSelected}
      />
    </div>
  );
}
