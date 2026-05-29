import { buildWeeklyReview } from "../domain/weeklyReview";
import { Habit, HabitCompletion } from "../domain/habitTypes";

const MONDAY = new Date("2025-01-06");

function habit(id: string, attr: Habit["attribute"], target = 3): Habit {
  return {
    id,
    name: `Habit ${id}`,
    attribute: attr,
    preferredTime: "anytime",
    frequency: { type: "weekly", targetPerWeek: target },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function completion(
  id: string,
  habitId: string,
  date: string,
  opts: Partial<HabitCompletion> = {}
): HabitCompletion {
  return {
    id,
    habitId,
    date,
    status: "completed",
    variantLabel: "full",
    xpAwarded: 25,
    completionWeight: 1.0,
    createdAt: new Date().toISOString(),
    ...opts,
  };
}

describe("buildWeeklyReview", () => {
  it("returns zero stats when no habits and no completions", () => {
    const review = buildWeeklyReview([], [], MONDAY);
    expect(review.completedCount).toBe(0);
    expect(review.partialCount).toBe(0);
    expect(review.skippedCount).toBe(0);
    expect(review.totalXp).toBe(0);
    expect(review.consistencyScore).toBe(0);
    expect(review.strongestAttribute).toBeNull();
    expect(review.weakestAttribute).toBeNull();
  });

  it("correctly counts full vs partial vs skipped", () => {
    const h = habit("h1", "strength");
    const cs = [
      completion("c1", "h1", "2025-01-06"),
      completion("c2", "h1", "2025-01-07", {
        variantLabel: "minimum",
        xpAwarded: 10,
        completionWeight: 0.7,
      }),
      completion("c3", "h1", "2025-01-08", {
        status: "skipped",
        xpAwarded: 0,
        completionWeight: 0,
      }),
    ];
    const review = buildWeeklyReview([h], cs, MONDAY);
    expect(review.completedCount).toBe(1);
    expect(review.partialCount).toBe(1);
    expect(review.skippedCount).toBe(1);
    expect(review.totalXp).toBe(35);
  });

  it("identifies the strongest attribute by total XP", () => {
    const h1 = habit("h1", "strength");
    const h2 = habit("h2", "mind");
    const cs = [
      completion("c1", "h1", "2025-01-06", { xpAwarded: 25 }),
      completion("c2", "h1", "2025-01-07", { xpAwarded: 25 }),
      completion("c3", "h2", "2025-01-06", { xpAwarded: 10 }),
    ];
    const review = buildWeeklyReview([h1, h2], cs, MONDAY);
    expect(review.strongestAttribute).toBe("strength");
  });

  it("identifies most common skip reason", () => {
    const h = habit("h1", "health");
    const cs = [
      completion("c1", "h1", "2025-01-06", {
        status: "skipped",
        skipReason: "too tired",
        xpAwarded: 0,
        completionWeight: 0,
      }),
      completion("c2", "h1", "2025-01-07", {
        status: "skipped",
        skipReason: "too tired",
        xpAwarded: 0,
        completionWeight: 0,
      }),
      completion("c3", "h1", "2025-01-08", {
        status: "skipped",
        skipReason: "no time",
        xpAwarded: 0,
        completionWeight: 0,
      }),
    ];
    const review = buildWeeklyReview([h], cs, MONDAY);
    expect(review.mostCommonSkipReason).toBe("too tired");
  });

  it("produces at least one recommendation", () => {
    const h = habit("h1", "discipline");
    const review = buildWeeklyReview([h], [], MONDAY);
    expect(review.recommendations.length).toBeGreaterThan(0);
  });

  it("generates a positive recommendation for high consistency", () => {
    const h = habit("h1", "discipline", 3);
    const cs = [
      completion("c1", "h1", "2025-01-06"),
      completion("c2", "h1", "2025-01-07"),
      completion("c3", "h1", "2025-01-08"),
    ];
    const review = buildWeeklyReview([h], cs, MONDAY);
    // Score is 3/3 = 100% → should produce a positive message
    const hasPositive = review.recommendations.some(
      (r) => r.includes("Strong") || r.includes("direction") || r.includes("protected")
    );
    expect(hasPositive).toBe(true);
  });
});
