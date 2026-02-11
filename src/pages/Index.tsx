import React, { useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { THEMES } from '@/constants/themes';
import { WorkoutRoutine, ThemeConfig } from '@/types/workout';
import * as htmlToImage from 'html-to-image';
import WorkoutPreview from '@/components/WorkoutPreview';
import PdfDayPage from '@/components/PdfDayPage';
import {
  Dumbbell, Download, Palette, Loader2,
  FileText, ChevronDown, Sparkles,
  Smartphone, Monitor, Undo2, Redo2,
  Coffee, Utensils, FileDown, Image as ImageIcon, FileType
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { createRoot } from 'react-dom/client';

const DAILY_LIMIT = 30;

const Index: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [workoutData, setWorkoutData] = useState<WorkoutRoutine | null>(null);
  const [usageCount, setUsageCount] = useState<number>(() => {
    const today = new Date().toLocaleDateString();
    const stored = localStorage.getItem('app_usage_stats_v3');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.count;
    }
    return 0;
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const defaultTheme = THEMES.find(t => t.id === 'modern-blue') || THEMES[0];
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [past, setPast] = useState<WorkoutRoutine[]>([]);
  const [future, setFuture] = useState<WorkoutRoutine[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragInfo, setDragInfo] = useState<{ dayIdx: number; exIdx: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isMobile = previewMode === 'mobile';

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('app_usage_stats_v3', JSON.stringify({
      date: new Date().toLocaleDateString(),
      count: newCount
    }));
  };

  const nextProgramDate = useMemo(() => {
    const today = new Date();
    const fortyDaysLater = new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(fortyDaysLater);
  }, []);

  const recordChange = useCallback(() => {
    if (!workoutData) return;
    setPast(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(workoutData))]);
    setFuture([]);
  }, [workoutData]);

  const undo = () => {
    if (past.length === 0 || !workoutData) return;
    const previous = past[past.length - 1];
    setFuture(prev => [JSON.parse(JSON.stringify(workoutData)), ...prev]);
    setPast(prev => prev.slice(0, -1));
    setWorkoutData(previous);
  };

  const redo = () => {
    if (future.length === 0 || !workoutData) return;
    const next = future[0];
    setPast(prev => [...prev, JSON.parse(JSON.stringify(workoutData))]);
    setFuture(prev => prev.slice(1));
    setWorkoutData(next);
  };

  const parseWorkoutData = async () => {
    if (usageCount >= DAILY_LIMIT) {
      toast({ title: 'خطا', description: 'سهمیه روزانه شما به پایان رسیده است.', variant: 'destructive' });
      return;
    }
    if (!inputText.trim()) {
      toast({ title: 'خطا', description: 'لطفاً متن برنامه را وارد کنید', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-workout', {
        body: { inputText }
      });

      if (error) throw error;
      setWorkoutData(data);
      setPast([]);
      setFuture([]);
      incrementUsage();
    } catch (err: any) {
      toast({ title: 'خطا', description: err?.message || 'خطا در پردازش هوشمند', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (path: string[], value: string) => {
    if (!workoutData) return;
    recordChange();
    const newData = JSON.parse(JSON.stringify(workoutData));
    let curr: any = newData;
    for (let i = 0; i < path.length - 1; i++) curr = curr[path[i]];
    curr[path[path.length - 1]] = value;
    setWorkoutData(newData);
  };

  const addExercise = (dayIndex: number) => {
    if (!workoutData) return;
    recordChange();
    const newDays = [...workoutData.days];
    const newName = workoutData.type === 'meal' ? `گزینه ${newDays[dayIndex].exercises.length + 1}` : 'حرکت جدید';
    newDays[dayIndex].exercises.push({ name: newName, sets: '-', reps: '-', rest: '-' });
    setWorkoutData({ ...workoutData, days: newDays });
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    if (!workoutData) return;
    recordChange();
    const newDays = [...workoutData.days];
    newDays[dayIndex].exercises.splice(exIndex, 1);
    setWorkoutData({ ...workoutData, days: newDays });
  };

  const moveExercise = useCallback((dayIndex: number, fromIdx: number, toIdx: number) => {
    if (!workoutData || fromIdx === toIdx || toIdx < 0 || toIdx >= workoutData.days[dayIndex].exercises.length) return;
    const newData = JSON.parse(JSON.stringify(workoutData));
    const [moved] = newData.days[dayIndex].exercises.splice(fromIdx, 1);
    newData.days[dayIndex].exercises.splice(toIdx, 0, moved);
    setWorkoutData(newData);
  }, [workoutData]);

  const handlePointerDown = (e: React.PointerEvent, dayIdx: number, exIdx: number) => {
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragInfo({ dayIdx, exIdx });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragInfo) return;
    const targetEl = document.elementFromPoint(e.clientX, e.clientY);
    const item = targetEl?.closest('[data-ex-idx]');
    if (item) {
      const targetDayIdx = parseInt(item.getAttribute('data-day-idx') || '-1');
      const targetExIdx = parseInt(item.getAttribute('data-ex-idx') || '-1');
      if (targetDayIdx === dragInfo.dayIdx && targetExIdx !== dragInfo.exIdx && targetExIdx !== -1) {
        moveExercise(dragInfo.dayIdx, dragInfo.exIdx, targetExIdx);
        setDragInfo({ ...dragInfo, exIdx: targetExIdx });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setDragInfo(null);
  };

  const [pdfExporting, setPdfExporting] = useState(false);

  const getFileName = (ext: string) => {
    const prefix = workoutData?.type === 'meal' ? 'Diet' : 'Workout';
    const name = workoutData?.studentName?.trim();
    const safeName = name ? `_${name.replace(/[^\w\u0600-\u06FF\s]/g, '').replace(/\s+/g, '_')}` : '';
    return `${prefix}${safeName}.${ext}`;
  };

  const downloadJPG = async () => {
    if (!previewRef.current) return;
    setIsDownloadOpen(false);
    setIsLoading(true);
    try {
      await document.fonts.ready;
      const exportWidth = isMobile ? 450 : 1050;
      const dataUrl = await htmlToImage.toJpeg(previewRef.current, {
        quality: 0.92,
        backgroundColor: selectedTheme.bg,
        pixelRatio: 3,
        width: exportWidth,
        filter: (node: HTMLElement) => !node.classList?.contains('export-hidden'),
        style: { direction: 'rtl', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }
      });
      if (dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = getFileName('jpg');
        link.click();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!workoutData) return;
    setIsDownloadOpen(false);
    setIsLoading(true);
    setPdfExporting(true);

    try {
      await document.fonts.ready;

      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const MARGIN_MM = 10;
      const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
      const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;
      const exportWidth = 1050;
      const pixelRatio = 2;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const totalDays = workoutData.days.length;

      for (let dIdx = 0; dIdx < totalDays; dIdx++) {
        if (dIdx > 0) pdf.addPage();

        // Create a temporary container for this day's page
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.zIndex = '-1';
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
          <PdfDayPage
            day={workoutData.days[dIdx]}
            dayIndex={dIdx}
            workoutData={workoutData}
            theme={selectedTheme}
            nextProgramDate={nextProgramDate}
            isFirstPage={dIdx === 0}
            isLastPage={dIdx === totalDays - 1}
          />
        );

        // Wait for render
        await new Promise(r => setTimeout(r, 300));

        const pageEl = container.querySelector('.pdf-day-page') as HTMLElement;
        if (pageEl) {
          const dataUrl = await htmlToImage.toJpeg(pageEl, {
            quality: 0.85,
            backgroundColor: selectedTheme.bg,
            pixelRatio,
            width: exportWidth,
            style: { direction: 'rtl' },
          });

          const img = new Image();
          img.src = dataUrl;
          await new Promise<void>(resolve => { img.onload = () => resolve(); });

          const imgAspect = img.naturalHeight / img.naturalWidth;
          const renderedHeightMM = CONTENT_WIDTH_MM * imgAspect;

          // If content is taller than one page, slice it
          if (renderedHeightMM > CONTENT_HEIGHT_MM) {
            const totalPages = Math.ceil(renderedHeightMM / CONTENT_HEIGHT_MM);
            for (let p = 0; p < totalPages; p++) {
              if (p > 0) pdf.addPage();
              const srcYStart = (p * CONTENT_HEIGHT_MM / renderedHeightMM) * img.naturalHeight;
              const srcYEnd = Math.min(((p + 1) * CONTENT_HEIGHT_MM / renderedHeightMM) * img.naturalHeight, img.naturalHeight);
              const srcHeight = srcYEnd - srcYStart;

              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = srcHeight;
              const ctx = canvas.getContext('2d')!;
              ctx.drawImage(img, 0, srcYStart, img.naturalWidth, srcHeight, 0, 0, img.naturalWidth, srcHeight);

              const pageData = canvas.toDataURL('image/jpeg', 0.85);
              const pageH = (srcHeight / img.naturalHeight) * renderedHeightMM;
              pdf.addImage(pageData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, pageH);
            }
          } else {
            pdf.addImage(dataUrl, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, renderedHeightMM);
          }
        }

        root.unmount();
        document.body.removeChild(container);
      }

      pdf.save(getFileName('pdf'));
    } finally {
      setPdfExporting(false);
      setIsLoading(false);
    }
  };

  const downloadTXT = () => {
    if (!workoutData) return;
    setIsDownloadOpen(false);
    const isMealType = workoutData.type === 'meal';
    let text = `🌟 ${isMealType ? 'برنامه غذایی' : 'برنامه تمرینی'} اختصاصی 🌟\n`;
    text += `👤 نام شاگرد: ${workoutData.studentName || '---'}\n`;
    text += `⚖️ وزن: ${workoutData.studentWeight || '---'}\n`;
    text += `📅 تاریخ تمدید: ${nextProgramDate}\n\n`;
    text += `--------------------------------\n\n`;
    workoutData.days.forEach(day => {
      text += `🔷 [ ${day.dayName} ]\n`;
      day.exercises.forEach((ex, idx) => {
        if (isMealType) {
          text += `${idx + 1}. ${ex.name}: ${ex.sets}\n`;
        } else {
          text += `${idx + 1}. ${ex.name} | ${ex.sets} ست | ${ex.reps} تکرار | استراحت: ${ex.rest}\n`;
        }
      });
      text += `\n`;
    });
    if (workoutData.tips) {
      text += `--------------------------------\n`;
      text += `💡 نکات طلایی:\n${workoutData.tips}\n\n`;
    }
    text += `--------------------------------\n`;
    text += `📲 جهت تمدید و دریافت برنامه جدید پیام بدهید:\n`;
    text += `📞 0998 220 2734\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getFileName('txt');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg">
            {workoutData?.type === 'meal' ? <Utensils size={22} /> : <Dumbbell size={22} />}
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tighter">استایلیست هوشمند</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-4">
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden border">
              <div
                className={`h-full transition-all duration-500 ${usageCount > DAILY_LIMIT * 0.8 ? 'bg-destructive' : 'bg-emerald-500'}`}
                style={{ width: `${(usageCount / DAILY_LIMIT) * 100}%` }}
              />
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setIsDownloadOpen(!isDownloadOpen)} disabled={!workoutData || isLoading} className="bg-foreground hover:opacity-90 disabled:opacity-30 text-background px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-base">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} <span>دریافت خروجی</span> <ChevronDown size={14} />
            </button>
            {isDownloadOpen && (
              <div className="absolute left-0 mt-3 w-56 bg-card border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <button onClick={downloadJPG} className="w-full px-4 py-4 text-right hover:bg-accent flex items-center gap-3 text-foreground transition-colors border-b">
                  <ImageIcon size={20} className="text-primary" /> <span className="font-bold text-base">تصویر (JPG)</span>
                </button>
                <button onClick={downloadPDF} className="w-full px-4 py-4 text-right hover:bg-accent flex items-center gap-3 text-foreground transition-colors border-b">
                  <FileType size={20} className="text-red-500" /> <span className="font-bold text-base">PDF (A4)</span>
                </button>
                <button onClick={downloadTXT} className="w-full px-4 py-4 text-right hover:bg-accent flex items-center gap-3 text-foreground transition-colors">
                  <FileDown size={20} className="text-emerald-500" /> <span className="font-bold text-base">فایل متنی (TXT)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1500px] mx-auto w-full">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-card p-6 rounded-3xl border shadow-xl space-y-4">
            <h2 className="font-black text-xl flex items-center gap-2 text-foreground"><FileText className="text-primary" /> متن برنامه</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="متن برنامه را اینجا قرار دهید..."
              className="w-full h-80 p-4 border-2 border-secondary rounded-2xl focus:border-primary outline-none resize-none text-right bg-secondary/30 text-base leading-relaxed text-foreground"
            />
            <button
              onClick={parseWorkoutData}
              disabled={isLoading || usageCount >= DAILY_LIMIT}
              className="w-full bg-primary hover:opacity-90 disabled:opacity-30 text-primary-foreground py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Sparkles size={22} />} <span>تبدیل هوشمند</span>
            </button>
          </section>

          <section className="bg-card p-6 rounded-3xl border shadow-xl space-y-4">
            <h2 className="font-black text-xl flex items-center gap-2 text-foreground"><Palette className="text-primary" /> انتخاب تم</h2>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {THEMES.map((theme) => (
                <button key={theme.id} onClick={() => setSelectedTheme(theme)} className={`group p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedTheme.id === theme.id ? 'border-primary bg-primary/10' : 'border-secondary hover:bg-secondary'}`}>
                  <div className="w-full h-10 rounded-lg flex overflow-hidden border" style={{ backgroundColor: theme.primary }}>
                    <div className="w-1/2 h-full opacity-30" style={{ backgroundColor: theme.secondary }}></div>
                  </div>
                  <span className="text-[11px] font-black text-muted-foreground truncate w-full text-center">{theme.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-2 bg-card p-1.5 rounded-xl shadow-sm border">
              <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-lg transition-all ${isMobile ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}><Smartphone size={20} /></button>
              <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-lg transition-all ${!isMobile ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}><Monitor size={20} /></button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={undo} disabled={past.length === 0} className="p-2.5 hover:bg-secondary disabled:opacity-20 rounded-lg"><Undo2 size={18} /></button>
              <button onClick={redo} disabled={future.length === 0} className="p-2.5 hover:bg-secondary disabled:opacity-20 rounded-lg"><Redo2 size={18} /></button>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-[50px] p-2 lg:p-12 min-h-[900px] overflow-auto flex justify-center items-start border-[8px] border-card shadow-inner">
            {workoutData ? (
              <WorkoutPreview
                workoutData={workoutData}
                selectedTheme={selectedTheme}
                previewMode={previewMode}
                previewRef={previewRef as React.RefObject<HTMLDivElement>}
                onUpdateField={updateField}
                onAddExercise={addExercise}
                onRemoveExercise={removeExercise}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-8 p-20 text-center animate-pulse">
                <Coffee size={120} className="opacity-10" />
                <p className="text-4xl font-black">آماده طراحی برنامه</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
