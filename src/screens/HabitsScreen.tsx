import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { EmptyState } from "../components/EmptyState";
import {
  Habit,
  Attribute,
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ICONS,
  PreferredTime,
  PREFERRED_TIME_LABELS,
} from "../domain/habitTypes";
import { getAllHabits } from "../data/habitRepository";
import { attributeColor, colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

type Filter = "all" | Attribute | PreferredTime;

export function HabitsScreen({ navigation }: any) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showArchived, setShowArchived] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAllHabits().then(setHabits);
    }, [])
  );

  const active = habits.filter((h) => !h.archivedAt);
  const archived = habits.filter((h) => h.archivedAt);

  const filtered = (showArchived ? archived : active).filter((h) => {
    if (filter === "all") return true;
    if (ATTRIBUTES.includes(filter as Attribute)) return h.attribute === filter;
    return h.preferredTime === filter;
  });

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Habits</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("HabitWizard")}
          >
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Attribute filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip
            label="All"
            active={filter === "all"}
            onPress={() => setFilter("all")}
          />
          {ATTRIBUTES.map((attr) => (
            <FilterChip
              key={attr}
              label={`${ATTRIBUTE_ICONS[attr]} ${ATTRIBUTE_LABELS[attr]}`}
              active={filter === attr}
              onPress={() => setFilter(attr)}
              color={attributeColor(attr)}
            />
          ))}
        </ScrollView>

        {/* Archive toggle */}
        <View style={styles.archiveRow}>
          <TouchableOpacity
            onPress={() => setShowArchived(false)}
            style={[styles.archiveTab, !showArchived && styles.archiveTabActive]}
          >
            <Text style={[styles.archiveTabText, !showArchived && styles.archiveTabTextActive]}>
              Active ({active.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowArchived(true)}
            style={[styles.archiveTab, showArchived && styles.archiveTabActive]}
          >
            <Text style={[styles.archiveTabText, showArchived && styles.archiveTabTextActive]}>
              Archived ({archived.length})
            </Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            title={showArchived ? "No archived habits" : "No habits yet"}
            subtitle={
              showArchived
                ? "Archived habits will appear here."
                : "Add your first habit to start building your character."
            }
            action={
              !showArchived
                ? {
                    label: "Add Habit",
                    onPress: () => navigation.navigate("HabitWizard"),
                  }
                : undefined
            }
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(h) => h.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <HabitRow
                habit={item}
                onPress={() =>
                  navigation.navigate("HabitDetail", { habitId: item.id })
                }
              />
            )}
          />
        )}
      </View>
    </Screen>
  );
}

function HabitRow({ habit, onPress }: { habit: Habit; onPress: () => void }) {
  const color = attributeColor(habit.attribute);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.row, { borderLeftColor: color }]}
    >
      <Text style={styles.rowIcon}>{ATTRIBUTE_ICONS[habit.attribute]}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{habit.name}</Text>
        <Text style={styles.rowMeta}>
          {ATTRIBUTE_LABELS[habit.attribute]} · {PREFERRED_TIME_LABELS[habit.preferredTime]} ·{" "}
          {habit.frequency.targetPerWeek}x/week
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: (color ?? colors.primary) + "22",
          borderColor: color ?? colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          active && { color: color ?? colors.primary, fontWeight: "700" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  archiveRow: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  archiveTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  archiveTabActive: {
    backgroundColor: colors.surfaceElevated,
  },
  archiveTabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  archiveTabTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  rowIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...typography.h4,
  },
  rowMeta: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
});
