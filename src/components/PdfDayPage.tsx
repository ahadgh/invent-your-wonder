import React from 'react';
import { WorkoutDay, WorkoutRoutine, ThemeConfig } from '@/types/workout';
import { CalendarClock, Dumbbell, Utensils, MessageCircle, Phone, Sparkles, Flame, Heart, Zap, Target, Trophy } from 'lucide-react';

interface PdfDayPageProps {
  days: WorkoutDay[];
  startIndex: number;
  workoutData: WorkoutRoutine;
  theme: ThemeConfig;
  nextProgramDate: string;
  isFirstPage: boolean;
  isLastPage: boolean;
}

const PdfDayPage: React.FC<PdfDayPageProps> = ({
  days, startIndex, workoutData, theme, nextProgramDate, isFirstPage, isLastPage
}) => {
  const isMeal = workoutData.type === 'meal';
  const decorIcons = [Flame, Heart, Zap, Target, Trophy];

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
        padding: '40px 45px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        border: `4px solid ${theme.primary}20`,
      }}
    >
      {/* Full page background tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${theme.primary}06 0%, ${theme.bg} 30%, ${theme.bg} 70%, ${theme.primary}06 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Decorative corner elements */}
      <div style={{ position: 'absolute', top: '15px', left: '15px', opacity: 0.05 }}>
        <Dumbbell size={100} color={theme.primary} />
      </div>
      <div style={{ position: 'absolute', bottom: '15px', right: '15px', opacity: 0.05 }}>
        <Trophy size={80} color={theme.primary} />
      </div>

      {/* Side accent bars */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px',
        background: `linear-gradient(to bottom, ${theme.primary}, ${theme.accent || theme.secondary}, ${theme.primary})`,
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px',
        background: `linear-gradient(to bottom, ${theme.accent || theme.secondary}, ${theme.primary}, ${theme.accent || theme.secondary})`,
      }} />
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(to right, ${theme.primary}, ${theme.accent || theme.secondary}, ${theme.primary})`,
      }} />
      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(to right, ${theme.accent || theme.secondary}, ${theme.primary}, ${theme.accent || theme.secondary})`,
      }} />

      {/* Header - only on first page */}
      {isFirstPage && (
        <div style={{
          textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1,
          borderBottom: `3px solid ${theme.primary}`, paddingBottom: '24px',
          background: `linear-gradient(135deg, ${theme.primary}10, ${theme.primary}18, transparent)`,
          borderRadius: '16px', padding: '24px 36px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <Flame size={24} color={theme.primary} style={{ opacity: 0.5 }} />
            {isMeal ? <Utensils size={38} color={theme.primary} /> : <Dumbbell size={38} color={theme.primary} />}
            <span style={{ fontSize: '34px', fontWeight: 900, color: theme.primary }}>
              {isMeal ? 'برنامه غذایی' : 'برنامه تمرینی'}
            </span>
            <Flame size={24} color={theme.primary} style={{ opacity: 0.5 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', marginTop: '10px', fontSize: '16px', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} color={theme.primary} /> شاگرد: <strong>{workoutData.studentName || '---'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color={theme.primary} /> وزن: <strong>{workoutData.studentWeight || '---'}</strong>
            </span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginTop: '14px', padding: '8px 24px', borderRadius: '10px',
            backgroundColor: theme.primary, color: theme.tableHeaderColor,
            fontSize: '13px', fontWeight: 800,
          }}>
            <CalendarClock size={14} /> زمان تمدید برنامه: {nextProgramDate}
          </div>
        </div>
      )}

      {/* Day sections */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '18px', position: 'relative', zIndex: 1 }}>
        {days.map((day, i) => {
          const dayIndex = startIndex + i;
          const DecorIcon = decorIcons[dayIndex % decorIcons.length];
          return (
            <div key={dayIndex}>
              {/* Day Title */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '10px',
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent || theme.primary}cc)`,
                  borderRadius: '10px', padding: '8px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DecorIcon size={22} color={theme.tableHeaderColor || '#fff'} />
                </div>
                <div style={{
                  fontSize: '22px', fontWeight: 900, color: theme.primary,
                  borderRight: `4px solid ${theme.primary}`, paddingRight: '12px',
                }}>
                  {day.dayName}
                </div>
                <div style={{
                  marginRight: 'auto', fontSize: '12px', fontWeight: 700,
                  backgroundColor: theme.secondary, padding: '4px 14px', borderRadius: '16px',
                  color: theme.primary,
                }}>
                  {day.exercises.length} {isMeal ? 'آیتم' : 'حرکت'}
                </div>
              </div>

              {/* Table */}
              {isMeal ? (
                <table style={{
                  width: '100%', borderCollapse: 'collapse', fontSize: '14px',
                  border: `2px solid ${theme.primary}30`, borderRadius: '10px', overflow: 'hidden',
                }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle(theme), width: '40px' }}>#</th>
                      <th style={{ ...thStyle(theme), width: '160px' }}>عنوان</th>
                      <th style={thStyle(theme)}>شرح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.exercises.map((ex, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? theme.rowEven : theme.rowOdd }}>
                        <td style={{ ...tdStyle(theme), textAlign: 'center', fontWeight: 800, color: theme.primary }}>{idx + 1}</td>
                        <td style={{ ...tdStyle(theme), fontWeight: 800, color: theme.primary }}>{ex.name}</td>
                        <td style={{ ...tdStyle(theme), lineHeight: 1.7 }}>{ex.sets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table style={{
                  width: '100%', borderCollapse: 'collapse', fontSize: '14px',
                  border: `2px solid ${theme.primary}30`, borderRadius: '10px', overflow: 'hidden',
                }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle(theme), width: '40px' }}>#</th>
                      <th style={thStyle(theme)}>نام حرکت</th>
                      <th style={{ ...thStyle(theme), width: '80px' }}>ست</th>
                      <th style={{ ...thStyle(theme), width: '80px' }}>تکرار</th>
                      <th style={{ ...thStyle(theme), width: '100px' }}>استراحت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.exercises.map((ex, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? theme.rowEven : theme.rowOdd }}>
                        <td style={{ ...tdStyle(theme), textAlign: 'center', fontWeight: 800, color: theme.primary }}>{idx + 1}</td>
                        <td style={{ ...tdStyle(theme), fontWeight: 800, color: theme.primary }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Dumbbell size={12} color={theme.primary} style={{ opacity: 0.4, flexShrink: 0 }} />
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
            </div>
          );
        })}
      </div>

      {/* Tips - only on last page */}
      {isLastPage && workoutData.tips && (
        <div style={{
          marginTop: '20px', padding: '18px', borderRadius: '12px', position: 'relative', zIndex: 1,
          backgroundColor: theme.secondary, borderRight: `6px solid ${theme.primary}`,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '8px', left: '8px', opacity: 0.06 }}>
            <Trophy size={50} color={theme.primary} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '18px', color: theme.primary, marginBottom: '8px' }}>
            <Sparkles size={18} /> نکات طلایی
          </div>
          <div style={{ fontWeight: 600, lineHeight: 1.9, opacity: 0.8, whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            {workoutData.tips}
          </div>
        </div>
      )}

      {/* Footer - only on last page */}
      {isLastPage && (
        <div style={{
          marginTop: 'auto', paddingTop: '20px', borderTop: `2px dashed ${theme.primary}30`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          color: theme.primary, fontSize: '13px', position: 'relative', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, opacity: 0.7 }}>
            <MessageCircle size={14} /> دریافت و تمدید برنامه واتساپ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: '#25D366' }}>
              <Phone size={18} color="white" fill="white" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', direction: 'ltr' }}>0998 220 2734</span>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = (theme: ThemeConfig): React.CSSProperties => ({
  backgroundColor: theme.tableHeaderBg || theme.primary,
  color: theme.tableHeaderColor || '#fff',
  padding: '10px 12px',
  textAlign: 'right',
  fontWeight: 800,
  fontSize: '13px',
  borderBottom: `2px solid ${theme.primary}40`,
});

const tdStyle = (theme: ThemeConfig): React.CSSProperties => ({
  padding: '8px 12px',
  borderBottom: `1px solid ${theme.primary}20`,
  verticalAlign: 'top',
});

export default PdfDayPage;
