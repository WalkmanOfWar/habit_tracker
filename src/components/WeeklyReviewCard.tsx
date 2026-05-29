import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = {
  title: string;
  children: React.ReactNode;
  accent?: string;
};

export function WeeklyReviewCard({ title, children, accent }: Props) {
  return (
    <View style={[styles.card, accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : null]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export function StatRow({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
  },
});
