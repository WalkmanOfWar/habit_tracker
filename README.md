# Life Build — RPG Habit Tracker

> *"Build your character by building your systems."*

An evidence-informed mobile habit tracker built with React Native, Expo, and TypeScript. Users develop RPG-style attributes (Strength, Health, Mind, Career, Discipline, Creativity) by completing habits with graded effort levels.

---

## Product Philosophy

This is **not** a streak app. It is a behavior-change system.

- **No shame.** The UI never says "you failed" or "you broke your streak."
- **Minimum still counts.** Every completion — full, minimum, or ease-in — earns XP.
- **Adjust the system, not your self-worth.**
- Recovery is built in. Missed days do not reset you.

Behavior-change principles implemented:
- Self-monitoring (completion history, weekly review)
- Goal setting (weekly targets)
- Prompts and cues (stored per-habit)
- Implementation intentions (if-then plan field)
- Graded tasks (Full / Minimum / Ease In variants)
- Feedback (XP, levels, consistency score)
- Weekly review and adjustment
- Autonomy-supportive gamification (no punitive mechanics)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 56 |
| Language | TypeScript (strict) |
| Navigation | React Navigation v7 (bottom tabs + native stack) |
| Persistence | expo-sqlite (offline-first, no cloud) |
| Testing | Jest + ts-jest |

---

## Screens

| Screen | Purpose |
|---|---|
| **Onboarding** | Welcome flow, attribute selection, first habit creation |
| **Today** | Daily habits with Full / Minimum / Ease In / Skip actions |
| **Skill Tree** | Attribute XP, levels, and progress bars |
| **Habits** | All habits with attribute and time filters |
| **Habit Detail** | Completion history, skip reasons, edit/archive |
| **Habit Wizard** | Multi-step habit creation with if-then planning |
| **Weekly Review** | Consistency score, recommendations, attribute snapshot |
| **Settings** | Notifications placeholder, data reset, app info |

---

## Data Model

```
Habit
  ├── id, name, attribute, why, cue, ifThenPlan
  ├── preferredTime, frequency (targetPerWeek)
  └── HabitVariant[]  (full / minimum / maintenance)
        └── title, description, xp, completionWeight

HabitCompletion
  └── habitId, date, status, variantLabel, skipReason, xpAwarded
```

**Completion weights:** full = 1.0 · minimum = 0.7 · maintenance = 0.4 · skipped = 0.0

**Leveling formula:** `xpRequiredForLevel(n) = 100 × n²`

**Consistency score:** sum of completion weights ÷ weekly target, capped at 100%.

---

## Project Structure

```
src/
  app/           AppNavigator.tsx
  domain/        habitTypes, leveling, consistency, weeklyReview, dates
  data/          db, habitRepository, completionRepository, seedData
  screens/       8 screens
  components/    HabitCard, CompletionVariantButton, AttributeProgressCard, …
  theme/         colors, spacing, typography
  services/      notificationService (placeholder)
  __tests__/     31 unit tests
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run unit tests
npm test
```

Requires [Expo Go](https://expo.dev/client) on your device, or an Android/iOS simulator.

---

## Unit Tests

31 tests covering:
- XP calculation and level thresholds
- Level advancement from XP
- Progress-within-level percentage
- Weekly consistency scoring (mixed completion weights, caps, week boundaries)
- Weekly review: stat counts, attribute ranking, skip reason aggregation, recommendations

```bash
npm test
```

---

## Seed Data

On first launch, the app seeds 4 demo habits:
- **Gym Training** (Strength)
- **Reading** (Mind)
- **Deep Work Block** (Career)
- **Meditation** (Discipline)

Reset via **Settings → Reload demo data**.

---

## Roadmap

- [ ] Push notifications via `expo-notifications`
- [ ] Data export (JSON)
- [ ] Habit streaks (non-primary, opt-in display)
- [ ] Dark/light theme toggle
- [ ] iCloud / Google Drive backup
