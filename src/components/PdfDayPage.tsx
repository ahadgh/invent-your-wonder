import React from 'react';
import { WorkoutDay, WorkoutRoutine, ThemeConfig } from '@/types/workout';
import { CalendarClock, Dumbbell, Utensils, MessageCircle, Phone, Sparkles, Flame, Heart, Zap, Target, Trophy } from 'lucide-react';

interface PdfDayPageProps {
  day: WorkoutDay;
  dayIndex: number;
  workoutData: WorkoutRoutine;
  theme: ThemeConfig;
  nextProgramDate: string;
  isFirstPage: boolean;
  isLastPage: boolean;
}

const PdfDayPage: React.FC<PdfDayPageProps> = ({
  day, dayIndex, workoutData, theme, nextProgramDate, isFirstPage, isLastPage
}) => {
  const isMeal = workoutData.type === 'meal';
  const decorIcons = [Flame, Heart, Zap, Target, Trophy];
  const DecorIcon = decorIcons[dayIndex % decorIcons.length];

  return (
    <div
      className="pdf-day-page"
      style={{
        width: '1050px',
        minHeight: '1485px',
        backgroundColor: theme.bg,
        color: theme.text,
        direction: 'rtl',
        fontFamily: 'Vazirmatn, sans-serif',
        padding: '50px 50px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner elements */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px', opacity: 0.06,
      }}>
        <Dumbbell size={120} color={theme.primary} />
      </div>
      <div style={{
        position: 'absolute', bottom: '20px', right: '20px', opacity: 0.06,
      }}>
        <DecorIcon size={100} color={theme.primary} />
      </div>
      {/* Side accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
        background: `linear-gradient(to bottom, ${theme.primary}, ${theme.accent || theme.secondary}, ${theme.primary})`,
      }} />

      {/* Header - only on first page */}
      {isFirstPage && (
        <div style={{
          textAlign: 'center', marginBottom: '36px',
          borderBottom: `3px solid ${theme.primary}`, paddingBottom: '28px',
          background: `linear-gradient(135deg, ${theme.primary}08, ${theme.primary}15, transparent)`,
          borderRadius: '20px', padding: '30px 40px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <Flame size={28} color={theme.primary} style={{ opacity: 0.5 }} />
            {isMeal ? <Utensils size={42} color={theme.primary} /> : <Dumbbell size={42} color={theme.primary} />}
            <span style={{ fontSize: '38px', fontWeight: 900, color: theme.primary }}>
              {isMeal ? 'برنامه غذایی' : 'برنامه تمرینی'}
            </span>
            <Flame size={28} color={theme.primary} style={{ opacity: 0.5 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '14px', fontSize: '18px', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={18} color={theme.primary} /> شاگرد: <strong>{workoutData.studentName || '---'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={18} color={theme.primary} /> وزن: <strong>{workoutData.studentWeight || '---'}</strong>
            </span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginTop: '16px', padding: '10px 28px', borderRadius: '12px',
            backgroundColor: theme.primary, color: theme.tableHeaderColor,
            fontSize: '14px', fontWeight: 800,
          }}>
            <CalendarClock size={16} /> زمان تمدید برنامه: {nextProgramDate}
          </div>
        </div>
      )}

      {/* Day Title with badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        marginBottom: '22px',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent || theme.primary}cc)`,
          borderRadius: '14px', padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DecorIcon size={26} color={theme.tableHeaderColor || '#fff'} />
        </div>
        <div style={{
          fontSize: '26px', fontWeight: 900, color: theme.primary,
          borderRight: `5px solid ${theme.primary}`, paddingRight: '14px',
        }}>
          {day.dayName}
        </div>
        <div style={{
          marginRight: 'auto', fontSize: '13px', fontWeight: 700,
          backgroundColor: theme.secondary, padding: '6px 16px', borderRadius: '20px',
          color: theme.primary,
        }}>
          {day.exercises.length} {isMeal ? 'آیتم' : 'حرکت'}
        </div>
      </div>

      {/* Table */}
      {isMeal ? (
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '16px',
          border: `2px solid ${theme.secondary}`, borderRadius: '12px', overflow: 'hidden',
        }}>
          <thead>
            <tr>
              <th style={{ ...thStyle(theme), width: '50px' }}>#</th>
              <th style={{ ...thStyle(theme), width: '180px' }}>عنوان</th>
              <th style={thStyle(theme)}>شرح</th>
            </tr>
          </thead>
          <tbody>
            {day.exercises.map((ex, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? theme.rowEven : theme.rowOdd }}>
                <td style={{ ...tdStyle(theme), textAlign: 'center', fontWeight: 800, color: theme.primary }}>{idx + 1}</td>
                <td style={{ ...tdStyle(theme), fontWeight: 800, color: theme.primary }}>{ex.name}</td>
                <td style={{ ...tdStyle(theme), lineHeight: 1.8 }}>{ex.sets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '16px',
          border: `2px solid ${theme.secondary}`, borderRadius: '12px', overflow: 'hidden',
        }}>
          <thead>
            <tr>
              <th style={{ ...thStyle(theme), width: '50px' }}>#</th>
              <th style={thStyle(theme)}>نام حرکت</th>
              <th style={{ ...thStyle(theme), width: '100px' }}>ست</th>
              <th style={{ ...thStyle(theme), width: '100px' }}>تکرار</th>
              <th style={{ ...thStyle(theme), width: '120px' }}>استراحت</th>
            </tr>
          </thead>
          <tbody>
            {day.exercises.map((ex, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? theme.rowEven : theme.rowOdd }}>
                <td style={{ ...tdStyle(theme), textAlign: 'center', fontWeight: 800, color: theme.primary }}>{idx + 1}</td>
                <td style={{ ...tdStyle(theme), fontWeight: 800, color: theme.primary }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Dumbbell size={14} color={theme.primary} style={{ opacity: 0.4, flexShrink: 0 }} />
                    {ex.name}
                  </span>
                </td>
                <td style={{ ...tdStyle(theme), textAlign: 'center' }}>{ex.sets}</td>
                <td style={{ ...tdStyle(theme), textAlign: 'center' }}>{ex.reps}</td>
                <td style={{ ...tdStyle(theme), textAlign: 'center' }}>{ex.rest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Tips - only on last page */}
      {isLastPage && workoutData.tips && (
        <div style={{
          marginTop: '30px', padding: '24px', borderRadius: '16px',
          backgroundColor: theme.secondary, borderRight: `8px solid ${theme.primary}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', opacity: 0.06 }}>
            <Trophy size={60} color={theme.primary} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '20px', color: theme.primary, marginBottom: '12px' }}>
            <Sparkles size={22} /> نکات طلایی
          </div>
          <div style={{ fontWeight: 600, lineHeight: 2, opacity: 0.8, whiteSpace: 'pre-wrap', fontSize: '15px' }}>
            {workoutData.tips}
          </div>
        </div>
      )}

      {/* Footer - only on last page */}
      {isLastPage && (
        <div style={{
          marginTop: 'auto', paddingTop: '30px', borderTop: `2px dashed ${theme.primary}30`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          color: theme.primary, fontSize: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, opacity: 0.7 }}>
            <MessageCircle size={16} /> دریافت و تمدید برنامه واتساپ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '10px', backgroundColor: '#25D366' }}>
              <Phone size={22} color="white" fill="white" />
            </div>
            <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '3px', direction: 'ltr' }}>0998 220 2734</span>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = (theme: ThemeConfig): React.CSSProperties => ({
  backgroundColor: theme.tableHeaderBg || theme.primary,
  color: theme.tableHeaderColor || '#fff',
  padding: '14px 16px',
  textAlign: 'right',
  fontWeight: 800,
  fontSize: '15px',
  borderBottom: `2px solid ${theme.secondary}`,
});

const tdStyle = (theme: ThemeConfig): React.CSSProperties => ({
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.secondary}`,
  verticalAlign: 'top',
});

export default PdfDayPage;