/** Mirrors CreateDietPlanRequest.DietItemRequest nested record */
export interface DietItemRequest {
  mealType: string;
  foodName: string;
  quantityDescription?: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  notes?: string;
}

/** Mirrors CreateDietPlanRequest record - note: NO update endpoint exists on the backend, same as Workouts. */
export interface CreateDietPlanRequest {
  name: string;
  description?: string;
  memberId: string;
  trainerId?: string;
  dailyCalorieTarget?: number;
  dailyProteinGrams?: number;
  dailyCarbsGrams?: number;
  dailyFatGrams?: number;
  startDate?: string;
  endDate?: string;
  items?: DietItemRequest[];
}

/** Mirrors DietItemResponse */
export interface DietItemResponse {
  id: string;
  mealType: string;
  foodName: string;
  quantityDescription?: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  notes?: string;
}

/** Mirrors DietPlanResponse */
export interface DietPlanResponse {
  id: string;
  name: string;
  description?: string;
  memberId: string;
  memberName: string;
  trainerId?: string;
  trainerName?: string;
  dailyCalorieTarget?: number;
  dailyProteinGrams?: number;
  dailyCarbsGrams?: number;
  dailyFatGrams?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  items: DietItemResponse[];
}

/**
 * mealType is free text on the backend (no enum) - these are just suggested
 * options for the <select> in the form; the person can type a custom one too
 * since the underlying control is a plain text combo, not a locked enum.
 */
export const COMMON_MEAL_TYPES = ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Post-Workout'];

/** Mirrors GenerateAiDietPlanRequest record - powers the Gemini-backed "AI Diet Plan Generator". */
export interface GenerateAiDietPlanRequest {
  memberId?: string; // ignored by the member "generate for me" endpoint; required for the owner/trainer one
  dietType?: string; // e.g. "vegetarian", "vegan", "high-protein", "keto"
  allergiesOrRestrictions?: string;
  cuisinePreference?: string; // e.g. "Indian", "Mediterranean"
  mealsPerDay?: number;
  targetCalories?: number;
  additionalNotes?: string;
  save: boolean;
}
