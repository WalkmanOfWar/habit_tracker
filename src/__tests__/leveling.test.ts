import {
  xpRequiredForLevel,
  getLevelFromXp,
  getXpProgressForLevel,
} from "../domain/leveling";

/**
 * Leveling thresholds (xpRequiredForLevel(n) = 100 * n * n):
 *   Level 1:  0   – 99  XP
 *   Level 2:  100 – 399 XP
 *   Level 3:  400 – 899 XP
 *   Level 4:  900 – 1599 XP
 *   Level 5:  1600 – 2499 XP
 *   Level 6:  2500 – 3599 XP
 */

describe("xpRequiredForLevel", () => {
  it("level 1 ceiling is 100 XP", () => {
    expect(xpRequiredForLevel(1)).toBe(100);
  });

  it("level 2 ceiling is 400 XP", () => {
    expect(xpRequiredForLevel(2)).toBe(400);
  });

  it("level 3 ceiling is 900 XP", () => {
    expect(xpRequiredForLevel(3)).toBe(900);
  });

  it("level 5 ceiling is 2500 XP", () => {
    expect(xpRequiredForLevel(5)).toBe(2500);
  });
});

describe("getLevelFromXp", () => {
  it("0 XP is level 1", () => {
    expect(getLevelFromXp(0)).toBe(1);
  });

  it("99 XP is still level 1", () => {
    expect(getLevelFromXp(99)).toBe(1);
  });

  it("100 XP advances to level 2", () => {
    expect(getLevelFromXp(100)).toBe(2);
  });

  it("399 XP is still level 2", () => {
    expect(getLevelFromXp(399)).toBe(2);
  });

  it("400 XP advances to level 3", () => {
    expect(getLevelFromXp(400)).toBe(3);
  });

  it("2500 XP advances to level 6", () => {
    expect(getLevelFromXp(2500)).toBe(6);
  });
});

describe("getXpProgressForLevel", () => {
  it("0 XP: level 1, floor 0, ceiling 100, progress 0%", () => {
    const result = getXpProgressForLevel(0);
    expect(result.level).toBe(1);
    expect(result.xpToCurrentLevel).toBe(0);   // floor for level 1
    expect(result.xpToNextLevel).toBe(100);     // ceiling to reach level 2
    expect(result.progressPercent).toBe(0);
  });

  it("50 XP: level 1, 50% progress toward level 2", () => {
    const result = getXpProgressForLevel(50);
    expect(result.level).toBe(1);
    expect(result.progressPercent).toBe(50);
  });

  it("250 XP: level 2, 50% progress toward level 3", () => {
    // Level 2 band: 100–400 XP, range = 300
    // 250 is 150/300 = 50% through
    const result = getXpProgressForLevel(250);
    expect(result.level).toBe(2);
    expect(result.xpToCurrentLevel).toBe(100);
    expect(result.xpToNextLevel).toBe(400);
    expect(result.progressPercent).toBe(50);
  });

  it("400 XP: level 3, 0% progress (just entered level 3)", () => {
    const result = getXpProgressForLevel(400);
    expect(result.level).toBe(3);
    expect(result.xpToCurrentLevel).toBe(400);
    expect(result.xpToNextLevel).toBe(900);
    expect(result.progressPercent).toBe(0);
  });

  it("never returns progressPercent > 100", () => {
    const result = getXpProgressForLevel(9999);
    expect(result.progressPercent).toBeLessThanOrEqual(100);
  });
});
