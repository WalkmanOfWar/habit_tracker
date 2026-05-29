/**
 * xpRequiredForLevel(n) is the total XP needed to *reach* level n+1.
 * i.e., once you accumulate this much XP you advance beyond level n.
 *
 * Threshold table:
 *   level 1:  0 – 99  XP    (xpRequiredForLevel(1) = 100 is the ceiling)
 *   level 2:  100 – 399 XP  (xpRequiredForLevel(2) = 400 is the ceiling)
 *   level 3:  400 – 899 XP  (xpRequiredForLevel(3) = 900 is the ceiling)
 *
 * Formula: xpRequiredForLevel(n) = 100 * n * n
 */
export function xpRequiredForLevel(level: number): number {
  return 100 * level * level;
}

/**
 * Returns 1-based level for a given total XP value.
 * Level advances once xp >= xpRequiredForLevel(currentLevel).
 */
export function getLevelFromXp(xp: number): number {
  let level = 1;
  while (xpRequiredForLevel(level) <= xp) {
    level++;
  }
  return level;
}

/**
 * Returns progress information for the given XP total.
 *
 * xpToCurrentLevel: floor threshold for the current level (XP where this level began)
 * xpToNextLevel:    ceiling threshold (XP needed to reach the next level)
 * progressPercent:  0-100 within the current level band
 */
export function getXpProgressForLevel(xp: number): {
  level: number;
  xpToCurrentLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  const level = getLevelFromXp(xp);
  // xpToCurrentLevel is the minimum XP for this level band
  const xpToCurrentLevel = level === 1 ? 0 : xpRequiredForLevel(level - 1);
  // xpToNextLevel is the threshold that will push us to the next level
  const xpToNextLevel = xpRequiredForLevel(level);
  const range = xpToNextLevel - xpToCurrentLevel;
  const progressPercent =
    range > 0 ? Math.round(((xp - xpToCurrentLevel) / range) * 100) : 100;

  return { level, xpToCurrentLevel, xpToNextLevel, progressPercent };
}
