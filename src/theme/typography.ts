import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.text,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
