import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Screen } from "../components/Screen";
import { clearAllData } from "../data/completionRepository";
import { seedIfEmpty } from "../data/seedData";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { typography } from "../theme/typography";

export function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleResetData = () => {
    Alert.alert(
      "Reset demo data?",
      "This will delete all your habits and completions and reload the sample data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            await seedIfEmpty();
            Alert.alert("Done", "Demo data has been reloaded.");
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear all data?",
      "This will permanently delete all your habits, completions, and progress. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Done", "All data cleared.");
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <SettingCard>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.settingTitle}>Daily reminders</Text>
              <Text style={styles.settingDesc}>
                Placeholder — push notifications not yet configured.
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {notificationsEnabled && (
            <Text style={styles.placeholder}>
              Notification scheduling will be added in a future update.
            </Text>
          )}
        </SettingCard>

        {/* Data */}
        <SectionHeader title="Data" />
        <SettingCard>
          <SettingRow
            title="Export data"
            desc="Export your habits and completions as JSON."
            onPress={() =>
              Alert.alert("Coming soon", "Data export will be available in a future update.")
            }
            chevron
          />
        </SettingCard>

        {/* About */}
        <SectionHeader title="About" />
        <SettingCard>
          <SettingRow
            title="Life Build"
            desc="Version 1.0.0 · Offline-first habit tracker"
          />
          <SettingRow
            title="Philosophy"
            desc={'"Adjust the system, not your self-worth."'}
          />
        </SettingCard>

        {/* Danger zone */}
        <SectionHeader title="Danger Zone" />
        <SettingCard>
          <SettingRow
            title="Reload demo data"
            desc="Reset to sample habits (all current data will be deleted)."
            onPress={handleResetData}
            danger
          />
          <SettingRow
            title="Clear all data"
            desc="Permanently delete all habits and completions."
            onPress={handleClearAll}
            danger
            noBorder
          />
        </SettingCard>

        <Text style={styles.footer}>
          Built for behavior change, not shame.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SettingRow({
  title,
  desc,
  onPress,
  chevron,
  danger,
  noBorder,
}: {
  title: string;
  desc?: string;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  noBorder?: boolean;
}) {
  const Inner = (
    <View style={[styles.settingRow, noBorder && { borderBottomWidth: 0 }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, danger && { color: colors.error }]}>
          {title}
        </Text>
        {desc && <Text style={styles.settingDesc}>{desc}</Text>}
      </View>
      {chevron && <Text style={styles.chevron}>›</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.caption,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: "600",
  },
  settingDesc: {
    ...typography.bodySmall,
    marginTop: 3,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  placeholder: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: "italic",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    ...typography.bodySmall,
    textAlign: "center",
    marginTop: spacing.lg,
    fontStyle: "italic",
    color: colors.textMuted,
  },
});
