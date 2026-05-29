import { getDatabase } from "./db";
import { HabitCompletion } from "../domain/habitTypes";

type RawCompletion = {
  id: string;
  habit_id: string;
  date: string;
  status: string;
  variant_label: string | null;
  skip_reason: string | null;
  xp_awarded: number;
  completion_weight: number;
  created_at: string;
};

function mapCompletion(row: RawCompletion): HabitCompletion {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    status: row.status as HabitCompletion["status"],
    variantLabel: (row.variant_label as HabitCompletion["variantLabel"]) ?? undefined,
    skipReason: row.skip_reason ?? undefined,
    xpAwarded: row.xp_awarded,
    completionWeight: row.completion_weight,
    createdAt: row.created_at,
  };
}

export async function getAllCompletions(): Promise<HabitCompletion[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawCompletion>(
    "SELECT * FROM habit_completions ORDER BY created_at DESC"
  );
  return rows.map(mapCompletion);
}

export async function getCompletionsForDate(
  date: string
): Promise<HabitCompletion[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawCompletion>(
    "SELECT * FROM habit_completions WHERE date = ?",
    date
  );
  return rows.map(mapCompletion);
}

export async function getCompletionsForDateRange(
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawCompletion>(
    "SELECT * FROM habit_completions WHERE date >= ? AND date <= ? ORDER BY created_at DESC",
    startDate,
    endDate
  );
  return rows.map(mapCompletion);
}

export async function getCompletionForHabitOnDate(
  habitId: string,
  date: string
): Promise<HabitCompletion | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawCompletion>(
    "SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?",
    habitId,
    date
  );
  return row ? mapCompletion(row) : null;
}

export async function upsertCompletion(
  completion: HabitCompletion
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO habit_completions (id, habit_id, date, status, variant_label, skip_reason, xp_awarded, completion_weight, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    completion.id,
    completion.habitId,
    completion.date,
    completion.status,
    completion.variantLabel ?? null,
    completion.skipReason ?? null,
    completion.xpAwarded,
    completion.completionWeight,
    completion.createdAt
  );
}

export async function deleteCompletionForHabitOnDate(
  habitId: string,
  date: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM habit_completions WHERE habit_id = ? AND date = ?",
    habitId,
    date
  );
}

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(
    "DELETE FROM habit_completions; DELETE FROM habit_variants; DELETE FROM habits;"
  );
}
