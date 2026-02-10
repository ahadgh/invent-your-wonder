import React from 'react';
import { WorkoutDay, WorkoutRoutine, ThemeConfig } from '@/types/workout';
import { CalendarClock, Dumbbell, Utensils, MessageCircle, Phone, Sparkles } from 'lucide-react';

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

  return (
    <div
      className="pdf-day-page"
      style={{
        width: '1050px',
        minHeight: '1485px', // A4 ratio at 1050px width
        backgroundColor: theme.bg,
        color: theme.text,
        direction: 'rtl',
        fontFamily: 'Vazirmatn, sans-serif',
        padding: '60px 50px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header - only on first page */}
      {isFirstPage && (
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: `3px solid ${theme.primary}`, paddingBottom: '30px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {isMeal ? <Utensils size={40} color={theme.primary} /> : <Dumbbell size={40} color={theme.primary} />}
            <span style={{ fontSize: '36px', fontWeight: 900, color: theme.primary }}>
              {isMeal ? 'برنامه غذایی' : 'برنامه تمرینی'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '16px', fontSize: '18px', fontWeight: 700 }}>
            <span>شاگرد: <strong>{workoutData.studentName || '---'}</strong></span>
            <span>وزن: <strong>{workoutData.studentWeight || '---'}</strong></span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginTop: '16px', padding: '8px 24px', borderRadius: '10px',
            backgroundColor: theme.primary, color: theme.tableHeaderColor,
            fontSize: '14px', fontWeight: 800,
          }}>
            <CalendarClock size={16} /> زمان تمدید برنامه: {nextProgramDate}
          </div>
        </div>
      )}

      {/* Day Title */}
      <div style={{
        fontSize: '28px', fontWeight: 900, color: theme.primary,
        borderRight: `6px solid ${theme.primary}`, paddingRight: '16px',
        marginBottom: '20px',
      }}>
        {day.dayName}
      </div>

      {/* Bootstrap-style Table */}
      {isMeal ? (
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '16px',
          border: `2px solid ${theme.secondary}`,
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
                <td style={tdStyle(theme)}>{idx + 1}</td>
                <td style={{ ...tdStyle(theme), fontWeight: 800, color: theme.primary }}>{ex.name}</td>
                <td style={{ ...tdStyle(theme), lineHeight: 1.8 }}>{ex.sets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '16px',
          border: `2px solid ${theme.secondary}`,
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
                <td style={tdStyle(theme)}>{idx + 1}</td>
                <td style={{ ...tdStyle(theme), fontWeight: 800, color: theme.primary }}>{ex.name}</td>
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
        }}>
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
