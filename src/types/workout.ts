export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface WorkoutDay {
  dayName: string;
  exercises: Exercise[];
}

export interface WorkoutRoutine {
  title: string;
  type: 'workout' | 'meal';
  studentName?: string;
  studentWeight?: string;
  days: WorkoutDay[];
  tips?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  tableHeaderBg: string;
  tableHeaderColor: string;
  rowEven: string;
  rowOdd: string;
  accent: string;
}
