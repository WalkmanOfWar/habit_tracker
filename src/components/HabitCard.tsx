import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Habit, HabitVariant, HabitCompletion, ATTRIBUTE_ICONS, ATTRIBUTE_LABELS } from "../domain/habitTypes";
import { attributeColor, colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";
import { CompletionVariantButton } from "./CompletionVariantButton";
import { AppButton } from "./AppButton";

type Props = {
  habit: Habit;
  variants: HabitVariant[];
  completion: HabitCompletion | null;
  onComplete: (variant: HabitVariant) => void;
  onSkip: (reason: string) => void;
  onUndo: () => void;
};

export function HabitCard({ habit, variants, completion, onComplete, onSkip, onUndo }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const color = attributeColor(habit.attribute);
  const isDone = completion?.status === "completed";
  const isSkipped = completion?.status === "skipped";

  const variantOrder: HabitVariant["label"][] = ["full", "minimum", "maintenance"];
  const sortedVariants = [...variants].sort(
    (a, b) => variantOrder.indexOf(a.label) - variantOrder.indexOf(b.label)
  );

  function handleSkip() {
    onSkip(skipReason.trim());
    setSkipModalVisible(false);
    setSkipReason("");
  }

  const completionMessage = () => {
    if (!completion) return null;
    if (completion.variantLabel === "full") return "Full done · keep the direction.";
    if (completion.variantLabel === "minimum") return "Minimum still counts.";
    if (completion.variantLabel === "maintenance") return "You protected the habit.";
    if (completion.status === "skipped") return "Skipped · adjust the system, not your self-worth.";
    return null;
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((e) => !e)}
        style={[styles.card, { borderLeftColor: color }]}
      >
        <View style={styles.row}>
          <View style={[styles.attrIcon, { backgroundColor: color + "22" }]}>
            <Text style={styles.icon}>{ATTRIBUTE_ICONS[habit.attribute]}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
            <Text style={styles.attr}>{ATTRIBUTE_LABELS[habit.attribute]}</Text>
          </View>
          {isDone && (
            <View style={[styles.badge, { backgroundColor: colors.full + "22" }]}>
              <Text style={[styles.badgeText, { color: colors.full }]}>
                +{completion!.xpAwarded} XP
              </Text>
            </View>
          )}
          {isSkipped && (
            <View style={[styles.badge, { backgroundColor: colors.skipped + "33" }]}>
              <Text style={[styles.badgeText, { color: colors.textMuted }]}>Skipped</Text>
            </View>
          )}
        </View>

        {completion && (
          <Text style={styles.completionMsg}>{completionMessage()}</Text>
        )}

        {expanded && !isDone && !isSkipped && (
          <View style={styles.actionsBlock}>
            <View style={styles.variantRow}>
              {sortedVariants.map((v) => (
                <CompletionVariantButton
                  key={v.id}
                  variant={v}
                  onPress={() => onComplete(v)}
                  style={styles.variantBtn}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setSkipModalVisible(true)}
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Skip today</Text>
            </TouchableOpacity>
          </View>
        )}

        {(isDone || isSkipped) && (
          <TouchableOpacity onPress={onUndo} style={styles.undoBtn}>
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={skipModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSkipModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBg}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Skip "{habit.name}"?</Text>
            <Text style={styles.modalSub}>
              Optional: what got in the way? This helps your weekly review.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. low energy, no time..."
              placeholderTextColor={colors.textMuted}
              value={skipReason}
              onChangeText={setSkipReason}
              multiline
              maxLength={200}
              autoFocus
            />
            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="ghost"
                onPress={() => {
                  setSkipModalVisible(false);
                  setSkipReason("");
                }}
                style={styles.modalBtn}
              />
              <AppButton
                label="Skip"
                variant="secondary"
                onPress={handleSkip}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  attrIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h4,
  },
  attr: {
    ...typography.bodySmall,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  completionMsg: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  actionsBlock: {
    marginTop: spacing.md,
  },
  variantRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  variantBtn: {},
  skipBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  undoBtn: {
    marginTop: spacing.sm,
    alignItems: "flex-end",
  },
  undoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  modalSub: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 21,
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
