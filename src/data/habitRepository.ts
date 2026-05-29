import { getDatabase } from "./db";
import { Habit, HabitVariant } from "../domain/habitTypes";

type RawHabit = {
  id: string;
  name: string;
  description: string | null;
  attribute: string;
  why: string | null;
  cue: string | null;
  preferred_time: string;
  if_then_plan: string | null;
  frequency_type: string;
  target_per_week: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type RawVariant = {
  id: string;
  habit_id: string;
  label: string;
  title: string;
  description: string;
  xp: number;
  completion_weight: number;
};

function mapHabit(row: RawHabit): Habit {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    attribute: row.attribute as Habit["attribute"],
    why: row.why ?? undefined,
    cue: row.cue ?? undefined,
    preferredTime: row.preferred_time as Habit["preferredTime"],
    ifThenPlan: row.if_then_plan ?? undefined,
    frequency: {
      type: row.frequency_type as "daily" | "weekly",
      targetPerWeek: row.target_per_week,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

function mapVariant(row: RawVariant): HabitVariant {
  return {
    id: row.id,
    habitId: row.habit_id,
    label: row.label as HabitVariant["label"],
    title: row.title,
    description: row.description,
    xp: row.xp,
    completionWeight: row.completion_weight,
  };
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawHabit>(
    "SELECT * FROM habits ORDER BY created_at DESC"
  );
  return rows.map(mapHabit);
}

export async function getActiveHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawHabit>(
    "SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at DESC"
  );
  return rows.map(mapHabit);
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawHabit>(
    "SELECT * FROM habits WHERE id = ?",
    id
  );
  return row ? mapHabit(row) : null;
}

export async function insertHabit(habit: Habit): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO habits (id, name, description, attribute, why, cue, preferred_time, if_then_plan, frequency_type, target_per_week, created_at, updated_at, archived_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    habit.id,
    habit.name,
    habit.description ?? null,
    habit.attribute,
    habit.why ?? null,
    habit.cue ?? null,
    habit.preferredTime,
    habit.ifThenPlan ?? null,
    habit.frequency.type,
    habit.frequency.targetPerWeek ?? 3,
    habit.createdAt,
    habit.updatedAt,
    habit.archivedAt ?? null
  );
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE habits SET name=?, description=?, attribute=?, why=?, cue=?, preferred_time=?, if_then_plan=?, frequency_type=?, target_per_week=?, updated_at=?, archived_at=? WHERE id=?`,
    habit.name,
    habit.description ?? null,
    habit.attribute,
    habit.why ?? null,
    habit.cue ?? null,
    habit.preferredTime,
    habit.ifThenPlan ?? null,
    habit.frequency.type,
    habit.frequency.targetPerWeek ?? 3,
    habit.updatedAt,
    habit.archivedAt ?? null,
    habit.id
  );
}

export async function archiveHabit(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    "UPDATE habits SET archived_at=?, updated_at=? WHERE id=?",
    now,
    now,
    id
  );
}

export async function getVariantsForHabit(
  habitId: string
): Promise<HabitVariant[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawVariant>(
    "SELECT * FROM habit_variants WHERE habit_id = ? ORDER BY label",
    habitId
  );
  return rows.map(mapVariant);
}

export async function getVariantsForHabits(
  habitIds: string[]
): Promise<HabitVariant[]> {
  if (habitIds.length === 0) return [];
  const db = await getDatabase();
  const placeholders = habitIds.map(() => "?").join(",");
  const rows = await db.getAllAsync<RawVariant>(
    `SELECT * FROM habit_variants WHERE habit_id IN (${placeholders})`,
    ...habitIds
  );
  return rows.map(mapVariant);
}

export async function insertVariant(variant: HabitVariant): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO habit_variants (id, habit_id, label, title, description, xp, completion_weight)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    variant.id,
    variant.habitId,
    variant.label,
    variant.title,
    variant.description,
    variant.xp,
    variant.completionWeight
  );
}

export async function deleteVariantsForHabit(habitId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM habit_variants WHERE habit_id = ?", habitId);
}
