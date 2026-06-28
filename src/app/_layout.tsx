import { useEffect, useState } from "react";

import { StyleSheet } from "react-native";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import { Toast } from "@/components/shared/toast";
import { hydrateOnboardingState } from "@/features/onboarding/lib/onboarding-storage";
import { bootstrapCurrency } from "@/features/settings/lib/bootstrap-currency";
import { hydratePersistedSettings } from "@/features/settings/lib/settings-storage";
import { queryClient } from "@/lib/api/query-client";
import { getDb } from "@/lib/db/client";
import { getModalScreenOptions, getStackScreenOptions } from "@/lib/navigation/stack-options";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useUnistyles();
  const [appReady, setAppReady] = useState(false);
  const stackOptions = getStackScreenOptions(theme);
  const modalOptions = getModalScreenOptions(theme);

  useEffect(() => {
    void Promise.all([
      getDb(),
      bootstrapCurrency().then(() => hydratePersistedSettings()),
      hydrateOnboardingState(),
    ]).then(() => {
      setAppReady(true);
    });
  }, []);

  useEffect(() => {
    if (!appReady) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      void SplashScreen.hideAsync();
    });

    return () => cancelAnimationFrame(frame);
  }, [appReady]);

  useEffect(() => {
    UnistylesRuntime.setRootViewBackgroundColor(theme.colors.background);
  }, [theme.colors.background]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={appReady && theme.name === "dark" ? "light" : "dark"} />
        {appReady ? (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add-subscription"
              options={{
                ...modalOptions,
                presentation: "modal",
                animation: "slide_from_bottom",
                headerShown: true,
                title: "Add subscription",
              }}
            />
            <Stack.Screen
              name="add-category"
              options={{
                ...modalOptions,
                presentation: "modal",
                animation: "slide_from_bottom",
                headerShown: true,
                title: "Add category",
              }}
            />
            <Stack.Screen
              name="subscription/[id]"
              options={{
                ...stackOptions,
                headerShown: true,
                headerLargeTitleEnabled: false,
                animation: "slide_from_right",
                title: "Subscription",
              }}
            />
            <Stack.Screen
              name="categories"
              options={{
                ...stackOptions,
                headerShown: true,
                headerLargeTitleEnabled: false,
                animation: "slide_from_right",
                title: "Categories",
              }}
            />
            <Stack.Screen
              name="category/[id]"
              options={{
                ...stackOptions,
                headerShown: true,
                headerLargeTitleEnabled: false,
                animation: "slide_from_right",
                title: "Category",
              }}
            />
          </Stack>
        ) : null}
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
