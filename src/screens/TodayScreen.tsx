import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";
import { Screen } from "../components/Screen";
import { HabitCard } from "../components/HabitCard";
import { EmptyState } from "../components/EmptyState";
import { ConsistencyScoreCard } from "../components/ConsistencyScoreCard";
import { Habit, HabitVariant, HabitCompletion } from "../domain/habitTypes";
import { getActiveHabits, getVariantsForHabits } from "../data/habitRepository";
import {
  getCompletionsForDate,
  upsertCompletion,
  deleteCompletionForHabitOnDate,
  getAllCompletions,
} from "../data/completionRepository";
import { getTodayString, formatDateLabel } from "../domain/dates";
import { calculateOverallConsistency } from "../domain/consistency";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

export function TodayScreen({ navigation }: any) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [variants, setVariants] = useState<HabitVariant[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [allCompletions, setAllCompletions] = useState<HabitCompletion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const today = getTodayString();

  const load = useCallback(async () => {
    const [h, c, ac] = await Promise.all([
      getActiveHabits(),
      getCompletionsForDate(today),
      getAllCompletions(),
    ]);
    setHabits(h);
    setCompletions(c);
    setAllCompletions(ac);
    if (h.length > 0) {
      const v = await getVariantsForHabits(h.map((x) => x.id));
      setVariants(v);
    }
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleComplete = async (habit: Habit, variant: HabitVariant) => {
    const existing = completions.find((c) => c.habitId === habit.id);
    const completion: HabitCompletion = {
      id: existing?.id ?? uuidv4(),
      habitId: habit.id,
      date: today,
      status: "completed",
      variantLabel: variant.label,
      xpAwarded: variant.xp,
      completionWeight: variant.completionWeight,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await upsertCompletion(completion);
    await load();
  };

  const handleSkip = async (habit: Habit, reason: string) => {
    const existing = completions.find((c) => c.habitId === habit.id);
    const completion: HabitCompletion = {
      id: existing?.id ?? uuidv4(),
      habitId: habit.id,
      date: today,
      status: "skipped",
      skipReason: reason || undefined,
      xpAwarded: 0,
      completionWeight: 0,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await upsertCompletion(completion);
    await load();
  };

  const handleUndo = async (habit: Habit) => {
    await deleteCompletionForHabitOnDate(habit.id, today);
    await load();
  };

  const totalXpToday = completions.reduce((sum, c) => sum + c.xpAwarded, 0);
  const doneCount = completions.filter((c) => c.status === "completed").length;
  const consistencyScore = calculateOverallConsistency(habits, allCompletions);

  const getHabitVariants = (habitId: string) =>
    variants.filter((v) => v.habitId === habitId);

  const getCompletion = (habitId: string) =>
    completions.find((c) => c.habitId === habitId) ?? null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateLabel}>{formatDateLabel(today)}</Text>
            <Text style={styles.title}>Today</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("HabitWizard")}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* XP summary */}
        <View style={styles.xpRow}>
          <View style={styles.xpCard}>
            <Text style={styles.xpValue}>{totalXpToday}</Text>
            <Text style={styles.xpLabel}>XP Earned</Text>
          </View>
          <View style={styles.xpCard}>
            <Text style={styles.xpValue}>
              {doneCount}/{habits.length}
            </Text>
            <Text style={styles.xpLabel}>Done</Text>
          </View>
          <View style={styles.xpCard}>
            <Text style={[styles.xpValue, { color: colors.primary }]}>
              {Math.round(consistencyScore * 100)}%
            </Text>
            <Text style={styles.xpLabel}>This Week</Text>
          </View>
        </View>

        {habits.length === 0 ? (
          <EmptyState
            title="No habits yet"
            subtitle={'Build your character by building your systems.\nAdd your first habit to get started.'}
            action={{
              label: "Add First Habit",
              onPress: () => navigation.navigate("HabitWizard"),
            }}
          />
        ) : (
          <>
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                variants={getHabitVariants(habit.id)}
                completion={getCompletion(habit.id)}
                onComplete={(v) => handleComplete(habit, v)}
                onSkip={(reason) => handleSkip(habit, reason)}
                onUndo={() => handleUndo(habit)}
              />
            ))}
          </>
        )}

        <Text style={styles.motto}>
          "Bad days do not reset you. Minimum still counts."
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  title: {
    ...typography.h1,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  xpRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  xpCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  xpLabel: {
    ...typography.caption,
  },
  motto: {
    ...typography.bodySmall,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.lg,
    color: colors.textMuted,
  },
});
