import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = {
  score: number; // 0-1
  label?: string;
};

export function ConsistencyScoreCard({ score, label = "Weekly Consistency" }: Props) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? colors.success : pct >= 50 ? colors.warning : colors.accent;

  const message =
    pct >= 80
      ? "Strong week. Keep the direction."
      : pct >= 50
      ? "Solid progress. Minimum still counts."
      : "Adjust the system, not your self-worth.";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.caption}>{label}</Text>
          <Text style={[styles.score, { color }]}>{pct}%</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={styles.ring}>
          <Text style={[styles.ringText, { color }]}>{pct}%</Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(pct, 100)}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  caption: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  score: {
    fontSize: 36,
    fontWeight: "800",
  },
  message: {
    ...typography.bodySmall,
    fontStyle: "italic",
    marginTop: 2,
  },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.border,
  },
  ringText: {
    fontSize: 18,
    fontWeight: "700",
  },
  barBg: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
});
