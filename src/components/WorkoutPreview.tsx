import React, { useMemo } from 'react';
import { WorkoutRoutine, ThemeConfig } from '@/types/workout';
import {
  Dumbbell, Utensils, CalendarClock, GripVertical, Trash2, Plus, Sparkles,
  MessageCircle, Phone
} from 'lucide-react';

interface WorkoutPreviewProps {
  workoutData: WorkoutRoutine;
  selectedTheme: ThemeConfig;
  previewMode: 'desktop' | 'mobile';
  previewRef: React.RefObject<HTMLDivElement>;
  onUpdateField: (path: string[], value: string) => void;
  onAddExercise: (dayIndex: number) => void;
  onRemoveExercise: (dayIndex: number, exIndex: number) => void;
  onPointerDown: (e: React.PointerEvent, dayIdx: number, exIdx: number) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  workoutData, selectedTheme, previewMode, previewRef,
  onUpdateField, onAddExercise, onRemoveExercise,
  onPointerDown, onPointerMove, onPointerUp
}) => {
  const isMobile = previewMode === 'mobile';

  const nextProgramDate = useMemo(() => {
    const today = new Date();
    const fortyDaysLater = new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(fortyDaysLater);
  }, []);

  return (
    <div
      ref={previewRef}
      className={`bg-white shadow-2xl relative overflow-hidden transition-all duration-500 mx-auto ${isMobile ? 'w-[450px] rounded-[32px]' : 'w-full max-w-[1050px] rounded-[48px]'}`}
      style={{
        backgroundColor: selectedTheme.bg,
        color: selectedTheme.text,
        borderTop: `${isMobile ? '12px' : '22px'} solid ${selectedTheme.primary}`,
        direction: 'rtl',
      }}
    >
      <div className={`${isMobile ? 'p-6' : 'p-16'} flex flex-col items-center`}>
        {/* Header */}
        <header className={`text-center w-full border-b ${isMobile ? 'mb-6 pb-8' : 'mb-14 pb-14'}`} style={{ borderColor: selectedTheme.secondary }}>
          <div className={`inline-block rounded-3xl shadow-lg ${isMobile ? 'p-4 mb-3' : 'p-8 mb-8'}`} style={{ backgroundColor: selectedTheme.primary + '15', color: selectedTheme.primary }}>
            {workoutData.type === 'meal' ? <Utensils size={isMobile ? 32 : 62} /> : <Dumbbell size={isMobile ? 32 : 62} />}
          </div>
          <h3 className={`${isMobile ? 'text-3xl' : 'text-[54px]'} font-black mb-6 tracking-tighter`} style={{ color: selectedTheme.primary }}>
            {workoutData.type === 'meal' ? 'برنامه غذایی' : 'برنامه تمرینی'}
          </h3>

          <div className="grid grid-cols-1 gap-3 mb-8 max-w-2xl mx-auto w-full px-2">
            <div className={`rounded-2xl border flex items-center justify-between ${isMobile ? 'px-5 py-3.5 text-base' : 'px-7 py-5 text-xl'}`} style={{ backgroundColor: selectedTheme.bg, borderColor: selectedTheme.secondary }}>
              <div className="flex items-center gap-2 opacity-50 font-bold tracking-tight">شاگرد:</div>
              <span onBlur={(e) => onUpdateField(['studentName'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="font-black outline-none">{workoutData.studentName || '---'}</span>
            </div>
            <div className={`rounded-2xl border flex items-center justify-between ${isMobile ? 'px-5 py-3.5 text-base' : 'px-7 py-5 text-xl'}`} style={{ backgroundColor: selectedTheme.bg, borderColor: selectedTheme.secondary }}>
              <div className="flex items-center gap-2 opacity-50 font-bold tracking-tight">وزن:</div>
              <span onBlur={(e) => onUpdateField(['studentWeight'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="font-black outline-none">{workoutData.studentWeight || '---'}</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-3 ${isMobile ? 'px-5 py-2.5 text-[13px]' : 'px-10 py-4 text-base'} rounded-xl font-black shadow-xl`} style={{ backgroundColor: selectedTheme.primary, color: selectedTheme.tableHeaderColor }}>
            <CalendarClock size={isMobile ? 14 : 18} /> زمان تمدید برنامه: {nextProgramDate}
          </div>
        </header>

        {/* Days */}
        <div className={`w-full ${isMobile ? 'space-y-8 px-2' : 'space-y-16'}`}>
          {workoutData.days.map((day, dIdx) => (
            <div key={dIdx} className="w-full relative">
              <div
                onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'dayName'], e.currentTarget.innerText)}
                contentEditable suppressContentEditableWarning
                className={`font-black flex items-center outline-none w-full border-r-[5px] pr-4 mb-5 ${isMobile ? 'text-2xl' : 'text-[44px]'}`}
                style={{ borderColor: selectedTheme.primary, color: selectedTheme.primary }}
              >
                {day.dayName}
              </div>

              {workoutData.type === 'meal' ? (
                <div className="w-full space-y-5" onPointerMove={onPointerMove}>
                  {day.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx} data-day-idx={dIdx} data-ex-idx={exIdx}
                      className={`group relative flex flex-col rounded-[26px] border transition-all duration-300 shadow-md w-full ${isMobile ? 'p-7' : 'p-10'}`}
                      style={{ backgroundColor: exIdx % 2 === 0 ? selectedTheme.rowOdd : selectedTheme.rowEven, borderColor: selectedTheme.secondary }}
                    >
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2">
                          <span onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'exercises', exIdx.toString(), 'name'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="px-5 py-2 rounded-xl font-black outline-none text-[13px] uppercase tracking-widest shadow-sm" style={{ backgroundColor: selectedTheme.primary, color: selectedTheme.bg }}>{ex.name}</span>
                          <div className="cursor-grab active:cursor-grabbing p-2 opacity-20 hover:opacity-100 export-hidden touch-none" onPointerDown={(e) => onPointerDown(e, dIdx, exIdx)} onPointerUp={onPointerUp}>
                            <GripVertical size={18} />
                          </div>
                        </div>
                        <button onClick={() => onRemoveExercise(dIdx, exIdx)} className="text-red-400 export-hidden opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
                      </div>
                      <div onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'exercises', exIdx.toString(), 'sets'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className={`font-bold outline-none leading-[1.8] text-justify ${isMobile ? 'text-[17px]' : 'text-[24px]'}`} style={{ color: selectedTheme.text }}>{ex.sets}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 w-full" onPointerMove={onPointerMove}>
                  {day.exercises.map((ex, exIdx) => (
                    <div key={exIdx} data-day-idx={dIdx} data-ex-idx={exIdx} className={`rounded-[22px] border p-6 shadow-sm transition-all duration-300 w-full group`} style={{ backgroundColor: exIdx % 2 === 0 ? selectedTheme.rowOdd : selectedTheme.rowEven, borderColor: selectedTheme.secondary }}>
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl flex items-center justify-center font-black shadow-inner ${isMobile ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'}`} style={{ backgroundColor: selectedTheme.primary, color: selectedTheme.bg }}>{exIdx + 1}</div>
                          <span onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'exercises', exIdx.toString(), 'name'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="font-black text-xl outline-none" style={{ color: selectedTheme.primary }}>{ex.name}</span>
                          <div className="cursor-grab active:cursor-grabbing p-2 opacity-20 hover:opacity-100 export-hidden touch-none" onPointerDown={(e) => onPointerDown(e, dIdx, exIdx)} onPointerUp={onPointerUp}>
                            <GripVertical size={18} />
                          </div>
                        </div>
                        <button onClick={() => onRemoveExercise(dIdx, exIdx)} className="text-red-300 export-hidden opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"><Trash2 size={16} /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: selectedTheme.primary + '10' }}>
                          <span className="block text-[12px] font-black opacity-40 mb-1">ست</span>
                          <div onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'exercises', exIdx.toString(), 'sets'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="font-black text-base outline-none">{ex.sets}</div>
                        </div>
                        <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: selectedTheme.primary + '10' }}>
                          <span className="block text-[12px] font-black opacity-40 mb-1">تکرار</span>
                          <div onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'exercises', exIdx.toString(), 'reps'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="font-black text-base outline-none">{ex.reps}</div>
                        </div>
                        <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: selectedTheme.primary + '10' }}>
                          <span className="block text-[12px] font-black opacity-40 mb-1">استراحت</span>
                          <div onBlur={(e) => onUpdateField(['days', dIdx.toString(), 'exercises', exIdx.toString(), 'rest'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className="font-black text-base outline-none">{ex.rest}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => onAddExercise(dIdx)} className="mt-5 w-full border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 opacity-30 hover:opacity-100 py-4 text-[13px] font-black export-hidden transition-all active:scale-95" style={{ borderColor: selectedTheme.accent + '40', color: selectedTheme.text }}>
                <Plus size={18} /> افزودن مورد
              </button>
            </div>
          ))}
        </div>

        {/* Tips */}
        {workoutData.tips && (
          <div className={`w-full ${isMobile ? 'mt-10 p-7 rounded-[30px]' : 'mt-20 p-14 rounded-[50px]'} border-r-[12px] shadow-2xl relative transition-all duration-300`} style={{ backgroundColor: selectedTheme.secondary, borderColor: selectedTheme.primary }}>
            <h4 className="flex items-center gap-3 font-black text-2xl mb-5" style={{ color: selectedTheme.primary }}><Sparkles size={28} /> نکات طلایی</h4>
            <div onBlur={(e) => onUpdateField(['tips'], e.currentTarget.innerText)} contentEditable suppressContentEditableWarning className={`font-bold leading-relaxed opacity-70 whitespace-pre-wrap outline-none ${isMobile ? 'text-[16px]' : 'text-2xl'}`}>{workoutData.tips}</div>
          </div>
        )}

        {/* Footer */}
        <div className={`w-full ${isMobile ? 'mt-10 p-8' : 'mt-20 p-12'} border-2 border-dashed rounded-[34px] flex flex-col items-center justify-center gap-3 text-center transition-all duration-300`} style={{ borderColor: selectedTheme.primary + '20', color: selectedTheme.primary }}>
          <div className="flex items-center gap-2 font-black text-[13px] opacity-70">
            <MessageCircle size={18} /> <span>دریافت و تمدید برنامه واتساپ</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl text-white shadow-md" style={{ backgroundColor: '#25D366' }}>
              <Phone size={isMobile ? 20 : 32} fill="white" />
            </div>
            <div className={`${isMobile ? 'text-3xl' : 'text-[56px]'} font-black tracking-[4px]`} style={{ direction: 'ltr' }}>0998 220 2734</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPreview;
