export type Attribute =
  | "strength"
  | "health"
  | "mind"
  | "career"
  | "discipline"
  | "creativity";

export type PreferredTime = "morning" | "afternoon" | "evening" | "anytime";

export type HabitFrequency = {
  type: "daily" | "weekly";
  targetPerWeek?: number;
};

export type HabitVariantLabel = "full" | "minimum" | "maintenance";

export type HabitVariant = {
  id: string;
  habitId: string;
  label: HabitVariantLabel;
  title: string;
  description: string;
  xp: number;
  completionWeight: number;
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  attribute: Attribute;
  why?: string;
  cue?: string;
  preferredTime: PreferredTime;
  ifThenPlan?: string;
  frequency: HabitFrequency;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
};

export type HabitCompletionStatus = "completed" | "skipped";

export type HabitCompletion = {
  id: string;
  habitId: string;
  date: string;
  status: HabitCompletionStatus;
  variantLabel?: HabitVariantLabel;
  skipReason?: string;
  xpAwarded: number;
  completionWeight: number;
  createdAt: string;
};

export type AttributeProgress = {
  attribute: Attribute;
  xp: number;
  level: number;
  xpToCurrentLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
};

export const ATTRIBUTES: Attribute[] = [
  "strength",
  "health",
  "mind",
  "career",
  "discipline",
  "creativity",
];

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  strength: "Strength",
  health: "Health",
  mind: "Mind",
  career: "Career",
  discipline: "Discipline",
  creativity: "Creativity",
};

export const ATTRIBUTE_ICONS: Record<Attribute, string> = {
  strength: "💪",
  health: "❤️",
  mind: "🧠",
  career: "🚀",
  discipline: "⚔️",
  creativity: "✨",
};

export const COMPLETION_WEIGHTS: Record<HabitVariantLabel, number> = {
  full: 1.0,
  minimum: 0.7,
  maintenance: 0.4,
};

export const PREFERRED_TIME_LABELS: Record<PreferredTime, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};
