export const colors = {
  background: "#0F0F14",
  surface: "#1A1A24",
  surfaceElevated: "#242432",
  border: "#2E2E42",

  primary: "#7C6FFF",
  primaryLight: "#9B91FF",
  primaryDark: "#5A4FCC",

  accent: "#FF6B6B",
  accentGreen: "#4ECDC4",
  accentAmber: "#FFD93D",
  accentBlue: "#6BAAFF",

  text: "#F0F0F8",
  textSecondary: "#9090A8",
  textMuted: "#5A5A72",

  strength: "#FF6B6B",
  health: "#4ECDC4",
  mind: "#6BAAFF",
  career: "#FFD93D",
  discipline: "#FF9F43",
  creativity: "#B983FF",

  success: "#4ECDC4",
  warning: "#FFD93D",
  error: "#FF6B6B",

  full: "#4ECDC4",
  minimum: "#6BAAFF",
  maintenance: "#9090A8",
  skipped: "#5A5A72",
};

export const attributeColor = (attr: string): string => {
  const map: Record<string, string> = {
    strength: colors.strength,
    health: colors.health,
    mind: colors.mind,
    career: colors.career,
    discipline: colors.discipline,
    creativity: colors.creativity,
  };
  return map[attr] ?? colors.primary;
};
