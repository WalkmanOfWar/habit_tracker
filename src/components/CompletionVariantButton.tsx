import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { HabitVariant } from "../domain/habitTypes";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";

const variantColors = {
  full: colors.full,
  minimum: colors.minimum,
  maintenance: colors.maintenance,
};

const variantLabels = {
  full: "Full",
  minimum: "Minimum",
  maintenance: "Ease In",
};

type Props = {
  variant: HabitVariant;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function CompletionVariantButton({ variant, selected, onPress, style }: Props) {
  const color = variantColors[variant.label];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.btn,
        selected && { backgroundColor: color + "22", borderColor: color },
        style,
      ]}
    >
      <Text style={[styles.labelText, { color: selected ? color : colors.textSecondary }]}>
        {variantLabels[variant.label]}
      </Text>
      <Text style={[styles.title, selected && { color: colors.text }]} numberOfLines={1}>
        {variant.title}
      </Text>
      <Text style={[styles.xp, { color }]}>+{variant.xp} XP</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    minHeight: 70,
    justifyContent: "center",
  },
  labelText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 2,
  },
  xp: {
    fontSize: 13,
    fontWeight: "700",
  },
});
