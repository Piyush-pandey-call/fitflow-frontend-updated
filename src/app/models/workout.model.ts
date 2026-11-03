/** Mirrors CreateExerciseRequest record */
export interface CreateExerciseRequest {
  name: string;
  description?: string;
  muscleGroup?: string;
  videoUrl?: string;
  imageUrl?: string;
}

/** Mirrors ExerciseResponse */
export interface ExerciseResponse {
  id: string;
  name: string;
  description?: string;
  muscleGroup?: string;
  videoUrl?: string;
  imageUrl?: string;
  active: boolean;
}

/** Mirrors CreateWorkoutPlanRequest.WorkoutExerciseItem nested record */
export interface WorkoutExerciseItem {
  exerciseId: string;
  dayOfWeek: number; // 0-6
  orderIndex: number;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
}

/** Mirrors CreateWorkoutPlanRequest record - note: NO update endpoint exists on the backend. */
export interface CreateWorkoutPlanRequest {
  name: string;
  description?: string;
  memberId: string;
  trainerId?: string;
  startDate?: string;
  endDate?: string;
  exercises: WorkoutExerciseItem[];
}

/** Mirrors the nested WorkoutExerciseResponse */
export interface WorkoutExerciseResponse {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup?: string;
  videoUrl?: string;
  dayOfWeek: number;
  orderIndex: number;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
}

/** Mirrors WorkoutPlanResponse */
export interface WorkoutPlanResponse {
  id: string;
  name: string;
  description?: string;
  memberId: string;
  memberName: string;
  trainerId?: string;
  trainerName?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  exercises: WorkoutExerciseResponse[];
}

/** Days of week as the backend represents them - plain 0-6 ints, not an enum. 0 = Sunday, matching java.time.DayOfWeek-adjacent convention used across the app's date pickers. */
export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
