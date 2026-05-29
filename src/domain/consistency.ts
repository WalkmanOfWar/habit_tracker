import { HabitCompletion, Habit } from "./habitTypes";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";

export function getWeekCompletions(
  completions: HabitCompletion[],
  weekDate: Date = new Date()
): HabitCompletion[] {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const end = endOfWeek(weekDate, { weekStartsOn: 1 });
  return completions.filter((c) =>
    isWithinInterval(parseISO(c.date), { start, end })
  );
}

export function calculateHabitConsistency(
  habit: Habit,
  completions: HabitCompletion[],
  weekDate: Date = new Date()
): number {
  const weekCompletions = getWeekCompletions(completions, weekDate).filter(
    (c) => c.habitId === habit.id && c.status === "completed"
  );
  const target = habit.frequency.targetPerWeek ?? 7;
  const weightedSum = weekCompletions.reduce(
    (sum, c) => sum + c.completionWeight,
    0
  );
  return Math.min(1.0, weightedSum / target);
}

export function calculateOverallConsistency(
  habits: Habit[],
  completions: HabitCompletion[],
  weekDate: Date = new Date()
): number {
  const activeHabits = habits.filter((h) => !h.archivedAt);
  if (activeHabits.length === 0) return 0;
  const scores = activeHabits.map((h) =>
    calculateHabitConsistency(h, completions, weekDate)
  );
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}
