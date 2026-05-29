import { calculateHabitConsistency, calculateOverallConsistency } from "../domain/consistency";
import { Habit, HabitCompletion } from "../domain/habitTypes";

const baseHabit: Habit = {
  id: "h1",
  name: "Test Habit",
  attribute: "discipline",
  preferredTime: "anytime",
  frequency: { type: "weekly", targetPerWeek: 3 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Use a fixed reference Monday so tests are stable
const MONDAY = new Date("2025-01-06"); // Monday, Jan 6 2025

function makeCompletion(
  habitId: string,
  date: string,
  weight: number,
  status: HabitCompletion["status"] = "completed"
): HabitCompletion {
  return {
    id: Math.random().toString(),
    habitId,
    date,
    status,
    xpAwarded: 10,
    completionWeight: weight,
    createdAt: new Date().toISOString(),
  };
}

describe("calculateHabitConsistency", () => {
  it("returns 0 when there are no completions", () => {
    const score = calculateHabitConsistency(baseHabit, [], MONDAY);
    expect(score).toBe(0);
  });

  it("returns 1.0 when target is fully met with full completions", () => {
    const completions = [
      makeCompletion("h1", "2025-01-06", 1.0),
      makeCompletion("h1", "2025-01-07", 1.0),
      makeCompletion("h1", "2025-01-08", 1.0),
    ];
    const score = calculateHabitConsistency(baseHabit, completions, MONDAY);
    expect(score).toBe(1.0);
  });

  it("correctly scores mixed full/minimum/maintenance: 1.0 + 0.7 + 0.4 = 2.1 / 3 = 0.7", () => {
    const completions = [
      makeCompletion("h1", "2025-01-06", 1.0),
      makeCompletion("h1", "2025-01-07", 0.7),
      makeCompletion("h1", "2025-01-08", 0.4),
    ];
    const score = calculateHabitConsistency(baseHabit, completions, MONDAY);
    expect(score).toBeCloseTo(0.7, 5);
  });

  it("caps the score at 1.0 when over-target", () => {
    const completions = [
      makeCompletion("h1", "2025-01-06", 1.0),
      makeCompletion("h1", "2025-01-07", 1.0),
      makeCompletion("h1", "2025-01-08", 1.0),
      makeCompletion("h1", "2025-01-09", 1.0),
      makeCompletion("h1", "2025-01-10", 1.0),
    ];
    const score = calculateHabitConsistency(baseHabit, completions, MONDAY);
    expect(score).toBe(1.0);
  });

  it("ignores skipped completions in weight sum", () => {
    const completions = [
      makeCompletion("h1", "2025-01-06", 0, "skipped"),
      makeCompletion("h1", "2025-01-07", 0, "skipped"),
    ];
    const score = calculateHabitConsistency(baseHabit, completions, MONDAY);
    expect(score).toBe(0);
  });

  it("ignores completions outside the week", () => {
    // Previous Monday = Dec 30 2024
    const completions = [
      makeCompletion("h1", "2024-12-30", 1.0),
      makeCompletion("h1", "2024-12-31", 1.0),
      makeCompletion("h1", "2025-01-01", 1.0),
    ];
    const score = calculateHabitConsistency(baseHabit, completions, MONDAY);
    expect(score).toBe(0);
  });

  it("ignores completions for other habits", () => {
    const completions = [
      makeCompletion("h2", "2025-01-06", 1.0),
      makeCompletion("h2", "2025-01-07", 1.0),
    ];
    const score = calculateHabitConsistency(baseHabit, completions, MONDAY);
    expect(score).toBe(0);
  });
});

describe("calculateOverallConsistency", () => {
  it("returns 0 when there are no active habits", () => {
    const score = calculateOverallConsistency([], [], MONDAY);
    expect(score).toBe(0);
  });

  it("averages consistency across multiple habits", () => {
    const h2: Habit = { ...baseHabit, id: "h2" };
    // h1: 3/3 = 1.0, h2: 0/3 = 0.0 → avg = 0.5
    const completions = [
      makeCompletion("h1", "2025-01-06", 1.0),
      makeCompletion("h1", "2025-01-07", 1.0),
      makeCompletion("h1", "2025-01-08", 1.0),
    ];
    const score = calculateOverallConsistency([baseHabit, h2], completions, MONDAY);
    expect(score).toBeCloseTo(0.5, 5);
  });

  it("excludes archived habits", () => {
    const archived: Habit = {
      ...baseHabit,
      id: "h2",
      archivedAt: new Date().toISOString(),
    };
    const completions = [
      makeCompletion("h1", "2025-01-06", 1.0),
      makeCompletion("h1", "2025-01-07", 1.0),
      makeCompletion("h1", "2025-01-08", 1.0),
    ];
    const score = calculateOverallConsistency([baseHabit, archived], completions, MONDAY);
    expect(score).toBe(1.0);
  });
});
