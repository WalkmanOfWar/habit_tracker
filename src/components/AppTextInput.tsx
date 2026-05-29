import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function AppTextInput({ label, hint, error, containerStyle, ...rest }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        {...rest}
      />
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  hint: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
