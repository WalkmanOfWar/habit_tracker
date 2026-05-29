import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import {
  Attribute,
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ICONS,
  Habit,
  HabitVariant,
} from "../domain/habitTypes";
import { insertHabit, insertVariant } from "../data/habitRepository";
import { attributeColor, colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "onboarding_complete";

type OnboardingStep = "welcome" | "attributes" | "firstHabit" | "done";

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(ONBOARDING_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [selectedAttrs, setSelectedAttrs] = useState<Attribute[]>([]);
  const [habitName, setHabitName] = useState("");
  const [habitAttr, setHabitAttr] = useState<Attribute>("discipline");
  const [habitWhy, setHabitWhy] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleAttr = (a: Attribute) => {
    setSelectedAttrs((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (habitName.trim()) {
        const now = new Date().toISOString();
        const habitId = uuidv4();
        const habit: Habit = {
          id: habitId,
          name: habitName.trim(),
          attribute: habitAttr,
          why: habitWhy.trim() || undefined,
          preferredTime: "anytime",
          frequency: { type: "weekly", targetPerWeek: 3 },
          createdAt: now,
          updatedAt: now,
        };
        await insertHabit(habit);
        const variants: HabitVariant[] = [
          {
            id: uuidv4(),
            habitId,
            label: "full",
            title: "Full version",
            description: "Complete the habit fully.",
            xp: 25,
            completionWeight: 1.0,
          },
          {
            id: uuidv4(),
            habitId,
            label: "minimum",
            title: "Minimum version",
            description: "A reduced but real effort. Still counts.",
            xp: 10,
            completionWeight: 0.7,
          },
          {
            id: uuidv4(),
            habitId,
            label: "maintenance",
            title: "Ease in",
            description: "The smallest useful action.",
            xp: 5,
            completionWeight: 0.4,
          },
        ];
        for (const v of variants) await insertVariant(v);
      }
      await markOnboardingComplete();
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {step === "welcome" && <WelcomeStep onNext={() => setStep("attributes")} />}
      {step === "attributes" && (
        <AttributesStep
          selected={selectedAttrs}
          onToggle={toggleAttr}
          onNext={() => setStep("firstHabit")}
          onSkip={() => setStep("firstHabit")}
        />
      )}
      {step === "firstHabit" && (
        <FirstHabitStep
          name={habitName}
          setName={setHabitName}
          attr={habitAttr}
          setAttr={setHabitAttr}
          why={habitWhy}
          setWhy={setHabitWhy}
          onNext={() => setStep("done")}
          onSkip={() => setStep("done")}
        />
      )}
      {step === "done" && (
        <DoneStep onFinish={handleFinish} saving={saving} />
      )}
    </KeyboardAvoidingView>
  );
}

/* ── Step sub-components ─────────────────────────────────── */

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.centeredStep}>
      <Text style={styles.welcomeEmoji}>⚔️</Text>
      <Text style={styles.welcomeTitle}>Build your character{"\n"}by building your systems.</Text>
      <Text style={styles.welcomeBody}>
        This is not a streak app. It's a system for building who you want to be — one action at a time.
      </Text>
      <View style={styles.pillList}>
        <Pill text="Minimum still counts." />
        <Pill text="Bad days do not reset you." />
        <Pill text="Adjust the system, not your self-worth." />
      </View>
      <AppButton
        label="Get Started →"
        onPress={onNext}
        fullWidth
        style={styles.ctaBtn}
      />
    </View>
  );
}

function AttributesStep({
  selected,
  onToggle,
  onNext,
  onSkip,
}: {
  selected: Attribute[];
  onToggle: (a: Attribute) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>What do you want to develop?</Text>
      <Text style={styles.stepBody}>
        Choose one or more areas of your life. You can add more later.
      </Text>
      <View style={styles.attrGrid}>
        {ATTRIBUTES.map((attr) => {
          const active = selected.includes(attr);
          const color = attributeColor(attr);
          return (
            <TouchableOpacity
              key={attr}
              onPress={() => onToggle(attr)}
              style={[
                styles.attrCard,
                active && {
                  backgroundColor: color + "18",
                  borderColor: color,
                },
              ]}
            >
              <Text style={styles.attrCardIcon}>{ATTRIBUTE_ICONS[attr]}</Text>
              <Text
                style={[
                  styles.attrCardText,
                  active && { color, fontWeight: "700" },
                ]}
              >
                {ATTRIBUTE_LABELS[attr]}
              </Text>
              {active && (
                <View style={[styles.checkDot, { backgroundColor: color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <AppButton
        label="Continue →"
        onPress={onNext}
        fullWidth
        style={styles.ctaBtn}
        disabled={selected.length === 0}
      />
      <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FirstHabitStep({
  name,
  setName,
  attr,
  setAttr,
  why,
  setWhy,
  onNext,
  onSkip,
}: {
  name: string;
  setName: (v: string) => void;
  attr: Attribute;
  setAttr: (a: Attribute) => void;
  why: string;
  setWhy: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Your first habit</Text>
      <Text style={styles.stepBody}>
        Start with one habit you want to build. You can add more from the Today screen.
      </Text>

      <AppTextInput
        label="Habit name"
        placeholder="e.g. Morning run, Read daily, Meditate"
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={styles.miniLabel}>Attribute</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.attrRow}
      >
        {ATTRIBUTES.map((a) => {
          const active = attr === a;
          const color = attributeColor(a);
          return (
            <TouchableOpacity
              key={a}
              onPress={() => setAttr(a)}
              style={[
                styles.attrPill,
                active && { backgroundColor: color + "22", borderColor: color },
              ]}
            >
              <Text style={styles.attrPillIcon}>{ATTRIBUTE_ICONS[a]}</Text>
              <Text
                style={[
                  styles.attrPillText,
                  active && { color, fontWeight: "700" },
                ]}
              >
                {ATTRIBUTE_LABELS[a]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <AppTextInput
        label="Why does this matter to you? (optional)"
        placeholder="e.g. Build energy and consistency"
        value={why}
        onChangeText={setWhy}
        multiline
        numberOfLines={3}
      />

      <AppButton
        label="Continue →"
        onPress={onNext}
        fullWidth
        style={styles.ctaBtn}
        disabled={!name.trim()}
      />
      <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip, I'll add habits later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DoneStep({
  onFinish,
  saving,
}: {
  onFinish: () => void;
  saving: boolean;
}) {
  return (
    <View style={styles.centeredStep}>
      <Text style={styles.welcomeEmoji}>🚀</Text>
      <Text style={styles.welcomeTitle}>You're ready.</Text>
      <Text style={styles.welcomeBody}>
        Your system is set. Complete habits to earn XP and level up your attributes.
      </Text>
      <View style={styles.pillList}>
        <Pill text="Tap a habit card to log completion." />
        <Pill text="Choose Full, Minimum, or Ease In." />
        <Pill text="Review your week every Sunday." />
      </View>
      <AppButton
        label="Start Building →"
        onPress={onFinish}
        loading={saving}
        fullWidth
        style={styles.ctaBtn}
      />
    </View>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>· {text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredStep: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  stepScroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  welcomeBody: {
    ...typography.body,
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  pillList: {
    width: "100%",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ctaBtn: {
    marginTop: spacing.sm,
  },
  skipBtn: {
    marginTop: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  stepTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  stepBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  attrGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  attrCard: {
    width: (width - spacing.xl * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    position: "relative",
  },
  attrCardIcon: {
    fontSize: 28,
  },
  attrCardText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  checkDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  miniLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  attrRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  attrPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  attrPillIcon: { fontSize: 16 },
  attrPillText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
