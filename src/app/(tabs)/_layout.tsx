import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useUnistyles } from "react-native-unistyles";

import { selectionChange } from "@/lib/haptics";

export default function TabsLayout() {
  const { theme } = useUnistyles();

  return (
    <NativeTabs
      backgroundColor={theme.colors.background}
      iconColor={{ default: theme.colors.tabInactive, selected: theme.colors.primary }}
      labelStyle={{
        default: { color: theme.colors.tabInactive, fontSize: 10, fontWeight: "700" },
        selected: { color: theme.colors.primary, fontSize: 10, fontWeight: "700" },
      }}
      minimizeBehavior="onScrollDown"
      screenListeners={{
        tabPress: (event) => {
          if (!event.data.isPrevented) {
            selectionChange();
          }
        },
      }}
      tabBarRespectsIMEInsets
      tintColor={theme.colors.primary}
    >
      <NativeTabs.Trigger contentStyle={{ backgroundColor: theme.colors.background }} name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "home", selected: "home_filled" }}
          sf={{ default: "house", selected: "house.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        contentStyle={{ backgroundColor: theme.colors.background }}
        name="subscriptions"
      >
        <NativeTabs.Trigger.Label>Subscriptions</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "list", selected: "list" }}
          sf={{ default: "list.bullet", selected: "list.bullet" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        contentStyle={{ backgroundColor: theme.colors.background }}
        name="calendar"
      >
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "event_repeat", selected: "event_repeat" }}
          sf={{ default: "calendar.badge.clock", selected: "calendar.badge.clock" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        contentStyle={{ backgroundColor: theme.colors.background }}
        name="settings"
      >
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "settings", selected: "settings" }}
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
