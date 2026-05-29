import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  textStyle,
  fullWidth,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.background : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: colors.text,
  },
  ghostText: {
    color: colors.primary,
  },
  dangerText: {
    color: "#fff",
  },
});
