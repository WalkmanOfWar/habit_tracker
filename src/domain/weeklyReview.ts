import {
  Habit,
  HabitCompletion,
  Attribute,
  AttributeProgress,
  ATTRIBUTES,
} from "./habitTypes";
import { getXpProgressForLevel } from "./leveling";
import { calculateHabitConsistency, getWeekCompletions } from "./consistency";

export type WeeklyReviewData = {
  completedCount: number;
  partialCount: number;
  skippedCount: number;
  totalXp: number;
  consistencyScore: number;
  strongestAttribute: Attribute | null;
  weakestAttribute: Attribute | null;
  mostCommonSkipReason: string | null;
  attributeProgress: AttributeProgress[];
  recommendations: string[];
  habitScores: Array<{ habit: Habit; score: number }>;
};

export function calculateAttributeProgress(
  completions: HabitCompletion[],
  habits: Habit[]
): AttributeProgress[] {
  return ATTRIBUTES.map((attr) => {
    const attrHabits = habits.filter((h) => h.attribute === attr);
    const attrCompletions = completions.filter((c) =>
      attrHabits.some((h) => h.id === c.habitId)
    );
    const xp = attrCompletions.reduce((sum, c) => sum + c.xpAwarded, 0);
    const { level, xpToCurrentLevel, xpToNextLevel, progressPercent } =
      getXpProgressForLevel(xp);
    return { attribute: attr, xp, level, xpToCurrentLevel, xpToNextLevel, progressPercent };
  });
}

export function buildWeeklyReview(
  habits: Habit[],
  completions: HabitCompletion[],
  weekDate: Date = new Date()
): WeeklyReviewData {
  const activeHabits = habits.filter((h) => !h.archivedAt);
  const weekCompletions = getWeekCompletions(completions, weekDate);

  const completedCount = weekCompletions.filter(
    (c) => c.status === "completed" && c.variantLabel === "full"
  ).length;
  const partialCount = weekCompletions.filter(
    (c) =>
      c.status === "completed" &&
      (c.variantLabel === "minimum" || c.variantLabel === "maintenance")
  ).length;
  const skippedCount = weekCompletions.filter(
    (c) => c.status === "skipped"
  ).length;
  const totalXp = weekCompletions.reduce((sum, c) => sum + c.xpAwarded, 0);

  const habitScores = activeHabits.map((h) => ({
    habit: h,
    score: calculateHabitConsistency(h, completions, weekDate),
  }));

  const consistencyScore =
    habitScores.length > 0
      ? habitScores.reduce((sum, hs) => sum + hs.score, 0) / habitScores.length
      : 0;

  const attrProgress = calculateAttributeProgress(completions, habits);
  const sorted = [...attrProgress].sort((a, b) => b.xp - a.xp);
  const hasAnyXp = sorted.some((a) => a.xp > 0);
  const strongestAttribute = hasAnyXp ? sorted[0].attribute : null;
  // Only report weakest when there are habits and some variation to act on
  const weakestAttribute =
    activeHabits.length > 0 ? sorted[sorted.length - 1].attribute : null;

  // Most common skip reason
  const skipReasons = weekCompletions
    .filter((c) => c.status === "skipped" && c.skipReason)
    .map((c) => c.skipReason!);
  const reasonCounts: Record<string, number> = {};
  skipReasons.forEach((r) => (reasonCounts[r] = (reasonCounts[r] ?? 0) + 1));
  const mostCommonSkipReason =
    Object.keys(reasonCounts).sort((a, b) => reasonCounts[b] - reasonCounts[a])[0] ?? null;

  const recommendations = buildRecommendations(
    habitScores,
    weakestAttribute,
    mostCommonSkipReason,
    consistencyScore
  );

  return {
    completedCount,
    partialCount,
    skippedCount,
    totalXp,
    consistencyScore,
    strongestAttribute,
    weakestAttribute,
    mostCommonSkipReason,
    attributeProgress: attrProgress,
    recommendations,
    habitScores,
  };
}

function buildRecommendations(
  habitScores: Array<{ habit: Habit; score: number }>,
  weakestAttribute: Attribute | null,
  mostCommonSkipReason: string | null,
  consistencyScore: number
): string[] {
  const recs: string[] = [];

  // Low-scoring habits
  const lowScoreHabits = habitScores.filter((hs) => hs.score < 0.4);
  lowScoreHabits.slice(0, 2).forEach((hs) => {
    recs.push(
      `"${hs.habit.name}" has a low completion rate. Consider lowering the weekly target or making the maintenance version easier.`
    );
  });

  if (weakestAttribute && habitScores.length > 0) {
    const attrHabits = habitScores.filter(
      (hs) => hs.habit.attribute === weakestAttribute
    );
    if (attrHabits.length === 0) {
      recs.push(
        `${capitalize(weakestAttribute)} is your lowest attribute. Consider adding a small habit to develop it.`
      );
    }
  }

  if (mostCommonSkipReason) {
    recs.push(
      `You often skip because: "${mostCommonSkipReason}". Adjust your system to address this cue — not your self-worth.`
    );
  }

  if (consistencyScore < 0.5 && recs.length === 0) {
    recs.push(
      "Keep the direction. Adjust the system, not your self-worth. Try doing the smallest useful version this week."
    );
  }

  if (consistencyScore > 0.8) {
    recs.push("Strong week. You protected most habits. Keep the direction.");
  }

  if (recs.length === 0) {
    recs.push("Review your habits and see if any cues can be made more specific.");
  }

  return recs;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
