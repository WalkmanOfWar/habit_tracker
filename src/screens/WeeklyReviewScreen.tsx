import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { ConsistencyScoreCard } from "../components/ConsistencyScoreCard";
import { AttributeProgressCard } from "../components/AttributeProgressCard";
import { WeeklyReviewCard, StatRow } from "../components/WeeklyReviewCard";
import { EmptyState } from "../components/EmptyState";
import { getAllHabits } from "../data/habitRepository";
import { getAllCompletions } from "../data/completionRepository";
import { buildWeeklyReview, WeeklyReviewData } from "../domain/weeklyReview";
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ICONS,
  Habit,
} from "../domain/habitTypes";
import { attributeColor, colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";
import { format, startOfWeek, endOfWeek } from "date-fns";

export function WeeklyReviewScreen({ navigation }: any) {
  const [review, setReview] = useState<WeeklyReviewData | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hasData, setHasData] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [h, c] = await Promise.all([getAllHabits(), getAllCompletions()]);
        setHabits(h);
        const r = buildWeeklyReview(h, c);
        setReview(r);
        setHasData(h.length > 0);
      }
      load();
    }, [])
  );

  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "MMM d");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "MMM d, yyyy");

  if (!hasData) {
    return (
      <Screen>
        <EmptyState
          title="No habits yet"
          subtitle="Create some habits and come back after a week to see your review."
          action={{ label: "Add Habit", onPress: () => navigation.navigate("HabitWizard") }}
        />
      </Screen>
    );
  }

  if (!review) return <Screen><View /></Screen>;

  const habitCountForAttr = (attr: string) =>
    habits.filter((h) => h.attribute === attr && !h.archivedAt).length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Review</Text>
          <Text style={styles.period}>{weekStart} – {weekEnd}</Text>
        </View>

        {/* Consistency score */}
        <ConsistencyScoreCard score={review.consistencyScore} />

        {/* Summary stats */}
        <WeeklyReviewCard title="This Week">
          <StatRow
            label="Full completions"
            value={review.completedCount}
            valueColor={colors.full}
          />
          <StatRow
            label="Partial completions"
            value={review.partialCount}
            valueColor={colors.minimum}
          />
          <StatRow
            label="Skipped"
            value={review.skippedCount}
            valueColor={colors.textMuted}
          />
          <StatRow
            label="XP earned"
            value={`+${review.totalXp} XP`}
            valueColor={colors.primary}
          />
        </WeeklyReviewCard>

        {/* Attributes */}
        {review.strongestAttribute || review.weakestAttribute ? (
          <WeeklyReviewCard title="Attribute Snapshot">
            {review.strongestAttribute && (
              <StatRow
                label="Strongest"
                value={`${ATTRIBUTE_ICONS[review.strongestAttribute]} ${ATTRIBUTE_LABELS[review.strongestAttribute]}`}
                valueColor={attributeColor(review.strongestAttribute)}
              />
            )}
            {review.weakestAttribute && (
              <StatRow
                label="Needs attention"
                value={`${ATTRIBUTE_ICONS[review.weakestAttribute]} ${ATTRIBUTE_LABELS[review.weakestAttribute]}`}
                valueColor={attributeColor(review.weakestAttribute)}
              />
            )}
          </WeeklyReviewCard>
        ) : null}

        {/* Per-habit scores */}
        {review.habitScores.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Habit Consistency</Text>
            {review.habitScores
              .sort((a, b) => b.score - a.score)
              .map(({ habit, score }) => {
                const pct = Math.round(score * 100);
                const color =
                  pct >= 80
                    ? colors.success
                    : pct >= 50
                    ? colors.warning
                    : colors.accent;
                return (
                  <View key={habit.id} style={styles.habitScoreRow}>
                    <Text style={styles.habitScoreIcon}>
                      {ATTRIBUTE_ICONS[habit.attribute]}
                    </Text>
                    <View style={styles.habitScoreInfo}>
                      <Text style={styles.habitScoreName}>{habit.name}</Text>
                      <View style={styles.barBg}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${pct}%` as any,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.habitScorePct, { color }]}>{pct}%</Text>
                  </View>
                );
              })}
          </>
        )}

        {/* Skip reasons */}
        {review.mostCommonSkipReason && (
          <WeeklyReviewCard title="Most Common Skip Reason" accent={colors.warning}>
            <Text style={styles.skipReason}>"{review.mostCommonSkipReason}"</Text>
            <Text style={styles.skipHint}>
              Adjust the system, not your self-worth.
            </Text>
          </WeeklyReviewCard>
        )}

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {review.recommendations.map((rec, i) => (
          <View key={i} style={styles.recCard}>
            <Text style={styles.recBullet}>💡</Text>
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}

        {/* Attribute progress */}
        <Text style={styles.sectionTitle}>Attribute Progress</Text>
        {review.attributeProgress
          .sort((a, b) => b.xp - a.xp)
          .map((ap) => (
            <AttributeProgressCard
              key={ap.attribute}
              progress={ap}
              habitCount={habitCountForAttr(ap.attribute)}
            />
          ))}

        <Text style={styles.motto}>
          "Keep the direction. Do the smallest useful version."
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  period: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  habitScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  habitScoreIcon: {
    fontSize: 20,
  },
  habitScoreInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  habitScoreName: {
    ...typography.body,
    fontWeight: "600",
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
  habitScorePct: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "right",
  },
  skipReason: {
    ...typography.body,
    color: colors.text,
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  skipHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  recCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  recBullet: {
    fontSize: 18,
    marginTop: 1,
  },
  recText: {
    ...typography.body,
    flex: 1,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  motto: {
    ...typography.bodySmall,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.lg,
    color: colors.textMuted,
  },
});
