import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { AttributeProgressCard } from "../components/AttributeProgressCard";
import { getAllHabits } from "../data/habitRepository";
import { getAllCompletions } from "../data/completionRepository";
import { calculateAttributeProgress } from "../domain/weeklyReview";
import { AttributeProgress, Habit, ATTRIBUTES } from "../domain/habitTypes";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export function SkillTreeScreen() {
  const [attributeProgress, setAttributeProgress] = useState<AttributeProgress[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [h, c] = await Promise.all([getAllHabits(), getAllCompletions()]);
        setHabits(h);
        setAttributeProgress(calculateAttributeProgress(c, h));
      }
      load();
    }, [])
  );

  const habitCountForAttr = (attr: string) =>
    habits.filter((h) => h.attribute === attr && !h.archivedAt).length;

  const totalXp = attributeProgress.reduce((sum, a) => sum + a.xp, 0);
  const maxLevel = attributeProgress.reduce((max, a) => Math.max(max, a.level), 1);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Skill Tree</Text>
          <Text style={styles.subtitle}>Your life build</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalXp}</Text>
            <Text style={styles.summaryLabel}>Total XP</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{maxLevel}</Text>
            <Text style={styles.summaryLabel}>Highest Lv</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{habits.filter((h) => !h.archivedAt).length}</Text>
            <Text style={styles.summaryLabel}>Habits</Text>
          </View>
        </View>

        {attributeProgress
          .sort((a, b) => b.xp - a.xp)
          .map((ap) => (
            <AttributeProgressCard
              key={ap.attribute}
              progress={ap}
              habitCount={habitCountForAttr(ap.attribute)}
            />
          ))}

        <Text style={styles.hint}>
          Complete habits to earn XP and level up your attributes.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  summaryLabel: {
    ...typography.caption,
  },
  hint: {
    ...typography.bodySmall,
    textAlign: "center",
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
});
