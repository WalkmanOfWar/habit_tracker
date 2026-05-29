import { v4 as uuidv4 } from "uuid";
import { Habit, HabitVariant } from "../domain/habitTypes";
import { insertHabit, insertVariant, getAllHabits } from "./habitRepository";

const now = new Date().toISOString();

const seedHabits: Array<{ habit: Habit; variants: Omit<HabitVariant, "id" | "habitId">[] }> = [
  {
    habit: {
      id: uuidv4(),
      name: "Gym Training",
      description: "Strength and conditioning workout",
      attribute: "strength",
      why: "Build muscle, improve energy, and develop discipline",
      cue: "After work",
      preferredTime: "afternoon",
      ifThenPlan: "If I come home from work, then I change into gym clothes before sitting down.",
      frequency: { type: "weekly", targetPerWeek: 3 },
      createdAt: now,
      updatedAt: now,
    },
    variants: [
      { label: "full", title: "Full Workout", description: "Complete training session, all exercises", xp: 25, completionWeight: 1.0 },
      { label: "minimum", title: "2 Exercises", description: "At least 2 main exercises, no skipping", xp: 10, completionWeight: 0.7 },
      { label: "maintenance", title: "10-min Walk", description: "A 10-minute walk or light movement", xp: 5, completionWeight: 0.4 },
    ],
  },
  {
    habit: {
      id: uuidv4(),
      name: "Reading",
      description: "Read books or long-form content",
      attribute: "mind",
      why: "Expand knowledge and improve focus",
      cue: "Before bed",
      preferredTime: "evening",
      ifThenPlan: "If I'm in bed, then I read for at least 10 minutes before sleeping.",
      frequency: { type: "weekly", targetPerWeek: 5 },
      createdAt: now,
      updatedAt: now,
    },
    variants: [
      { label: "full", title: "30+ Minutes", description: "Deep reading session", xp: 20, completionWeight: 1.0 },
      { label: "minimum", title: "10 Minutes", description: "At least 10 pages or 10 minutes", xp: 8, completionWeight: 0.7 },
      { label: "maintenance", title: "5 Minutes", description: "Any reading, even a few pages", xp: 3, completionWeight: 0.4 },
    ],
  },
  {
    habit: {
      id: uuidv4(),
      name: "Deep Work Block",
      description: "Focused, uninterrupted work on priority tasks",
      attribute: "career",
      why: "Build career skills and deliver meaningful output",
      cue: "Morning after coffee",
      preferredTime: "morning",
      ifThenPlan: "If I have my morning coffee, then I open my task list and start a 90-min deep work block.",
      frequency: { type: "weekly", targetPerWeek: 4 },
      createdAt: now,
      updatedAt: now,
    },
    variants: [
      { label: "full", title: "90-min Block", description: "Full deep work session, phone off", xp: 30, completionWeight: 1.0 },
      { label: "minimum", title: "45 Minutes", description: "At least 45 minutes focused", xp: 15, completionWeight: 0.7 },
      { label: "maintenance", title: "15 Minutes", description: "Tackle just the most important task", xp: 6, completionWeight: 0.4 },
    ],
  },
  {
    habit: {
      id: uuidv4(),
      name: "Meditation",
      description: "Mindfulness or breathing practice",
      attribute: "discipline",
      why: "Reduce stress and sharpen attention",
      cue: "Right after waking up",
      preferredTime: "morning",
      ifThenPlan: "If I wake up, then I sit up and meditate before picking up my phone.",
      frequency: { type: "weekly", targetPerWeek: 5 },
      createdAt: now,
      updatedAt: now,
    },
    variants: [
      { label: "full", title: "20 Minutes", description: "Full guided or silent meditation", xp: 20, completionWeight: 1.0 },
      { label: "minimum", title: "5 Minutes", description: "5 minutes of focused breathing", xp: 8, completionWeight: 0.7 },
      { label: "maintenance", title: "3 Deep Breaths", description: "Three intentional deep breaths", xp: 3, completionWeight: 0.4 },
    ],
  },
];

export async function seedIfEmpty(): Promise<void> {
  const existing = await getAllHabits();
  if (existing.length > 0) return;

  for (const { habit, variants } of seedHabits) {
    await insertHabit(habit);
    for (const v of variants) {
      await insertVariant({
        id: uuidv4(),
        habitId: habit.id,
        ...v,
      });
    }
  }
}
