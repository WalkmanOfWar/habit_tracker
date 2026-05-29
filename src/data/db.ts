import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("habittracker.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      attribute TEXT NOT NULL,
      why TEXT,
      cue TEXT,
      preferred_time TEXT NOT NULL DEFAULT 'anytime',
      if_then_plan TEXT,
      frequency_type TEXT NOT NULL DEFAULT 'weekly',
      target_per_week INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT
    );

    CREATE TABLE IF NOT EXISTS habit_variants (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      label TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      xp INTEGER NOT NULL,
      completion_weight REAL NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      variant_label TEXT,
      skip_reason TEXT,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      completion_weight REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
