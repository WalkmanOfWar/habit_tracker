import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDatabase } from "./src/data/db";
import { seedIfEmpty } from "./src/data/seedData";
import {
  OnboardingScreen,
  isOnboardingComplete,
} from "./src/screens/OnboardingScreen";
import { AppNavigator } from "./src/app/AppNavigator";
import { colors } from "./src/theme/colors";

export default function App() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      await initDatabase();
      await seedIfEmpty();
      const done = await isOnboardingComplete();
      setShowOnboarding(!done);
      setReady(true);
    }
    bootstrap().catch((e) => {
      console.error("Bootstrap error:", e);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
