import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import {
  Habit,
  HabitVariant,
  Attribute,
  PreferredTime,
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ICONS,
  PREFERRED_TIME_LABELS,
} from "../domain/habitTypes";
import {
  getHabitById,
  getVariantsForHabit,
  insertHabit,
  updateHabit,
  insertVariant,
  deleteVariantsForHabit,
} from "../data/habitRepository";
import { attributeColor, colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

type Step = "basics" | "context" | "variants" | "review";

const STEPS: Step[] = ["basics", "context", "variants", "review"];
const STEP_TITLES: Record<Step, string> = {
  basics: "The Habit",
  context: "Context & Cues",
  variants: "Completion Levels",
  review: "Review & Save",
};

type VariantDraft = {
  title: string;
  description: string;
  xp: string;
};

type FormState = {
  name: string;
  attribute: Attribute;
  why: string;
  cue: string;
  preferredTime: PreferredTime;
  ifThenPlan: string;
  targetPerWeek: string;
  full: VariantDraft;
  minimum: VariantDraft;
  maintenance: VariantDraft;
};

const defaultForm = (): FormState => ({
  name: "",
  attribute: "discipline",
  why: "",
  cue: "",
  preferredTime: "anytime",
  ifThenPlan: "",
  targetPerWeek: "3",
  full: { title: "", description: "", xp: "25" },
  minimum: { title: "", description: "", xp: "10" },
  maintenance: { title: "", description: "", xp: "5" },
});

export function HabitWizardScreen({ route, navigation }: any) {
  const editId = route?.params?.habitId as string | undefined;
  const isEdit = !!editId;

  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isEdit && editId) {
        Promise.all([getHabitById(editId), getVariantsForHabit(editId)]).then(
          ([habit, variants]) => {
            if (!habit) return;
            const getV = (label: HabitVariant["label"]) =>
              variants.find((v) => v.label === label);
            setForm({
              name: habit.name,
              attribute: habit.attribute,
              why: habit.why ?? "",
              cue: habit.cue ?? "",
              preferredTime: habit.preferredTime,
              ifThenPlan: habit.ifThenPlan ?? "",
              targetPerWeek: String(habit.frequency.targetPerWeek ?? 3),
              full: {
                title: getV("full")?.title ?? "",
                description: getV("full")?.description ?? "",
                xp: String(getV("full")?.xp ?? 25),
              },
              minimum: {
                title: getV("minimum")?.title ?? "",
                description: getV("minimum")?.description ?? "",
                xp: String(getV("minimum")?.xp ?? 10),
              },
              maintenance: {
                title: getV("maintenance")?.title ?? "",
                description: getV("maintenance")?.description ?? "",
                xp: String(getV("maintenance")?.xp ?? 5),
              },
            });
          }
        );
      } else {
        setForm(defaultForm());
        setStep("basics");
      }
    }, [editId, isEdit])
  );

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setVariant = (
    which: "full" | "minimum" | "maintenance",
    key: keyof VariantDraft,
    value: string
  ) =>
    setForm((f) => ({
      ...f,
      [which]: { ...f[which], [key]: value },
    }));

  const currentStepIndex = STEPS.indexOf(step);

  const canProceed = () => {
    if (step === "basics") return form.name.trim().length > 0;
    if (step === "variants")
      return form.full.title.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert("Fill in required fields", "Please complete the required fields before continuing.");
      return;
    }
    const next = STEPS[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const handleBack = () => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setStep(prev);
    else navigation.goBack();
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const habitId = editId ?? uuidv4();

      const habit: Habit = {
        id: habitId,
        name: form.name.trim(),
        attribute: form.attribute,
        why: form.why.trim() || undefined,
        cue: form.cue.trim() || undefined,
        preferredTime: form.preferredTime,
        ifThenPlan: form.ifThenPlan.trim() || undefined,
        frequency: {
          type: "weekly",
          targetPerWeek: parseInt(form.targetPerWeek, 10) || 3,
        },
        createdAt: now,
        updatedAt: now,
      };

      if (isEdit) {
        await updateHabit(habit);
        await deleteVariantsForHabit(habitId);
      } else {
        await insertHabit(habit);
      }

      const variantEntries: Array<[HabitVariant["label"], VariantDraft]> = [
        ["full", form.full],
        ["minimum", form.minimum],
        ["maintenance", form.maintenance],
      ];

      for (const [label, draft] of variantEntries) {
        if (draft.title.trim()) {
          await insertVariant({
            id: uuidv4(),
            habitId,
            label,
            title: draft.title.trim(),
            description: draft.description.trim(),
            xp: parseInt(draft.xp, 10) || 0,
            completionWeight: label === "full" ? 1.0 : label === "minimum" ? 0.7 : 0.4,
          });
        }
      }

      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Progress bar */}
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                i <= currentStepIndex && { backgroundColor: colors.primary },
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.stepLabel}>
            Step {currentStepIndex + 1} of {STEPS.length}
          </Text>
          <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>

          {step === "basics" && (
            <BasicsStep form={form} set={set} />
          )}
          {step === "context" && (
            <ContextStep form={form} set={set} />
          )}
          {step === "variants" && (
            <VariantsStep form={form} setVariant={setVariant} />
          )}
          {step === "review" && (
            <ReviewStep form={form} />
          )}
        </ScrollView>

        {/* Navigation footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>
              {currentStepIndex === 0 ? "Cancel" : "← Back"}
            </Text>
          </TouchableOpacity>
          {step !== "review" ? (
            <AppButton
              label="Continue →"
              onPress={handleNext}
              style={styles.nextBtn}
              disabled={!canProceed()}
            />
          ) : (
            <AppButton
              label={isEdit ? "Save Changes" : "Create Habit"}
              onPress={handleSave}
              loading={saving}
              style={styles.nextBtn}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ── Step sub-components ─────────────────────────────────── */

function BasicsStep({
  form,
  set,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
}) {
  return (
    <>
      <AppTextInput
        label="Habit name *"
        placeholder="e.g. Gym Training"
        value={form.name}
        onChangeText={(v) => set("name", v)}
        autoFocus
      />

      <Text style={styles.sectionLabel}>Attribute *</Text>
      <View style={styles.attrGrid}>
        {ATTRIBUTES.map((attr) => {
          const active = form.attribute === attr;
          const color = attributeColor(attr);
          return (
            <TouchableOpacity
              key={attr}
              onPress={() => set("attribute", attr)}
              style={[
                styles.attrChip,
                active && { backgroundColor: color + "22", borderColor: color },
              ]}
            >
              <Text style={styles.attrChipIcon}>{ATTRIBUTE_ICONS[attr]}</Text>
              <Text
                style={[
                  styles.attrChipText,
                  active && { color, fontWeight: "700" },
                ]}
              >
                {ATTRIBUTE_LABELS[attr]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <AppTextInput
        label="Why does this matter to you?"
        placeholder="e.g. Build muscle and stay consistent"
        value={form.why}
        onChangeText={(v) => set("why", v)}
        multiline
        numberOfLines={3}
        hint="Connecting to your 'why' strengthens motivation."
      />

      <Text style={styles.sectionLabel}>Weekly target</Text>
      <View style={styles.targetRow}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => set("targetPerWeek", String(n))}
            style={[
              styles.targetChip,
              form.targetPerWeek === String(n) && styles.targetChipActive,
            ]}
          >
            <Text
              style={[
                styles.targetChipText,
                form.targetPerWeek === String(n) && styles.targetChipTextActive,
              ]}
            >
              {n}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function ContextStep({
  form,
  set,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
}) {
  return (
    <>
      <Text style={styles.contextIntro}>
        Stable cues make habits stick. Be as specific as possible.
      </Text>

      <AppTextInput
        label="Cue / Trigger"
        placeholder="e.g. After work, right when I get home"
        value={form.cue}
        onChangeText={(v) => set("cue", v)}
        hint="What event or time reliably precedes this habit?"
      />

      <Text style={styles.sectionLabel}>Preferred time</Text>
      <View style={styles.timeRow}>
        {(["morning", "afternoon", "evening", "anytime"] as PreferredTime[]).map(
          (t) => (
            <TouchableOpacity
              key={t}
              onPress={() => set("preferredTime", t)}
              style={[
                styles.timeChip,
                form.preferredTime === t && styles.timeChipActive,
              ]}
            >
              <Text
                style={[
                  styles.timeChipText,
                  form.preferredTime === t && styles.timeChipTextActive,
                ]}
              >
                {PREFERRED_TIME_LABELS[t]}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <AppTextInput
        label="If-Then Plan"
        placeholder={`If [cue happens], then I will [habit action].`}
        value={form.ifThenPlan}
        onChangeText={(v) => set("ifThenPlan", v)}
        multiline
        numberOfLines={3}
        hint="Implementation intentions dramatically increase follow-through."
      />
    </>
  );
}

function VariantsStep({
  form,
  setVariant,
}: {
  form: FormState;
  setVariant: (
    which: "full" | "minimum" | "maintenance",
    key: keyof VariantDraft,
    value: string
  ) => void;
}) {
  return (
    <>
      <Text style={styles.contextIntro}>
        Define three effort levels. On hard days, minimum still counts.
      </Text>

      <VariantBlock
        label="Full"
        color={colors.full}
        emoji="🏆"
        description="Your ideal effort. The full version."
        draft={form.full}
        onChange={(k, v) => setVariant("full", k, v)}
        required
      />
      <VariantBlock
        label="Minimum"
        color={colors.minimum}
        emoji="✅"
        description="A reduced but real effort. Still counts."
        draft={form.minimum}
        onChange={(k, v) => setVariant("minimum", k, v)}
      />
      <VariantBlock
        label="Ease In"
        color={colors.maintenance}
        emoji="🛡️"
        description="The smallest useful action. Protects the habit."
        draft={form.maintenance}
        onChange={(k, v) => setVariant("maintenance", k, v)}
      />
    </>
  );
}

function VariantBlock({
  label,
  color,
  emoji,
  description,
  draft,
  onChange,
  required,
}: {
  label: string;
  color: string;
  emoji: string;
  description: string;
  draft: VariantDraft;
  onChange: (k: keyof VariantDraft, v: string) => void;
  required?: boolean;
}) {
  return (
    <View style={[styles.variantBlock, { borderLeftColor: color }]}>
      <View style={styles.variantBlockHeader}>
        <Text style={styles.variantBlockEmoji}>{emoji}</Text>
        <View>
          <Text style={[styles.variantBlockLabel, { color }]}>{label}</Text>
          <Text style={styles.variantBlockDesc}>{description}</Text>
        </View>
      </View>
      <AppTextInput
        label={`Title${required ? " *" : ""}`}
        placeholder={`e.g. ${label === "Full" ? "Full workout" : label === "Minimum" ? "2 exercises" : "10-min walk"}`}
        value={draft.title}
        onChangeText={(v) => onChange("title", v)}
        containerStyle={{ marginBottom: spacing.sm }}
      />
      <AppTextInput
        label="Description (optional)"
        placeholder="More detail about what this means"
        value={draft.description}
        onChangeText={(v) => onChange("description", v)}
        containerStyle={{ marginBottom: spacing.sm }}
      />
      <View style={styles.xpRow}>
        <Text style={styles.xpLabel}>XP awarded:</Text>
        <View style={styles.xpChips}>
          {[5, 8, 10, 15, 20, 25, 30].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => onChange("xp", String(n))}
              style={[
                styles.xpChip,
                draft.xp === String(n) && { backgroundColor: color + "22", borderColor: color },
              ]}
            >
              <Text
                style={[
                  styles.xpChipText,
                  draft.xp === String(n) && { color, fontWeight: "700" },
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function ReviewStep({ form }: { form: FormState }) {
  const color = attributeColor(form.attribute);
  return (
    <>
      <Text style={styles.contextIntro}>
        Review your habit before saving. You can always edit it later.
      </Text>

      <View style={[styles.reviewCard, { borderLeftColor: color }]}>
        <Row label="Habit" value={form.name} />
        <Row label="Attribute" value={`${ATTRIBUTE_ICONS[form.attribute]} ${ATTRIBUTE_LABELS[form.attribute]}`} />
        {form.why ? <Row label="Why" value={form.why} /> : null}
        {form.cue ? <Row label="Cue" value={form.cue} /> : null}
        <Row label="Time" value={PREFERRED_TIME_LABELS[form.preferredTime]} />
        {form.ifThenPlan ? <Row label="If-Then" value={form.ifThenPlan} /> : null}
        <Row label="Target" value={`${form.targetPerWeek}x per week`} />
      </View>

      <Text style={styles.sectionLabel}>Completion levels</Text>
      {(["full", "minimum", "maintenance"] as const).map((l) => {
        const v = form[l];
        if (!v.title) return null;
        return (
          <View key={l} style={styles.reviewVariant}>
            <Text style={styles.reviewVariantLabel}>
              {l === "full" ? "🏆 Full" : l === "minimum" ? "✅ Minimum" : "🛡️ Ease In"}
            </Text>
            <Text style={styles.reviewVariantTitle}>{v.title}</Text>
            <Text style={styles.reviewVariantXp}>+{v.xp} XP</Text>
          </View>
        );
      })}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewRowLabel}>{label}</Text>
      <Text style={styles.reviewRowValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  contextIntro: {
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
  attrChip: {
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
  attrChipIcon: { fontSize: 16 },
  attrChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  targetRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: "wrap",
  },
  targetChip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  targetChipActive: {
    backgroundColor: colors.primary + "22",
    borderColor: colors.primary,
  },
  targetChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  targetChipTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeChipActive: {
    backgroundColor: colors.primary + "22",
    borderColor: colors.primary,
  },
  timeChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  timeChipTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  variantBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  variantBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  variantBlockEmoji: { fontSize: 22 },
  variantBlockLabel: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  variantBlockDesc: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  xpRow: {
    marginTop: spacing.xs,
  },
  xpLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  xpChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  xpChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  xpChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  reviewRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  reviewRowLabel: {
    ...typography.label,
    width: 70,
    flexShrink: 0,
  },
  reviewRowValue: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  reviewVariant: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  reviewVariantLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    width: 90,
  },
  reviewVariantTitle: {
    ...typography.body,
    flex: 1,
  },
  reviewVariantXp: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
    justifyContent: "center",
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  nextBtn: {
    flex: 1,
  },
});
