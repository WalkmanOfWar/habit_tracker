import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TodayScreen } from "../screens/TodayScreen";
import { SkillTreeScreen } from "../screens/SkillTreeScreen";
import { HabitsScreen } from "../screens/HabitsScreen";
import { HabitDetailScreen } from "../screens/HabitDetailScreen";
import { HabitWizardScreen } from "../screens/HabitWizardScreen";
import { WeeklyReviewScreen } from "../screens/WeeklyReviewScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export type RootStackParamList = {
  MainTabs: undefined;
  HabitWizard: { habitId?: string } | undefined;
  HabitDetail: { habitId: string };
};

export type TabParamList = {
  Today: undefined;
  SkillTree: undefined;
  Habits: undefined;
  Review: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({
  emoji,
  focused,
}: {
  emoji: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconActive]}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {emoji}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚡" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SkillTree"
        component={SkillTreeScreen}
        options={{
          title: "Skills",
          tabBarLabel: "Skills",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌳" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Review"
        component={WeeklyReviewScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HabitWizard"
          component={HabitWizardScreen}
          options={({ route }) => ({
            title: (route.params as any)?.habitId ? "Edit Habit" : "New Habit",
            presentation: "modal",
            animation: "slide_from_bottom",
          })}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ title: "Habit Detail" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 85 : 65,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: spacing.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 28,
    borderRadius: 8,
  },
  tabIconActive: {
    backgroundColor: colors.primary + "18",
  },
  tabEmoji: {
    fontSize: 18,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
});
