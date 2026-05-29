import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AttributeProgress, ATTRIBUTE_LABELS, ATTRIBUTE_ICONS } from "../domain/habitTypes";
import { attributeColor } from "../theme/colors";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = {
  progress: AttributeProgress;
  habitCount?: number;
};

export function AttributeProgressCard({ progress, habitCount }: Props) {
  const color = attributeColor(progress.attribute);
  const icon = ATTRIBUTE_ICONS[progress.attribute];
  const label = ATTRIBUTE_LABELS[progress.attribute];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: color + "22" }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{label}</Text>
          {habitCount !== undefined && (
            <Text style={styles.habitCount}>
              {habitCount} habit{habitCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelLabel, { color }]}>Lv {progress.level}</Text>
        </View>
      </View>

      <View style={styles.xpRow}>
        <Text style={styles.xpText}>{progress.xp} XP</Text>
        <Text style={styles.xpNext}>Next: {progress.xpToNextLevel} XP</Text>
      </View>

      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${progress.progressPercent}%` as any, backgroundColor: color },
          ]}
        />
      </View>

      <Text style={styles.pct}>{progress.progressPercent}% to Level {progress.level + 1}</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    ...typography.h4,
  },
  habitCount: {
    ...typography.bodySmall,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  xpText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
  },
  xpNext: {
    ...typography.bodySmall,
  },
  barBg: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  pct: {
    ...typography.caption,
  },
});
