import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import {
  Habit,
  HabitVariant,
  HabitCompletion,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ICONS,
  PREFERRED_TIME_LABELS,
} from "../domain/habitTypes";
import {
  getHabitById,
  getVariantsForHabit,
  archiveHabit,
} from "../data/habitRepository";
import { getAllCompletions } from "../data/completionRepository";
import { attributeColor, colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const VARIANT_COLORS = {
  full: colors.full,
  minimum: colors.minimum,
  maintenance: colors.maintenance,
};

const VARIANT_LABELS = {
  full: "Full",
  minimum: "Minimum",
  maintenance: "Ease In",
};

export function HabitDetailScreen({ route, navigation }: any) {
  const { habitId } = route.params as { habitId: string };
  const [habit, setHabit] = useState<Habit | null>(null);
  const [variants, setVariants] = useState<HabitVariant[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [h, v, c] = await Promise.all([
          getHabitById(habitId),
          getVariantsForHabit(habitId),
          getAllCompletions(),
        ]);
        setHabit(h);
        setVariants(v);
        setCompletions(c.filter((x) => x.habitId === habitId));
      }
      load();
    }, [habitId])
  );

  const handleArchive = () => {
    Alert.alert(
      "Archive habit?",
      "Archived habits won't appear in Today. Your history is preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            await archiveHabit(habitId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!habit) return null;

  const color = attributeColor(habit.attribute);
  const habitCompletions = completions.slice(0, 30);

  // Last 7 completions for history display
  const recentCompletions = habitCompletions.slice(0, 14);

  // Recent skip reasons
  const skipReasons = habitCompletions
    .filter((c) => c.status === "skipped" && c.skipReason)
    .slice(0, 5)
    .map((c) => c.skipReason!);

  // Weekly stats
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeek = habitCompletions.filter((c) =>
    isWithinInterval(parseISO(c.date), { start: weekStart, end: weekEnd })
  );
  const weekXp = thisWeek.reduce((s, c) => s + c.xpAwarded, 0);
  const weekDone = thisWeek.filter((c) => c.status === "completed").length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.heroCard, { borderLeftColor: color }]}>
          <View style={styles.heroRow}>
            <Text style={styles.heroIcon}>{ATTRIBUTE_ICONS[habit.attribute]}</Text>
            <View style={styles.heroMeta}>
              <Text style={[styles.attrLabel, { color }]}>
                {ATTRIBUTE_LABELS[habit.attribute]}
              </Text>
              <Text style={styles.heroName}>{habit.name}</Text>
            </View>
          </View>
          {habit.description ? (
            <Text style={styles.heroDesc}>{habit.description}</Text>
          ) : null}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="This Week" value={`${weekDone}/${habit.frequency.targetPerWeek}x`} color={color} />
          <StatBox label="Week XP" value={`+${weekXp}`} color={color} />
          <StatBox label="Total Logs" value={habitCompletions.length} color={color} />
        </View>

        {/* Details */}
        {habit.why ? (
          <DetailRow icon="💡" label="Why this matters" value={habit.why} />
        ) : null}
        {habit.cue ? (
          <DetailRow icon="🔔" label="Cue / Trigger" value={habit.cue} />
        ) : null}
        {habit.ifThenPlan ? (
          <DetailRow icon="🗺️" label="If-Then Plan" value={habit.ifThenPlan} />
        ) : null}
        <DetailRow
          icon="🕐"
          label="Preferred Time"
          value={PREFERRED_TIME_LABELS[habit.preferredTime]}
        />
        <DetailRow
          icon="🎯"
          label="Weekly Target"
          value={`${habit.frequency.targetPerWeek}x per week`}
        />

        {/* Variants */}
        <Text style={styles.sectionTitle}>Completion Levels</Text>
        {variants.map((v) => (
          <View key={v.id} style={[styles.variantCard, { borderLeftColor: VARIANT_COLORS[v.label] }]}>
            <View style={styles.variantHeader}>
              <Text style={[styles.variantLabel, { color: VARIANT_COLORS[v.label] }]}>
                {VARIANT_LABELS[v.label]}
              </Text>
              <Text style={[styles.variantXp, { color: VARIANT_COLORS[v.label] }]}>
                +{v.xp} XP
              </Text>
            </View>
            <Text style={styles.variantTitle}>{v.title}</Text>
            {v.description ? (
              <Text style={styles.variantDesc}>{v.description}</Text>
            ) : null}
          </View>
        ))}

        {/* Skip reasons */}
        {skipReasons.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Skip Reasons</Text>
            <View style={styles.card}>
              {skipReasons.map((r, i) => (
                <Text key={i} style={styles.skipReason}>
                  · {r}
                </Text>
              ))}
              <Text style={styles.skipHint}>
                Patterns here can help you adjust the system.
              </Text>
            </View>
          </>
        )}

        {/* Completion history */}
        {recentCompletions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent History</Text>
            <View style={styles.card}>
              {recentCompletions.map((c) => (
                <View key={c.id} style={styles.histRow}>
                  <Text style={styles.histDate}>
                    {format(parseISO(c.date), "EEE, MMM d")}
                  </Text>
                  {c.status === "completed" ? (
                    <View style={styles.histRight}>
                      <Text
                        style={[
                          styles.histLabel,
                          { color: VARIANT_COLORS[c.variantLabel ?? "full"] },
                        ]}
                      >
                        {VARIANT_LABELS[c.variantLabel ?? "full"]}
                      </Text>
                      <Text style={styles.histXp}>+{c.xpAwarded} XP</Text>
                    </View>
                  ) : (
                    <Text style={styles.histSkipped}>Skipped</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            label="Edit Habit"
            variant="secondary"
            onPress={() =>
              navigation.navigate("HabitWizard", { habitId: habit.id })
            }
            style={styles.actionBtn}
          />
          {!habit.archivedAt ? (
            <AppButton
              label="Archive"
              variant="ghost"
              onPress={handleArchive}
              style={styles.actionBtn}
              textStyle={{ color: colors.textMuted }}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailBody}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  heroIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  heroMeta: {
    flex: 1,
  },
  attrLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  heroName: {
    ...typography.h2,
  },
  heroDesc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
  },
  detailIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 1,
  },
  detailBody: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    marginBottom: 3,
  },
  detailValue: {
    ...typography.body,
    lineHeight: 21,
  },
  sectionTitle: {
    ...typography.h4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  variantCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  variantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  variantLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  variantXp: {
    fontSize: 14,
    fontWeight: "700",
  },
  variantTitle: {
    ...typography.h4,
    marginBottom: 2,
  },
  variantDesc: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipReason: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  skipHint: {
    ...typography.bodySmall,
    fontStyle: "italic",
    marginTop: spacing.sm,
  },
  histRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  histDate: {
    ...typography.body,
    color: colors.textSecondary,
  },
  histRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  histLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  histXp: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  histSkipped: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionBtn: {
    width: "100%",
  },
});
