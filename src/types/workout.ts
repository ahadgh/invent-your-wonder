export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface Supplement {
  name: string;
  usage: string;
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
  studentHeight?: string;
  studentBMI?: string;
  studentGoal?: string;
  days: WorkoutDay[];
  supplements?: Supplement[];
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
